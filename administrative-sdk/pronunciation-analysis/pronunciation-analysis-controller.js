/* eslint-disable
 camelcase
 */
const Base64Utils = require('./../utils/base64-utils');
const Connection = require('./../connection/connection-controller');
const Phoneme = require('../phoneme/phoneme');
const PronunciationAnalysis = require('./pronunciation-analysis');
const Student = require('../student/student');
const Word = require('../word/word');
const WordChunk = require('../word-chunk/word-chunk');
const when = require('autobahn').when;

/**
 * Controller class for the PronunciationAnalysis model.
 */
module.exports = class PronunciationAnalysisController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Create a `its.Word` domain model from JSON data.
   *
   * @param {object[]} The words array from the PronunciationAnalysis API.
   * @returns an array of the `its.Word` domain models.
   */
  static _wordsToModels(inWords) {
    const words = [];
    inWords.forEach(word => {
      const chunks = [];
      word.chunks.forEach(chunk => {
        const phonemes = [];
        // Phonemes are only provided on detailed analysis.
        chunk.phonemes = chunk.phonemes || [];
        chunk.phonemes.forEach(phoneme => {
          const newPhoneme = new Phoneme(
            phoneme.ipa, phoneme.score, phoneme.confidenceScore,
            phoneme.verdict);
          // Copy all properties as API docs indicate there may be a
          // variable amount of phoneme properties.
          Object.assign(newPhoneme, phoneme);
          phonemes.push(newPhoneme);
        });
        const wordChunk = new WordChunk(chunk.graphemes, chunk.score,
          chunk.verdict, phonemes);
        chunks.push(wordChunk);
      });
      const newWord = new Word(chunks);
      words.push(newWord);
    });
    return words;
  }

  /**
   * Initialise the pronunciation analysis challenge through RPCs.
   *
   */
  pronunciationAnalysisInitChallenge(challenge) {
    return this.connection._session.call('nl.itslanguage.pronunciation.init_challenge',
      [this.connection._analysisId, challenge.organisationId, challenge.id])
      .catch(res => {
        Connection.logRPCError(res);
        return Promise.reject(res);
      })
      .then(analysisId => {
        console.log('Challenge initialised for analysisId: ' + this.connection._analysisId);
        return analysisId;
      })
      .then(() => this.connection._session.call('nl.itslanguage.pronunciation.alignment',
        [this.connection._analysisId]))
      .catch(res => {
        Connection.logRPCError(res);
        return Promise.reject(res);
      })
      .then(alignment => {
        this.referenceAlignment = alignment;
        console.log('Reference alignment retrieved', alignment);
      });
  }

  /**
   * Initialise the pronunciation analysis audio specs through RPCs.
   *
   */
  pronunciationAnalysisInitAudio(recorder, dataavailableCb) {
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the analysis when audio is actually submitted.
    const specs = recorder.getAudioSpecs();
    return this.connection._session.call('nl.itslanguage.pronunciation.init_audio',
      [this.connection._analysisId, specs.audioFormat], specs.audioParameters)
      .then(analysisId => {
        console.log('Accepted audio parameters for analysisId after init_audio: ' + this.connection._analysisId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
        return analysisId;
      })
      .catch(res => {
        Connection.logRPCError(res);
        return Promise.reject(res);
      });
  }

  /**
   * Start a pronunciation analysis from streaming audio.
   *
   * @param {its.PronunciationChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   * @returns Promise containing a PronunciationAnalysis.
   * @rejects If challenge is not an object or not defined.
   * @rejects If challenge has no id.
   * @rejects If challenge has no organisationId.
   * @rejects If the connection is not open.
   * @rejects If the recorder is already recording.
   * @rejects If a session is already in progress.
   * @rejects If something went wrong during analysis.
   */
  startStreamingPronunciationAnalysis(challenge, recorder, trim) {
    if (typeof challenge !== 'object' || !challenge) {
      return Promise.reject(new Error(
        '"challenge" parameter is required or invalid'));
    }
    if (!challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    if (!this.connection._session) {
      return Promise.reject(new Error('WebSocket connection was not open.'));
    }
    if (recorder.isRecording()) {
      return Promise.reject(new Error('Recorder should not yet be recording.'));
    }

    if (this.connection._analysisId !== null) {
      return Promise.reject(new Error('Session with analysisId ' + this.connection._analysisId +
        ' still in progress.'));
    }
    const self = this;
    this.connection._analyisId = null;
    let trimAudioStart = 0.15;
    const trimAudioEnd = 0.0;
    if (trim === false) {
      trimAudioStart = 0.0;
    }
    return new when.Promise((resolve, reject, notify) => {
      function reportDone(data) {
        const analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          null, null,
          self.connection.addAccessToken(data.audioUrl));
        analysis.score = data.score;
        analysis.confidenceScore = data.confidenceScore;
        analysis.words = PronunciationAnalysisController._wordsToModels(data.words);
        resolve({analysisId: self.connection._analysisId, analysis});
      }

      function reportProgress(progress) {
        notify({progress, referenceAlignment: self.referenceAlignment});
      }

      function reportError(data) {
        // Either there was an unexpected error, or the audio failed to
        // align, in which case no analysis is provided, but just the
        // basic metadata.
        const analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          self.connection.addAccessToken(data.audioUrl));
        reject({analysis, message: data.message});
      }

      // Start streaming the binary audio when the user instructs
      // the audio recorder to start recording.
      function startStreaming(chunk) {
        const encoded = Base64Utils._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for analysisId: ' +
          self.connection._analysisId);
        self.connection._session.call('nl.itslanguage.pronunciation.write',
          [self.connection._analysisId, encoded, 'base64'])
          .catch(res => {
            Connection.logRPCError(res);
            reportError(res);
          })
          .then(() => {
            console.debug('Delivered audio successfully');
          });
      }

      function initAnalysis(analysisId) {
        self.connection._analysisId = analysisId;
        console.log('Got analysisId after initialisation: ' + self.connection._analysisId);
      }

      // Stop listening when the audio recorder stopped.
      function stopListening() {
        recorder.removeEventListener('recorded', stopListening);
        recorder.removeEventListener('dataavailable', startStreaming);

        // When done, submit any plain text (non-JSON) to start analysing.
        self.connection._session.call('nl.itslanguage.pronunciation.analyse',
          [self.connection._analysisId], {}, {receive_progress: true})
          .then(reportDone)
          .catch(res => {
            if (res.error === 'nl.itslanguage.ref_alignment_failed') {
              res.kwargs.analysis.message = 'Reference alignment failed';
            } else if (res.error === 'nl.itslanguage.alignment_failed') {
              res.kwargs.analysis.message = 'Alignment failed';
            } else if (res.error === 'nl.itslanguage.analysis_failed') {
              res.kwargs.analysis.message = 'Analysis failed';
            } else {
              res.kwargs.analysis.message = 'Unhandled error';
              Connection.logRPCError(res);
            }
            reportError(res.kwargs.analysis);
          })
          .tap(progress => {
            reportProgress(progress);
          });
        // This session is over.
        self.connection._analysisId = null;
      }

      recorder.addEventListener('recorded', stopListening);
      self.connection._session.call('nl.itslanguage.pronunciation.init_analysis', [],
        {
          trimStart: trimAudioStart,
          trimEnd: trimAudioEnd
        })
        .then(initAnalysis)
        .then(() => {
          self.pronunciationAnalysisInitChallenge(challenge)
            .then(() => {
              const p = new Promise(resolve_ => {
                if (recorder.hasUserMediaApproval()) {
                  resolve_();
                } else {
                  recorder.addEventListener('ready', resolve_);
                }
              });

              p.then(() => {
                self.pronunciationAnalysisInitAudio(recorder, startStreaming)
                  .catch(reject);
              });
            })
            .then(() => notify('ReadyToReceive'))
            .catch(reject);
        })
        .catch(res => {
          Connection.logRPCError(res);
          reject(res);
        });
    });
  }

  /**
   * Get a pronunciation analysis in a pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge.
   * @param {string} analysisId Specify a pronunciation analysis identifier.
   * @returns Promise containing a PronunciationAnalysis.
   * @rejects If no result could not be found.
   */
  getPronunciationAnalysis(challenge, analysisId) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    const url = this.connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses/' + analysisId;
    return this.connection._secureAjaxGet(url)
      .then(datum => {
        const student = new Student(challenge.organisationId, datum.studentId);
        const analysis = new PronunciationAnalysis(challenge, student,
          datum.id, new Date(datum.created), new Date(datum.updated),
          datum.audioUrl);
        // Alignment may not be successful, in which case the analysis
        // is not available, but it's still an attempt that is available,
        // albeit without extended attributes like score and phonemes.
        if (datum.score) {
          analysis.score = datum.score;
          analysis.words = PronunciationAnalysisController._wordsToModels(datum.words);
        }
        return analysis;
      });
  }

  /**
   * List all pronunciation analyses in a specific pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge to list speech recordings for.
   * @param {Boolean} detailed Returns extra analysis metadata when true. false by default.
   * @returns Promise containing a list of PronunciationAnalyses.
   * @rejects If no result could not be found.
   */
  listPronunciationAnalyses(challenge, detailed) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    let url = this.connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses';
    if (detailed) {
      url += '?detailed=true';
    }
    return this.connection._secureAjaxGet(url)
      .then(data => {
        const analyses = [];
        data.forEach(datum => {
          const student = new Student(challenge.organisationId, datum.studentId);
          const analysis = new PronunciationAnalysis(challenge, student,
            datum.id, new Date(datum.created), new Date(datum.updated),
            datum.audioUrl);
          // Alignment may not be successful, in which case the analysis
          // is not available, but it's still an attempt that is available,
          // albeit without extended attributes like score and phonemes.
          if (datum.score) {
            analysis.score = datum.score;
            analysis.words = PronunciationAnalysisController._wordsToModels(datum.words);
          }
          analyses.push(analysis);
        });
        return analyses;
      });
  }
};

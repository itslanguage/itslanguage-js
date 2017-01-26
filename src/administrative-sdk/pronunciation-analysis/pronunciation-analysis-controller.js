/* eslint-disable
 camelcase
 */
import Connection from '../connection/connection-controller';
import Phoneme from '../phoneme/phoneme';
import PronunciationAnalysis from './pronunciation-analysis';
import PronunciationChallenge from '../pronunciation-challenge/pronunciation-challenge';
import Word from '../word/word';
import WordChunk from '../word-chunk/word-chunk';
import base64 from 'base64-js';
import when from 'when';

/**
 * Controller class for the PronunciationAnalysis model.
 * @private
 */
export default class PronunciationAnalysisController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    /**
     * Object to use for making a connection to the REST API and Websocket server.
     * @type {Connection}
     */
    this._connection = connection;
  }

  /**
   * Create a `its.Word` domain model from JSON data.
   *
   * @param {object[]} inWords - The words array from the PronunciationAnalysis API.
   * @returns {Word[]} An array of {@link Word} domain models.
   */
  static _wordsToModels(inWords) {
    return inWords.map(word => {
      const chunks = word.chunks.map(chunk => {
        const phonemes = (chunk.phonemes || []).map(phoneme => {
          const newPhoneme = new Phoneme(
            phoneme.ipa, phoneme.score, phoneme.confidenceScore,
            phoneme.verdict);
          // Copy all properties as API docs indicate there may be a
          // variable amount of phoneme properties.
          return Object.assign(newPhoneme, phoneme);
        });
        return new WordChunk(chunk.graphemes, chunk.score, chunk.verdict, phonemes);
      });
      return new Word(chunks);
    });
  }

  /**
   * Initialise the pronunciation analysis challenge through RPCs.
   *
   * @param {PronunciationChallenge} challenge - Challenge.
   * @private
   */
  pronunciationAnalysisInitChallenge(challenge) {
    return this._connection.call('pronunciation.init_challenge',
      [this._connection._analysisId, challenge.id]);
  }

  /**
   * Initialise the pronunciation analysis audio specs through RPCs.
   *
   * @param {AudioRecorder} recorder - AudioRecorder.
   * @param {Function} dataavailableCb - Callback.
   * @private
   */
  pronunciationAnalysisInitAudio(recorder, dataavailableCb) {
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the analysis when audio is actually submitted.
    const specs = recorder.getAudioSpecs();
    return this._connection.call('pronunciation.init_audio',
      [this._connection._analysisId, specs.audioFormat], specs.audioParameters)
      .then(analysisId => {
        console.log('Accepted audio parameters for analysisId after init_audio: ' + this._connection._analysisId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
        return analysisId;
      });
  }

  /**
   * Start a pronunciation analysis from streaming audio.
   *
   * @param {PronunciationChallenge} challenge - The pronunciation challenge to perform.
   * @param {AudioRecorder} recorder - The audio recorder to extract audio from.
   * @param {?boolean} trim - Whether to trim the start and end of recorded audio (default: true).
   * @returns {Promise.<PronunciationAnalysis>} A {@link https://github.com/cujojs/when} Promise containing a {@link PronunciationAnalysis}.
   * @emits {string} 'ReadyToReceive' when the call is made to receive audio. The recorder can now send audio.
   * @emits {Object} When the sent audio has finished alignment. Aligning audio is the process of mapping the audio
   * to spoken words and determining when what is said. An object is sent containing a property 'progress',
   * which is the sent audio alignment, and a property 'referenceAlignment' which is the alignment of the
   * reference audio.
   * @throws {Promise.<Error>} challenge parameter of type "PronunciationChallenge" is required.
   * @throws {Promise.<Error>} challenge.id field of type "string" is required.
   * @throws {Promise.<Error>} If the connection is not open.
   * @throws {Promise.<Error>} If the recorder is already recording.
   * @throws {Promise.<Error>} If a session is already in progress.
   * @throws {Promise.<Error>} If something went wrong during analysis.
   */
  startStreamingPronunciationAnalysis(challenge, recorder, trim) {
    if (!(challenge instanceof PronunciationChallenge)) {
      return Promise.reject(new Error('challenge parameter of type "PronunciationChallenge" is required'));
    }
    if (typeof challenge.id !== 'string') {
      return Promise.reject(new Error('challenge.id field of type "string" is required'));
    }
    if (!this._connection._session) {
      return Promise.reject(new Error('WebSocket connection was not open.'));
    }
    if (recorder.isRecording()) {
      return Promise.reject(new Error('Recorder should not yet be recording.'));
    }

    if (this._connection._analysisId !== null) {
      return Promise.reject(new Error('Session with analysisId ' + this._connection._analysisId +
        ' still in progress.'));
    }
    const self = this;
    this._connection._analyisId = null;
    let trimAudioStart = 0.15;
    const trimAudioEnd = 0.0;
    if (trim === false) {
      trimAudioStart = 0.0;
    }
    return new when.Promise((resolve, reject, notify) => {
      function reportDone(data) {
        const analysis = new PronunciationAnalysis(
          challenge.id, data.userId, data.id,
          new Date(data.created), new Date(data.updated),
          self._connection.addAccessToken(data.audioUrl),
          data.score, data.confidenceScore,
          PronunciationAnalysisController._wordsToModels(data.words)
        );
        resolve({analysisId: self._connection._analysisId, analysis});
      }

      function reportProgress(progress) {
        notify({progress, referenceAlignment: self._referenceAlignment});
      }

      function reportError(data) {
        // Either there was an unexpected error, or the audio failed to
        // align, in which case no analysis is provided, but just the
        // basic metadata.
        const analysis = new PronunciationAnalysis(
          challenge.id, data.userId, data.id,
          new Date(data.created), new Date(data.updated),
          self._connection.addAccessToken(data.audioUrl));
        reject({analysis, message: data.message});
      }

      // Start streaming the binary audio when the user instructs
      // the audio recorder to start recording.
      function startStreaming(chunk) {
        const encoded = base64.fromByteArray(chunk);
        console.log('Sending audio chunk to websocket for analysisId: ' +
          self._connection._analysisId);
        self._connection.call('pronunciation.write',
          [self._connection._analysisId, encoded, 'base64'])
          .then(() => {
            console.debug('Delivered audio successfully');
          })
          .catch(res => {
            Connection.logRPCError(res);
            reportError(res);
          });
      }

      function initAnalysis(analysisId) {
        self._connection._analysisId = analysisId;
        console.log('Got analysisId after initialisation: ' + self._connection._analysisId);
      }

      // Stop listening when the audio recorder stopped.
      function stopListening() {
        recorder.removeEventListener('recorded', stopListening);
        recorder.removeEventListener('dataavailable', startStreaming);

        // When done, submit any plain text (non-JSON) to start analysing.
        self._connection.call('pronunciation.analyse',
          [self._connection._analysisId], {}, {receive_progress: true})
          .progress(progress => {
            reportProgress(progress);
          })
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
          });
      }

      recorder.addEventListener('recorded', stopListening);
      self._connection.call('pronunciation.init_analysis', [],
        {
          trimStart: trimAudioStart,
          trimEnd: trimAudioEnd
        })
        .then(initAnalysis)
        .then(() => self.pronunciationAnalysisInitChallenge(challenge))
        .then(() => notify('ReadyToReceive'))
        .then(() => new Promise(resolve_ => {
          if (recorder.hasUserMediaApproval()) {
            resolve_();
          } else {
            recorder.addEventListener('ready', resolve_);
          }
        }))
        .then(() => self.pronunciationAnalysisInitAudio(recorder, startStreaming))
        .catch(reject);
    })
      .then(res => {
        self._connection._analysisId = null;
        return Promise.resolve(res);
      })
      .catch(error => {
        self._connection._analysisId = null;
        Connection.logRPCError(error);
        return Promise.reject(error);
      });
  }

  /**
   * Get a pronunciation analysis in a pronunciation challenge from the current active {@link Organisation} derived
   * from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a pronunciation challenge identifier.
   * @param {string} analysisId - Specify a pronunciation analysis identifier.
   * @returns {Promise.<PronunciationAnalysis>} Promise containing a PronunciationAnalysis.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} {@link PronunciationAnalysis#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getPronunciationAnalysis(challengeId, analysisId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    if (!analysisId) {
      return Promise.reject(new Error('analysisId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation/' +
      challengeId + '/analyses/' + analysisId;
    return this._connection._secureAjaxGet(url)
      .then(datum => {
        const analysis = new PronunciationAnalysis(challengeId, datum.userId,
          datum.id, new Date(datum.created), new Date(datum.updated),
          datum.audioUrl, datum.score, datum.confidenceScore, null);
        // Alignment may not be successful, in which case the analysis
        // is not available, but it's still an attempt that is available,
        // albeit without extended attributes like score and phonemes.
        if (datum.words) {
          analysis.words = PronunciationAnalysisController._wordsToModels(datum.words);
        }
        return analysis;
      });
  }

  /**
   * Get and return all pronunciation analyses in a specific pronunciation challenge from the current active
   * {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a pronunciation challenge identifier to list
   * speech recordings for.
   * @param {boolean} [detailed=false] - Returns extra analysis metadata when true.
   * @returns {Promise.<PronunciationAnalysis[]>} Promise containing an array PronunciationAnalyses.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getPronunciationAnalyses(challengeId, detailed) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    let url = this._connection._settings.apiUrl + '/challenges/pronunciation/' +
      challengeId + '/analyses';
    if (detailed) {
      url += '?detailed=true';
    }
    return this._connection._secureAjaxGet(url)
      .then(data => data.map(datum => {
        const analysis = new PronunciationAnalysis(challengeId, datum.userId,
          datum.id, new Date(datum.created), new Date(datum.updated),
          datum.audioUrl, datum.score, datum.confidenceScore, null);
        // Alignment may not be successful, in which case the analysis
        // is not available, but it's still an attempt that is available,
        // albeit without extended attributes like score and phonemes.
        if (datum.words) {
          analysis.words = PronunciationAnalysisController._wordsToModels(datum.words);
        }
        return analysis;
      }));
  }
}

/* eslint-disable
 camelcase
 */
const Student = require('../administrative-sdk/student').Student;
const Base64Utils = require('./base64Utils').Base64Utils;
const Connection = require('../administrative-sdk/connection').Connection;
const when = require('autobahn').when;

/**
 * @class WordChunk
 *
 * @member {string} graphemes The graphemes this chunk consists of.
 * @member {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad,
 * 1 the perfect score.
 * @member {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6.
 * `good` when the score is 0.6 or above.
 * @member {its.Phoneme[]} phonemes The phonemes this chunk consists of.
 */
class WordChunk {
  /**
   * Create a word chunk domain model.
   *
   * @constructor
   * @param {string} graphemes The graphemes this chunk consists of.
   * @param {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad,
   * 1 the perfect score.
   * @param {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6.
   * `good` when the score is 0.6 or above.
   * @param {its.Phoneme[]} phonemes The phonemes this chunk consists of.
   * @return {WordChunk}
   */
  constructor(graphemes, score, verdict, phonemes) {
    this.graphemes = graphemes;
    this.score = score;
    this.verdict = verdict;
    this.phonemes = phonemes || [];
  }
}

/**
 * @class Word
 *
 * @member {its.WordChunk[]} chunks The spoken sentence, split in graphemes per word.
 */
class Word {
  /**
   * Create a word domain model.
   *
   * @constructor
   * @param {its.WordChunk[][]} chunks The spoken sentence, split in graphemes per word.
   * @return {Word}
   */
  constructor(chunks) {
    this.chunks = chunks;
  }
}

/**
 * @class Phoneme
 *
 * @member {string} ipa The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
 * @member {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad,
 * 1 the perfect score.
 * @member {string} bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6.
 * good when the score is 0.6 or above.
 */
class Phoneme {
  /**
   * Create a phoneme domain model.
   *
   * @constructor
   * @param {string} ipa The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
   * @param {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad,
   * 1 the perfect score.
   * @param {float} confidenceScore This value provides a reliable prediction that the pronounced phoneme is
   * actually the phoneme that is supposed to be pronounced. There is no absolute scale defined yet.
   * @param {string} verdict bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6.
   * good when the score is 0.6 or above.
   * @return {Phoneme}
   */
  constructor(ipa, score, confidenceScore, verdict) {
    this.ipa = ipa;
    this.score = score;
    this.confidenceScore = confidenceScore;
    this.verdict = verdict;
  }
}

/**
 * @class PronunciationAnalysis
 *
 * @member {PronunciationChallenge} challenge The challenge identifier.
 * @member {Student} student The student identifier on whose behalve this audio is uploaded.
 * @member {string} id The pronunciation analysis identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 * @member {number} score The average score of all phonemes grading the entire attempt.
 * @member {float} confidenceScore This value provides a reliable prediction that the pronounced phonemes are
 * actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
 * @member {its.Word[][]} words The spoken sentence, split in graphemes per word.
 */
class PronunciationAnalysis {
  /**
   * Create a pronunciation analysis domain model.
   *
   * @constructor
   * @param {PronunciationChallenge} challenge The challenge identifier.
   * @param {Student} student The student identifier on whose behalve this audio is uploaded.
   * @param {string} id The pronunciation analysis identifier.
   * @param {date} created The creation date of the entity.
   * @param {date} updated The most recent update date of the entity.
   * @param {string} audioUrl The audio fragment as streaming audio link.
   */
  constructor(challenge, student, id, created, updated, audioUrl) {
    this.id = id;
    this.challenge = challenge;
    this.student = student;
    this.created = created;
    this.updated = updated;
    this.audioUrl = audioUrl;
  }

  /**
   * Create a `its.Word` domain model from JSON data.
   *
   * @param {object[]} The words array from the PronunciationAnalysis API.
   * @returns an array of the `its.Word` domain models.
   */
  static _wordsToModels(inWords) {
    var words = [];
    inWords.forEach(function(word) {
      var chunks = [];
      word.chunks.forEach(function(chunk) {
        var phonemes = [];
        // Phonemes are only provided on detailed analysis.
        chunk.phonemes = chunk.phonemes || [];
        chunk.phonemes.forEach(function(phoneme) {
          var newPhoneme = new Phoneme(
            phoneme.ipa, phoneme.score, phoneme.confidenceScore,
            phoneme.verdict);
          // Copy all properties as API docs indicate there may be a
          // variable amount of phoneme properties.
          Object.assign(newPhoneme, phoneme);
          phonemes.push(newPhoneme);
        });
        var wordChunk = new WordChunk(chunk.graphemes, chunk.score,
          chunk.verdict, phonemes);
        chunks.push(wordChunk);
      });
      var newWord = new Word(chunks);
      words.push(newWord);
    });
    return words;
  }

  /**
   * Initialise the pronunciation analysis challenge through RPCs.
   *
   */
  pronunciationAnalysisInitChallenge(connection, challenge) {
    var self = this;

    return connection._session.call('nl.itslanguage.pronunciation.init_challenge',
      [connection._analysisId, challenge.organisationId, challenge.id])
      .catch(function(res) {
        Connection.logRPCError(res);
      })
      .then(function(analysisId) {
        console.log('Challenge initialised for analysisId: ' + connection._analysisId);
        return analysisId;
      })
      .then(connection._session.call('nl.itslanguage.pronunciation.alignment',
        [connection._analysisId]))
      .catch(function(res) {
        Connection.logRPCError(res);
      })
      .then(function(alignment) {
        self.referenceAlignment = alignment;
        console.log('Reference alignment retrieved');
      });
  }

  /**
   * Initialise the pronunciation analysis audio specs through RPCs.
   *
   */
  pronunciationAnalysisInitAudio(connection, recorder, dataavailableCb) {
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the analysis when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    connection._session.call('nl.itslanguage.pronunciation.init_audio',
      [connection._analysisId, specs.audioFormat], specs.audioParameters)
      .then(function(analysisId) {
        console.log('Accepted audio parameters for analysisId after init_audio: ' + connection._analysisId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
        return analysisId;
      })
      .catch(function(res) {
        Connection.logRPCError(res);
        return Promise.reject(res);
      });
  }

  /**
   * Start a pronunciation analysis from streaming audio.
   *
   * @param {Connection} connection Object to connect to.
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
  startStreamingPronunciationAnalysis(connection, challenge, recorder, trim) {
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
    if (!connection._session) {
      return Promise.reject(new Error('WebSocket connection was not open.'));
    }
    if (recorder.isRecording()) {
      return Promise.reject(new Error('Recorder should not yet be recording.'));
    }

    if (connection._analysisId !== null) {
      return Promise.reject(new Error('Session with analysisId ' + connection._analysisId + ' still in progress.'));
    }
    var self = this;
    connection._analyisId = null;
    var trimAudioStart = 0.15;
    var trimAudioEnd = 0.0;
    if (trim === false) {
      trimAudioStart = 0.0;
    }
    return new when.Promise(function(resolve, reject, notify) {
      function reportDone(data) {
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          null, null,
          connection.addAccessToken(data.audioUrl));
        analysis.score = data.score;
        analysis.confidenceScore = data.confidenceScore;
        analysis.words = PronunciationAnalysis._wordsToModels(data.words);
        resolve({analysisId: connection._analysisId, analysis: analysis});
      }

      function reportProgress(progress) {
        notify(progress, self.referenceAlignment);
      }

      function reportError(data) {
        // Either there was an unexpected error, or the audio failed to
        // align, in which case no analysis is provided, but just the
        // basic metadata.
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          connection.addAccessToken(data.audioUrl));
        reject({analysis: analysis, message: data.message});
      }

      // Start streaming the binary audio when the user instructs
      // the audio recorder to start recording.
      function startStreaming(chunk) {
        var encoded = Base64Utils._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for analysisId: ' +
          connection._analysisId);
        connection._session.call('nl.itslanguage.pronunciation.write',
          [connection._analysisId, encoded, 'base64'])
          .catch(function(res) {
            Connection.logRPCError(res);
            reportError(res);
          })
          .then(function() {
            console.debug('Delivered audio successfully');
          });
      }

      function initAnalysis(analysisId) {
        connection._analysisId = analysisId;
        console.log('Got analysisId after initialisation: ' + connection._analysisId);
      }

      // Stop listening when the audio recorder stopped.
      function stopListening() {
        recorder.removeEventListener('recorded', stopListening);
        recorder.removeEventListener('dataavailable', startStreaming);

        // This session is over.
        connection._analysisId = null;

        // When done, submit any plain text (non-JSON) to start analysing.
        connection._session.call('nl.itslanguage.pronunciation.analyse',
          [connection._analysisId], {}, {receive_progress: true})
          .then(reportDone)
          .catch(function(res) {
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
          .tap(function(progress) {
            reportProgress(progress);
          });
      }

      recorder.addEventListener('recorded', stopListening);
      connection._session.call('nl.itslanguage.pronunciation.init_analysis', [],
        {
          trimStart: trimAudioStart,
          trimEnd: trimAudioEnd
        })
        .then(initAnalysis)
        .then(function() {
          self.pronunciationAnalysisInitChallenge(connection, challenge)
            .then(function() {
              var p = new Promise(function(resolve) {
                if (recorder.hasUserMediaApproval()) {
                  resolve();
                } else {
                  recorder.addEventListener('ready', resolve);
                }
              });

              p.then(function() {
                recorder.removeEventListener('ready', resolve);
                self.pronunciationAnalysisInitAudio(connection, recorder, startStreaming);
              });
            });
        })
        .catch(Connection.logRPCError);
    });
  }

  /**
   * Get a pronunciation analysis in a pronunciation challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge.
   * @param {string} analysisId Specify a pronunciation analysis identifier.
   * @returns Promise containing a PronunciationAnalysis.
   * @rejects If no result could not be found.
   */
  static getPronunciationAnalysis(connection, challenge, analysisId) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses/' + analysisId;
    return connection._secureAjaxGet(url)
      .then(datum => {
        var student = new Student(challenge.organisationId, datum.studentId);
        var analysis = new PronunciationAnalysis(challenge, student,
          datum.id, new Date(datum.created), new Date(datum.updated),
          datum.audioUrl);
        // Alignment may not be successful, in which case the analysis
        // is not available, but it's still an attempt that is available,
        // albeit without extended attributes like score and phonemes.
        if (datum.score) {
          analysis.score = datum.score;
          analysis.words = PronunciationAnalysis._wordsToModels(datum.words);
        }
        return analysis;
      });
  }

  /**
   * List all pronunciation analyses in a specific pronunciation challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge to list speech recordings for.
   * @param {Boolean} detailed Returns extra analysis metadata when true. false by default.
   * @returns Promise containing a list of PronunciationAnalyses.
   * @rejects If no result could not be found.
   */
  static listPronunciationAnalyses(connection, challenge, detailed) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses';
    if (detailed) {
      url += '?detailed=true';
    }
    return connection._secureAjaxGet(url)
      .then(data => {
        var analyses = [];
        data.forEach(function(datum) {
          var student = new Student(challenge.organisationId, datum.studentId);
          var analysis = new PronunciationAnalysis(challenge, student,
            datum.id, new Date(datum.created), new Date(datum.updated),
            datum.audioUrl);
          // Alignment may not be successful, in which case the analysis
          // is not available, but it's still an attempt that is available,
          // albeit without extended attributes like score and phonemes.
          if (datum.score) {
            analysis.score = datum.score;
            analysis.words = PronunciationAnalysis._wordsToModels(datum.words);
          }
          analyses.push(analysis);
        });
        return analyses;
      });
  }
}
module.exports = {
  Phoneme: Phoneme,
  PronunciationAnalysis: PronunciationAnalysis,
  Word: Word,
  WordChunk: WordChunk
};

/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
const Student = require('../administrative-sdk/student').Student;
const Base64Utils = require('./base64Utils').Base64Utils;
const Connection = require('../administrative-sdk/connection').Connection;

/**
 * @class WordChunk
 *
 * @member {string} graphemes The graphemes this chunk consists of.
 * @member {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad, 1 the perfect score.
 * @member {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6. `good` when the score is 0.6 or above.
 * @member {its.Phoneme[]} phonemes The phonemes this chunk consists of.
 */
class WordChunk {
  /**
   * Create a word chunk domain model.
   *
   * @constructor
   * @param {string} graphemes The graphemes this chunk consists of.
   * @param {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad, 1 the perfect score.
   * @param {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6. `good` when the score is 0.6 or above.
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
 * @member {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad, 1 the perfect score.
 * @member {string} bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6. good when the score is 0.6 or above.
 */
class Phoneme {
  /**
   * Create a phoneme domain model.
   *
   * @constructor
   * @param {string} ipa The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
   * @param {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad, 1 the perfect score.
   * @param {float} confidenceScore This value provides a reliable prediction that the pronounced phoneme is actually the phoneme that is supposed to be pronounced. There is no absolute scale defined yet.
   * @param {string} verdict bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6. good when the score is 0.6 or above.
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
 * @member {float} confidenceScore This value provides a reliable prediction that the pronounced phonemes are actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
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
   * Callback used by createPronunciationAnalysis.
   *
   * @callback Sdk~Sdk~pronunciationAnalysisCreatedCallback
   * @param {its.PronunciationAnalysis} analysis New pronunciation analysis domain model instance containing the performed analysis.
   */
  pronunciationAnalysisCreatedCallback(analysis) {}

  /**
   * Error callback used by createPronunciationAnalysis.
   *
   * @callback Sdk~pronunciationAnalysisCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechRecording} recording Speech recording domain model instance with unapplied changes.
   */
  pronunciationAnalysisCreatedErrorCallback(errors, recording) {}

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

    connection._session.call('nl.itslanguage.pronunciation.init_challenge',
      [connection._analysisId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function(analysisId) {
        console.log('Challenge initialised for analysisId: ' + connection._analysisId);
      },
      // RPC error callback
      function(res) {
        Connection.logRPCError(res);
      }
    );

    connection._session.call('nl.itslanguage.pronunciation.alignment',
      [connection._analysisId]).then(
      // RPC success callback
      function(alignment) {
        self.referenceAlignment = alignment;
        console.log('Reference alignment retrieved');
      },
      // RPC error callback
      function(res) {
        Connection.logRPCError(res);
      }
    );
  }

  /**
   * Initialise the pronunciation analysis audio specs through RPCs.
   *
   */
  pronunciationAnalysisInitAudio(connection, recorder, dataavailableCb) {
    var self = this;

    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the analysis when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    connection._session.call('nl.itslanguage.pronunciation.init_audio',
      [connection._analysisId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function(analysisId) {
        console.log('Accepted audio parameters for analysisId after init_audio: ' + connection._analysisId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function(res) {
        Connection.logRPCError(res);
      }
    );
  }

  /**
   * Start a pronunciation analysis from streaming audio.
   *
   * @param {its.PronunciationChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Sdk~pronunciationAnalysisPreparedCallback} [preparedCb] The callback that signals server is prepared for receiving data.
   * @param {Sdk~pronunciationAnalysisCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~pronunciationAnalysisCreatedErrorCallback} [ecb] The callback that handles the error response.
   * @param {Sdk~pronunciationAnalysisProgressCallback} [progressCb] The callback that handles the intermediate results.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   */
  startStreamingPronunciationAnalysis(connection, challenge, recorder, preparedCb, cb, ecb, progressCb, trim) {
    var self = this;
    var _cb = function(data) {
      var analysis = new PronunciationAnalysis(
        challenge.id, data.studentId, data.id,
        null, null,
        connection.addAccessToken(data.audioUrl));
      analysis.score = data.score;
      analysis.confidenceScore = data.confidenceScore;
      analysis.words = PronunciationAnalysis._wordsToModels(data.words);
      if (cb) {
        cb(analysis);
      }
    };

    var _progressCb = function(progress) {
      if (progressCb) {
        progressCb(progress, self.referenceAlignment);
      }
    };

    var _ecb = function(data) {
      // Either there was an unexpected error, or the audio failed to
      // align, in which case no analysis is provided, but just the
      // basic metadata.
      if (ecb) {
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          connection.addAccessToken(data.audioUrl));
        ecb(analysis, data.message);
      }
    };

    // Validate required domain model.
    if (typeof challenge !== 'object' || !challenge) {
      throw new Error(
        '"challenge" parameter is required or invalid');
    }
    if (!challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    // Validate environment prerequisites.
    if (!connection._session) {
      throw new Error('WebSocket connection was not open.');
    }

    if (recorder.isRecording()) {
      throw new Error('Recorder should not yet be recording.');
    }

    if (connection._analysisId !== null) {
      console.error('Session with analysisId ' + connection._analysisId + ' still in progress.');
      return;
    }
    this._analyisId = null;

    // Start streaming the binary audio when the user instructs
    // the audio recorder to start recording.
    var dataavailableCb = function(chunk) {
      var encoded = Base64Utils._arrayBufferToBase64(chunk);
      console.log('Sending audio chunk to websocket for analysisId: ' +
        connection._analysisId);
      connection._session.call('nl.itslanguage.pronunciation.write',
        [connection._analysisId, encoded, 'base64']).then(
        // RPC success callback
        function(res) {
          console.debug('Delivered audio successfully');
        },
        // RPC error callback
        function(res) {
          Connection.logRPCError(res);
          _ecb(res);
        }
      );
    };

    var analysisInitCb = function(analysisId) {
      connection._analysisId = analysisId;
      console.log('Got analysisId after initialisation: ' + connection._analysisId);
      self.pronunciationAnalysisInitChallenge(connection, challenge);
      preparedCb(connection._analysisId);

      if (recorder.hasUserMediaApproval()) {
        self.pronunciationAnalysisInitAudio(connection, recorder, dataavailableCb);
      } else {
        var userMediaCb = function(chunk) {
          self.pronunciationAnalysisInitAudio(connection, recorder, dataavailableCb);
          recorder.removeEventListener('ready', userMediaCb);
        };
        recorder.addEventListener('ready', userMediaCb);
      }
    };

    var trimAudioStart = 0.15;
    var trimAudioEnd = 0.0;
    if (trim === false) {
      trimAudioStart = 0.0;
    }
    connection._session.call('nl.itslanguage.pronunciation.init_analysis', [],
      {trimStart: trimAudioStart,
        trimEnd: trimAudioEnd}).then(
      // RPC success callback
      analysisInitCb,
      // RPC error callback
      function(res) {
        Connection.logRPCError(res);
      }
    );

    // Stop listening when the audio recorder stopped.
    var recordedCb = function(id) {
      // When done, submit any plain text (non-JSON) to start analysing.

      connection._session.call('nl.itslanguage.pronunciation.analyse',
        [connection._analysisId], {}, {receive_progress: true}).then(

        // RPC success callback
        function(res) {
          // Wait for analysis results to come back.
          _cb(res);
        },
        // RPC error callback
        function(res) {
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
          _ecb(res.kwargs.analysis);
        },
        _progressCb
      );

      recorder.removeEventListener('recorded', recordedCb);
      recorder.removeEventListener('dataavailable', dataavailableCb);
      // This session is over.
      connection._analysisId = null;
    };
    recorder.addEventListener('recorded', recordedCb);
  }

  /**
   * Callback used by getPronunciationAnalysis.
   *
   * @callback Sdk~getPronunciationAnalysisCallback
   * @param {its.PronunciationAnalysis} analysis Retrieved pronunciation analysis domain model instance.
   */
  getPronunciationAnalysisCallback(analysis) {}

  /**
   * Error callback used by getPronunciationAnalysis.
   *
   * @callback Sdk~getPronunciationAnalysisErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getPronunciationAnalysisErrorCallback(errors) {}

  /**
   * Get a pronunciation analysis in a pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge.
   * @param {string} analysisId Specify a pronunciation analysis identifier.
   * @param {Sdk~getPronunciationAnalysisCallback} [cb] The callback that handles the response.
   * @param {Sdk~getPronunciationAnalysisErrorCallback} [ecb] The callback that handles the error response.
   */
  static getPronunciationAnalysis(connection, challenge, analysisId, cb, ecb) {
    var _cb = function(datum) {
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
      if (cb) {
        cb(analysis);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses/' + analysisId;
    connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listPronunciationAnalyses.
   *
   * @callback Sdk~listPronunciationAnalysesCallback
   * @param {its.PronunciationAnalysis[]} analyses Retrieved pronunciation analysis domain model instances.
   */
  listPronunciationAnalysisCallback(analyses) {}

  /**
   * Error callback used by listPronunciationAnalyses.
   *
   * @callback Sdk~listPronunciationAnalysesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listPronunciationAnalysisErrorCallback(errors) {}

  /**
   * List all pronunciation analyses in a specific pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge to list speech recordings for.
   * @param {Boolean} detailed Returns extra analysis metadata when true. false by default.
   * @param {Sdk~listPronunciationAnalysesCallback} cb The callback that handles the response.
   * @param {Sdk~listPronunciationAnalysesErrorCallback} [ecb] The callback that handles the error response.
   */
  static listPronunciationAnalyses(connection, challenge, detailed, cb, ecb) {
    var self = this;
    var _cb = function(data) {
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
          analysis.words = self._wordsToModels(datum.words);
        }
        analyses.push(analysis);
      });
      if (cb) {
        cb(analyses);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses';
    if (detailed) {
      url += '?detailed=true';
    }
    connection._secureAjaxGet(url, _cb, ecb);
  }
}
module.exports = {
  Phoneme: Phoneme,
  PronunciationAnalysis: PronunciationAnalysis,
  Word: Word,
  WordChunk: WordChunk
};

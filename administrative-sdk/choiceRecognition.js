/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
const autobahn = require('autobahn');
const Student = require('../administrative-sdk/student').Student;
const PronunciationAnalysis = require('../administrative-sdk/pronunciationAnalysis').PronunciationAnalysis;
const Base64Utils = require('./base64Utils').Base64Utils;

/**
 * @class ChoiceRecognition
 *
 * @member {ChoiceChallenge} challenge The challenge identifier.
 * @member {Student} student The student identifier on whose behalve this audio is uploaded.
 * @member {string} id The choice recognition identifier.
 * @member {Date} created The creation date of the entity.
 * @member {Date} updated The most recent update date of the entity.
 * @member {blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 * @member {string} recognised The recognised sentence.
 */
class ChoiceRecognition {
  /**
   * Create a choice recognition domain model.
   *
   * @constructor
   * @param {PronunciationChallenge} challenge The choiceChall identifier.
   * @param {Student} student The student identifier on whose behalve this audio is uploaded.
   * @param {string} id The choice recognition identifier.
   * @param {Date} created The creation date of the entity.
   * @param {Date} updated The most recent update date of the entity.
   * @param {string} audioUrl The audio fragment as streaming audio link.
   * @param {string} recognised The recognised sentence.
   */
  constructor(challenge, student, id, created, updated, audioUrl, recognised) {
    this.id = id;
    this.challenge = challenge;
    this.student = student;
    this.created = created;
    this.updated = updated;
    this.audioUrl = audioUrl;
    this.recognised = recognised;
  }

  /**
   * Callback used by createChoiceRecognition.
   *
   * @callback Sdk~Sdk~choiceRecognitionCreatedCallback
   * @param {its.ChoiceRecognition} recognition New choice recognition domain model instance containing the performed recognition.
   */
  choiceRecognitionCreatedCallback(recognition) {}

  /**
   * Error callback used by createChoiceRecognition.
   *
   * @callback Sdk~choiceRecognitionCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechRecording} recording Speech recording domain model instance with unapplied changes.
   */
  choiceRecognitionCreatedErrorCallback(errors, recording) {}

  /**
   * Initialise the choice recognition challenge through RPCs.
   *
   */
  choiceRecognitionInitChallenge(connection, challenge) {
    connection._session.call('nl.itslanguage.choice.init_challenge',
      [connection._recognitionId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function(recognitionId) {
        console.log('Challenge initialised for recognitionId: ' + connection._recognitionId);
      },
      // RPC error callback
      function(res) {
        console.error('RPC error returned:', res.error);
      }
    );
  }

  /**
   * Initialise the pronunciation analysis audio specs through RPCs.
   *
   */
  choiceRecognitionInitAudio(connection, recorder, dataavailableCb) {
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the analysis when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    connection._session.call('nl.itslanguage.choice.init_audio',
      [connection._recognitionId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function(recognitionId) {
        console.log('Accepted audio parameters for recognitionId after init_audio: ' + connection._recognitionId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function(res) {
        console.error('RPC error returned:', res.error);
      }
    );
  }

  /**
   * Start a choice recognition from streaming audio.
   *
   * @param {its.ChoiceChallenge} challenge The choice challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Sdk~choiceRecognitionPreparedCallback} [preparedCb] The callback that signals server is prepared for receiving data.
   * @param {Sdk~choiceRecognitionCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~choiceRecognitionCreatedErrorCallback} [ecb] The callback that handles the error response.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   */
  startStreamingChoiceRecognition(connection, challenge, recorder, preparedCb, cb, ecb, trim) {
    var self = this;
    var _cb = function(data) {
      var recognition = new ChoiceRecognition(
        challenge.id, data.studentId, data.id,
        new Date(data.created), new Date(data.updated),
        connection.addAccessToken(data.audioUrl), data.recognised);
      if (cb) {
        cb(recognition);
      }
    };

    var _ecb = function(data) {
      // There was an unexpected error.
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

    if (connection._recognitionId !== null) {
      console.error('Session with recognitionId ' + connection._recognitionId + ' still in progress.');
      return;
    }
    connection._recognitionId = null;

    // Start streaming the binary audio when the user instructs
    // the audio recorder to start recording.
    var dataavailableCb = function(chunk) {
      var encoded = Base64Utils._arrayBufferToBase64(chunk);
      console.log('Sending audio chunk to websocket for recognitionId: ' +
        connection._recognitionId);
      connection._session.call('nl.itslanguage.choice.write',
        [connection._recognitionId, encoded, 'base64']).then(
        // RPC success callback
        function(res) {
          console.debug('Delivered audio successfully');
        },
        // RPC error callback
        function(res) {
          console.error('RPC error returned:', res.error);
          _ecb(res);
        }
      );
    };

    var recognitionInitCb = function(recognitionId) {
      connection._recognitionId = recognitionId;
      console.log('Got recognitionId after initialisation: ' + connection._recognitionId);
      self.choiceRecognitionInitChallenge(connection, challenge);
      preparedCb(connection._recognitionId);

      if (recorder.hasUserMediaApproval()) {
        self.choiceRecognitionInitAudio(connection, recorder, dataavailableCb);
      } else {
        var userMediaCb = function(chunk) {
          self.choiceRecognitionInitAudio(connection, recorder, dataavailableCb);
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
    connection._session.call('nl.itslanguage.choice.init_recognition', [],
      {trimStart: trimAudioStart,
        trimEnd: trimAudioEnd}).then(
      // RPC success callback
      recognitionInitCb,
      // RPC error callback
      function(res) {
        console.error('RPC error returned:', res.error);
      }
    );

    // Stop listening when the audio recorder stopped.
    var recordedCb = function(id) {
      // When done, submit any plain text (non-JSON) to start analysing.
      connection._session.call('nl.itslanguage.choice.recognise',
        [connection._recognitionId]).then(
        // RPC success callback
        function(res) {
          console.log(res);
          // Wait for analysis results to come back.
          _cb(res);
        },
        // RPC error callback
        function(res) {
          console.error('RPC error returned:', res.error);
          if (res.error === 'nl.itslanguage.recognition_failed') {
            res.kwargs.recognition.message = 'Recognition failed';
          } else {
            res.kwargs.recognition.message = 'Unhandled error';
          }
          _ecb(res.kwargs.analysis);
        }
      );

      recorder.removeEventListener('recorded', recordedCb);
      recorder.removeEventListener('dataavailable', dataavailableCb);
      // This session is over.
      connection._recognitionId = null;
    };
    recorder.addEventListener('recorded', recordedCb);
  }

  /**
   * Callback used by getChoiceRecognition.
   *
   * @callback Sdk~getChoiceRecognitionCallback
   * @param {its.ChoiceRecognition} recognition Retrieved choice recognition domain model instance.
   */
  getChoiceRecognitionCallback(recognition) {}

  /**
   * Error callback used by getChoiceRecognition.
   *
   * @callback Sdk~getChoiceRecognitionErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getChoiceRecognitionErrorCallback(errors) {}

  /**
   * Get a choice recognition in a choice challenge.
   *
   * @param {ChoiceChallenge} challenge Specify a choice challenge.
   * @param {string} recognitionId Specify a choice recognition identifier.
   * @param {Sdk~getChoiceRecognitionCallback} [cb] The callback that handles the response.
   * @param {Sdk~getChoiceRecognitionErrorCallback} [ecb] The callback that handles the error response.
   */
  static getChoiceRecognition(connection, challenge, recognitionId, cb, ecb) {
    var _cb = function(datum) {
      var student = new Student(challenge.organisationId, datum.studentId);
      var recognition = new ChoiceRecognition(challenge, student,
        datum.id, new Date(datum.created), new Date(datum.updated),
        datum.audioUrl);
      // Alignment may not be successful, in which case the recognition
      // is not available, but it's still an attempt that is available,
      // albeit without extended attributes like score and phonemes.
      if (datum.recognised) {
        recognition.recognised = datum.recognised;
      }
      if (cb) {
        cb(recognition);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions/' + recognitionId;
    connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listChoiceRecognitions.
   *
   * @callback Sdk~listChoiceRecognitionsCallback
   * @param {its.ChoiceRecognition[]} recognitions Retrieved choice recognition domain model instances.
   */
  listChoiceRecognitionCallback(recognitions) {}

  /**
   * Error callback used by listChoiceRecognitions.
   *
   * @callback Sdk~listChoiceRecognitionsErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listChoiceRecognitionErrorCallback(errors) {}

  /**
   * List all choice recognitions in a specific choice challenge.
   *
   * @param {ChoiceChallenge} challenge Specify a choice challenge to list speech recognitions for.
   * @param {Sdk~listChoiceRecognitionsCallback} cb The callback that handles the response.
   * @param {Sdk~listChoiceRecognitionsErrorCallback} [ecb] The callback that handles the error response.
   */
  static listChoiceRecognitions(connection, challenge, cb, ecb) {
    var _cb = function(data) {
      var recognitions = [];
      data.forEach(function(datum) {
        var student = new Student(challenge.organisationId, datum.studentId);
        var recognition = new ChoiceRecognition(challenge, student,
          datum.id, new Date(datum.created), new Date(datum.updated),
          datum.audioUrl);
        // Recognition may not be successful, in which case the recognition
        // is not available, but it's still an attempt that is available,
        // albeit without extended attributes like recognised.
        if (datum.recognised) {
          recognition.recognised = datum.recognised;
        }
        recognitions.push(recognition);
      });
      if (cb) {
        cb(recognitions);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions';
    connection._secureAjaxGet(url, _cb, ecb);
  }
}

module.exports = {
  ChoiceRecognition: ChoiceRecognition
};

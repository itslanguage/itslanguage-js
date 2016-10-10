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
 * @class SpeechRecording
 *
 * @member {its.SpeechChallenge} challenge The SpeechChallenge instance this speech is recorded for.
 * @member {its.Student} student The student instance on whose behalve this audio is recorded.
 * @member {string} [id] The speech recording identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 */
class SpeechRecording {
  /**
   * Create a speech recording domain model.
   *
   * @constructor
   * @param {its.SpeechChallenge} challenge The SpeechChallenge instance this speech is recorded for.
   * @param {its.Student} student The Student instance on whose behalve this audio is recorded.
   * @param {string} [id] The speech recording identifier. If none is given, one is generated.
   * @param {blob} audio The recorded audio fragment.
   */
  constructor(challenge, student, id, audio, connection) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    this.id = id;
    if (typeof challenge !== 'object' || !challenge) {
      throw new Error(
        'challenge parameter of type "SpeechChallenge" is required');
    }
    this.challenge = challenge;
    if (typeof student !== 'object' || !student) {
      throw new Error(
        'student parameter of type "Student" is required');
    }
    this.student = student;

    if (!(audio instanceof Blob || audio === null || audio === undefined)) {
      throw new Error(
        'audio parameter of type "Blob|null" is required');
    }
    this.audio = audio;
    this.connection = connection;
  }

  /**
   * Callback used by createSpeechRecording.
   *
   * @callback Sdk~speechRecordingCreatedCallback
   * @param {its.SpeechRecording} recording Updated speech recording domain model instance.
   */
  speechRecordingCreatedCallback(recording) {}

  /**
   * Error callback used by createSpeechRecording.
   *
   * @callback Sdk~speechRecordingCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechRecording} recording Speech recording domain model instance with unapplied changes.
   */
  speechRecordingCreatedErrorCallback(errors, recording) {}

  /**
   * Initialise the speech recording challenge through RPCs.
   *
   */
  speechRecordingInitChallenge(challenge) {
    var self = this;

    this.connection._session.call('nl.itslanguage.recording.init_challenge',
      [self.connection._recordingId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function(recordingId) {
        console.log('Challenge initialised for recordingId: ' + self.connection._recordingId);
      },
      // RPC error callback
      function(res) {
        Connection.logRPCError(res);
      }
    );
  }

  /**
   * Initialise the speech recording audio specs through RPCs.
   *
   */
  speechRecordingInitAudio(recorder, dataavailableCb) {
    var self = this;

    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the recording when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    this.connection._session.call('nl.itslanguage.recording.init_audio',
      [self.connection._recordingId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function(recordingId) {
        console.log('Accepted audio parameters for recordingId after init_audio: ' + self.connection._recordingId);
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
   * Start a speech recording from streaming audio.
   *
   * @param {its.SpeechChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Sdk~speechRecordingPreparedCallback} [preparedCb] The callback that signals server is prepared for receiving data.
   * @param {Sdk~speechRecordingCreatedCallback} [cb] The callback that handles the response. The success outcome is returned as first parameter, whether the recording was forcedStopped due to timer timeout is returned as second parameter.
   * @param {Sdk~speechRecordingCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  startStreamingSpeechRecording(challenge, recorder, preparedCb, cb, ecb) {
    var self = this;
    var _cb = function(data) {
      var student = new Student(challenge.organisationId, data.studentId);
      var recording = new SpeechRecording(
        challenge, student, data.id);
      recording.created = new Date(data.created);
      recording.updated = new Date(data.updated);
      recording.audioUrl = self.connection.addAccessToken(data.audioUrl);
      if (cb) {
        cb(recording);
      }
    };

    var _ecb = function(errors, recording) {
      // Either there was an unexpected error, or the audio failed to
      // align, in which case no recording is provided, but just the
      // basic metadata.
      if (ecb) {
        ecb(errors, null);
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
    if (!this.connection._session) {
      throw new Error('WebSocket connection was not open.');
    }

    if (recorder.isRecording()) {
      throw new Error('Recorder should not yet be recording.');
    }

    if (this.connection._recordingId !== null) {
      console.error('Session with recordingId ' + this.connection._recordingId + ' still in progress.');
      return;
    }
    this.connection._recordingId = null;

    // Start streaming the binary audio when the user instructs
    // the audio recorder to start recording.
    function dataavailableCb(chunk) {
      var encoded = Base64Utils._arrayBufferToBase64(chunk);
      console.log('Sending audio chunk to websocket for recordingId: ' +
        self.connection._recordingId);
      self.connection._session.call('nl.itslanguage.recording.write',
        [self.connection._recordingId, encoded, 'base64']).then(
        // RPC success callback
        function(res) {
          // Wrote data.
        },
        // RPC error callback
        function(res) {
          Connection.logRPCError(res);
          _ecb(res);
        }
      );
    }

    function recordingCb(recordingId) {
      self.connection._recordingId = recordingId;
      console.log('Got recordingId after initialisation: ' + self.connection._recordingId);
      self.speechRecordingInitChallenge(challenge);
      preparedCb(self.connection._recordingId);

      if (recorder.hasUserMediaApproval()) {
        self.speechRecordingInitAudio(recorder, dataavailableCb);
      } else {
        var userMediaCb = function(chunk) {
          self.speechRecordingInitAudio(recorder, dataavailableCb);
          recorder.removeEventListener('ready', recordingCb);
        };
        recorder.addEventListener('ready', userMediaCb);
      }
    }

    this.connection._session.call('nl.itslanguage.recording.init_recording', []).then(
      // RPC success callback
      recordingCb,
      // RPC error callback
      function(res) {
        Connection.logRPCError(res);
        _ecb(res);
      }
    );

    // Stop listening when the audio recorder stopped.
    var recordedCb = function(activeRecordingId, audioBlob, forcedStop) {
      self.connection._session.call('nl.itslanguage.recording.close',
        [self.connection._recordingId]).then(
        // RPC success callback
        function(res) {
          console.log(res);
          // Pass along details to the success callback
          _cb(res, forcedStop);
        },
        // RPC error callback
        function(res) {
          Connection.logRPCError(res);
          _ecb(res);
        }
      );

      recorder.removeEventListener('recorded', recordedCb);
      recorder.removeEventListener('dataavailable', dataavailableCb);
      // This session is over.
      self.connection._recordingId = null;
    };
    recorder.addEventListener('recorded', recordedCb);
  }

  /**
   * Callback used by getSpeechRecording.
   *
   * @callback Sdk~getSpeechRecordingCallback
   * @param {its.SpeechRecording} recording Retrieved speech recording domain model instance.
   */
  getSpeechRecordingCallback(recording) {}

  /**
   * Error callback used by getSpeechRecording.
   *
   * @callback Sdk~getSpeechRecordingErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getSpeechRecordingErrorCallback(errors) {}

  /**
   * Get a speech recording in a speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge.
   * @param {string} recordingId Specify a speech recording identifier.
   * @param {Sdk~getSpeechRecordingCallback} [cb] The callback that handles the response.
   * @param {Sdk~getSpeechRecordingErrorCallback} [ecb] The callback that handles the error response.
   */
  getSpeechRecording(challenge, recordingId, cb, ecb) {
    var self = this;
    var _cb = function(data) {
      var student = new Student(challenge.organisationId, data.studentId);
      var recording = new SpeechRecording(challenge, student, data.id);
      recording.audio = null;
      recording.audioUrl = self.connection.addAccessToken(data.audioUrl);
      recording.created = new Date(data.created);
      recording.updated = new Date(data.updated);
      if (cb) {
        cb(recording);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings/' + recordingId;
    this.connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listSpeechRecordings.
   *
   * @callback Sdk~listSpeechChallegesCallback
   * @param {its.SpeechRecording[]} recordings Retrieved speech recording domain model instances.
   */
  listSpeechRecordingCallback(recordings) {}

  /**
   * Error callback used by listSpeechRecordings.
   *
   * @callback Sdk~listSpeechRecordingsErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listSpeechRecordingErrorCallback(errors) {}

  /**
   * List all speech recordings in a specific speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge to list speech recordings for.
   * @param {Sdk~listSpeechRecordingsCallback} cb The callback that handles the response.
   * @param {Sdk~listSpeechRecordingsErrorCallback} [ecb] The callback that handles the error response.
   */
  listSpeechRecordings(challenge, cb, ecb) {
    var self = this;
    var _cb = function(data) {
      var recordings = [];
      data.forEach(function(datum) {
        var student = new Student(challenge.organisationId, datum.studentId);
        var recording = new SpeechRecording(challenge, student, datum.id);
        recording.audio = null;
        recording.audioUrl = self.connection.addAccessToken(datum.audioUrl);
        recording.created = new Date(datum.created);
        recording.updated = new Date(datum.updated);
        recordings.push(recording);
      });
      if (cb) {
        cb(recordings);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings';
    this.connection._secureAjaxGet(url, _cb, ecb);
  }
}

module.exports = {
  SpeechRecording: SpeechRecording
};

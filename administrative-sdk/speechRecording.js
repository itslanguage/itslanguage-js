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
  constructor(challenge, student, id, audio) {
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
  }

  /**
   * Initialise the speech recording challenge through RPCs.
   *
   */
  speechRecordingInitChallenge(connection, challenge) {
    return connection._session.call('nl.itslanguage.recording.init_challenge',
      [connection._recordingId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function(recordingId) {
        console.log('Challenge initialised for recordingId: ' + connection._recordingId);
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
  speechRecordingInitAudio(connection, recorder, dataavailableCb) {
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the recording when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    connection._session.call('nl.itslanguage.recording.init_audio',
      [connection._recordingId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function(recordingId) {
        console.log('Accepted audio parameters for recordingId after init_audio: ' + connection._recordingId);
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
   * @param {Sdk~speechRecordingPreparedCallback} [preparedCb] The callback that signals server is prepared for
   *   receiving data.
   * @param {Sdk~speechRecordingCreatedCallback} [cb] The callback that handles the response. The success outcome is
   *   returned as first parameter, whether the recording was forcedStopped due to timer timeout is returned as second
   *   parameter.
   * @param {Sdk~speechRecordingCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  startStreamingSpeechRecording(connection, challenge, recorder) {
    // Validate required domain model.
    // Validate environment prerequisites.
    if (typeof challenge !== 'object' || !challenge) {
      return Promise.reject(new Error('"challenge" parameter is required or invalid'));
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
    if (connection._recordingId !== null) {
      return Promise.reject(new Error('Session with recordingId ' + connection._recordingId + ' still in progress.'));
    }
    var self = this;
    return new Promise(function(resolve, reject) {
      connection._recordingId = null;
      var errorEncountered = function(errors, recording) {
          // Either there was an unexpected error, or the audio failed to
          // align, in which case no recording is provided, but just the
          // basic metadata.
        reject(errors);
      };

      var _cb = function(data) {
        var student = new Student(challenge.organisationId, data.studentId);
        var recording = new SpeechRecording(
            challenge, student, data.id);
        recording.created = new Date(data.created);
        recording.updated = new Date(data.updated);
        recording.audioUrl = connection.addAccessToken(data.audioUrl);
        recording.recordingId = connection._recordingId;
        resolve(recording);
      };

      var recordedCb = function(activeRecordingId, audioBlob, forcedStop) {
        connection._session.call('nl.itslanguage.recording.close',
            [connection._recordingId]).then(
            // RPC success callback
            function(res) {
              // Pass along details to the success callback
              _cb(res, forcedStop);
            },
            // RPC error callback
            function(res) {
              connection.logRPCError(res);
              errorEncountered(res);
            }
          );
        recorder.removeEventListener('recorded', recordedCb);
        recorder.removeEventListener('dataavailable', startStreaming);
        connection._recordingId = null;
      };

        // Start streaming the binary audio when the user instructs
        // the audio recorder to start recording.
      function startStreaming(chunk) {
        var encoded = Base64Utils._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for recordingId: ' +
            connection._recordingId);
        connection._session.call('nl.itslanguage.recording.write',
            [connection._recordingId, encoded, 'base64']).then(
            // RPC success callback
            function(res) {
              // Wrote data.
              console.log('Wrote data');
            },
            // RPC error callback
            function(res) {
              Connection.logRPCError(res);
              errorEncountered(res);
            }
          );
      }

      function startRecording(recordingId) {
        connection._recordingId = recordingId;
        console.log('Got recordingId after initialisation: ' + connection._recordingId);
      }

      recorder.addEventListener('recorded', recordedCb);
      connection._session.call('nl.itslanguage.recording.init_recording', [])
          .then(startRecording)
          .then(() => {
            self.speechRecordingInitChallenge(connection, challenge)
                .then(function() {
                  var p = new Promise(function(resolve) {
                    if (recorder.hasUserMediaApproval()) {
                      resolve();
                    } else {
                      recorder.addEventListener('ready', resolve);
                    }
                  });
                  p.then(self.speechRecordingInitAudio(connection, recorder, startStreaming));
                });
          },
            function(res) {
              Connection.logRPCError(res);
              errorEncountered(res);
            }
          );
    }
    );
  }

  /**
   * Get a speech recording in a speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge.
   * @param {string} recordingId Specify a speech recording identifier.
   * @param {Sdk~getSpeechRecordingCallback} [cb] The callback that handles the response.
   * @param {Sdk~getSpeechRecordingErrorCallback} [ecb] The callback that handles the error response.
   */
  static getSpeechRecording(connection, challenge, recordingId) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings/' + recordingId;

    return connection._secureAjaxGet(url)
      .then(data => {
        var student = new Student(challenge.organisationId, data.studentId);
        var recording = new SpeechRecording(challenge, student, data.id);
        recording.audio = null;
        recording.audioUrl = connection.addAccessToken(data.audioUrl);
        recording.created = new Date(data.created);
        recording.updated = new Date(data.updated);
        return recording;
      });
  }

  /**
   * List all speech recordings in a specific speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge to list speech recordings for.
   * @param {Sdk~listSpeechRecordingsCallback} cb The callback that handles the response.
   * @param {Sdk~listSpeechRecordingsErrorCallback} [ecb] The callback that handles the error response.
   */
  static listSpeechRecordings(connection, challenge) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings';

    return connection._secureAjaxGet(url)
      .then(data => {
        var recordings = [];
        data.forEach(function(datum) {
          var student = new Student(challenge.organisationId, datum.studentId);
          var recording = new SpeechRecording(challenge, student, datum.id);
          recording.audio = null;
          recording.audioUrl = connection.addAccessToken(datum.audioUrl);
          recording.created = new Date(datum.created);
          recording.updated = new Date(datum.updated);
          recordings.push(recording);
        });
        return recordings;
      });
  }
}

module.exports = {
  SpeechRecording: SpeechRecording
};

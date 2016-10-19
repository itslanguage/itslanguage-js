const Base64Utils = require('../base64Utils').Base64Utils;
const Connection = require('./connectionController').Connection;
const SpeechRecording = require('../models/speechRecording').SpeechRecording;
const Student = require('../models/student').Student;

/**
 * Controller class for the SpeechRecording model.
 */
class SpeechRecordingController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Initialise the speech recording challenge through RPCs.
   *
   */
  speechRecordingInitChallenge(challenge) {
    var self = this;
    return this.connection._session.call('nl.itslanguage.recording.init_challenge',
      [this.connection._recordingId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      recordingId => {
        console.log('Challenge initialised for recordingId: ' + connection._recordingId);
        return recordingId;
      },
      // RPC error callback
      res => {
        Connection.logRPCError(res);
      }
    );
  }

  /**
   * Initialise the speech recording audio specs through RPCs.
   *
   */
  speechRecordingInitAudio(recorder, dataavailableCb) {
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the recording when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    var self = this;
    this.connection._session.call('nl.itslanguage.recording.init_audio',
      [this.connection._recordingId, specs.audioFormat], specs.audioParameters)
      .then(function(recordingId) {
        console.log('Accepted audio parameters for recordingId after init_audio: ' + self.connection._recordingId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
        return recordingId;
      })
      .catch(res => {
        Connection.logRPCError(res);
        return Promise.reject(res);
      });
  }

  /**
   * Start a speech recording from streaming audio.
   *
   * @param {its.SpeechChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @returns Promise containing a SpeechRecording.
   * @rejects If challenge is not an object or not defined.
   * @rejects If challenge has no id.
   * @rejects If challenge has no organisationId.
   * @rejects If the connection is not open.
   * @rejects If the recorder is already recording.
   * @rejects If a session is already in progress.
   * @rejects If something went wrong during recording.
   */
  startStreamingSpeechRecording(challenge, recorder) {
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
    if (!this.connection._session) {
      return Promise.reject(new Error('WebSocket connection was not open.'));
    }
    if (recorder.isRecording()) {
      return Promise.reject(new Error('Recorder should not yet be recording.'));
    }
    if (this.connection._recordingId !== null) {
      return Promise.reject(new Error('Session with recordingId ' + this.connection._recordingId +
        ' still in progress.'));
    }
    var self = this;
    return new Promise(function(resolve, reject) {
      self.connection._recordingId = null;

      // Either there was an unexpected error, or the audio failed to
      // align, in which case no recording is provided, but just the
      // basic metadata.
      const errorEncountered = reject;

      function _cb(data) {
        var student = new Student(challenge.organisationId, data.studentId);
        var recording = new SpeechRecording(
          challenge, student, data.id);
        recording.created = new Date(data.created);
        recording.updated = new Date(data.updated);
        recording.audioUrl = self.connection.addAccessToken(data.audioUrl);
        recording.recordingId = self.connection._recordingId;
        resolve(recording);
      }

      function recordedCb(activeRecordingId, audioBlob, forcedStop) {
        self.connection._session.call('nl.itslanguage.recording.close',
          [self.connection._recordingId]).then(
          // RPC success callback
          function(res) {
            // Pass along details to the success callback
            _cb(res, forcedStop);
          },
          // RPC error callback
          function(res) {
            Connection.logRPCError(res);
            errorEncountered(res);
          }
        );
        recorder.removeEventListener('recorded', recordedCb);
        recorder.removeEventListener('dataavailable', startStreaming);
        self.connection._recordingId = null;
      }

      // Start streaming the binary audio when the user instructs
      // the audio recorder to start recording.
      function startStreaming(chunk) {
        const encoded = Base64Utils._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for recordingId: ' +
          self.connection._recordingId);
        self.connection._session.call('nl.itslanguage.recording.write',
          [self.connection._recordingId, encoded, 'base64']).then(
          // RPC success callback
          function(res) {
            // Wrote data.
            console.log('Wrote data');
            return res;
          },
          // RPC error callback
          function(res) {
            Connection.logRPCError(res);
            errorEncountered(res);
          }
        );
      }

      function startRecording(recordingId) {
        self.connection._recordingId = recordingId;
        console.log('Got recordingId after initialisation: ' + self.connection._recordingId);
      }

      recorder.addEventListener('recorded', recordedCb);
      self.connection._session.call('nl.itslanguage.recording.init_recording', [])
        .then(startRecording)
        .then(function() {
          self.speechRecordingInitChallenge(challenge)
              .then(function() {
                var p = new Promise(function(resolve) {
                  if (recorder.hasUserMediaApproval()) {
                    resolve_();
                  } else {
                    recorder.addEventListener('ready', resolve_);
                  }
                });
                p.then(self.speechRecordingInitAudio(recorder, startStreaming));
              });
        },
          res => {
            Connection.logRPCError(res);
            errorEncountered(res);
          });
    });
  }

  /**
   * Get a speech recording in a speech challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {SpeechChallenge} challenge Specify a speech challenge.
   * @param {string} recordingId Specify a speech recording identifier.
   * @returns Promise containing a SpeechRecording.
   * @rejects If no result could not be found.
   */
  static getSpeechRecording(connection, challenge, recordingId) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    const url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings/' + recordingId;
    return connection._secureAjaxGet(url)
      .then(data => {
        const student = new Student(challenge.organisationId, data.studentId);
        const recording = new SpeechRecording(challenge, student, data.id);
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
   * @param {Connection} connection Object to connect to.
   * @param {SpeechChallenge} challenge Specify a speech challenge to list speech recordings for.
   * @returns Promise containing a list of SpeechRecording.
   * @rejects If no result could not be found.
   */
  static listSpeechRecordings(connection, challenge) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    const url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings';

    return connection._secureAjaxGet(url)
      .then(data => {
        const recordings = [];
        data.forEach(datum => {
          const student = new Student(challenge.organisationId, datum.studentId);
          const recording = new SpeechRecording(challenge, student, datum.id);
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
  SpeechRecordingController
};

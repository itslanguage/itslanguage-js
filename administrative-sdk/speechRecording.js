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
    return Reflect.apply(connection._session.call, null, ['nl.itslanguage.recording.init_challenge',
      [connection._recordingId, challenge.organisationId, challenge.id]]).then(
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
  speechRecordingInitAudio(connection, recorder, dataavailableCb) {
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the recording when audio is actually submitted.
    const specs = recorder.getAudioSpecs();
    Reflect.apply(connection._session.call, null, ['nl.itslanguage.recording.init_audio',
      [connection._recordingId, specs.audioFormat], specs.audioParameters])
      .then(recordingId => {
        console.log('Accepted audio parameters for recordingId after init_audio: ' + connection._recordingId);
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
   * @param {Connection} connection Object to connect to.
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
    const self = this;
    return new Promise((resolve, reject) => {
      connection._recordingId = null;

      // Either there was an unexpected error, or the audio failed to
      // align, in which case no recording is provided, but just the
      // basic metadata.
      const errorEncountered = reject;

      function _cb(data) {
        const student = new Student(challenge.organisationId, data.studentId);
        const recording = new SpeechRecording(
            challenge, student, data.id);
        recording.created = new Date(data.created);
        recording.updated = new Date(data.updated);
        recording.audioUrl = connection.addAccessToken(data.audioUrl);
        recording.recordingId = connection._recordingId;
        resolve(recording);
      }

      function recordedCb(activeRecordingId, audioBlob, forcedStop) {
        Reflect.apply(connection._session.call, null, ['nl.itslanguage.recording.close',
            [connection._recordingId]]).then(
            // RPC success callback
            res => {
              // Pass along details to the success callback
              _cb(res, forcedStop);
            },
            // RPC error callback
            res => {
              connection.logRPCError(res);
              errorEncountered(res);
            }
          );
        recorder.removeEventListener('recorded', recordedCb);
        recorder.removeEventListener('dataavailable', startStreaming);
        connection._recordingId = null;
      }

        // Start streaming the binary audio when the user instructs
        // the audio recorder to start recording.
      function startStreaming(chunk) {
        const encoded = Base64Utils._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for recordingId: ' +
            connection._recordingId);
        Reflect.apply(connection._session.call, null, ['nl.itslanguage.recording.write',
            [connection._recordingId, encoded, 'base64']]).then(
            // RPC success callback
            res => {
              // Wrote data.
              console.log('Wrote data');
              return res;
            },
            // RPC error callback
            res => {
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
      Reflect.apply(connection._session.call, null, ['nl.itslanguage.recording.init_recording', []])
        .then(startRecording)
        .then(() => {
          self.speechRecordingInitChallenge(connection, challenge)
              .then(() => {
                const p = new Promise(resolve_ => {
                  if (recorder.hasUserMediaApproval()) {
                    resolve_();
                  } else {
                    recorder.addEventListener('ready', resolve_);
                  }
                });
                p.then(self.speechRecordingInitAudio(connection, recorder, startStreaming));
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
  SpeechRecording
};

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
   * Initialise the choice recognition challenge through RPCs.
   *
   */
  choiceRecognitionInitChallenge(connection, challenge) {
    return connection._session.call('nl.itslanguage.choice.init_challenge',
      [connection._recognitionId, challenge.organisationId, challenge.id])
      .then(
        // RPC success callback
        function(recognitionId) {
          console.log('Challenge initialised for recognitionId: ' + connection._recognitionId);
          return recognitionId;
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
        return recognitionId;
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
   * @param {Connection} connection Object to connect to.
   * @param {its.ChoiceChallenge} challenge The choice challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   * @returns Promise containing a SpeechRecognition.
   * @rejects If challenge is not an object or not defined.
   * @rejects If challenge has no id.
   * @rejects If challenge has no organisationId.
   * @rejects If the connection is not open.
   * @rejects If the recorder is already recording.
   * @rejects If a session is already in progress.
   * @rejects If something went wrong during analysis.
   */
  startStreamingChoiceRecognition(connection, challenge, recorder, trim) {
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

    // Validate environment prerequisites.
    if (!connection._session) {
      return Promise.reject(new Error('WebSocket connection was not open.'));
    }

    if (recorder.isRecording()) {
      return Promise.reject(new Error('Recorder should not yet be recording.'));
    }

    if (connection._recognitionId !== null) {
      return Promise.reject(new Error('Session with recognitionId ' + connection._recognitionId +
        ' still in progress.'));
    }

    var self = this;
    var trimAudioStart = 0.15;
    var trimAudioEnd = 0.0;
    if (trim === false) {
      trimAudioStart = 0.0;
    }
    return new Promise(function(resolve, reject) {
      function _cb(data) {
        var recognition = new ChoiceRecognition(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          connection.addAccessToken(data.audioUrl), data.recognised);
        resolve(recognition);
      }

      function _ecb(data) {
        // There was an unexpected error.
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          connection.addAccessToken(data.audioUrl));
        reject(
          {
            analysis: analysis,
            message: data.message
          }
        );
      }

      connection._recognitionId = null;

      // Start streaming the binary audio when the user instructs
      // the audio recorder to start recording.
      function dataavailableCb(chunk) {
        var encoded = Base64Utils._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for recognitionId: ' +
          connection._recognitionId);
        connection._session.call('nl.itslanguage.choice.write',
          [connection._recognitionId, encoded, 'base64']).then(
          // RPC success callback
          function(res) {
            console.debug('Delivered audio successfully');
            return res;
          },
          // RPC error callback
          function(res) {
            console.error('RPC error returned:', res.error);
            _ecb(res);
          }
        );
      }

      function recognitionInitCb(recognitionId) {
        connection._recognitionId = recognitionId;
        console.log('Got recognitionId after initialisation: ' + connection._recognitionId);
      }
      connection._session.call('nl.itslanguage.choice.init_recognition', [],
        {
          trimStart: trimAudioStart,
          trimEnd: trimAudioEnd
        })
        .then(recognitionInitCb)
        .then(function() {
          self.choiceRecognitionInitChallenge(connection, challenge)
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
                self.choiceRecognitionInitAudio(connection, recorder, dataavailableCb);
              });
            });
        })
        .catch(function(res) {
          console.error('RPC error returned:', res.error);
        });

      // Stop listening when the audio recorder stopped.
      function recordedCb() {
        // When done, submit any plain text (non-JSON) to start analysing.
        connection._session.call('nl.itslanguage.choice.recognise',
          [connection._recognitionId]).then(
          // RPC success callback
          function(res) {
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
      }
      recorder.addEventListener('recorded', recordedCb);
    });
  }

  /**
   * Get a choice recognition in a choice challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {ChoiceChallenge} challenge Specify a choice challenge.
   * @param {string} recognitionId Specify a choice recognition identifier.
   * @returns Promise containing a ChoiceRecognition.
   * @rejects If no result could not be found.
   */
  static getChoiceRecognition(connection, challenge, recognitionId) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions/' + recognitionId;

    return connection._secureAjaxGet(url)
      .then(datum => {
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
        return recognition;
      });
  }

  /**
   * List all choice recognitions in a specific choice challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {ChoiceChallenge} challenge Specify a choice challenge to list speech recognitions for.
   * @returns Promise containing a list of ChoiceRecognitions.
   * @rejects If no result could not be found.
   */
  static listChoiceRecognitions(connection, challenge) {
    if (!challenge || !challenge.id) {
      return Promise.reject(new Error('challenge.id field is required'));
    }
    if (!challenge.organisationId) {
      return Promise.reject(new Error('challenge.organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions';
    return connection._secureAjaxGet(url)
      .then(data => {
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
        return recognitions;
      });
  }
}

module.exports = {
  ChoiceRecognition: ChoiceRecognition
};

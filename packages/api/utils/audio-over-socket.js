/**
 * This file contains some re-usable parts for websocket audio communication.
 *
 * @module api/utils/audio-over-socket
 */

import autobahn from 'autobahn';
import {
  getWebsocketConnection,
  makeWebsocketCall,
} from '../communication/websocket';
import broadcaster from '../broadcaster';
import { dataToBase64, asyncBlobToArrayBuffer } from './index';

/**
 * This class allows us to stream audio from the recorder to the backend.
 * @private
 */
class StreamRecorderAudio {
  /**
   * @param {MediaRecorder} recorder - Recorder to use to capture data from.
   * @param {string} rpcName - Name of the registered RPC function.
   */
  constructor(recorder, rpcName, websocketConnection) {
    /**
     * MediaRecorder to process the stream from.
     * @type {MediaRecorder}
     */
    this.recorder = recorder;

    /**
     * Name of the RPC registered.
     * This name will be prepended with 'nl.itslanguage' for better consistency.
     * @type {string}
     */
    this.rpcName = `nl.itslanguage.${rpcName}`;

    /**
     * Store a reference to the websocket connection.
     * @type {autobahn.Connection}
     */
    this.websocketConnection = websocketConnection;

    /**
     * The autobahn.Registration object. This is returned when you register
     * a function through Session.register.
     * @type {null|autobahn.Registration}
     */
    this.registration = null;

    this.sendAudioChunks = this.sendAudioChunks.bind(this);
    this.register = this.register.bind(this);
    this.unregister = this.unregister.bind(this);
  }

  /**
   * This is the function that will be registered to the autobahn realm that the backend will call
   * to receive audio on.
   *
   * Once called, it will prepare the recorder to allow data transmission trough the progressive
   * results meganism.
   *
   * @see https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#register
   * @see https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#progressive-results
   *
   * @private
   * @param {Array} args - Argument list.
   * @param {Object} kwargs - Key-valued argument list.
   * @param {Object} details - Details, just as the progress function.
   * @returns {Promise} - A promise that can be resolved to end the asynchronous behaviour of this
   * registered RCP.
   */
  sendAudioChunks(args, kwargs, details) {
    const defer = new autobahn.when.defer(); // eslint-disable-line new-cap
    let lastChunk = false;

    const processData = ({ data }) => {
      asyncBlobToArrayBuffer(data).then(audioData => {
        if (details.progress) {
          const dataToSend = Array.from(new Uint8Array(audioData));
          details.progress([dataToSend]);

          // If the last one ends, closing time!
          if (lastChunk) {
            defer.resolve();
            this.unregister();
            lastChunk = false;
          }
        } else {
          defer.reject('no progress function registered');
        }
      });
    };

    const recorderStopped = () => {
      // When stopped, the dataavailableevent will be triggered
      // one final time, so make sure it will cleanup afterwards
      lastChunk = true;
    };

    // Before adding the events, let's make sure they have not been added
    // on a previous session;
    this.recorder.removeEventListener('dataavailable', processData);
    this.recorder.removeEventListener('stop', recorderStopped);

    // Now add the event listeners!
    this.recorder.addEventListener('dataavailable', processData);
    this.recorder.addEventListener('stop', recorderStopped);

    // Notify listeners that we are ready to process audio;
    this.recorder.dispatchEvent(new Event('recorderready'));

    return defer.promise;
  }

  /**
   * register the RPC to the autobahn realm.
   * @returns {Promise}
   */
  register() {
    return new Promise((resolve, reject) => {
      const { session } = this.websocketConnection;
      // First cleanup previously created registrations on this session;
      Promise.all(
        session.registrations.map(reg => session.unregister(reg)),
      ).then(() => {
        session
          .register(this.rpcName, this.sendAudioChunks)
          .then(registration => {
            this.registration = registration;
            resolve(registration);
          })
          .catch(reject);
      });
    });
  }

  /**
   * unregister the RPC from the autobahn realm.
   */
  unregister() {
    return new Promise((resolve, reject) => {
      if (!this.registration) {
        resolve(); // There is no registration to unregister!
      } else {
        this.websocketConnection.session
          .unregister(this.registration)
          .then(() => {
            this.registration = null;
            resolve();
          })
          .catch(reject);
      }
    });
  }
}

/**
 * Register a RPC call to the current websocket connection. The backend will call this registered
 * function once, an then we can send progressive results (the details.progress call) to send audio
 * chunks to the backend. We will send those chunks as soon as we got audio from the recorder.
 *
 * When the recording ends we un-register the rpc.
 *
 * @param {MediaRecorder} recorder - Audio recorder instance.
 * @param {string} rpcName - Name of the RPC to register. This name will be prepended with
 * nl.itslanguage for better consistency.
 * @fires broadcaster#websocketserverreadyforaudio
 * @returns {Promise} - It returns a promise with the service registration as result.
 */
export function registerStreamForRecorder(recorder, rpcName) {
  // Start registering a RPC call. As a result, this function will return a promise with the
  // registration of the RPC as result.
  return new Promise((resolve, reject) => {
    getWebsocketConnection().then(websocketConnection => {
      const streamingSession = new StreamRecorderAudio(
        recorder,
        rpcName,
        websocketConnection,
      );
      streamingSession
        .register()
        .then(registration => {
          /**
           * Notify that we are ready to process audio.
           * @event broadcaster#websocketserverreadyforaudio
           * @deprecated will be removed in a future version
           */
          broadcaster.emit('websocketserverreadyforaudio');
          recorder.dispatchEvent(new Event('websocketserverreadyforaudio'));
          resolve(registration);
        })
        .catch(reject);
    });
  });
}

/**
 * Encode the audio as base64 and send it to the websocket server.
 *
 * @param {string} id - The reserved ID for the audio.
 * @param {MediaRecorder} recorder - The recorder to use to get the recording.
 * @param {string} rpc - The RPC to use to store the data.
 *
 * @returns {Promise<*>} - The response of the given RPC.
 */
export function encodeAndSendAudioOnDataAvailable(id, recorder, rpc) {
  return new Promise((resolve, reject) => {
    let lastChunk = false;

    // When data is received from the recorder, it will be in Blob format.
    // When we read the data from the Blob element, base64 it and send it to
    // the websocket server and continue with the chain.
    const processData = ({ data }) => {
      asyncBlobToArrayBuffer(data).then(audioData => {
        const encoded = dataToBase64(audioData);
        // Send the audio
        makeWebsocketCall(rpc, { args: [id, encoded, 'base64'] })
          .then(result => {
            /* istanbul ignore else */
            if (lastChunk) {
              resolve(result);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    };

    const recorderStopped = () => {
      // When stopped, the dataavailable event will be triggered
      // one final time, so make sure it will cleanup afterwards
      lastChunk = true;
    };

    // Before adding the events, let's make sure they have not been added
    // on a previous session;
    recorder.removeEventListener('dataavailable', processData);
    recorder.removeEventListener('stop', recorderStopped);

    // Now add the event listeners!
    recorder.addEventListener('dataavailable', processData);
    recorder.addEventListener('stop', recorderStopped);

    // Notify listeners that we are ready to process audio;
    recorder.dispatchEvent(new Event('recorderready'));
  });
}

/**
 * Send the recorder settings to the websocket server to initialize it.
 *
 * The reserved ID (passed in the parameters) is returned once the promise is resolved.
 *
 * @param {string} id - The reserved ID for the audio.
 * @param {MediaRecorder} recorder - The recorder which has been set up to record.
 * @param {string} rpc - The RPC to use to initialize the websocket server.
 *
 * @emits {websocketserverreadyforaudio} - When the websocket server has been prepared for and is
 * ready to receive the audio.
 *
 * @returns {Promise} - The promise which resolves when the websocket server is ready for the audio.
 */
export function prepareServerForAudio(id, recorder, rpc) {
  const { audioFormat, audioParameters } = recorder.getAudioSpecs();
  return makeWebsocketCall(rpc, {
    args: [id, audioFormat],
    kwargs: audioParameters,
  }).then(() => {
    // We've prepped the websocket server, now it can receive audio. Broadcast
    // that it is allowed to record.
    // This call is deprecated and will be removed in a future version, the
    // event on the recorder will stay.
    broadcaster.emit('websocketserverreadyforaudio');
    recorder.dispatchEvent(new Event('websocketserverreadyforaudio'));
    return id;
  });
}

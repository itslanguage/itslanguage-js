/**
 * This file contains some re-usable parts for websocket audio communication.
 */

import {getWebsocketConnection, makeWebsocketCall} from '../communication/websocket';
import autobahn from 'autobahn';
import broadcaster from '../broadcaster';
import {createWAVEHeader} from '../../audio/wave-packer';
import {dataToBase64} from './index';


/**
 * Encode the audio as base64 and send it to the websocket server.
 *
 * @param {string} id - The reserved ID for the audio.
 * @param {MediaRecorder|Recorder} recorder - The recorder to use to get the recording.
 * @param {string} rpc - The RPC to use to store the data.
 *
 * @returns {Promise.<*>} - The response of the given RPC.
 */
export function encodeAndSendAudioOnDataAvailible(id, recorder, rpc) {
  return new Promise((resolve, reject) => {
    // When the audio is done recording: encode the data, send it to the
    // websocket server and continue with the chain.
    recorder.addEventListener('dataavailable', chunk => {
      const encoded = dataToBase64(chunk);
      makeWebsocketCall(rpc, {args: [id, encoded, 'base64']})
        .then(resolve, reject);
    });
  });
}

/**
 * Register a RPC call to the current websocket connection. The backend will call this registered
 * function once, an then we can send progressive results (the details.progress call) to send audio
 * chunks to the backend. We will send those chunks as soon as we got audio from the recorder.
 *
 * When the recording ends we un-register the rpc.
 *
 * @todo make the unregistering more solid. It can break way to easy now. One way could be, for
 *       example, to keep a list of registered RPC's and set a timer to unregister them.
 *
 * @param {Recorder} recorder - Audio recorder instance.
 * @param {string} rpcName - Name of the RPC to register. This name will be prepended with
 *                           nl.itslanguage for better consistency.
 * @returns {Promise<any>} - It returns a promise with the service registration as result.
 */
export function registerStreamForRecorder(recorder, rpcName) {
  const rpc = `nl.itslanguage.${rpcName}`;
  let rpcRegistration = null;

  /**
   * This is the actual RPC function that the backend will call. We need to make use of the
   * autobahn deferred object (based on When.js, an older version) to be able to use progressive
   * calls. Native promises don't support progressive result (it is not in the Promise A+ spec).
   *
   * For the audio chunks we assume to send audio according to the WAVE format. For this to happen
   * we need to prepend our raw data with a WAVE file header. We do this as first step if data
   * becomes available.
   *
   * @see https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#register
   * @see https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#progressive-results
   *
   * @param {Array} args - Argument list.
   * @param {Object} kwargs - Key-valued argument list.
   * @param {Object} details - Details, just as the progress function.
   * @returns {Promise} - A promise that can be resolved to end the asynchronous behaviour of this
   *                      registered RCP.
   */
  function sendAudioChunks(args, kwargs, details) {
    // eslint-disable-next-line new-cap
    const defer = new autobahn.when.defer();
    const {audioParameters: {channels, sampleRate}} = recorder.getAudioSpecs();
    const headerArrBuff = createWAVEHeader(channels, sampleRate);
    const header = Array.from(new Uint8Array(headerArrBuff));
    let headerSent = false;

    if (details.progress) {
      // Listen for recording events.
      recorder.addEventListener('dataavailable', chuck => {
        if (!headerSent) {
          // Sent the empty wave header first, this is needed
          // for containerized WAVE files.
          details.progress([header]);
          headerSent = true;
        }

        // Send the data chunks to the backend! Whoop whoop!
        const dataToSend = Array.from(new Uint8Array(chuck));
        details.progress([dataToSend]);
      });

      // Recording is done. Resolve and unregister now please!
      recorder.addEventListener('recorded', () => {
        defer.resolve();
        if (rpcRegistration) {
          getWebsocketConnection().then(connection => connection.session.unregister(rpcRegistration));
        }
      });
    }

    return defer.promise;
  }

  // Start registering a RPC call. As a result, this function will return a promise with the
  // registration of the RPC as result.
  return new Promise(resolve => {
    getWebsocketConnection().then(connection => {
      connection.session.register(rpc, sendAudioChunks).then(registration => {
        // Registering done. Save it so we can un-register later on.
        rpcRegistration = registration;
        resolve(registration);
      });
    });
  });
}

/**
 * Send the recorder settings to the websocket server to initialize it.
 *
 * The reserved ID (passed in the parameters) is returned once the promise is
 * resolved.
 *
 * @param {string} id - The reserved ID for the audio.
 * @param {MediaRecorder|Recorder} recorder - The recorder which has been set up to
 *                                   record.
 * @param {string} rpc - The RPC to use to initialize the websocket server.
 *
 * @emits {websocketserverreadyforaudio} - When the websocket server has been
 *                                         prepared for and is ready to receive
 *                                         the audio.
 *
 * @returns {Promise} - The promise which resolves when the websocket server
 *                      is ready for the audio.
 */
export function prepareServerForAudio(id, recorder, rpc) {
  const {audioFormat, audioParameters} = recorder.getAudioSpecs();
  return makeWebsocketCall(rpc, {args: [id, audioFormat], kwargs: audioParameters})
    .then(() => {
      // We've preped the websocket server, now it can receive audio. Broadcast
      // that it is allowed to record.
      broadcaster.emit('websocketserverreadyforaudio');
      return id;
    });
}


/**
 * Wait for the recorder to get the permission for user media.
 *
 * The reserved ID (passed in the parameters) is returned once the promise is
 * resolved.
 *
 * @param {string} id - The reserved ID for the audio.
 * @param {MediaRecorder|Recorder} recorder - The recorder for which to wait.
 *
 * @returns {Promise} - The promise which resolves if the user has allowed us
 *                      to record them.
 */
export function waitForUserMediaApproval(id, recorder) {
  return new Promise(resolve => {
    // We need the user's permission in order to record the audio. Wait for
    // it if we don't have it already.
    if (recorder.hasUserMediaApproval()) {
      resolve();
    } else {
      recorder.addEventListener('ready', resolve);
    }
  }).then(() => id);
}

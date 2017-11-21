/**
 * This file contains some re-usable parts for websocket audio communication.
 */

import broadcaster from '../broadcaster';
import {dataToBase64} from './index';
import {makeWebsocketCall} from '../communication/websocket';


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
 * @param {MediaRecorder} recorder - The recorder for which to wait.
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

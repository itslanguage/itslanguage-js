/**
 * This file contains the functions that are needed to interact with the ITSLanguage Speech
 * Feedback API.
 *
 * It's possible to get feedback while recording. After every sentence feedback is provided
 * indicating whether or not the sentence was read well. This will be done through the
 * ITSLanguage WebSocket Server.
 *
 * The general approach for getting real-time feedback is:
 *  - Prepare the speech feedback
 *  - Register audio procedure for streaming
 *  - Start listening for audio
 *
 *  To read up on the Speech feedback:
 *  @see https://itslanguage.github.io/itslanguage-docs/websocket/feedback/index.html
 *
 *  To read more on Speech Challenges:
 *  @see https://itslanguage.github.io/itslanguage-docs/api/speech_challenges/index.html
 *
 *  @module api/challenges/feedback/speech
 */

import { registerStreamForRecorder } from '../../utils/audio-over-socket';
import {
  makeWebsocketCall,
  closeWebsocketConnection,
} from '../../communication/websocket';

/**
 * Prepare a new Speech Feedback.
 * Should be called upon each new speech feedback.
 * The backend will generate an unique ID for the feedback and prepare a speech challenge.
 *
 * @param {string} challengeId - The ID of the challenge to prepare.
 * @returns {Promise} - The ID of the Speech Feedback.
 */
export function prepare(challengeId) {
  return makeWebsocketCall('feedback.prepare', { args: [challengeId] });
}

/**
 * In order to receive feedback the server needs to listen for audio on a registered audio rpc.
 * While listening the server will reply using progressive results. The server will stop listening
 * when the audio rpc returns.
 *
 * If you call this function the SDK will register an RPC method to the realm on which audio will be
 * streamed to the backend.
 *
 * @param {string} feedbackId - The Id of the Feedback Challenge.
 * @param {Function} progressCb - A callback which will be used to receive progress on.
 * @param {MediaRecorder} recorder - Audio recorder instance.
 * @param {string} [dataEvent] - Optional the event to collect data from.
 * @returns {Promise} - After each sentence there will be real-time feedback on that sentence. This
 * feedback will be given through the progressiveResultsCb function. When the rpc is done, the
 * promise will return an recording with the appropriate feedback per sentence.
 */
export function listenAndReply(feedbackId, progressCb, recorder, dataEvent) {
  // Generate a somewhat unique RPC name
  const rpcNameToRegister = `feedback.stream.${Math.floor(Date.now() / 1000)}`;

  // Below we use registration.procedure instead of rpcNameToRegister. This is because the later
  // lacks some namespace information that we do need.
  return registerStreamForRecorder(recorder, rpcNameToRegister, dataEvent).then(
    registration =>
      makeWebsocketCall('feedback.listen_and_reply', {
        args: [feedbackId, registration.procedure],
        progressCb: progressCb.bind(null, feedbackId),
      }),
  );
}

/**
 * Feedback can be paused. This will stop the backend from processing the audio stream and returning
 * feedback.
 *
 * Important note: Pausing the feedback will not stop the feedback. Also make sure to stop sending
 * data from the recorder to the backend.
 *
 * @param {string} feedbackId - The ID of the feedback to pause.
 * @returns {Promise} - An error if something went wrong.
 */
export function pause(feedbackId) {
  return makeWebsocketCall('feedback.pause', { args: [feedbackId] });
}

/**
 * A paused feedback can be resumed at a sentence in the challenge. If not provided, it will resume
 * at the first sentence.
 *
 * @param {string} feedbackId - The ID of the feedback to resume.
 * @param {string} sentenceId - The ID of the sentence to resume feedback from.
 * @returns {Promise} - An error if something went wrong.
 */
export function resume(feedbackId, sentenceId = 0) {
  return makeWebsocketCall('feedback.resume', {
    args: [feedbackId, sentenceId],
  });
}

/**
 * Function for convenience. Using this function calls the corresponding functions so that the
 * required backend flow is backed up.
 *
 * It will call the following functions (and more important, in the correct order):
 *  - {@link prepare}.
 *  - {@link listenAndReply}.
 *
 * @param {string} challengeId - The Id of the Challenge to get feedback on.
 * @param {Function} progressiveResultsCb - A callback which will be used to receive progress on.
 * @param {MediaRecorder} recorder - Audio recorder instance.
 * @param {string} dataEvent - The event to use to collect data from.
 * @returns {Promise} - After each sentence there will be real-time feedback on that sentence. This
 * feedback will be given through the progressiveResultsCb function. When the rpc is done, the
 * promise will return an recording with the appropriate feedback per sentence.
 */
export function feedback(
  challengeId,
  progressiveResultsCb,
  recorder,
  dataEvent,
) {
  return prepare(challengeId)
    .then(feedbackId =>
      listenAndReply(feedbackId, progressiveResultsCb, recorder, dataEvent),
    )
    .finally(() => closeWebsocketConnection());
}

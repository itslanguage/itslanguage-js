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
 *  @TODO: The feedback.pause and feedback.resume are not implemented yet.
 */

import {
  registerStreamForRecorder,
  waitForUserMediaApproval
} from '../../utils/audio-over-socket';
import {makeWebsocketCall} from '../../communication/websocket';

/**
 * Prepare a new Speech Feedback.
 * Should be called upon each new speech feedback.
 * The backend will generate an unique ID for the feedback and prepare a speech challenge.
 *
 * @param {string} challengeId - The ID of the challenge to prepare.
 * @returns {Promise} - The ID of the Speech Feedback.
 */
export function prepareFeedback(challengeId) {
  return makeWebsocketCall('feedback.prepare', {args: [challengeId]});
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
 * @param {Recorder} recorder - Audio recorder instance.
 * @returns {Promise} - After each sentence there will be real-time feedback on that sentence. This
 *                      feedback will be given through the progressiveResultsCb function. When the
 *                      rpc is done, the promise will return an recording with the appropriate
 *                      feedback per sentence.
 */
export function listenAndReply(feedbackId, progressCb, recorder) {
  // Generate a somewhat unique RPC name
  const rpcNameToRegister = `feedback.stream.${Math.floor(Date.now() / 1000)}`;

  // Below we use registration.procedure instead of rpcNameToRegister. This is because the later
  // lacks some namespacing information that we do need.
  return registerStreamForRecorder(recorder, rpcNameToRegister)
    .then(registration =>
      makeWebsocketCall(
        'feedback.listen_and_reply',
        {
          args: [feedbackId, registration.procedure],
          progressCb
        }
      )
    );
}

/**
 * Feedback can be paused. This will stop the backend from processing the audio stream and returning
 * feedback.
 *
 * Important note: pausing the feedback will not stop the feedback. Also make sure to stop sending
 *                 data from the recorder to the backend.
 *
 * @param {string} feedbackId - The ID of the feedback to pause.
 * @returns {Promise} - An error if something went wrong.
 */
export function pause(feedbackId) {
  return makeWebsocketCall('feedback.pause', {args: [feedbackId]});
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
  return makeWebsocketCall('feedback.resume', {args: [feedbackId, sentenceId]});
}

/**
 * Function for convenience. Using this function calls the corresponding functions so that the
 * required backend flow is backed up.
 *
 * It will call the following functions (and more important, in the correct order):
 *  - {@link prepareFeedback}.
 *  - {@link waitForUserMediaApproval}.
 *  - {@link listenAndReply}.
 *
 * @param {string} challengeId - The Id of the Challenge to get feedback on.
 * @param {Function} progressiveResultsCb - A callback which will be used to receive progress on.
 * @param {Recorder} recorder - Audio recorder instance.
 * @returns {Promise} - After each sentence there will be real-time feedback on that sentence. This
 *                      feedback will be given through the progressiveResultsCb function. When the
 *                      rpc is done, the promise will return an recording with the appropriate
 *                      feedback per sentence.
 */
export function feedback(challengeId, progressiveResultsCb, recorder) {
  return prepareFeedback(challengeId)
    .then(feedbackId => waitForUserMediaApproval(feedbackId, recorder))
    .then(feedbackId => listenAndReply(feedbackId, progressiveResultsCb, recorder));
}

/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage speech recordings API.
 *
 * Note that this is one of the "nested" or "composite" APIs; You can only
 * obtain the data if you provide a reference to the challenge for which you
 * want a recording.
 */

import {
  encodeAndSendAudioOnDataAvailible,
  prepareServerForAudio,
  waitForUserMediaApproval
} from '../../utils/audio-over-socket';
import {authorisedRequest} from '../../communication';
import {makeWebsocketCall} from '../../communication/websocket';

// The URL for the speech recording handler(s).
const url = challenge => `/challenges/speech/${challenge}/recordings`;


/**
 * Get a single speech recording by its ID.
 *
 * @param {string} challenge - The ID of the challenge for which the recording
 *                             was made.
 * @param {string} id - The ID of the desired speech recording.
 *
 * @returns {Promise} - The promise for the speech recording.
 */
export function getSpeechRecordingByID(challenge, id) {
  return authorisedRequest('GET', `${url(challenge)}/${id}`);
}


/**
 * Get a all speech recordings.
 *
 * By default all speech recordings are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {string} challenge - The ID of the challenge for which the recording
 *                             was made.
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the speech recordings.
 */
export function getAllSpeechRecordings(challenge, filters) {
  let urlWithFilters = url(challenge);

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}


/**
 * Create a new recording for the given challenge with the data from the given
 * recorder.
 *
 * @param {string} challenge - The ID of the challenge for which a recording
 *                             is made.
 * @param {MediaRecorder} recorder - The recorder to use to get the recording.
 *
 * @emits {websocketserverreadyforaudio} - When the websocket server has been
 *                                         prepared for and is ready to receive
 *                                         the audio.
 *
 * @returns {Promise} - The promise which resolves once the speech recording
 *                      has successfully been stored.
 */
export function createSpeechRecording(challenge, recorder) {
  return makeWebsocketCall('recording.init_recording')
    // Initializeing the recording ought to give us an ID for the recording we
    // are creating right now.
    .then(recording => makeWebsocketCall('recording.init_challenge', {args: [recording, challenge]}))
    // We've linked it to the speech challenge now. We also should have
    // received the recording ID once again.
    .then(recording => waitForUserMediaApproval(recording, recorder))
    // Alright, we should have permission to record the user. Time to prep the
    // websocket server.
    .then(recording => prepareServerForAudio(recording, recorder, 'recording.init_audio'))
    // We've preped the websocket server so it knows what audio format we are
    // using and all the extra floof that comes with it.
    .then(recording => encodeAndSendAudioOnDataAvailible(recording, recorder, 'recording.write'))
    // When we are done; close the connection.
    .then(recording => makeWebsocketCall('recording.close', {args: [recording]}));
}

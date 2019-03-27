/**
 * This file contains the readily available functions which interact with the ITSLanguage speech
 * recordings API.
 *
 * Note that this is one of the "nested" or "composite" APIs; You can only obtain the data if you
 * provide a reference to the challenge for which you want a recording.
 *
 * @module api/challenges/speech/recordings
 */

import {
  encodeAndSendAudioOnDataAvailable,
  prepareServerForAudio,
} from '../../utils/audio-over-socket';
import { authorisedRequest } from '../../communication';
import { makeWebsocketCall } from '../../communication/websocket';

/**
 * The URL for the speech recording handler(s).
 *
 * @param challenge
 * @returns {string}
 */
const url = challenge => `/challenges/speech/${challenge}/recordings`;


/**
 * Create a new speech recording.
 *
 * @param {Object} challengeId - The ID of the challenge to create a recording for.
 * @param {Object} recording - The recording to create.
 *
 * @returns {Promise} - The recording creation promise.
 */
export function create(challengeId, recording) {
  return authorisedRequest('POST', url(challengeId), recording);
}


/**
 * Get a single speech recording by its ID.
 *
 * @param {string} challenge - The ID of the challenge for which the recording  was made.
 * @param {string} id - The ID of the desired speech recording.
 *
 * @returns {Promise} - The promise for the speech recording.
 */
export function getById(challenge, id) {
  return authorisedRequest('GET', `${url(challenge)}/${id}`);
}


/**
 * Get a all speech recordings.
 *
 * By default all speech recordings are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {string} challenge - The ID of the challenge for which the recording was made.
 * @param {URLSearchParams} [filters] - The filters to apply to the category list.
 *
 * @throws {Promise<string>} - If the given optional filters are not an instance of
 * `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the speech recordings.
 */
export function getAll(challenge, filters) {
  let urlWithFilters = url(challenge);

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject(new Error('The filters should be a `URLSearchParams` object.'));
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}


/**
 * Create a new recording for the given challenge with the data from the given recorder.
 *
 * @param {string} challenge - The ID of the challenge for which a recording is made.
 * @param {MediaRecorder} recorder - The recorder to use to get the recording.
 *
 * @emits {websocketserverreadyforaudio} - When the websocket server has been prepared for and is
 * ready to receive the audio.
 *
 * @returns {Promise} - The promise which resolves once the speech recording has successfully been
 * stored.
 */
export function record(challenge, recorder) {
  let recordingId = null;

  return makeWebsocketCall('recording.init_recording')
    // Initializing the recording to give us an ID for the recording we are creating right now.
    .then((recording) => {
      recordingId = recording;
      return makeWebsocketCall('recording.init_challenge', { args: [recordingId, challenge] });
    })
    // We've linked it to the speech challenge now. We also should have
    // received the recording ID once again.
    .then(() => prepareServerForAudio(recordingId, recorder, 'recording.init_audio'))
    // We've prepped the websocket server so it knows what audio format we are
    // using and all the extra floof that comes with it.
    .then(() => encodeAndSendAudioOnDataAvailable(recordingId, recorder, 'recording.write'))
    // When we are done; close the connection.
    .then(() => makeWebsocketCall('recording.close', { args: [recordingId] }));
}

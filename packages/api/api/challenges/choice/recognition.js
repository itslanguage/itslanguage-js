/**
 * This file contains the readily available functions which interact with the
 * ITSLanguage choice recognition API.
 *
 * Speech recognitions can be stored and retrieved for user submitted audio using the ITSLanguage
 * Speech API. The actual recognitions are performed by the ITSLanguage websocket server.
 *
 * For streaming, note that this is one of the "nested" or "composite" APIs; You can only obtain the
 * data if you provide a reference to the challenge for which you want a recording.
 *
 * @module sdk/lib/api/challenges/choice/recognition
 */

import { registerStreamForRecorder } from '../../utils/audio-over-socket';
import { authorisedRequest } from '../../communication';
import { makeWebsocketCall } from '../../communication/websocket';

/**
 * The URL for the choice recognition challenge handler(s).
 *
 * @param challengeId
 * @returns {string}
 */
const url = challengeId => `/challenges/choice/${challengeId}/recognitions`;


/**
 * Submit an audio fragment for recognition. The recognition is created for the current
 * authenticated user.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/recognitions/index.html#create-a-choice-recognition
 * @param {string} challengeId - The ID of the challenge to relate the recognition to.
 * @param {Blob} audio - The actual audio.
 * @param {string} recognised - The recognised string.
 * @param {string} [recognitionId=null] - Unique identifier for the recognition. If none is given,
 * one is generated.
 * @returns {Promise} - The created recognition with an url to download the audio if needed.
 */
export function create(challengeId, audio, recognised, recognitionId = null) {
  const recognition = {
    audio,
    recognised,
  };

  if (recognitionId) {
    recognition.id = recognitionId;
  }

  return authorisedRequest(
    'POST',
    `${url(challengeId)}`,
    recognition,
  );
}


/**
 * Get a single ChoiceRecognition by its ID.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/recognitions/index.html#get-a-single-choice-recognition
 * @param {string} challengeId - ID of the Choice Challenge to get all the recognitions for.
 * @param {string} id - ID of the choice recognition to get.
 * @returns {Promise} - Promise with the Choice Recognition as result if successful.
 */
export function getById(challengeId, id) {
  return authorisedRequest('GET', `${url(challengeId)}/${id}`);
}


/**
 * Get all Choice Recognitions for a specific Choice Challenge.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/recognitions/index.html#list-choice-recognitions
 * @param {string} challengeId - ID of the Choice Challenge to get all the recognitions for.
 * @returns {Promise} - Promise with the Choice Recognitions as result if successful.
 */
export function getAll(challengeId) {
  return authorisedRequest('GET', `${url(challengeId)}`);
}


/**
 * This is the starting point for a choice recognition. A unique recognition id is generated,
 * which serves a leading role in the recognition. Each other call requires the recognition id
 * as a parameter.
 *
 * If other RPCs are called without this RPC being called first, the error
 * `nl.itslanguage.session_not_initialised` will be returned.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/websocket/choice_recognitions/index.html#initialising-a-choice-recognition
 * @returns {Promise} - Returns a promise. When successfully the ID of the recognition is returned.
 */
export function prepare() {
  return makeWebsocketCall('choice.init_recognition');
}


/**
 * Before performing the recognition, a WFST needs to be prepared for the challenge. When the RPC is
 * called, the challenge is initialised asynchronously. When the challenge is to be used, the server
 * automatically waits for the challenge initialisation to finish. If the initialisation results in
 * an error, the error is relayed to the client.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/websocket/choice_recognitions/index.html#initialise-choice-challenge
 * @param {string} recognitionId - The ID of the recognition to prepare the challenge for.
 * @param {string} challengeId - The ID of the challenge to prepare.
 * @returns {Promise} - If succesful the promise returns nothing. On error, there will be an error.
 */
export function prepareChallenge(recognitionId, challengeId) {
  return makeWebsocketCall('choice.init_challenge', { args: [recognitionId, challengeId] });
}


/**
 * Based on a recognitionId and a recorder register a RPC call that will be used to send the audio
 * across the line. The actual registration will not be done here, but we send the RPC that the
 * backend needs to call to the 'nl.itslanguage.choice.recognise' function.
 *
 * @param {string} recognitionId - The ID of the recognition to send audio for.
 * @param {MediaRecorder} recorder - Audio recorder instance.
 * @returns {Promise} - When all good, the result will have the actual recognition.
 */
export function recogniseAudioStream(recognitionId, recorder) {
  // Generate a somewhat unique RPC name
  const rpcNameToRegister = `choice.stream.${Math.floor(Date.now() / 1000)}`;
  return registerStreamForRecorder(recorder, rpcNameToRegister)
    // We don't use rpcNameToRegister here because it lacks some namespacing info. The
    // registration.procedure does have the needed information.
    .then(registration => makeWebsocketCall('choice.recognise', { args: [recognitionId, registration.procedure] }));
}


/**
 * Easy function to do a recognition in one go. This is the "dance of the RPC's" that needs to be
 * done in order to get correct feedback from the backend.
 *
 * @param {string} challengeId - The ID of the challenge to take the recognition for.
 * @param {MediaRecorder} recorder - Audio recorder instance.
 * @returns {Promise<*>} - If all good it returns the actual recognition. If not, any error can be
 * expected to be returned.
 */
export function recognise(challengeId, recorder) {
  let recognitionId;
  return prepare()
    .then((rId) => {
      recognitionId = rId;
      return rId;
    })
    .then(() => prepareChallenge(recognitionId, challengeId))
    .then(() => recogniseAudioStream(recognitionId, recorder).then(result => result));
}

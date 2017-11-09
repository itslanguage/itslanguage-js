/**
 * This file contains the readily available functions which interact with the
 * ITSLanguage choice recognition API.
 *
 * Speech recognitions can be stored and retrieved for user submitted audio using the ITSLanguage
 * Speech API. The actual recognitions are performed by the ITSLanguage websocket server.
 *
 * For streaming, note that this is one of the "nested" or "composite" APIs; You can only obtain the
 * data if you provide a reference to the challenge for which you want a recording.
 */

import {
  encodeAndSendAudioOnDataAvailible,
  prepareServerForAudio, waitForUserMediaApproval
} from '../../utils/audio-over-socket';
import {authorisedRequest} from '../../communication';
import {makeWebsocketCall} from '../../communication/websocket';

const url = challengeId => `/challenges/choice/${challengeId}/recognitions`;

/**
 * Get all Choice Recognitions for a specific Choice Challenge.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/recognitions/index.html#list-choice-recognitions
 * @param {string} challengeId - ID of the Choice Challenge to get all the recognitions for.
 * @returns {Promise} - Promise with the Choice Recognitions as result if successful.
 */
export function getAllChoiceRecognitions(challengeId) {
  return authorisedRequest('GET', `${url(challengeId)}`);
}

/**
 * Get a single ChoiceRecognition by its ID.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/recognitions/index.html#get-a-single-choice-recognition
 * @param {string} challengeId - ID of the Choice Challenge to get all the recognitions for.
 * @param {string} id - ID of the choice recognition to get.
 * @returns {Promise} - Promise with the Choice Recognition as result if successful.
 */
export function getChoiceRecognitionByID(challengeId, id) {
  return authorisedRequest('GET', `${url(challengeId)}/${id}`);
}

/**
 * Submit an audio fragment for recognition. The recognition is created for the current
 * authenticated user.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/recognitions/index.html#create-a-choice-recognition
 * @param {string} challengeId - The ID of the challenge to relate the recognition to.
 * @param {Blob} audio - The actual audio.
 * @param {string} recognised - The recognised string.
 * @param {string} [recognitionId=null] - Unique identifier for the recognition. If none is given,
 *                                        one is generated.
 * @returns {Promise} - The created recognition with an url to download the audio if needed.
 */
export function createChoiceRecognition(challengeId, audio, recognised, recognitionId = null) {
  return authorisedRequest(
    'POST',
    `${url(challengeId)}/${recognitionId && recognitionId}`,
    {
      audio,
      recognised
    }
  );
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
export function prepareChoiceRecognition() {
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
export function prepareChoiceRecognitionChallenge(recognitionId, challengeId) {
  return makeWebsocketCall('choice.init_challenge', {args: [recognitionId, challengeId]});
}

/**
 * The audio that is to be uploaded for recognition is streamed to the server. Some information is
 * required in order for the server to be able to store and use the audio correctly.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/websocket/choice_recognitions/index.html#initialising-audio-for-uploading
 * @param {string} recognitionId - The ID of the recognition to initialise the audio for.
 * @param {Recorder} recorder - Instance of a recorder. The metadata will be extracted elsewhere.
 * @returns {Promise} - If it fails an error will be returned. Otherwise nothing will be returned.
 */
export function prepareAudioForChoiceRecognition(recognitionId, recorder) {
  return prepareServerForAudio(recognitionId, recorder, 'choice.init_audio');
}

/**
 * The streaming works by repeatedly calling this RPC. Each time the RPC is called, the data will be
 * appended to an audio file on the server.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/websocket/choice_recognitions/index.html#stream-recognition-audio
 * @param {string} recognitionId - The ID of the recognition for which to upload audio.
 * @param {Recorder} recorder - Instance of a recorder. The data will be fetched from it.
 * @returns {Promise} - If it fails an error will be returned. Otherwise there will be no result.
 */
export function writeAudioForChoiceRecognition(recognitionId, recorder) {
  return encodeAndSendAudioOnDataAvailible(recognitionId, recorder, 'choice.write');
}

/**
 * After completing the streaming of the audio, the recognition can be performed.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/websocket/choice_recognitions/index.html#perform-the-recognition
 * @param {string} recognitionId - The ID of the recognition to recognise on.
 * @param {Function} progressCb - A function that could be called if progressed results are required.
 * @returns {Promise.<Object>} - It will return a object with the recognition result if successful.
 */
export function recogniseChoiceRecognition(recognitionId, progressCb) {
  return makeWebsocketCall('choice.recognise', {args: [recognitionId], progressCb});
}

/**
 * Expose easy way to run the choice challenge in one go.
 *
 * @param {string} challengeId - The ID of the challenge for the choice recognition.
 * @param {Recorder} recorder - Audio Recorder instance.
 * @param {Function} progressCb - Callback function to call if progressed results are being used.
 * @returns {Promise} - If all good the result will have the recognition perfomed. Otherwise it will
 *                      return an error.
 */
export function performChoiceRecognition(challengeId, recorder, progressCb) {
  return prepareChoiceRecognition()
    .then(recognitionId =>
      prepareChoiceRecognitionChallenge(recognitionId, challengeId)
        .then(waitForUserMediaApproval(recognitionId, recorder))
        .then(prepareAudioForChoiceRecognition(recognitionId, recorder))
        .then(writeAudioForChoiceRecognition(recognitionId, recorder))
        .then(recogniseChoiceRecognition(recognitionId, progressCb))
    );
}

/*
 * below is some code for the new streaming yet to come.
 *
 * export function prepareAudioStream(recognitionId, recorder) {
 *   const rpc = 'choise.chuck';
 *   return registerAudioStream(recorder, rpc)
 *     .then(() => makeWebsocketCall('choice.recognise', {args: [recognitionId, rpc]}));
 * }
 */

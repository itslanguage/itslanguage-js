/**
 * This file contains the readily available functions which interact with the
 * ITSLanguage choice recognition API.
 *
 * Note that this is one of the "nested" or "composite" APIs; You can only
 * obtain the data if you provide a reference to the challenge for which you
 * want a recording.
 */

import {
  encodeAndSendAudioOnDataAvailible,
  prepareServerForAudio
} from '../../utils/audio-over-socket';
import {authorisedRequest} from '../../communication';
import {makeWebsocketCall} from '../../communication/websocket';

const url = challenge => `/challenges/choice/${challenge}/recognitions`;

export function getAllChoiceRecognitions() {
  return authorisedRequest('GET', `${url}`);
}

export function getChoiceRecognitionByID(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}

export function prepareChoiceRecognition() {
  return makeWebsocketCall('choice.init_recognition');
}

export function prepareChoiceRecognitionChallenge(recognitionId, challengeId) {
  return makeWebsocketCall('choice.init_challenge', {args: [recognitionId, challengeId]});
}

export function prepareAudioForChoiceRecognition(recognitionId, recorder) {
  return prepareServerForAudio(recognitionId, recorder, 'choice.init_audio');
}

export function streamAudioForChoiceRecognition(recognitionId, recorder) {
  return encodeAndSendAudioOnDataAvailible(recognitionId, recorder, 'choice.write');
}

export function endStreamAudioForChoiceRecognition(recognitionId, progressCb) {
  return makeWebsocketCall('choice.recognise', {args: [recognitionId], progressCb});
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

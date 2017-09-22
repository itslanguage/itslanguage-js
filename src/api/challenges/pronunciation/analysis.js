/**
 * This file contains the readily available functions which interact with the
 * ITSLanguage pronunciation analysis API.
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

const url = challenge => `/challenges/pronunciation/${challenge}/analyses`;

/**
 * Ask the backend for a Pronunciation Analysis.
 *
 * @param {string} challengeId - The ID of the corresponding challenge.
 * @param {string} analysisId - The ID of the analysis you want result for.
 * @returns {Promise.<Object>} - The Pronunciation Analysis.
 */
export function getPronunciationAnalysisById(challengeId, analysisId) {
  return authorisedRequest('GET', `${url(challengeId)}/${analysisId}`);
}

/**
 * Create a new analysis and return the ID.
 *
 * @returns {Promise|Promise.<*>} - The result will hold the ID for the analysis.
 */
export function preparePronunciationAnalysis() {
  return makeWebsocketCall('pronunciation.init_analysis');
}

/**
 * Prepare the backend by telling it which challenge it can expect by a new analysis.
 *
 * @param {string} analysisId - The ID of the analysis to attache the challenge to.
 * @param {string} challengeId - The ID of the challenge that belongs to a specific analysis.
 * @returns {Promise.<*>} - Promise with the result of the init_challenge call.
 */
export function prepareAnalysisChalllenge(analysisId, challengeId) {
  return makeWebsocketCall('pronunciation.init_challenge', {args: [analysisId, challengeId]});
}

/**
 * A Pronunciaion Challange could hold an alignment allready. If not so
 * this function will instruct the backend to create the alignment and
 * return it to the client.
 *
 * @param {string} analysisId - The ID of the analysis to create the alignment for.
 * @returns {Promise.<*>} - The alignment.
 */
export function performAlignmentOnChallenge(analysisId) {
  return makeWebsocketCall('pronunciation.alignment', {args: [analysisId]});
}

/**
 * Prepare the backend for our audio.
 *
 * @param {string} analyseId - The Analysis that belongs to the audio.
 * @param {Recorder} recorder - The recorder to get specs from.
 * @returns {Promise} - Result of preparing the audio.
 */
export function prepareAudioForPronuncationAnalysis(analyseId, recorder) {
  return prepareServerForAudio(analyseId, recorder, 'pronunciation.init_audio');
}

/**
 * Us the provided recorder to stream/send the recorded audio to the backend.
 *
 * @param {string} analyseId - The ID of the analysis we're receiving audio for.
 * @param {Recorder} recorder - Instance of an Recorder.
 * @returns {Promise} - Stream result.
 */
export function streamAudioForPronunciationAnalysis(analyseId, recorder) {
  return encodeAndSendAudioOnDataAvailible(analyseId, recorder, 'pronunciation.write');
}

/**
 * Finishing the recording means we're ready to analyse! Smartest man in the entire universe.
 * We also accept a special callback that can be used to receive progress on.
 *
 * @param {string} analyseId - The ID of the Analysis to analyse on.
 * @param {Function} [progressCb] - A callback which will be used to receive progress on.
 * @returns {Promise.<*>} - The result will return the analysis.
 */
export function endStreamAudioForPronunciationAnalysis(analyseId, progressCb) {
  return makeWebsocketCall('pronunciation.analyse', {args: [analyseId], progressCb});
}

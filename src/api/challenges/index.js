/**
 * This file exports all the available challenges and their APIs for convenience only.
 *
 * @module sdk/lib/api/challenges
 */

import * as choiceApi from './choice';
import * as choiceRecognitionApi from './choice/recognition';
import * as feedbackApi from './feedback';
import * as feedbackSpeechApi from './feedback/speech';
import * as pronunciationApi from './pronunciation';
import * as pronunciationAnalysisApi from './pronunciation/analysis';
import * as speechApi from './speech';
import * as speechRecordingApi from './speech/recordings';

/**
 * @type {module:sdk/lib/api/challenges/choice}
 */
export const choice = choiceApi;

/**
 * @type {module:sdk/lib/api/challenges/choice/recognition}
 */
export const choiceRecognition = choiceRecognitionApi;

/**
 * @type {module:sdk/lib/api/challenges/feedback}
 */
export const feedback = feedbackApi;

/**
 * @type {module:sdk/lib/api/challenges/feedback/speech}
 */
export const feedbackSpeech = feedbackSpeechApi;

/**
 * @type {module:sdk/lib/api/challenges/pronunciation}
 */
export const pronunciation = pronunciationApi;

/**
 * @type {module:sdk/lib/api/challenges/pronunciation/analysis}
 */
export const pronunciationAnalysis = pronunciationAnalysisApi;

/**
 * @type {module:sdk/lib/api/challenges/speech}
 */
export const speech = speechApi;

/**
 * @type {module:sdk/lib/api/challenges/speech/recordings}
 */
export const speechRecording = speechRecordingApi;

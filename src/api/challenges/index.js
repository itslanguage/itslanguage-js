import * as choiceApi from './choice';
import * as recognition from './choice/recognition';
import * as feedbackApi from './feedback';
import * as speechFeedback from './feedback/speech';
import * as pronunciationApi from './pronunciation';
import * as analysis from './pronunciation/analysis';
import * as speechApi from './speech';
import * as recording from './speech/recordings';


/**
 * Interface to the Choice Challenge API (both REST and streaming).
 *
 * @type {{
 *   create?,
 *   getById?,
 *   getAll?,
 *   recognition: {
 *     create?,
 *     getAll?,
 *     prepare?,
 *     prepareChallenge?,
 *     getById?,
 *     recogniseAudioStream?,
 *     recognise?
 *   }
 * }}
 */
export const choice = {
  ...choiceApi,
  recognition,
};

/**
 * Interface to the Feedback API (both REST and streaming).
 *
 * @type {{
 *   create?,
 *   getById?,
 *   getAll?,
 *   prepare?,
 *   resume?,
 *   listenAndReply?,
 *   feedback?,
 *   pause?
 * }}
 */
export const feedback = {
  ...feedbackApi,
  ...speechFeedback,
};

/**
 * Interface to the Pronunciation Challenge API (both REST and streaming).
 *
 * @type {{
 *   create?,
 *   getAll?,
 *   getById?,
 *   deleteChallenge?,
 *   analysis: {
 *     prepare?,
 *     alignChallenge?,
 *     prepareChallenge?,
 *     getById?,
 *     endStreamAudio?,
 *     streamAudio?,
 *     prepareAudio?
 *   }
 * }}
 */
export const pronunciation = {
  ...pronunciationApi,
  analysis,
};

/**
 * Interface to the Speech Challenge API (both REST and streaming).
 *
 * @type {{
 *   create?,
 *   getById?,
 *   getAll?,
 *   recording: {
 *     getAll?,
 *     getById?,
 *     record?
 *   }
 * }}
 */
export const speech = {
  ...speechApi,
  recording,
};

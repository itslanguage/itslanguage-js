import * as authentication from './api/auth';
import * as basicauth from './api/basicauth';
import broadcaster from './api/broadcaster';
import * as categories from './api/categories';
import * as challenges from './api/challenges';
import * as communication from './api/communication';
import * as emailauth from './api/emailauth';
import * as groups from './api/groups';
import * as organisations from './api/organisations';
import * as profile from './api/profile';
import * as progress from './api/progress';
import * as roles from './api/roles';
import * as tenants from './api/tenants';
import * as users from './api/users';
import VolumeMeter, { generateWaveSample } from './audio/audio-tools';
import AudioPlayer from './audio/audio-player';
import AudioRecorder from './audio/audio-recorder';
import Player from './WebAudio/Player';
import Stopwatch from './audio/tools';


/**
 * Document the version number of the ITSLanguage SDK.
 * @type {string}
 */
const VERSION = '4.0.0-beta-6';


/**
 * Represents the ITSLanguage SDK.
 * It allows the user to make every call to the API with a single function.
 * @see https://itslanguage.github.io/itslanguage-docs
 */
export class Itslanguage {
  /**
   * Create ITSLanguage SDK.
   *
   * @param {Object} options - An object containing options for communication.
   * @param {string} options.apiUrl - The URL of the REST api.
   * @param {string} options.wsUrl - The URL of the WebSocket server.
   * @param {string} options.authorizationToken - An OAuth2 token string.
   */
  constructor(options) {
    /**
     * Expose the ITSLanguage SDK version.
     * @type {string}
     */
    this.version = VERSION;

    this.authentication = authentication;
    this.basicauth = basicauth;
    this.broadcaster = broadcaster;
    this.categories = categories;
    this.challenges = challenges;
    this.communication = communication;
    this.emailauth = emailauth;
    this.groups = groups;
    this.organisations = organisations;
    this.profile = profile;
    this.progress = progress;
    this.roles = roles;
    this.tenants = tenants;
    this.users = users;

    this.utils = {
      generateWaveSample,
      VolumeMeter,
      AudioPlayer,
      AudioRecorder,
      Stopwatch,
      Player,
    };

    this.communication.updateSettings(options);
  }
}

/**
 * Create the ITSLanguage SDK object to interact with the API.
 *
 * @param {Object} options - An object containing options for communication.
 * @param {string} options.apiUrl - The URL of the REST api.
 * @param {string} options.wsUrl - The URL of the Websocket server.
 * @param {string} options.authorizationToken - An OAuth2 token string.
 *
 * @return {Itslanguage} - The SDK.
 */
export function createItslSdk(options) {
  return new Itslanguage(options);
}


/**
 * Factory to create a VolumeMeter.
 * The VolumeMeter object is also available through the ITSLanguage SDK object.
 *
 * @param {AudioContext} audioContext - The WebAudio context.
 * @param {MediaStream} inputStream - The MediaStream to analyze.
 *
 * @returns {VolumeMeter} - A VolumeMeter instance.
 */
export function createVolumeMeter(audioContext, inputStream) {
  return new VolumeMeter(audioContext, inputStream);
}


/**
 * Factory to create an AudioPlayer object.
 * The AudioPlayer object is also available through the ITSLanguage SDK object.
 *
 * @param {Object} options - An object to be able to override default settings for the player.
 * @returns {AudioPlayer} - An AudioPlayer instance.
 */
export function createAudioPlayer(options) {
  return new AudioPlayer(options);
}


/**
 * Factory to create an AudioRecorder object.
 *
 * @param {Object} options - An object to be able to override default settings for the recorder.
 * @returns {AudioRecorder} - An AudioRecorder instance.
 */
export function createAudioRecorder(options) {
  return new AudioRecorder(options);
}


/**
 * Factory to create a Stopwatch object.
 * The StopWatch object is also available through the ITSLanguage SDK object.
 *
 * @param {function} tickCb - Callback function to call at every tick.
 * @returns {Stopwatch} - An instance of the StopWatch object.
 */
export function createStopwatch(tickCb) {
  return new Stopwatch(tickCb);
}


/**
 * Factory to create a Player object. The Player differs from the AudioPlayer in terms that this
 * player uses MediaStream to playback audio instead of the `audio` player.
 * The Player object is also available through the ITSLanguage SDK object.
 *
 * @returns {Player} - An instance of a Player object.
 */
export function createPlayer() {
  return new Player();
}

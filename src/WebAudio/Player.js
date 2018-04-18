import {authorisedRequest, request} from '../api/communication';
import AudioContext from './AudioContext';

/**
 * Player
 * Simple Audio Player based on Web Audio API technology
 */
export default class Player extends AudioContext {
  /**
   * Private object to hold AudioBuffer node.
   * @private
   * @Type {AudioBuffer}
   */
  audioBuffer = null;

  /**
   * Private object to hold AudioBufferSourceNode node.
   * @private
   * @type {AudioBufferSourceNode}
   */
  audioSource = null;

  /**
   * Player playback state.
   * @private
   * @type {boolean}
   */
  playing = false;

  /**
   * Point in time where player is paused.
   * @private
   * @type {number}
   */
  pausedAt = 0;

  /**
   * Point in time where player is started
   * @private
   * @type {number}
   */
  startedAt = 0;

  /**
   * Create and initialize the AudioBufferSourceNode object.
   *
   */
  createBufferSource() {
    this.disconnectBufferSource();

    // Create a sound source
    this.audioSource = this.audioContext.createBufferSource();

    // Select what to play
    this.audioSource.buffer = this.audioBuffer;

    // Connect to the speakers!
    this.audioSource.connect(this.audioContext.destination);

    // Add some event handlers;
    this.audioSource.addEventListener('ended', this.suspendAudioContext);
  }

  /**
   * Disconnect the AudioBufferSourceNode.
   *
   */
  disconnectBufferSource() {
    if (this.audioSourceExists()) {
      this.audioSource.disconnect();
      this.audioSource.removeEventListener('ended', this.suspendAudioContext);
    }
  }

  /**
   * Get an audio stream from an URL.
   *
   * If the withItslToken is provided (and set to true) use the authorizedRequest method to load
   * the audio. This in effect will set the ITSLanguage bearer token (if available) to the request.
   *
   * For both request methods goes: there's no check whether you're trying to load from ITSLanguage
   * backend system or not.
   *
   * @param {string} url - Url to load.
   * @param {boolean} withItslToken - Make use of authorizedRequest or just request if set to false.
   */
  load(url, withItslToken = true) {
    if (!url) {
      return;
    }

    // Determine whether to ask authorized, or not.
    const requestMethod = withItslToken ? authorisedRequest : request;
    const {audioContext} = this;

    requestMethod('GET', url)
      .then(response => response.arrayBuffer())
      .then(audioData => audioContext.decodeAudioData(audioData, decodedAudio => {
        this.audioBuffer = decodedAudio;
        this.fireEvent('loaded');
      }))
      .catch(error => {
        this.error(`${error.name}: ${error.message}`);
      });
  }

  /**
   * Returns if the audioBuffer has been created and loaded, or not.

   * @returns {boolean} The audioBuffer created.
   */
  audioBufferExists() {
    return Boolean(this.audioBuffer);
  }

  /**
   * Return if audioSource has been created, or not.
   *
   * @returns {boolean} The audioSource created.
   */
  audioSourceExists() {
    return Boolean(this.audioSource);
  }

  /**
   * Start audio playback of that what is in the buffer.
   */
  play() {
    const offset = this.pausedAt;

    this.createBufferSource();

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // play the source now
    this.audioSource.start(0, offset);

    this.startedAt = this.audioContext.currentTime - offset;
    this.pausedAt = 0;
    this.playing = true;

    this.fireEvent('playing');
  }

  /**
   * Stop playback of audio.
   * Check for buffer and source to exist, if not, exit.
   */
  stop() {
    if (!this.audioBufferExists() && !this.audioSourceExists()) {
      return;
    }

    this.audioSource.stop();
    this.pausedAt = 0;
    this.startedAt = 0;
    this.playing = false;

    this.fireEvent('stopped');
  }

  /**
   * Pause playback of audio.
   */
  pause() {
    if (!this.audioBufferExists() && !this.audioSourceExists()) {
      return;
    }

    const elapsed = this.audioContext.currentTime - this.startedAt;
    this.audioSource.stop();
    this.pausedAt = elapsed;

    this.fireEvent('pause');
  }

  /**
   * Is the player currently playing.
   *
   * @returns {boolean} - Whether or not the player is playing audio.
   */
  isPlaying() {
    return this.playing;
  }

  /**
   * Get the duration of the loaded audio.
   *
   * @returns {number} - Duration of the loaded audio.
   */
  getDuration() {
    return this.audioBuffer.duration;
  }

  /**
   * Get the currentTime for the audio that is loaded.
   *
   * @returns {number} - The currentTime value.
   */
  getCurrentTime() {
    if (this.pausedAt) {
      return this.pausedAt;
    }

    if (this.startedAt) {
      return this.audioContext.currentTime - this.startedAt;
    }

    return 0;
  }
}

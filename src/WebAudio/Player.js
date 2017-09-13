import {authorisedRequest, request} from '../api/communication';
import debug from 'debug';

/**
 * Player
 * Audio player based on WebAudio technology
 */
export default class Player {
  /**
   * Private object to hold AudioContext node.
   * @private
   */
  audioContext = null;

  /**
   * Private object to hold AudioBuffer node.
   * @private
   */
  audioBuffer = null;

  /**
   * Private object to hold AudioBufferSourceNode node.
   * @private
   */
  audioSource = null;

  /**
   * Keep a list of all registered event listeners.
   * This way, we could conveniently remove all the listeners at once.
   * @type {Array}
   * @private
   */
  eventListeners = [];

  /**
   * Set logging namespace.
   * @private
   */
  log = debug('its-sdk:AudioPlayer');

  /**
   * Construct the Player.
   *
   * @param {Object} audioContext - Allow to provide custom/own audioContext object.
   */
  constructor(audioContext = null) {
    // Provide AudioContext object. If not passed the
    // default window.AudioContext will be used.
    if (audioContext) {
      this.audioContext = audioContext;
    } else {
      this.audioContext = this.createAudioContext();
    }

    this.suspendAudioContext = this.suspendAudioContext.bind(this);

    // set log to output to stdout
    this.log.log = console.log.bind(console);
  }

  /**
   * Wraps the addEventListener which is available on the AudioContext node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/attachEvent
   * @param {...*} args - Array with passed arguments.
   */
  addEventListener(...args) {
    // First, add the event listener to our local list.
    this.eventListeners.push(args);

    // Now, actually add the event listener!
    this.audioContext.addEventListener(...args);
  }

  /**
   * Wraps the removeEventListener which is available on the AudioContext node.
   * Make sure to call with the same arguments as the addEventListner.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
   * @param {...*} args - Array with passed arguments.
   */
  removeEventListener(...args) {
    // First, try to find the event in our list.
    const itemIndex = this.eventListeners.findIndex(item => {
      const items = item.length;
      let count = 0;

      // If the count of items doesn't equal, it's definitely not the
      // listener we want to remove.
      if (items !== args.length) {
        return false;
      }

      // Start looping through all items.
      for (count; count <= items; count += 1) {
        if (typeof item[count] === 'function') {
          if (typeof args[count] !== 'function') {
            // typecheck failed, so return false!
            return false;
          } else if (item[count].toString() !== args[count].toString()) {
            // Both are function, but not the same!
            return false;
          }
        } else if (item[count] !== args[count]) {
          // values do not equal
          return false;
        }
      }

      // If we hit here, we found a match! On fire!
      return true;
    });

    // Remove that item from the list
    if (itemIndex) {
      this.eventListeners.splice(itemIndex, 1);
    }

    // Remove the event handler!
    this.audioContext.removeEventListener(...args);
  }

  removeAllEventListeners() {
    this.eventListeners.forEach(listener => {
      this.removeEventListener(...listener);
    });
    this.eventListeners = [];
  }

  /**
   * Use this method to conveniently fire an event.
   * We could, if we wanted, add some data.
   *
   * @param {string} eventName - Event to fire.
   * @param {Object} data - Data to pass as detail.
   * @private
   */
  fireEvent(eventName = null, data = null) {
    if (!eventName) {
      return;
    }

    this.audioContext.dispatchEvent(new CustomEvent(eventName, {detail: data}));
  }

  /**
   * Get the audio context or create one.
   *
   * @return {AudioContext} The AudioContext created will be returned
   */
  createAudioContext() {
    if (!window.ItslAudioContext) {
      window.AudioContext =
        window.AudioContext || window.webkitAudioContext;
      window.ItslAudioContext = new window.AudioContext();
    }
    return window.ItslAudioContext;
  }

  suspendAudioContext() {
    this.audioContext.suspend();
  }

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
  async load(url, withItslToken = true) {
    if (!url) {
      return;
    }

    // Determine whether to ask authorized, or not.
    const requestMethod = withItslToken ? authorisedRequest : request;
    const {audioContext} = this;

    try {
      const response = await requestMethod('GET', url);
      const audioData = await response.arrayBuffer();
      audioContext.decodeAudioData(audioData, decodedAudio => {
        this.audioBuffer = decodedAudio;
        this.fireEvent('loaded');
      });
    } catch (error) {
      this.log(`${error.name}: ${error.message}`);
    }
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
    this.createBufferSource();

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // play the source now
    this.audioSource.start();
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
    this.fireEvent('stopped');
  }

  pause() {
    if (!this.audioBufferExists() && !this.audioSourceExists()) {
      return;
    }

    this.audioSource.stop();
    this.fireEvent('pause');
  }
}

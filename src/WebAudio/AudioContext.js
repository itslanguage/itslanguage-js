import debug from 'debug';

/**
 * Recorder
 * Simple Audio Recorder based on WebAudio technology
 */
export default class AudioContext {
  /**
   * Construct the Player.
   *
   * @param {Object} audioContext - Allow to provide custom/own audioContext object.
   * @param {string} debugNameSpace - Name to be used for debugging.
   */
  constructor(audioContext = null, debugNameSpace = 'AudioContext') {
    /**
     * Private object to hold AudioContext node.
     * @type {AudioContext}
     */
    this.audioContext = null;

    /**
     * This will be the log function.
     * Will output to stdout.
     * @type {Function}
     */
    this.log = null;

    /**
     * This will be the error function.
     * Will output to stderr.
     * @type {Function}
     */
    this.error = null;

    /**
     * Keep a list of all registered event listeners.
     * This way, we could conveniently remove all the listeners at once.
     * @type {Array}
     */
    this.eventListeners = [];

    // Provide AudioContext object. If not passed the
    // default window.AudioContext will be used.
    if (audioContext) {
      this.audioContext = audioContext;
    } else {
      this.audioContext = this.createAudioContext();
    }

    // Prepare the log and error function to be used!
    this.log = debug(`its-sdk:${debugNameSpace}`);
    this.error = debug(`its-sdk:${debugNameSpace}`);

    // Bind log to stdout in stead of stderr
    this.log.log = console.log.bind(console);

    this.suspendAudioContext = this.suspendAudioContext.bind(this);
  }

  /**
   * Wraps the addEventListener which is available on the AudioContext node.
   * Note that it is required to pass a named function to actually be able
   * to remove an event listeners. This is just how the EventTarget.removeEventListener
   * works. There are no extra checks for.
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
   * Make sure to call with the same arguments as the addEventListener.
   *
   * If you didn't call the addEventListener with a named function, please note
   * that you won't be able to remove the eventListener.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
   * @param {...*} args - Array with passed arguments.
   */
  removeEventListener(...args) {
    // First, try to find the event in our list.
    const itemIndex = this.eventListeners.findIndex((item) => {
      // If the count of items doesn't equal, it's definitely not the
      // listener we want to remove.
      if (item.length !== args.length) {
        return false;
      }

      // Now we're gonna loop through the items to check if we can
      // find an item which does not compare equal. If we find one
      // 'some' will immediately return true and the party is over!
      // Wubba lubba dub dub!
      return !args.some((arg, index) => item[index] !== arg);
    });

    // Remove that item, and only that one, from the list
    if (itemIndex) {
      this.eventListeners.splice(itemIndex, 1);
    }

    // Remove the event handler!
    this.audioContext.removeEventListener(...args);
  }

  removeAllEventListeners() {
    this.eventListeners.forEach((listener) => {
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
   */
  fireEvent(eventName, data = null) {
    if (!eventName) {
      return;
    }
    const customEvent = new CustomEvent(eventName, { detail: data });
    this.audioContext.dispatchEvent(customEvent);
  }

  /**
   * Get the audio context or create one.
   *
   * @return {AudioContext} The AudioContext created will be returned.
   */
  static createAudioContext() {
    if (!window.ItslAudioContext) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      window.ItslAudioContext = new window.AudioContext();
    }
    return window.ItslAudioContext;
  }

  /**
   * Suspend the AudioContext to preserve power and such.
   */
  suspendAudioContext() {
    this.audioContext.suspend();
  }

  /**
   * Resume a suspended AudioContext.
   */
  resumeAudioContext() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

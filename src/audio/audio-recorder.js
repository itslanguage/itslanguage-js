import allOff from 'event-emitter/all-off';
import ee from 'event-emitter';
import uuidv4 from 'uuid/v4';
import Stopwatch from './tools';
import WavePacker from './wave-packer';
import WebAudioRecorder from './web-audio-recorder';

/**
 * Audio recording component.
*/

export default class AudioRecorder {
  /**
   * ITSLanguage AudioRecorder.
   *
   * @param {?Object} options - Override any of the default settings.
   *
   */
  constructor(options = {}) {
    this.settings = Object.assign({}, options);

    this.recordingCompatibility();

    this.userMediaApproval = false;

    /**
     * The specific recorder type.
     * @type {WebAudioRecorder|MediaRecorder}
     * @private
     */
    this.recorder = null;

    this.emitter = ee({});

    this.stopwatch = null;

    if (options.audioContext) {
      this.audioContext = options.audioContext;
    } else {
      this.audioContext = AudioRecorder.createAudioContext();
    }
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
   * Turn off all event listeners for this recorder.
   */
  removeAllEventListeners() {
    allOff(this.emitter);
  }

  /**
   * Add an event listener. Listens to events emitted from the recorder.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to add.
   */
  addEventListener(name, handler) {
    this.emitter.on(name, handler);
  }

  /**
   * Remove an event listener of the recorder.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to remove.
   */
  removeEventListener(name, handler) {
    this.emitter.off(name, handler);
  }

  /**
   * Fire an event.
   *
   * @param {string} name - Name of the event.
   * @param {Object[]} args - Arguments.
   * @private
   */
  fireEvent(name, args = []) {
    this.emitter.emit(name, ...args);
  }

  /**
   * Check if the user has already given permission to access the microphone.
   *
   * @returns {boolean} True if user has granted access to the microphone. False otherwise.
   */
  hasUserMediaApproval() {
    return this.userMediaApproval || false;
  }

  /**
   * Logs browser compatibility for audio recording.
   * In case of compatibility issues, an error is thrown.
   *
   * @private
   */
  recordingCompatibility/* istanbul ignore next */() {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/mediaDevices.getUserMedia
    this.canMediaDevicesGetUserMedia = false;
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia
        || navigator.mediaDevices.webkitGetUserMedia
        || navigator.mediaDevices.mozGetUserMedia;
      this.canMediaDevicesGetUserMedia = Boolean(navigator.mediaDevices.getUserMedia);
    }
    console.log('Native navigator.mediaDevices.getUserMedia API capability:', this.canMediaDevicesGetUserMedia);

    if (!this.canGetUserMedia && !this.canMediaDevicesGetUserMedia) {
      throw new Error(
        'Some form of audio recording capability is required',
      );
    }

    window.URL = window.URL || window.webkitURL;
    const hasWindowURL = Boolean(window.URL);
    console.log('Native window.URL capability:', hasWindowURL);
    if (!hasWindowURL) {
      throw new Error(
        'No window.URL blob conversion capabilities',
      );
    }
  }

  /**
   * Request microphone access.
   *
   * Calling this function may result in thrown exceptions when browser
   * doesn't support provide live audio input.
   *
   * @throws {Error} If no live audio input is available or permitted.
   * @returns {Promise} - A promise that resolves a MediaStream object.
   *  If the user denies permission, or matching media is not available, then the
   *  promise is rejected with PermissionDeniedError or NotFoundError respectively.
   */
  requestUserMedia() {
    const readyForStream = (stream) => {
      // Modify state of userMediaApproval now access is granted.
      this.userMediaApproval = true;

      const micInputGain = this.startUserMedia(stream);
      this.fireEvent('ready', [this.audioContext, micInputGain]);
    };

    const userCanceled = (error) => {
      console.error(error);
      throw new Error('No live audio input available or permitted');
    };

    return navigator.mediaDevices.getUserMedia({ audio: true })
      .then(readyForStream)
      .catch(userCanceled);
  }

  /**
   * Audio access was granted, start analysing.
   *
   * @param {MediaStream} stream - Media Stream.
   * @private
   */
  startUserMedia(stream) {
    // Creates an audio node from the microphone incoming stream.
    const micInput = this.audioContext.createMediaStreamSource(stream);

    // This is a workaround for a bug in Firefox that would otherwise lead to
    // the sound input stopping after ~5 seconds.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=934512
    // the important thing is to save a reference to the MediaStreamAudioSourceNode
    this.micInput = micInput;

    // Create a gain node
    const micInputGain = this.audioContext.createGain();
    // Connect the microphone source to a gain node.
    micInput.connect(micInputGain);

    this.recorder = this.getBestRecorder(micInputGain);

    return micInputGain;
  }

  /**
   * Get a recorder object that performs audio compression, when available.
   *
   * Using the Media Stream Recording API for recording is the preferred
   * solution. It allows recording compressed audio which makes it quicker to
   * submit. If not available, use a default createScriptProcessor is used.
   *
   * @param {GainNode} micInputGain - The GainNode to analyze.
   * @private
   */
  getBestRecorder(micInputGain) {
    return new WebAudioRecorder(micInputGain, this.audioContext, (data) => {
      this.streamCallback(data);
    }, new WavePacker(), false);
  }

  /**
   * Called when a chunk of audio becomes available.
   *
   * @param {ArrayBuffer} chunk - A chunk of audio (Int16 formatted).
   */
  streamCallback(chunk) {
    this.fireEvent('dataavailable', [chunk]);
  }

  /**
   * Throw an error if the user is not yet logged in.
   *
   * @returns {boolean} True when permission was already granted. False otherwise.
   * @private
   */
  requireGetUserMedia() {
    if (this.recorder) {
      return true;
    }
    console.log('Requesting getUserMedia permission first.');
    this.requestUserMedia();
    return false;
  }

  /**
   * Set a new recording session id.
   *
   * @param {number} id - When defined, stick this id to the recorded blob.
   *
   * @returns {number} The id that was given or a unique generated one.
   */
  startRecordingSession(id) {
    // Generate a uuid to remember this recording by (locally).
    const newUuid = id === undefined ? uuidv4() : id;
    this.activeRecordingId = newUuid;
    return newUuid;
  }

  /**
   * Start recording microphone input until stopped. By default the actual recording will start
   * a small delay of 100ms. Set disableDelay to true to disable this delay.
   *
   * @param {boolean} disableDelay - If set to true it will disable the delay before the actual
   * recording starts.
   * @emits {Event} 'recording' With arguments: [recording ID].
   */
  record(disableDelay = false) {
    if (!this.requireGetUserMedia()) {
      return;
    }

    if (this.isRecording()) {
      throw new Error('Already recording, stop recording first.');
    }

    const delay = disableDelay ? 0 : 100;

    window.setTimeout(() => {
      this.audioContext.resume();

      this.recorder.record();
      if (this.stopwatch) {
        this.stopwatch.value = 0;
        this.stopwatch.start();
      }

      if (!this.activeRecordingId) {
        this.startRecordingSession();
      }
      console.log(`Recording as id: ${this.activeRecordingId}`);

      this.fireEvent('recording', [this.activeRecordingId]);
    }, delay);
  }

  /**
   * Stop recording microphone input.
   *
   * @param {boolean} [forced=false] - Set whether to force the microphone to stop recording or let
   * it end normally.
   * @emits {Event} 'recorded' With arguments: [recording ID, audio Blob, forced].
   */
  stop(forced) {
    if (!this.recorder.isPaused() && !this.recorder.isRecording()) {
      return;
    }
    this.recorder.stop();
    if (this.stopwatch) {
      this.stopwatch.stop();
    }
    console.log(`Stopped recording for id: ${this.activeRecordingId}`);

    const self = this;
    this.recorder.getEncodedAudio((blob) => {
      console.log(`Received encoded audio of type: ${blob.type}`);
      // Allow direct playback from local blob.
      self.fireEvent('recorded', [self.activeRecordingId, blob, Boolean(forced)]);
    });
  }

  pause() {
    if (!this.recorder.isPaused() && !this.recorder.isRecording()) {
      return;
    }
    this.recorder.pause();
    if (this.stopwatch) {
      this.stopwatch.stop();
    }
    console.log(`paused recording for id: ${this.activeRecordingId}`);
    this.fireEvent('paused', [this.activeRecordingId]);
  }

  /**
   * Check if there is a recording in progress.
   *
   * @returns {boolean} True if user is currently recording audio. False` otherwise.
   */
  isRecording() {
    if (!this.recorder) {
      return false;
    }
    return this.recorder.isRecording();
  }

  /**
   * Check if the recorder is in paused state.
   *
   * @returns {boolean} True if the recorder is paused. False` otherwise.
   */
  isPaused() {
    if (!this.recorder) {
      return false;
    }
    return this.recorder.isPaused();
  }

  /**
   * Toggle audio playback. Switch from playing to paused state and back.
   */
  toggleRecording() {
    if (this.isRecording()) {
      this.stop();
    } else {
      this.record();
    }
  }

  /**
   * Get the recorded audio specifications.
   *
   * @returns {Object} Containing audioFormat and audioParameters describing the format.
   */
  getAudioSpecs() {
    return this.recorder.getAudioSpecs();
  }

  /**
   * Bind a stopwatch to sync with the playing and stopping functionality of the recorder.
   *
   * @param {Function} tickCb - Callback to invoke on every tick. A tick occurs once every 100 ms.
   * @throws {Error} If tickCb is null.
   * @returns {Stopwatch} New Stopwatch object.
   */
  bindStopwatch(tickCb) {
    this.stopwatch = new Stopwatch(tickCb);
    return this.stopwatch;
  }
}

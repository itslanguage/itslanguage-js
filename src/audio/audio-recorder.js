// import MediaRecorder from './media-recorder';
import Stopwatch from './tools';
import WavePacker from './wave-packer';
import WebAudioRecorder from './web-audio-recorder';
import allOff from 'event-emitter/all-off';
import ee from 'event-emitter';
import uuid from 'uuid';

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
  constructor(options) {
    this._settings = Object.assign({}, options);

    this._recordingCompatibility();

    this.userMediaApproval = false;

    /**
     *
     * @type {WebAudioRecorder|MediaRecorder} The specific recorder type.
     */
    this._recorder = null;

    this._emitter = ee({});

    this._stopwatch = null;
  }

  /**
   * Turn off all event listeners for this recorder.
   */
  removeAllEventListeners() {
    allOff(this._emitter);
  }

  /**
   * Add an event listener. Listens to events emitted from the recorder.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to add.
   */
  addEventListener(name, handler) {
    this._emitter.on(name, handler);
  }

  /**
   * Remove an event listener of the recorder.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to remove.
   */
  removeEventListener(name, handler) {
    this._emitter.off(name, handler);
  }

  /**
   * Fire an event.
   *
   * @param {string} name - Name of the event.
   * @param {Object[]} args - Arguments.
   * @private
   */
  fireEvent(name, args = []) {
    this._emitter.emit(name, ...args);
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
  _recordingCompatibility/* istanbul ignore next */() {
    // Detect audio recording capabilities.
    // http://caniuse.com/#feat=stream
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia
    // navigator.getUserMedia = navigator.getUserMedia ||
    //   navigator.webkitGetUserMedia ||
    //   navigator.mozGetUserMedia ||
    //   navigator.msGetUserMedia;
    // this.canGetUserMedia = Boolean(navigator.getUserMedia);
    // console.log('Native deprecated navigator.getUserMedia API capability:', this.canGetUserMedia);

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/mediaDevices.getUserMedia
    this.canMediaDevicesGetUserMedia = false;
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
        navigator.mediaDevices.webkitGetUserMedia ||
        navigator.mediaDevices.mozGetUserMedia;
      this.canMediaDevicesGetUserMedia = Boolean(navigator.mediaDevices.getUserMedia);
    }
    console.log('Native navigator.mediaDevices.getUserMedia API capability:', this.canMediaDevicesGetUserMedia);

    // Detect MediaStream Recording
    // It allows recording audio using the MediaStream from the above
    // getUserMedia directly with a native codec better than Wave.
    // http://www.w3.org/TR/mediastream-recording/
    // this.canUseMediaRecorder = Boolean(window.MediaRecorder);
    // console.log('Native MediaRecorder recording capability:', this.canUseMediaRecorder);

    // Web Audio API
    // High-level JavaScript API for processing and synthesizing audio
    // http://caniuse.com/#feat=audio-api
    window.AudioContext = window.AudioContext ||
      window.webkitAudioContext || window.mozAudioContext;
    const canCreateAudioContext = Boolean(window.AudioContext);
    console.log('Native Web Audio API (AudioContext) processing capability:', canCreateAudioContext);

    if (!this.canGetUserMedia && !this.canMediaDevicesGetUserMedia) {
      throw new Error(
        'Some form of audio recording capability is required');
    }

    window.URL = window.URL || window.webkitURL;
    const hasWindowURL = Boolean(window.URL);
    console.log('Native window.URL capability:', hasWindowURL);
    if (!hasWindowURL) {
      throw new Error(
        'No window.URL blob conversion capabilities');
    }
  }


  /**
   * Request microphone access.
   *
   * Calling this function may result in thrown exceptions when browser
   * doesn't support provide live audio input.
   *
   * @throws {Error} If no live audio input is available or permitted.
   */
  requestUserMedia() {
    const self = this;
    function success(stream) {
      console.log('Got getUserMedia stream');

      // checking audio presence
      if (self.canMediaDevicesGetUserMedia) {
        if (stream.getAudioTracks().length) {
          console.log('Got audio tracks:', stream.getAudioTracks().length);
        }
      }

      // Modify state of userMediaApproval now access is granted.
      self.userMediaApproval = true;

      const micInputGain = self._startUserMedia(stream);
      self.fireEvent('ready', [self.audioContext, micInputGain]);
    }
    function failure(e) {
      console.log(e);
      throw new Error('No live audio input available or permitted');
    }

    if (this.canMediaDevicesGetUserMedia) {
      // Use of promises is required.
      navigator.mediaDevices.getUserMedia({audio: true}).then(success).catch(failure);
    } else if (this.canGetUserMedia) {
      navigator.getUserMedia({audio: true}, success, failure);
    }
  }

  /**
   * Audio access was granted, start analysing.
   *
   * @param {MediaStream} stream - Media Stream.
   * @private
   */
  _startUserMedia(stream) {
    if (!this.audioContext) {
      // Initialize the context once, and only when getUserMedia was
      // successful.
      this.audioContext = new window.AudioContext();
    }

    if (!this.audioContext.createMediaStreamSource) {
      throw new Error('AudioContext has no property createMediaStreamSource');
    }

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

    this._recorder = this._getBestRecorder(micInputGain);

    return micInputGain;
  }

  /**
   * Get a recorder object that performs audio compression, when available.
   *
   * Using the Media Stream Recording API for recording is the prefered
   * solution. It allows recording compressed audio which makes it quicker to
   * submit. If not available, use a default createScriptProcessor is used.
   *
   * @param {GainNode} micInputGain - The GainNode to analyze.
   * @private
   */
  _getBestRecorder(micInputGain) {
    let recorder = null;
    // Start by checking for a MediaRecorder.
    // if (this.canUserMediaRecorder && !this._settings.forceWave) {
    //   // Use the recorder with MediaRecorder implementation.
    //   recorder = new MediaRecorder(micInputGain);
    // } else if (this.canGetUserMedia) {
    if (this.canMediaDevicesGetUserMedia) {
      // Fall back to raw (WAVE) audio encoding.
      const self = this;
      recorder = new WebAudioRecorder(micInputGain, data => {
        self.streamCallback(data);
      }, new WavePacker());
    } else {
      throw new Error('Unable to find a proper recorder.');
    }
    console.log('Recorder initialised.');
    return recorder;
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
   */
  _requireGetUserMedia() {
    if (this._recorder) {
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
    const uuid_ = id === undefined ? uuid.v4() : id;
    this.activeRecordingId = uuid_;
    return uuid_;
  }

  /**
   * Start recording microphone input until stopped.
   *
   * @param {?Function} cb - The callback that provides a piece of raw audio when
   * it becomes available. It may be used for streaming.
   * @emits {Event} 'recording' With arguments: [recording ID].
   */
  record(cb) {
    if (!this._requireGetUserMedia()) {
      return;
    }

    if (this.isRecording()) {
      throw new Error('Already recording, stop recording first.');
    }

    this._recorder.record();
    if (this._stopwatch) {
      this._stopwatch._value = 0;
      this._stopwatch.start();
    }

    if (!this.activeRecordingId) {
      this.startRecordingSession();
    }
    console.log('Recording as id: ' + this.activeRecordingId);

    this.fireEvent('recording', [this.activeRecordingId]);
    return cb;
  }

  /**
   * Stop recording microphone input.
   *
   * @param {boolean} [forced=false] - Set whether to force the microphone to stop recording or let it end normally.
   * @emits {Event} 'recorded' With arguments: [recording ID, audio Blob, forced].
   */
  stop(forced) {
    if (!this._recorder.isRecording()) {
      return;
    }
    this._recorder.stop();
    if (this._stopwatch) {
      this._stopwatch.stop();
    }
    console.log('Stopped recording for id: ' + this.activeRecordingId);

    const self = this;
    this._recorder.getEncodedAudio(blob => {
      console.log('Received encoded audio of type: ' + blob.type);
      // Allow direct playback from local blob.
      self.fireEvent('recorded', [self.activeRecordingId, blob, Boolean(forced)]);
    });
  }

  /**
   * Check if there is a recording in progress.
   *
   * @returns {boolean} True if user is currently recording audio. False` otherwise.
   */
  isRecording() {
    if (!this._recorder) {
      return false;
    }
    return this._recorder.isRecording();
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
    return this._recorder.getAudioSpecs();
  }

  /**
   * Bind a stopwatch to sync with the playing and stopping functionality of the recorder.
   *
   * @param {Function} tickCb - Callback to invoke on every tick. A tick occurs once every 100 ms.
   * @throws {Error} If _tickCb is null.
   * @returns {Stopwatch} New Stopwatch object.
   */
  bindStopwatch(tickCb) {
    this._stopwatch = new Stopwatch(tickCb);
    return this._stopwatch;
  }
}

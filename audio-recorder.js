const CordovaMediaRecorder = require('./cordova-media-recorder');
const ee = require('event-emitter');
const getUserMedia = require('get-user-media-promise');
const MediaRecorder = require('./media-recorder');
const WavePacker = require('./wave-packer');
const WebAudioRecorder = require('./web-audio-recorder');
const guid = require('guid');

/**
@module its.AudioRecorder
Audio recording component.

Note the several events to subscribe to.
*/

module.exports = class AudioRecorder {
  /**
   * ITSLanguage AudioRecorder.
   *
   * @constructor
   * @param {object} [options] Override any of the default settings.
   * @fires {AudioRecorder~ready} ready Fired when user gave audio recording permissions.
   * @fires {AudioRecorder~recording} recording Fired when recording has started.
   * @fires {AudioRecorder~recorded} recorded Fired when recording has stopped and an audio blob is ready.
   *
   */
  constructor(options) {
    this.settings = Object.assign({}, options);

    this._recordingCompatibility();

    this.userMediaApproval = false;
    this.recorder = null;

    this.events = {};
    this.emitter = ee({});
    const self = this;
    this.addEventListener = function(name, handler) {
      self.emitter.on(name, handler);
    };

    this.removeEventListener = function(name, handler) {
      self.emitter.off(name, handler);
    };

    this.fireEvent = function(name, args) {
      args = args || [];
      self.emitter.emit(name, ...args);
    };

    if (this.canUseCordovaMedia) {
      // Through the App permissions, access to the microphone was
      // already granted.
      this.userMediaApproval = true;
      this.recorder = this._getBestRecorder();
    }
  }

  /**
   * Event fired by requestUserMedia.
   *
   * @event AudioRecorder~ready
   * @param {AudioContext} audioContext The active AudioContext object.
   * @param {AudioStream} audioStream The microphone AudioStream.
   */
  ready(audioContext, audioStream) {
    return {
      context: audioContext,
      stream: audioStream
    };
  }

  /**
   * Check if the user has already given permission to access the microphone.
   *
   * @returns true if user has granted access to the microphone, false otherwise.
   */
  hasUserMediaApproval() {
    return this.userMediaApproval || false;
  }

  /**
   * Logs browser compatibility for audio recording.
   * In case of compatibility issues, an error is thrown.
   */
  _recordingCompatibility() {
    // Detect audio recording capabilities.
    // http://caniuse.com/#feat=stream
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia
    return getUserMedia({audio: true})
      .then(() => {
        this.canGetUserMedia = true;
        return Promise.resolve();
      }).catch(() => {
        this.canGetUserMedia = false;
        return Promise.resolve();
      })
      .then(() => {
        console.log('Native getUserMedia API capability: ' +
          this.canGetUserMedia);

        // Detect MediaStream Recording
        // It allows recording audio using the MediaStream from the above
        // getUserMedia directly with a native codec better than Wave.
        // http://www.w3.org/TR/mediastream-recording/
        this.canUseMediaRecorder = Boolean(window.MediaRecorder);
        console.log('Native MediaRecorder recording capability: ' +
          this.canUseMediaRecorder);

        // Web Audio API
        // High-level JavaScript API for processing and synthesizing audio
        // http://caniuse.com/#feat=audio-api
        window.AudioContext = window.AudioContext ||
          window.webkitAudioContext || window.mozAudioContext;
        const canCreateAudioContext = Boolean(window.AudioContext);
        console.log('Native Web Audio API (AudioContext) processing capability: ' +
          canCreateAudioContext);

        // Detect Cordova Media Recording
        // It allows recording audio using the native bridge inside WebView Apps.
        // Note that it may also require native playback when codecs were used for
        // recording that are not yet supported in the WebView.
        // https://github.com/apache/cordova-plugin-media/blob/master/doc/index.md
        this.canUseCordovaMedia = Boolean(window.Media);
        console.log('Cordova Media recording capability: ' +
          this.canUseCordovaMedia);

        if (!(this.canGetUserMedia || this.canUseCordovaMedia)) {
          return Promise.reject(
            'Some form of audio recording capability is required');
        }

        window.URL = window.URL || window.webkitURL;
        const hasWindowURL = Boolean(window.URL);
        console.log('Native window.URL capability: ' +
          hasWindowURL);
        if (!hasWindowURL) {
          return Promise.reject(
            'No window.URL blob conversion capabilities');
        }
      });
  }


  /**
   * Request microphone access.
   *
   * Calling this function may result in thrown exceptions when browser
   * doesn't support provide live audio input.
   *
   */
  requestUserMedia() {
    return getUserMedia({audio: true})
      .then(stream => {
        console.log('Got getUserMedia stream');

        if (stream.getAudioTracks().length) {
          console.log('Got audio tracks:', stream.getAudioTracks().length);
        }

        // Modify state of userMediaApproval now access is granted.
        this.userMediaApproval = true;

        const micInputGain = this._startUserMedia(stream);
        this.fireEvent('ready', [this.audioContext, micInputGain]);
      })
      .catch(e => {
        console.log(e);
        return Promise.reject('No live audio input available or permitted');
      });
  }

  /**
   * Audio access was granted, start analysing.
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

    this.recorder = this._getBestRecorder(micInputGain);

    return micInputGain;
  }

  /**
   * Get a recorder object that performs audio compression, when available.
   *
   * Using the Media Stream Recording API for recording is the prefered
   * solution. It allows recording compressed audio which makes it quicker to
   * submit. If not available, use a default createScriptProcessor is used.
   *
   * @param {GainNode} micInputGain The GainNode to analyze.
   */
  _getBestRecorder(micInputGain) {
    let recorder = null;
    // Start by checking for a Cordova environment.
    // When running under a debugger like Ripple, both Cordova and WebAudio
    // environments get detected. While this is technically valid -Ripple is
    // running in Chrome, which supports WebAudio-, it's not a sandbox that
    // also disables functionality that would not be available on a device.
    if (this.canUseCordovaMedia && !this.settings.forceWave) {
      // Use Cordova audio encoding (used codec depends on the platform).
      recorder = new CordovaMediaRecorder();
    } else if (this.canUserMediaRecorder && !this.settings.forceWave) {
      // Use the recorder with MediaRecorder implementation.
      recorder = new MediaRecorder(micInputGain);
    } else if (this.canGetUserMedia) {
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
   * @param {ArrayBuffer} chunk A chunk of audio (Int16 formatted).
   */
  streamCallback(chunk) {
    this.fireEvent('dataavailable', [chunk]);
  }

  /**
   * Throw an error if the user is not yet logged in.
   *
   * @returns true when permission was already granted, false otherwise.
   */
  _requireGetUserMedia() {
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
   * @param {number} id When defined, stick this id to the recorded blob.
   *
   * @returns The id that was given or a unique generated one.
   */
  startRecordingSession(id) {
    // Generate a uuid to remember this recording by (locally).
    const uuid = id === undefined ? guid.create() : id;
    this.activeRecordingId = uuid;
    return uuid;
  }

  /**
   * Callback used by record.
   *
   * @callback Sdk~recordDataAvailableCallback
   * @param {arraybuffer} buffer A chunk of recorded audio.
   */
  recordDataAvailableCallback(buffer) {
    return buffer;
  }

  /**
   * Event fired by record.
   *
   * @event AudioRecorder~recording
   * @param {number} id Recording session (if any was defined).
   */
  recording(id) {
    return id;
  }

  /**
   * Start recording microphone input until stopped.
   *
   * @param {AudioRecorder~recordDataAvailableCallback} [cb] The callback that provides a piece of raw audio when
   * it becomes available. It may be used for streaming.
   * @fires {AudioRecorder~recording} The event that is triggered when recording has started.
   */
  record(cb) {
    if (!this._requireGetUserMedia()) {
      return;
    }

    if (this.isRecording()) {
      throw new Error('Already recording, stop recording first.');
    }

    this.recorder.record();

    if (!this.activeRecordingId) {
      this.startRecordingSession();
    }
    console.log('Recording as id: ' + this.activeRecordingId);

    this.fireEvent('recording', [this.activeRecordingId]);
    return cb;
  }

  /**
   * Event fired by stop.
   *
   * @event AudioRecorder~recorded
   * @param {number} id Recording session (if any was defined).
   * @param {Blob} blob The recorded audio as Blob (including the mime type).
   * @param {bool} forced true when the reason for the stopped recording was reaching the maximum recording duration.
   */
  recorded(id, blob, forced) {
    return {
      id,
      blob,
      forced
    };
  }

  /**
   * Stop recording microphone input.
   *
   * @fires {AudioRecorder~recorded} The event that is triggered when recording has stopped.
   */
  stop(forced) {
    if (!this.recorder.isRecording()) {
      console.error('Recorder was already stopped.');
      return;
    }

    this.recorder.stop();

    console.log('Stopped recording for id: ' + this.activeRecordingId);

    const self = this;
    this.recorder.getEncodedAudio(blob => {
      console.log('Received encoded audio of type: ' + blob.type);
      // Allow direct playback from local blob.
      self.fireEvent('recorded', [self.activeRecordingId, blob, Boolean(forced)]);
    });
  }

  /**
   * Check if there is a recording in progress.
   *
   * @returns `true` if user is currently recording audio, `false` otherwise.
   */
  isRecording() {
    if (!this.recorder) {
      return false;
    }
    return this.recorder.isRecording();
  }

  /**
   * Toggle audio playback. Switch from playing to paused state and back.
   *
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
   * @returns object containing audioFormat and audioParameters describing the format.
   */
  getAudioSpecs() {
    return this.recorder.getAudioSpecs();
  }
};

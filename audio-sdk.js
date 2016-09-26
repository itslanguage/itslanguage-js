/* eslint-disable
 max-len,
 no-unused-vars,
 no-use-before-define
 */


/**
 * @title ITSLanguage Javascript Audio
 * @overview This is part of the ITSLanguage Javascript SDK to perform audio related functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */

/**
 @module its
 ITSLanguage Audio module.
 */

const CordovaMediaPlayer = require('./cordova-media-player');
const CordovaMediaRecorder = require('./cordova-media-recorder');
const MediaRecorder = require('./media-recorder');
const WebAudioPlayer = require('./web-audio-player');
const WebAudioRecorder = require('./web-audio-recorder');
const guid = require('guid');


class AudioPlayer {
  /**
   * ITSLanguage AudioPlayer non-graphical component.
   *
   * @constructor
   * @param {object} [options] Override any of the default settings.
   *
   */
  constructor(options) {
    this.settings = Object.assign({}, options);

    this._playbackCompatibility();

    var callbacks = {
      playingCb: function() {
        self.fireEvent('playing', []);
      },
      timeupdateCb: function() {
        self.fireEvent('timeupdate', []);
      },
      durationchangeCb: function() {
        self.fireEvent('durationchange', []);
      },
      canplayCb: function() {
        self.fireEvent('canplay', []);
      },
      endedCb: function() {
        self.fireEvent('ended', []);
      },
      pauseCb: function() {
        self.fireEvent('pause', []);
      },
      progressCb: function() {
        self.fireEvent('progress', []);
      },
      errorCb: function() {
        self.fireEvent('error', []);
      }
    };
    this.player = this._getBestPlayer(callbacks);

    // The addEventListener interface exists on object.Element DOM elements.
    // However, this is just a simple class without any relation to the DOM.
    // Therefore we have to implement a pub/sub mechanism ourselves.
    // See:

    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
    // http://stackoverflow.com/questions/10978311/implementing-events-in-my-own-object

    var self = this;
    this.events = {};

    this.resetEventListeners = function() {
      self.events = {};
    };

    this.addEventListener = function(name, handler) {
      if (self.events.hasOwnProperty(name)) {
        self.events[name].push(handler);
      } else {
        self.events[name] = [handler];
      }
    };

    this.removeEventListener = function(name, handler) {
      /* This is a bit tricky, because how would you identify functions?
       This simple solution should work if you pass THE SAME handler. */
      if (!self.events.hasOwnProperty(name)) {
        return;
      }

      var index = self.events[name].indexOf(handler);
      if (index !== -1) {
        self.events[name].splice(index, 1);
      }
    };

    this.fireEvent = function(name, args) {
      if (!self.events.hasOwnProperty(name)) {
        return;
      }
      if (!args || !args.length) {
        args = [];
      }

      var evs = self.events[name];
      evs.forEach(function(ev) {
        ev.apply(null, args);
      });
    };
  }

  /**
   * Check for mandatory browser compatibility.
   * Logs detailed browser compatibilities related to for audio playback.
   * In case of compatibility issues, an error is thrown.
   */
  _playbackCompatibility() {
    // Detect audio playback capabilities.

    // Detect HTML5 Audio playback.
    // http://caniuse.com/#feat=audio
    this.canUseAudio = Boolean(new Audio());
    console.log('Native HTML5 Audio playback capability: ' +
      this.canUseAudio);

    // Detect Cordova Media Playback
    // It allows playing audio using the native bridge inside WebView Apps.
    // https://github.com/apache/cordova-plugin-media/blob/master/doc/index.md
    this.canUseCordovaMedia = Boolean(window.Media);
    console.log('Cordova Media playback capability: ' +
      this.canUseCordovaMedia);

    if (!(this.canUseAudio || this.canUseCordovaMedia)) {
      throw new Error(
        'Some form of audio playback capability is required');
    }

    var _audio = new Audio();
    if (_audio.canPlayType === 'function') {
      throw new Error(
        'Unable to detect audio playback capabilities');
    }

    var canPlayOggVorbis = _audio.canPlayType(
        'audio/ogg; codecs="vorbis"') !== '';
    var canPlayOggOpus = _audio.canPlayType(
        'audio/ogg; codecs="opus"') !== '';
    var canPlayWave = _audio.canPlayType('audio/wav') !== '';
    var canPlayMP3 = _audio.canPlayType('audio/mpeg; codecs="mp3"') !== '';
    var canPlayAAC = _audio.canPlayType(
        'audio/mp4; codecs="mp4a.40.2"') !== '';
    var canPlay3GPP = _audio.canPlayType(
        'audio/3gpp; codecs="samr"') !== '';

    console.log('Native Vorbis audio in Ogg container playback capability: ' +
      canPlayOggVorbis);
    console.log('Native Opus audio in Ogg container playback capability: ' +
      canPlayOggOpus);
    console.log('Native PCM audio in Waveform Audio File Format (WAVE) ' +
      'playback capability: ' + canPlayWave);
    console.log('Native MPEG Audio Layer 3 (MP3) playback capability: ' +
      canPlayMP3);
    console.log('Native Low-Complexity AAC audio in MP4 container playback ' +
      'capability: ' + canPlayAAC);
    console.log('Native AMR audio in 3GPP container playback capability: ' +
      canPlay3GPP);

    if (!(canPlayWave || canPlayMP3)) {
      throw new Error(
        'Native Wave or MP3 playback is required');
    }
  }

  /**
   * Get a player object that performs audio compression, when available.
   *
   * Using the Media Stream Recording API for recording is the prefered
   * solution. It allows recording compressed audio which makes it quicker to
   * submit. If not available, use a default createScriptProcessor is used.
   *
   * @param {GainNode} micInputGain The GainNode to analyze.
   */
  _getBestPlayer(callbacks) {
    var player = null;
    // Start by checking for a Cordova environment.
    // When running under a debugger like Ripple, both Cordova and WebAudio
    // environments get detected. While this is technically valid -Ripple is
    // running in Chrome, which supports WebAudio-, it's not a sandbox that
    // also disables functionality that would not be available on a device.
    if (this.canUseCordovaMedia) {
      // Use Cordova audio encoding (used codec depends on the platform).
      player = new CordovaMediaPlayer(callbacks);
    } else if (this.canUseAudio) {
      // Use the recorder with MediaRecorder implementation.
      player = new WebAudioPlayer(callbacks);
    } else {
      throw new Error('Unable to find a proper player.');
    }

    console.log('Player initialised.');
    return player;
  }

  /**
   * Preload audio from an URL.
   *
   * @param {string} url The URL that contains the audio.
   * @param {bool} preload Try preloading metadata and possible some audio (default). Set to false to not download anything until playing.
   * @param {AudioPlayer~loadedCallback} [loadedCb] The callback that is invoked when the duration of the audio file is first known.
   */
  load(url, preload, loadedCb) {
    this.player.load(url, preload, loadedCb);

    // If preloading is disabled, the 'canplay' event won't be triggered.
    // In that case, fire it manually.
    if (!preload) {
      this.fireEvent('canplay', []);
    }
  }

  /**
   * Unload previously loaded audio.
   */
  reset() {
    this.stop();
    this.player.reset();
    this.fireEvent('unloaded', []);
  }

  /**
   * Start or continue playback of audio.
   *
   * @param {number} [position] When position is given, start playing from this position (seconds).
   */
  play(position) {
    this.player.play(position);
  }

  /**
   * Stop playback of audio.
   */
  stop() {
    this.player.stop();
  }

  /**
   * Toggle audio playback. Switch from playing to paused state and back.
   */
  togglePlayback() {
    if (this.player.isPlaying()) {
      this.player.stop();
    } else {
      this.player.play();
    }
  }

  /**
   * Start preloading audio.
   */
  preload() {
    this.player.preload();
  }

  /**
   * Start playing audio at the given offset.
   *
   * @param {number} percentage Start at this percentage (0..100) of the audio stream.
   */
  scrub(percentage) {
    this.player.scrub(percentage);
  }

  /*
   * Returns the percentage of which the buffer is filled.
   *
   * @returns {number} percentage of buffer fill.
   */
  getBufferFill() {
    return this.player.getBufferFill();
  }

  /**
   * Returns the current playing time as offset in seconds from the start.
   *
   * @returns {number} time in seconds as offset from the start.
   */
  getCurrentTime() {
    return this.player.getCurrentTime();
  }

  /**
   * Returns the total duration in seconds.
   *
   * @returns {number} time in seconds of fragment duration.
   */
  getDuration() {
    return this.player.getDuration();
  }

  /**
   * Check if there is playback in progress.
   *
   * @returns `true` if user is currently playing audio, `false` otherwise.
   */
  isPlaying() {
    return this.player.isPlaying();
  }

  /**
   * Returns ready state of the player.
   *
   * @returns {bool} true when player is ready to start loading data or play, false when no audio is loaded or preparing.
   */
  canPlay() {
    return this.player.canPlay();
  }
}

/**
 @module its.AudioRecorder
 Audio recording component.

 Note the several events to subscribe to.
 */

class AudioRecorder {
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

    // The addEventListener interface exists on object.Element DOM elements.
    // However, this is just a simple class without any relation to the DOM.
    // Therefore we have to implement a pub/sub mechanism ourselves.
    // See:
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
    // http://stackoverflow.com/questions/10978311/implementing-events-in-my-own-object
    this.events = {};

    var self = this;
    this.addEventListener = function(name, handler) {
      if (self.events.hasOwnProperty(name)) {
        self.events[name].push(handler);
      } else {
        self.events[name] = [handler];
      }
    };

    this.removeEventListener = function(name, handler) {
      /* This is a bit tricky, because how would you identify functions?
       This simple solution should work if you pass THE SAME handler. */
      if (!self.events.hasOwnProperty(name)) {
        return;
      }

      if (handler) {
        var index = self.events[name].indexOf(handler);
        if (index !== -1) {
          self.events[name].splice(index, 1);
        }
      } else {
        delete self.events[name];
      }
    };

    this.fireEvent = function(name, args) {
      if (!self.events.hasOwnProperty(name)) {
        return;
      }
      if (!args || !args.length) {
        args = [];
      }

      var evs = self.events[name];
      evs.forEach(function(ev) {
        ev.apply(null, args);
      });
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
    navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
    this.canGetUserMedia = Boolean(navigator.getUserMedia);
    console.log('Native deprecated navigator.getUserMedia API capability: ' +
      this.canGetUserMedia);

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/mediaDevices.getUserMedia
    this.canMediaDevicesGetUserMedia = false;
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;
      this.canMediaDevicesGetUserMedia = Boolean(navigator.mediaDevices.getUserMedia);
    }
    console.log('Native navigator.mediaDevices.getUserMedia API capability:',
      this.canMediaDevicesGetUserMedia);

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
    var canCreateAudioContext = Boolean(window.AudioContext);
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
      throw new Error(
        'Some form of audio recording capability is required');
    }

    window.URL = (window.URL || window.webkitURL);
    var hasWindowURL = Boolean(window.URL);
    console.log('Native window.URL capability: ' +
      hasWindowURL);
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
   */
  requestUserMedia() {
    var self = this;

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

      var micInputGain = self._startUserMedia(stream);
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
    var micInput = this.audioContext.createMediaStreamSource(stream);

    // This is a workaround for a bug in Firefox that would otherwise lead to
    // the sound input stopping after ~5 seconds.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=934512
    // the important thing is to save a reference to the MediaStreamAudioSourceNode
    this.micInput = micInput;

    // Create a gain node
    var micInputGain = this.audioContext.createGain();
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
    var recorder = null;
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
      var self = this;
      recorder = new WebAudioRecorder(micInputGain, function(data) {
        self.streamCallback(data);
      });
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
    var uuid = (id === undefined ? guid.create() : id);
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
  }

  /**
   * Event fired by record.
   *
   * @event AudioRecorder~recording
   * @param {number} id Recording session (if any was defined).
   */
  recording(id) {
  }

  /**
   * Start recording microphone input until stopped.
   *
   * @param {AudioRecorder~recordDataAvailableCallback} [cb] The callback that provides a piece of raw audio when it becomes available. It may be used for streaming.
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

    var self = this;
    this.recorder.getEncodedAudio(function(blob) {
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
}


module.exports = {
  AudioPlayer: AudioPlayer,
  AudioRecorder: AudioRecorder
};

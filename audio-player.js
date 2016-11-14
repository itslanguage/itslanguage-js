const CordovaMediaPlayer = require('./cordova-media-player');
const ee = require('event-emitter');
const allOff = require('event-emitter/all-off');
const WebAudioPlayer = require('./web-audio-player');
/**
 *@module its.AudioPlayer
 * ITSLanguage AudioPlayer non-graphical component.
 */
module.exports = class AudioPlayer {
  /**
   * @constructor
   * @param {object} [options] Override any of the default settings.
   *
   */
  constructor(options) {
    this.settings = Object.assign({}, options);

    this._playbackCompatibility();
    const self = this;
    const callbacks = {
      playingCb() {
        self.emitter.emit('playing', []);
      },
      timeupdateCb() {
        self.emitter.emit('timeupdate', []);
      },
      durationchangeCb() {
        self.emitter.emit('durationchange', []);
      },
      canplayCb() {
        self.emitter.emit('canplay', []);
      },
      endedCb() {
        self.emitter.emit('ended', []);
      },
      pauseCb() {
        self.emitter.emit('pause', []);
      },
      stoppedCb() {
        self.emitter.emit('stopped', []);
      },
      playbackStoppedCb() {
        self.emitter.emit('playbackstopped', []);
      },
      progressCb() {
        self.emitter.emit('progress', []);
      },
      errorCb() {
        self.emitter.emit('error', []);
      }
    };
    this.player = this._getBestPlayer(callbacks);
    this.emitter = ee({});
  }

  resetEventListeners() {
    allOff(this.emitter);
  }

  addEventListener(name, handler) {
    this.emitter.on(name, handler);
  }

  removeEventListener(name, handler) {
    this.emitter.off(name, handler);
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
    this.canUseAudio = Boolean(Audio);
    console.log('Native HTML5 Audio playback capability: ' +
      this.canUseAudio);

    // Detect Cordova Media Playback
    // It allows playing audio using the native bridge inside WebView Apps.
    // https://github.com/apache/cordova-plugin-media/blob/master/doc/index.md
    this.canUseCordovaMedia = Boolean(window.Media);
    console.log('Cordova Media playback capability: ' +
      this.canUseCordovaMedia);

    if (!this.canUseAudio && !this.canUseCordovaMedia) {
      throw new Error(
        'Some form of audio playback capability is required');
    }
    if (this.canUseAudio) {
      const _audio = new Audio();
      if (!(_audio.canPlayType && _audio.canPlayType instanceof Function)) {
        throw new Error(
          'Unable to detect audio playback capabilities');
      }
      const canPlayOggVorbis = _audio.canPlayType(
          'audio/ogg; codecs="vorbis"') !== '';
      const canPlayOggOpus = _audio.canPlayType(
          'audio/ogg; codecs="opus"') !== '';
      const canPlayWave = _audio.canPlayType('audio/wav') !== '';
      const canPlayMP3 = _audio.canPlayType('audio/mpeg; codecs="mp3"') !== '';
      const canPlayAAC = _audio.canPlayType(
          'audio/mp4; codecs="mp4a.40.2"') !== '';
      const canPlay3GPP = _audio.canPlayType(
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
    let player = null;
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
   * @param {bool} preload Try preloading metadata and possible some audio (default). Set to false to not download
   * anything until playing.
   * @param {AudioPlayer~loadedCallback} [loadedCb] The callback that is invoked when the duration of the audio file
   * is first known.
   */
  load(url, preload, loadedCb) {
    this.player.load(url, preload, loadedCb);

    // If preloading is disabled, the 'canplay' event won't be triggered.
    // In that case, fire it manually.
    if (!preload) {
      this.emitter.emit('canplay', []);
    }
  }

  /**
   * Unload previously loaded audio.
   */
  reset() {
    this.stop();
    this.player.reset();
    this.emitter.emit('unloaded', []);
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

  pause() {
    this.player.pause();
  }

  /**
   * Toggle audio playback. Switch from playing to paused state and back.
   */
  togglePlayback() {
    if (this.player.isPlaying()) {
      this.player.pause();
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
   * @returns {bool} true when player is ready to start loading data or play, false when no audio is loaded
   * or preparing.
   */
  canPlay() {
    return this.player.canPlay();
  }
};

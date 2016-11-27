import CordovaMediaPlayer from './cordova-media-player';
import Stopwatch from './tools';
import WebAudioPlayer from './web-audio-player';
import allOff from 'event-emitter/all-off';
import ee from 'event-emitter';
/**
 * ITSLanguage AudioPlayer non-graphical component.
 */
export default class AudioPlayer {
  /**
   * Construct an AudioPlayer for playing .wav or .mp3 files.
   * Fires all events the HTML5 Audio also fires. {@link http://www.w3schools.com/tags/ref_av_dom.asp}
   * @param {Object} [options] Override any of the default settings.
   * @emits {Event} 'playbackstopped' When playback has ended, been stopped or been paused.
   */
  constructor(options) {
    this.settings = Object.assign({}, options);

    this._playbackCompatibility();
    const self = this;
    const callbacks = {
      playingCb() {
        self._emitter.emit('playing', []);
      },
      timeupdateCb() {
        self._emitter.emit('timeupdate', []);
      },
      durationchangeCb() {
        self._emitter.emit('durationchange', []);
      },
      canplayCb() {
        self._emitter.emit('canplay', []);
      },
      endedCb() {
        self._emitter.emit('ended', []);
      },
      pauseCb() {
        self._emitter.emit('pause', []);
      },
      stoppedCb() {
        self._emitter.emit('stopped', []);
      },
      playbackStoppedCb() {
        self._emitter.emit('playbackstopped', []);
        if (self._stopwatch) {
          self._stopwatch.stop();
        }
      },
      progressCb() {
        self._emitter.emit('progress', []);
      },
      errorCb() {
        self._emitter.emit('error', []);
      }
    };
    /**
     * @type {CordovaMediaPlayer|WebAudioPlayer} player - Specific audio player.
     */
    this.player = this._getBestPlayer(callbacks);
    this._emitter = ee({});
    this._stopwatch = null;
  }

  /**
   * Turn off all event listeners for this player.
   */
  resetEventListeners() {
    allOff(this._emitter);
  }

  /**
   * Add an event listener. Listens to events emitted from the player.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to add.
   */
  addEventListener(name, handler) {
    this._emitter.on(name, handler);
  }

  /**
   * Remove an event listener of the player.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to remove.
   */
  removeEventListener(name, handler) {
    this._emitter.off(name, handler);
  }

  /**
   * Check for mandatory browser compatibility.
   * Logs detailed browser compatibilities related to for audio playback.
   * @throws {Error} If no native wave or MP3 playback is available.
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
   * Using the Media Stream Recording API for recording is the preferred
   * solution. It allows recording compressed audio which makes it quicker to
   * submit. If not available, use a default createScriptProcessor is used.
   *
   * @param {Function} callbacks - Callbacks to add to the chosen player.
   * @private
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
   * @param {string} url - The URL that contains the audio.
   * @param {boolean} [preload=true] Try preloading metadata and possible some audio. Set to false to not download
   * anything until playing.
   * @param {Function} [loadedCb] The callback that is invoked when the duration of the audio file
   * is first known.
   * @emits {Event} 'canplay' When the player is ready to play.
   */
  load(url, preload, loadedCb) {
    this.reset();
    this.player.load(url, preload, loadedCb);

    // If preloading is disabled, the 'canplay' event won't be triggered.
    // In that case, fire it manually.
    if (!preload) {
      this._emitter.emit('canplay', []);
    }
  }

  /**
   * Unload previously loaded audio. Stops the player and any stopwatch.
   * @emits {Event} 'unloaded'
   */
  reset() {
    this.stop();
    this.player.reset();
    this._emitter.emit('unloaded', []);
  }

  /**
   * Start or continue playback of audio. Also starts the stopwatch at the given position.
   *
   * @param {number} [position] When position is given, start playing from this position (seconds).
   */
  play(position) {
    if (this.player.isPlaying()) {
      return;
    }
    this.player.play(position);
    if (this._stopwatch) {
      const time = Math.round(this.player.getCurrentTime() * 10);
      this._stopwatch.value = time;
      this._stopwatch.start();
    }
  }

  /**
   * Stop playback of audio. Stops and resets the stopwatch.
   */
  stop() {
    if (this._stopwatch) {
      this._stopwatch.reset();
      this._stopwatch.stop();
    }
    this.player.stop();
  }

  /**
   * Pause playback of audio. Stops the stopwatch.
   */
  pause() {
    if (this._stopwatch) {
      this._stopwatch.stop();
    }
    this.player.pause();
  }

  /**
   * Toggle audio playback. Switch from playing to paused state and back.
   */
  togglePlayback() {
    if (this.player.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Start preloading audio.
   */
  preload() {
    this.player.preload();
  }

  /**
   * Start playing audio at the given offset. Corrects a percentage under 0 or above 100 to the respective values.
   *
   * @param {number} percentage - Start at this percentage (0..100) of the audio stream.
   */
  scrub(percentage) {
    if (percentage < 0) {
      this.player.scrub(0);
    } else if (percentage > 100) {
      this.player.scrub(100);
    } else {
      this.player.scrub(percentage);
    }
    if (this._stopwatch) {
      this._stopwatch.value = Math.round(this.player.getCurrentTime() * 10);
    }
  }

  /**
   * Returns the percentage of which the buffer is filled.
   *
   * @returns {Number} percentage of buffer fill.
   */
  getBufferFill() {
    return this.player.getBufferFill();
  }

  /**
   * Returns the current playing time as offset in seconds from the start.
   *
   * @returns {Number} time in seconds as offset from the start.
   */
  getCurrentTime() {
    return this.player.getCurrentTime();
  }

  /**
   * Returns the total duration in seconds.
   *
   * @returns {Number} time in seconds of fragment duration.
   */
  getDuration() {
    return this.player.getDuration();
  }

  /**
   * Check if there is playback in progress.
   *
   * @returns {boolean} True if user is currently playing audio. False otherwise.
   */
  isPlaying() {
    return this.player.isPlaying();
  }

  /**
   * Returns ready state of the player.
   *
   * @returns {boolean} True when player is ready to start loading data or play. False when no audio is loaded
   * or the player is preparing.
   */
  canPlay() {
    return this.player.canPlay();
  }

  /**
   * Bind a stopwatch to sync with the playing and stopping functionality of the player.
   *
   * @param {Function} tickCb - Callback to invoke on every tick. A tick occurs once every 100 ms.
   * @throws {Error} If tickCb is null.
   * @returns {Stopwatch}
   */
  bindStopwatch(tickCb) {
    this._stopwatch = new Stopwatch(time => {
      const duration = this.getDuration() * 10;
      if (time > duration) {
        tickCb(duration);
      } else {
        tickCb(time);
      }
    });
    return this._stopwatch;
  }
}

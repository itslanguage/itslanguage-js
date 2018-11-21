import allOff from 'event-emitter/all-off';
import ee from 'event-emitter';
import Stopwatch from './tools';
import WebAudioPlayer from './web-audio-player';

/**
 * ITSLanguage AudioPlayer non-graphical component.
 * @module sdk/lib/audio/audio-player
 */
class AudioPlayer {
  /**
   * Construct an AudioPlayer for playing .wav or .mp3 files.
   *
   * @param {?Object} options - Override any of the default settings.
   * @emits {Event} 'playbackstopped' When playback has ended, been stopped or been paused.
   * @emits {Event} All events the HTML5 Audio also fires. {@link http://www.w3schools.com/tags/ref_av_dom.asp}
   */
  constructor(options) {
    /**
     * @type {Object}
     * @private
     */
    this.settings = Object.assign({}, options);

    this.playbackCompatibility();
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
        if (self.stopwatch) {
          self.stopwatch.stop();
        }
      },
      progressCb() {
        self.emitter.emit('progress', []);
      },
      errorCb() {
        self.emitter.emit('error', []);
      },
    };
    /**
     * Specific audio player.
     * @type {WebAudioPlayer}
     * @private
     */
    this.player = this.getPlayer(callbacks);

    /**
     * @type {Object}
     * @private
     */
    this.emitter = ee({});

    /**
     * @type {Object}
     * @private
     */
    this.stopwatch = null;

    /**
     * @type {number}
     * @private
     */
    this.audioLevel = 1;

    /**
     * @type {boolean}
     * @private
     */
    this.audioMuted = false;
  }

  /**
   * Turn off all event listeners for this player.
   */
  resetEventListeners() {
    allOff(this.emitter);
  }

  /**
   * Add an event listener. Listens to events emitted from the player.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to add.
   */
  addEventListener(name, handler) {
    this.emitter.on(name, handler);
  }

  /**
   * Remove an event listener of the player.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to remove.
   */
  removeEventListener(name, handler) {
    this.emitter.off(name, handler);
  }

  /**
   * Check for mandatory browser compatibility.
   * Logs detailed browser compatibilities related to for audio playback.
   *
   * @throws {Error} If no native wave or MP3 playback is available.
   * @private
   */
  playbackCompatibility() {
    // Detect audio playback capabilities.

    // Detect HTML5 Audio playback.
    // http://caniuse.com/#feat=audio
    this.canUseAudio = Boolean(Audio);
    console.log('Native HTML5 Audio playback capability:', this.canUseAudio);

    if (!this.canUseAudio) {
      throw new Error(
        'Some form of audio playback capability is required',
      );
    }
    if (this.canUseAudio) {
      const audio = new Audio();
      if (!(audio.canPlayType && audio.canPlayType instanceof Function)) {
        throw new Error(
          'Unable to detect audio playback capabilities',
        );
      }
      const canPlayOggVorbis = audio.canPlayType(
        'audio/ogg; codecs="vorbis"',
      ) !== '';
      const canPlayOggOpus = audio.canPlayType(
        'audio/ogg; codecs="opus"',
      ) !== '';
      const canPlayWave = audio.canPlayType('audio/wav') !== '';
      const canPlayMP3 = audio.canPlayType('audio/mpeg; codecs="mp3"') !== '';
      const canPlayAAC = audio.canPlayType(
        'audio/mp4; codecs="mp4a.40.2"',
      ) !== '';
      const canPlay3GPP = audio.canPlayType(
        'audio/3gpp; codecs="samr"',
      ) !== '';

      console.log('Native Vorbis audio in Ogg container playback capability:', canPlayOggVorbis);
      console.log('Native Opus audio in Ogg container playback capability:', canPlayOggOpus);
      console.log('Native PCM audio in Waveform Audio File Format (WAVE) playback capability:', canPlayWave);
      console.log('Native MPEG Audio Layer 3 (MP3) playback capability:', canPlayMP3);
      console.log('Native Low-Complexity AAC audio in MP4 container playback capability:', canPlayAAC);
      console.log('Native AMR audio in 3GPP container playback capability:', canPlay3GPP);

      if (!(canPlayWave || canPlayMP3)) {
        throw new Error(
          'Native Wave or MP3 playback is required',
        );
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
  getPlayer(callbacks) {
    let player = null;

    if (this.canUseAudio) {
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
   * @param {boolean} [preload=true] - Try preloading metadata and possible some audio. Set to false
   * to not download anything until playing.
   * @param {?Function} loadedCb - The callback that is invoked when the duration of the audio file
   * is first known.
   * @emits {Event} 'canplay' When the player is ready to play.
   */
  load(url, preload, loadedCb) {
    this.reset();
    this.player.load(url, preload, loadedCb);
    this.audioLevel = 1;

    // If preloading is disabled, the 'canplay' event won't be triggered.
    // In that case, fire it manually.
    if (!preload) {
      this.emitter.emit('canplay', []);
    }
  }

  /**
   * Unload previously loaded audio. Stops the player and any stopwatch.
   *
   * @emits {Event} 'unloaded'
   */
  reset() {
    this.stop();
    this.player.reset();
    this.emitter.emit('unloaded', []);
  }

  /**
   * Start or continue playback of audio. Also starts the stopwatch at the given position.
   *
   * @param {?number} position - When position is given, start playing from this position (seconds).
   */
  play(position) {
    if (this.player.isPlaying()) {
      return;
    }
    this.player.play(position);
    if (this.stopwatch) {
      const time = Math.round(this.player.getCurrentTime() * 10);
      this.stopwatch.value = time;
      this.stopwatch.start();
    }
  }

  /**
   * Stop playback of audio. Stops and resets the stopwatch.
   */
  stop() {
    if (this.stopwatch) {
      this.stopwatch.reset();
      this.stopwatch.stop();
    }
    this.player.stop();
  }

  /**
   * Pause playback of audio. Stops the stopwatch.
   */
  pause() {
    if (this.stopwatch) {
      this.stopwatch.stop();
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
   * Start playing audio at the given offset. Corrects a percentage under 0 or above 100 to the
   * respective values.
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
    if (this.stopwatch) {
      this.stopwatch.value = Math.round(this.player.getCurrentTime() * 10);
    }
  }

  /**
   * Returns the percentage of which the buffer is filled.
   *
   * @returns {number} Percentage of buffer fill.
   */
  getBufferFill() {
    return this.player.getBufferFill();
  }

  /**
   * Returns the current playing time as offset in seconds from the start.
   *
   * @returns {number} Time in seconds as offset from the start.
   */
  getCurrentTime() {
    return this.player.getCurrentTime();
  }

  /**
   * Returns the total duration in seconds.
   *
   * @returns {number} Time in seconds of fragment duration.
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
   * @returns {boolean} True when player is ready to start loading data or play. False when no audio
   * is loaded or the player is preparing.
   */
  canPlay() {
    return this.player.canPlay();
  }

  /**
   * Set the playback rate of the audio. Values are used according to HTML5 Audio.
   * Example values:
   * *1.0 is normal speed.
   * *0.5 is half speed (slower).
   * *2.0 is double speed (faster).
   * *-1.0 is backwards, normal speed.
   * *-0.5 is backwards, half speed.
   *
   * @param {number} rate - Rate at which to change the audio playback.
   */
  setPlaybackRate(rate) {
    this.player.setPlaybackRate(rate);
  }

  /**
   * Get the playback rate of the current loaded audio.
   *
   * @returns {number} Playback rate of the audio.
   */
  getPlaybackRate() {
    return this.player.getPlaybackRate();
  }

  /**
   * Bind a stopwatch to sync with the playing and stopping functionality of the player.
   *
   * @param {Function} tickCb - Callback to invoke on every tick. A tick occurs once every 100 ms.
   * @throws {Error} If tickCb is null.
   * @returns {Stopwatch} New Stopwatch object.
   */
  bindStopwatch(tickCb) {
    this.stopwatch = new Stopwatch((time) => {
      const duration = this.getDuration() * 10 / this.player.sound.playbackRate;
      if (time > duration) {
        tickCb(duration);
      } else {
        tickCb(time);
      }
    });
    return this.stopwatch;
  }

  /**
   * Sets the audio level of the current loaded audio. Valid values are from 0 (0%) to 1 (100%).
   *
   * @param {number} volume - Volume value from 0 to 1.
   */
  setAudioVolume(volume) {
    if (volume !== 0) {
      this.audioMuted = false;
    }
    if (volume === 0) {
      this.audioMuted = true;
    }
    this.player.setAudioVolume(volume);
  }

  /**
   * Gets the audio level of the current loaded audio. Valid values are from 0 (0%) to 1 (100%).
   *
   * @returns {number} Volume level of the current loaded audio.
   */
  getAudioVolume() {
    return this.player.getAudioVolume();
  }

  /**
   * Toggle the current playing audio to be muted or not. If the audio will be muted, the current
   * audio level is remembered and can be unmuted to continue at this same audio level.
   */
  toggleAudioMute() {
    this.setAudioMute(!this.audioMuted);
  }

  /**
   * Manually set the muted state of the current loaded audio.
   *
   * @param {boolean} shouldMute - Whether the audio should be muted or unmuted.
   */
  setAudioMute(shouldMute) {
    if (shouldMute) {
      this.audioLevel = this.getAudioVolume();
      this.setAudioVolume(0);
    } else {
      this.setAudioVolume(this.audioLevel);
    }
  }

  /**
   * Return the muted state of the current loaded audio.
   *
   * @returns {boolean} The muted state of the current loaded audio.
   */
  isAudioMuted() {
    return this.audioMuted;
  }
}

export default AudioPlayer;

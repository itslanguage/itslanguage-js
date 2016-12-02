/**
 * @title ITSLanguage Javascript Audio
 * @overview This is part of the ITSLanguage Javascript SDK to perform audio related functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 *
 * This class fires the same events as the HTML5 Audio does. {@link http://www.w3schools.com/tags/ref_av_dom.asp}
 */

export default class WebAudioPlayer {
  /**
   * ITSLanguage WebAudioPlayer non-graphical component.
   *
   * This player uses the HTML5 Audio component for playback.
   *
   * @param {Object} [options] - Override any of the default settings.
   */
  constructor(options) {
    this._settings = Object.assign({}, options);

    this._initPlayer();
  }

  _initPlayer() {
    this.sound = new window.Audio();
    this._pauseIsStop = false;

    // The its.AudioPlayer API is based upon the same API calls as the
    // HTML5 Audio element itself, therefore, just bubble up all events.
    const self = this;

    this.sound.addEventListener('playing', () => {
      if (self._settings.playingCb) {
        self._settings.playingCb();
      }
    });

    this.sound.addEventListener('timeupdate', () => {
      if (self._settings.timeupdateCb) {
        self._settings.timeupdateCb();
      }
    });

    this.sound.addEventListener('durationchange', () => {
      if (self._settings.durationchangeCb) {
        self._settings.durationchangeCb();
      }
    });

    this.sound.addEventListener('canplay', () => {
      if (self._settings.canplayCb) {
        self._settings.canplayCb();
      }
    });

    this.sound.addEventListener('ended', () => {
      if (self._settings.endedCb) {
        self._settings.endedCb();
      }
    });

    this.sound.addEventListener('pause', () => {
      // The HTML5 audio player only has a pause(), no stop().
      // To differentiate between the two, a flag is set in case the user
      // explicitly stopped (not paused) the audio.
      if (self._pauseIsStop === true) {
        self._pauseIsStop = false;
        if (self._settings.pauseCb) {
          self._settings.pauseCb();
        }
      } else if (self._settings.stoppedCb) {
        self._settings.stoppedCb();
      }
      if (self._settings.playbackStoppedCb) {
        self._settings.playbackStoppedCb();
      }
    });

    this.sound.addEventListener('progress', () => {
      if (self._settings.progressCb) {
        self._settings.progressCb();
      }
    });

    this.sound.addEventListener('error', e => {
      switch (e.target.error.code) {
        case e.target.error.MEDIA_ERR_ABORTED:
          console.error('You aborted the playback.');
          break;
        case e.target.error.MEDIA_ERR_NETWORK:
          console.error(
          'A network error caused the audio download to fail.');
          break;
        case e.target.error.MEDIA_ERR_DECODE:
          console.error(
          'The audio playback was aborted due to a corruption ' +
          'problem or because the media used features your ' +
          'browser did not support.');
          break;
        case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          console.error(
          'The audio could not be loaded, either because the ' +
          'server or network failed or because the format is ' +
          'not supported.');
          break;
        default:
          console.error('An unknown error occurred.');
          break;
      }
      if (self._settings.errorCb) {
        self._settings.errorCb();
      }
    });
  }


  /**
   * Preload audio from an URL.
   *
   * @param {string} url - The URL that contains the audio.
   * @param {boolean} [preload=true] - Try preloading metadata and possible some audio (default).
   * Set to false to not download anything until playing.
   * @param {Function} [loadedCb] - The callback that is invoked when the duration of the audio file
   * is first known.
   */
  load(url, preload, loadedCb) {
    preload = preload === undefined ? true : preload;

    // Automatically begin buffering the file, even if autoplay is off.
    this.sound.autobuffer = Boolean(preload);

    // Preloading options:
    // none - Do not preload any media.
    // Wait for a play event before downloading anything.
    // metadata - Preload just the metadata. Grab the start and the end of
    // the file via range-request and determine the duration.
    // auto - Preload the whole file. Grab the start and the end of the
    // file to determine duration, then seek back to the start
    // again for the preload proper.
    this.sound.preload = preload ? 'auto' : 'none';

    const self = this;
    if (loadedCb) {
      this.sound.addEventListener('durationchange', () => {
        console.log('Duration change for ' + url + ' to : ' +
          self.sound.duration);
        loadedCb(self.sound);
      });
    }

    this.sound.src = url;
  }


  /**
   * Start or continue playback of audio.
   *
   * @param {number} [position] - When position is given, start playing from this position (seconds).
   */
  play(position) {
    if (position !== undefined) {
      if (this.sound.readyState < this.sound.HAVE_METADATA) {
        // In case the audio wasn't already preloaded, do it now.
        this.sound.preload = 'auto';
        console.warn('Playing from a given position is not possible. ' +
          'Audio was not yet loaded. Try again.');
      } else {
        console.debug('Scrub position to: ' + position);
        this.sound.currentTime = position;
      }
    }
    console.debug('Start playing from position: ' + this.sound.currentTime);
    this.sound.play();
  }

  /**
   * Unload previously loaded audio.
   */
  reset() {
    this._initPlayer();
  }

  /**
   * Stop playback of audio.
   */
  stop() {
    // The HTML5 audio player only has a pause(), no stop().
    // To differentiate between the two, set a flag.
    this.sound.pause();
    this.sound.currentTime = 0;
  }

  /**
   * Pause playback of audio.
   */
  pause() {
    this._pauseIsStop = true;
    this.sound.pause();
  }

  /**
   * Start preloading audio.
   */
  preload() {
    // In case the audio wasn't already preloaded, do it now.
    if (this.sound.preload !== 'auto') {
      console.info('Start preloading audio.');
      this.sound.preload = 'auto';
    }
  }


  /**
   * Start playing audio at the given offset.
   *
   * @param {number} percentage - Start at this percentage (0..100) of the audio stream.
   */
  scrub(percentage) {
    // In case the audio wasn't already preloaded, do it now.
    if (this.sound.readyState < this.sound.HAVE_METADATA) {
      this.preload();
      console.warn('Scrubbing not possible. Audio was not yet loaded. ' +
        'Try again.');
      return;
    }

    const newTime = this.sound.duration / 100 * percentage;
    console.log('Moving audio position to: ' + percentage + '%: ' +
      newTime + 's of total playing time: ' + this.sound.duration);
    this.sound.currentTime = newTime;
  }

  /**
   * Returns the percentage of which the buffer is filled.
   *
   * @returns {number} Percentage of buffer fill.
   */
  getBufferFill() {
    if (this.sound.buffered === undefined ||
      this.sound.buffered.length === 0) {
      // Nothing buffered yet.
      return 0;
    }

    // The fact that there's not one buffer segment is ignored here.
    // Truely representing the buffered state requires multiple
    // loading bars.
    // Usually, when user didn't seek yet, there are two segments:
    // Got segment from: 0 to: 187.63999938964844
    // Got segment from: 222.44700622558594 to: 228.1140899658203
    // The latter is gained when the HTML5 audio component tries to find
    // the total audio duration.
    // More info:
    // http://html5doctor.com/html5-audio-the-state-of-play/#time-ranges
    let probableEnd = 0;
    for (let i = 0; i < this.sound.buffered.length; i++) {
      const start = this.sound.buffered.start(i);
      const end = this.sound.buffered.end(i);
      // console.log('Got segment from: ' + start + ' to: ' + end);
      // Often, the segment that starts from 0 keeps growing and
      // indicates -most likely- the biggest buffer.
      if (start === 0) {
        probableEnd = end;
      }
    }

    // Round up,so the buffer won't get stuck on 99% when
    // duration and buffer are equal, except for some far decimal.
    const loaded = Math.round(probableEnd * 100 / this.sound.duration);
    console.log('Buffer filled to ' + loaded + '%');
    return loaded;
  }

  /**
   * Returns the current playing time as offset in seconds from the start.
   *
   * @returns {number} Time in seconds as offset from the start.
   */
  getCurrentTime() {
    return this.sound.currentTime;
  }

  /**
   * Returns the total duration in seconds.
   *
   * @returns {number} Time in seconds of fragment duration. 0 if no audio is loaded.
   */
  getDuration() {
    let duration = this.sound.duration;
    // When no audio is loaded, the duration may be NaN
    if (!duration) {
      duration = 0;
    }
    return duration;
  }

  /**
   * Returns state of the player.
   *
   * @returns {boolean} True when player is currently playing. False when paused or stopped.
   */
  isPlaying() {
    return !this.sound.paused;
  }

  /**
   * Returns ready state of the player.
   *
   * @returns {boolean} True when player is ready to start loading data or play. False when no audio is loaded
   * or preparing.
   */
  canPlay() {
    // Either the player is in a valid readyState (preloaded), or
    // the player has a source attached and doesn't show any loading error (non-preloaded).
    return this.sound.readyState >= this.sound.HAVE_METADATA ||
      this.sound.src && !this.sound.error;
  }
}

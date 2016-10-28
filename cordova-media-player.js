/*
global
device
 */

const cordovaPromiseFS = require('cordova-promise-fs');

/**
 * @title ITSLanguage Javascript Audio
 * @overview This is part of the ITSLanguage Javascript SDK to perform audio related functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */


module.exports = class CordovaMediaPlayer {
  /**
   * ITSLanguage CordovaMediaPlayer non-graphical component.
   *
   * It uses the Cordova Media component to provide playback capability
   * through native Android or iOS code.
   *
   * @constructor
   * @param {object} [options] Override any of the default settings.
   *
   */
  constructor(options) {
    this.settings = Object.assign({}, options);

    this._isPlaying = false;
    this._canPlay = false;
    this.fs = cordovaPromiseFS({
      persistent: true,
      Promise: require('bluebird')
    });
    const platform = device.platform;
    if (platform === 'Android') {
      // See the 'cordova-plugin-media' documentation for more Android quirks:
      // Android devices record audio in Adaptive Multi-Rate format.
      // The specified file should end with a .3gp extension.
      this.filename = 'tempfile.3gp';
      this.mimetype = 'audio/3gpp';
      this.filepath = this.filename;
    } else if (platform === 'iOS') {
      // iOS only records to files of type .wav and returns an error if the
      // file name extension is not correct.
      this.filename = 'tempfile.wav';
      this.mimetype = 'audio/wav';
      this.filepath = 'documents://' + this.filename;
    } else {
      throw new Error('Unable to detect Android or iOS platform for ' +
        'determining audio format.');
    }
  }

  getFile(
    filename) {
    return this.fs.file(filename)
        .catch(fileError => {
          console.debug('Error getting file: ' + fileError);
          return Promise.reject(fileError);
        });
  }

  _loadMedia(
        filepath, closure) {
    return new Promise(resolve => {
      console.debug('Loading media: ' + filepath);
      // Cordova Media can only be loaded during instantiation.
      this.sound = new window.Media(filepath, () => {
        console.debug('Playback ended successfully.');
      },
        e => {
          console.debug('Playback failed: ' + e.code);
        },
        mediaStatus => {
          console.debug('Playback status update: ' + mediaStatus);
          if (mediaStatus === window.Media.MEDIA_STARTING) {
            console.debug('Metadata is being loaded.');
          }
          // We could have the duration known by now,
          // but Cordova should do better. Improvement reported:
          // https://issues.apache.org/jira/browse/CB-6880
          const duration = this.sound.getDuration();
          console.debug('Duration: ' + duration);

          if (duration > 0 && closure.settings.durationchangeCb) {
            closure.settings.durationchangeCb();
          }
        });

      // Trigger 'canplay' event on sound (which is what HTML5 would do).
      this._canPlay = true;
      if (closure.settings.canplayCb) {
        closure.settings.canplayCb();
      }

      // When Media is initialised, nothing is preloaded. Trigger loading of
      // the audio (without actually starting playback) by seeking.
      this.sound.seekTo(0);
      resolve(this.sound);
    });
  }

  /**
   * Preload audio from an URL.
   *
   * @param {string} url The URL that contains the audio.
   * @param {bool} preload Try preloading metadata and possible some audio (default).
   * Set to false to not download anything until playing.
   * @param {CordovaMediaPlayer~loadedCallback} [loadedCb] The callback that is invoked when the duration of
   * the audio file is first known.
   */
  load(url) {
    const self = this;
    const options = {
      method: 'GET'
    };
    return fetch(url, options)
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        return Promise.reject(response.status);
      })
      .then(data => {
        console.debug('Downloaded blob');
        console.debug('Writing blob to file');
        return new Promise(resolve => {
          self.getFile(this.filename)
            .then(() => this.fs.write(this.filename, data))
            .then(() => {
              resolve(self._loadMedia(self.filepath, self));
            });
        });
      });
  }


  /**
   * Start or continue playback of audio.
   *
   * @param {number} [position] When position is given, start playing from this position (seconds).
   */
  play(position) {
    this._isPlaying = true;
    this.sound.play();
    return position;
  }

  /**
   * Unload previously loaded audio.
   */
  reset() {
    this._canPlay = false;
    this.sound = null;
  }

  /**
   * Stop playback of audio.
   */
  stop() {
    this._isPlaying = false;
    this.sound.pause();
  }

  /**
   * Start preloading audio.
   */
  preload() {
    // This is a noop.
  }


  /**
   * Start playing audio at the given offset.
   *
   * @param {number} percentage Start at this percentage (0..100) of the audio stream.
   */
  scrub(percentage) {
    // XXX: Not implemented yet.
    return percentage;
  }

  /**
   * Returns the percentage of which the buffer is filled.
   *
   * @returns {number} percentage of buffer fill.
   */
  getBufferFill() {
    // XXX: Not implemented yet.
    return 100;
  }

  /**
   * Returns the current playing time as offset in seconds from the start.
   *
   * @returns {number} time in seconds as offset from the start.
   */
  getCurrentTime() {
    // XXX: Not implemented yet.
    return 0;
  }

  /**
   * Returns the total duration in seconds.
   *
   * @returns {number} time in seconds of fragment duration.
   */
  getDuration() {
    if (!this.sound) {
      return 0;
    }
    const duration = this.sound.getDuration();
    // duration may be -1 when undefined.
    return Math.min(duration, 0);
  }

  /**
   * Returns ready state of the player.
   *
   * @returns {bool} true when player is ready to start loading data or play, false when no audio is loaded
   * or preparing.
   */
  canPlay() {
    return this._canPlay;
  }

  /**
   * Returns state of the player.
   *
   * @returns {bool} true when player is currently playing, false when paused or stopped.
   */
  isPlaying() {
    return this._isPlaying;
  }
};

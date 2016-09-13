/* eslint-disable
 handle-callback-err,
 max-len,
 no-unused-vars
 */

/* global
 device
 */


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

    var platform = device.platform;
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

  _writeFile(filename, callback) {
    // org.apache.cordova.file provides the HTML5 Filesystem API.

    // var fs = window.TEMPORARY;
    var fs = window.PERSISTENT;

    window.requestFileSystem(
      fs, 0, fileSystemCallback, fileSystemErrorCallback);

    function fileSystemCallback(fileSystem) {
      // www.w3.org/TR/2012/WD-file-system-api-20120417/#idl-def-FileSystem
      console.debug('Got filesystem name: ' + fileSystem.name);

      // getFile Creates or looks up a file.
      // By setting options to create:false, only a lookup will be performed.
      console.debug('Calling getFile in read mode: ' + filename);
      fileSystem.root.getFile(filename, {
          create: true
        },
        entryCallback, entryErrorCallback);
    }

    function fileSystemErrorCallback(domError) {
      console.debug('Error calling requestFileSystem: ' + domError.name);
    }

    function entryCallback(entry) {
      // http://www.w3.org/TR/2012/WD-file-system-api-20120417/#idl-def-Entry
      console.debug('Got file entry: ' + entry.name);
      callback(entry);
    }

    function entryErrorCallback(fileError) {
      console.debug('Error calling getFile: ' + fileError.code);
    }
  }

  /**
   * Callback used by load.
   *
   * @callback CordovaMediaPlayer~loadedCallback
   * @param {Audio} audio The Audio element that has the duration property set.
   */
  loadedCallback(audio) {
  }

  _loadMedia(filepath, closure, loadedCb) {
    console.debug('Loading media: ' + filepath);
    var self = this;
    // Cordova Media can only be loaded during instantiation.
    this.sound = new window.Media(filepath, function () {
        console.debug('Playback ended successfully.');
      },
      function (e) {
        console.debug('Playback failed: ' + e.code);
      },
      function (mediaStatus) {
        console.debug('Playback status update: ' + mediaStatus);
        if (mediaStatus === window.Media.MEDIA_STARTING) {
          console.debug('Metadata is being loaded.');
        }
        // We could have the duration known by now,
        // but Cordova should do better. Improvement reported:
        // https://issues.apache.org/jira/browse/CB-6880
        var duration = self.sound.getDuration();
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

    if (loadedCb) {
      loadedCb(this.sound);
    }
  }


  /**
   * Preload audio from an URL.
   *
   * @param {string} url The URL that contains the audio.
   * @param {bool} preload Try preloading metadata and possible some audio (default). Set to false to not download anything until playing.
   * @param {CordovaMediaPlayer~loadedCallback} [loadedCb] The callback that is invoked when the duration of the audio file is first known.
   */
  load(url, preload, loadedCb) {
    var self = this;

    // The incoming url is actually a blob URL. (blob:file://xyz)
    // This blob URL needs to be 'downloaded' first.
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
      if (this.status === 200) {
        var blob = this.response;
        console.debug('Downloaded blob');

        console.debug('Writing blob to file');
        self._writeFile(self.filename, function (file) {
          file.createWriter(function (writer) {
            writer.onwriteend = function (e) {
              // File has been written, now load it.
              self._loadMedia(self.filepath, self, loadedCb);
            };
            writer.write(blob, 'application/octet-stream');
          });
        });
      }
    };
    xhr.send();
  }


  /**
   * Start or continue playback of audio.
   *
   * @param {number} [position] When position is given, start playing from this position (seconds).
   */
  play(position) {
    this._isPlaying = true;
    this.sound.play();
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
    var duration = this.sound.getDuration();
    // duration may be -1 when undefined.
    return Math.min(duration, 0);
  }

  /**
   * Returns ready state of the player.
   *
   * @returns {bool} true when player is ready to start loading data or play, false when no audio is loaded or preparing.
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

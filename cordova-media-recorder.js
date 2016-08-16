/* global
  device,
  Media
*/

/*
 * Use the Cordova Media recorder for recording and encoding audio
 * on a WebView, wrapped in a native App.
 * Supports 3GPP recording on Android, WAV recording on iOS.
 *
 * More information on:
 * https://github.com/apache/cordova-plugin-media/blob/master/doc/index.md
 */
module.exports = class CordovaMediaRecorder {
  /**
   * MediaRecorder
   *
   * @constructor
   * @param {MediaStream}
   *      stream - The MediaStream to analyze.
   */
  constructor() {
    this._isRecording = false;

    var platform = device.platform;
    var filepath = null;
    if (platform === 'Android') {
      // See the 'cordova-plugin-media' documentation for more Android quirks:
      // Android devices record audio in Adaptive Multi-Rate format.
      // The specified file should end with a .3gp extension.
      this.filename = 'recording.3gp';
      this.mimetype = 'audio/3gpp';
      // Attempts to save the file on some specific location failed.
      // Therefore, the path is no longer specified, just the filename.
      // On iOS the behaviour is documented under quirks:
      // If a full path is not provided, it's saved in
      // LocalFileSystem.TEMPORARY
      // On Android, a temporary recording is always saved to:
      // /storage/emulated/0/tmprecording.3gp
      // Then moved to its final destination:
      // /storage/emulated/0/<filename>
      filepath = this.filename;
    } else if (platform === 'iOS') {
      // iOS only records to files of type .wav and returns an error if the
      // file name extension is not correct.
      this.filename = 'recording.wav';
      this.mimetype = 'audio/wav';
      // On iOS, the path fed to Media() should be prepended with
      // 'documents://'. This behaviour is documented as quirk.
      filepath = 'documents://' + this.filename;
    } else {
      throw new Error('Unable to detect Android or iOS platform for ' +
        'determining audio format.');
    }

    this.mediaRecorder = new Media(filepath,
      // success callback
      function() {
        console.log('Final recording written to: ' + filepath);
      },

      // error callback
      function(err) {
        console.debug('recordAudio(): Audio Error: ' + err.code);
      }
    );
  }

  /**
   * Start recording audio.
   */
  record() {
    this.mediaRecorder.startRecord();
    this._isRecording = true;
  }

  /**
   * Is audio recording in progress.
   *
   * @returns true when recording, else false.
   */
  isRecording() {
    return this._isRecording;
  }

  /**
   * Stop recording audio.
   */
  stop() {
    if (this.isRecording()) {
      this.mediaRecorder.stopRecord();
      this._isRecording = false;
    }
  }

  _requestFilepath(
    filename, callback) {
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
        create: false
      },
        entryCallback, entryErrorCallback);
    }

    function fileSystemErrorCallback(domError) {
      console.debug('Error calling requestFileSystem: ' + domError.name);
    }

    function entryCallback(entry) {
      // http://www.w3.org/TR/2012/WD-file-system-api-20120417/#idl-def-Entry
      console.debug('Got file entry: ' + entry.name);
      entry.file(callback);
    }

    function entryErrorCallback(fileError) {
      console.debug('Error calling getFile: ' + fileError.code);
    }
  }

  /**
   * Request encoded audio to be returned through callback.
   *
   * @param {Function}
   *      callback - The callback to use when returning the audio as a
   *      blob.
   */
  getEncodedAudio(callback) {
    this._requestFilepath(this.filename, readDataUrl);

    function readDataUrl(file) {
      var reader = new FileReader();
      reader.onloadend = function(evt) {
        var arraybuffer = evt.target.result;
        var b = new Blob([arraybuffer], {
          type: this.mimetype
        });
        callback(b);
      };

      reader.readAsArrayBuffer(file);
    }
  }
};

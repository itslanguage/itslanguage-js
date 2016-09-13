/*
 * Use the Media Stream Recording API for recording and encoding. Ogg Opus
 * (audio/ogg) is the prefered output format.
 *
 * The Media Stream Recording API is W3C standard in the making:
 * https://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/RecordingProposal.html
 *
 * Currently only supported in Firefox. There's a standards author working for
 * Microsoft which hints wide adoption in the future.
 *
 * Encoder only supports 48k/16k mono audio channel.
 * http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
 * https://wiki.mozilla.org/Gecko:MediaRecorder
 *
 */
module.exports = class MediaRecorder {
  /**
   * MediaRecorder
   *
   * @constructor
   * @param {MediaStream}
   *      stream - The MediaStream to analyze.
   */
  constructor(mediaStream) {
    var self = this;
    this.mediaRecorder = new window.MediaRecorder(mediaStream);
    this.mediaRecorder.ondataavailable = function(e) {
      self.recordedBlob = new Blob([e.data], {
        type: 'audio/ogg'
      });
      console.log('Recorded audio/ogg Blob size: ' + self.recordedBlob.size);
      if (self.callback) {
        self.callback(self.recordedBlob);
        self.callback = null;
      }
    };
  }

  /**
   * Start recording audio.
   */
  record() {
    this.recordedBlob = null;
    this.callback = null;
    this.mediaRecorder.start();
  }

  /**
   * Is audio recording in progress.
   *
   * @returns true when recording, else false.
   */
  isRecording() {
    return this.mediaRecorder.state === 'recording';
  }

  /**
   * Stop recording audio.
   */
  stop() {
    if (this.isRecording()) {
      // Calling `stop()` throws a dataavailable event.
      this.mediaRecorder.stop();
    }
  }

  /**
   * Request encoded audio to be returned through callback.
   *
   * @param {Function}
   *      callback - The callback to use when returning the audio as a
   *      blob in Ogg Opus format.
   */
  getEncodedAudio(callback) {
    if (this.recordedBlob) {
      // Data already available, return right away.
      callback(this.recordedBlob);
      return;
    }
    // Callback will trigger later when audio is ready.
    this.callback = callback;
  }
};

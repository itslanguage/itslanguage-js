const WavePacker = require('./wave-packer');

module.exports = class WebAudioRecorder {
  /**
   * WebAudioRecorder
   *
   * Use 'low level' processing tooling to record audio and get a Wave
   * (audio/wav) encoded recording.
   *
   * Currently supported in all modern HTML5/WebAudio browsers.
   *
   * @constructor
   * @param {GainNode} source - The source to record.
   * @param {function} [streamingCallback] - The callback to deliver
   *    audio chunks to.
   */
  constructor(source, streamingCallback) {
    this.recording = false;

    var context = source.context;
    // For the best quality, use the samplerate in which audio is recorded.
    this.recordedSampleRate = context.sampleRate;
    // var sampleRate = recordedSampleRate;
    // 48000hz -> 24000hz recording, 44100hz -> 22050hz recording.
    // Sheffield determined the minimum to be 16000hz, so /4 is too low.
    this.sampleRate = this.recordedSampleRate / 2;
    // Streaming doesn't yet downsample: #1302.
    this.sampleRate = (streamingCallback ? this.recordedSampleRate :
      this.sampleRate);

    // Always record audio in mono.
    this.channels = 1;
    console.log('Recording at: ' +
      this.getAudioSpecs().audioParameters.sampleRate);

    this.packer = new WavePacker();
    this.packer.init(this.recordedSampleRate, this.sampleRate, this.channels);

    // From the spec: This value controls how frequently the audioprocess
    // event is dispatched and how many sample-frames need to be processed
    // each call. Lower values for buffer size will result in a lower
    // (better) latency. Higher values will be necessary to avoid audio
    // breakup and glitches.
    // Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).
    var bufferSize = 8192;
    var recorder = context.createScriptProcessor(bufferSize, 2, 2);
    // Keep a reference to the scriptProcessor.
    // This is a workaround for a bug in Chrome that would otherwise lead to
    // the recorder being garbage collected before it even recorded anything.
    // https://bugs.webkit.org/show_bug.cgi?id=112521
    this.recorder = recorder;

    var self = this;
    recorder.onaudioprocess = function (e) {
      if (!self.recording) {
        return;
      }
      var left = e.inputBuffer.getChannelData(0);
      var right = e.inputBuffer.getChannelData(1);
      // These returned channel buffers are pointers to the current samples
      // coming in. Make a snapshot (clone). The webworkers can't serialize
      // the pointers. Well, Chrome and FF could, but Edge can't.
      var leftClone = new Float32Array(left);
      var rightClone = new Float32Array(right);
      self.packer.record(leftClone, rightClone);
      if (streamingCallback) {
        self.packer.recordStreaming(leftClone, rightClone, streamingCallback);
      }
    };

    source.connect(recorder);
    // If the script node is not connected to an output the "onaudioprocess"
    // event is not triggered in chrome.
    recorder.connect(context.destination);
  }

  /**
   * Get the recorded audio specifications.
   *
   * @returns object containing metadata on the audio format.
   */
  getAudioSpecs() {
    return {
      audioFormat: 'audio/wave',
      audioParameters: {
        channels: this.channels,
        sampleWidth: 16,
        frameRate: this.sampleRate
      }
    };
  }

  /**
   * Start recording audio.
   *
   */
  record() {
    this.packer.clear();
    this.recording = true;
  }

  /**
   * Request encoded audio to be returned through callback.
   *
   * @param {Function}
   *      callback - The callback to use when returning the audio as a
   *      blob in Wave format.
   */
  getEncodedAudio(callback) {
    this.packer.exportWAV(callback);
  }

  /**
   * Is audio recording in progress.
   *
   * @returns true when recording, else false.
   */
  isRecording() {
    return this.recording;
  }

  /**
   * Stop recording audio.
   */
  stop() {
    this.recording = false;
  }
};

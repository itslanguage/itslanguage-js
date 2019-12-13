import { createBuffer } from './buffer';

/**
 * Buffer Audio.
 * Be able to get parts of audio buffered.
 */

class BufferPlugin {
  /**
   * Constructor method.
   *
   * @param {object} options - Options to pass to the plugin.
   * @param {boolean} options.immediateStart - Immediately start with buffering.
   * @param {boolean} options.stopAfterRecording - Stop buffering when the
   * recorder stops recording.
   * @param {number} options.secondsToBuffer - Number of seconds to buffer.
   */
  constructor({
    immediateStart = false,
    stopAfterRecording = true,
    secondsToBuffer,
  }) {
    this.immediateStart = immediateStart;
    this.stopAfterRecording = stopAfterRecording;
    this.secondsToBuffer = secondsToBuffer;

    this.bufferNode = null;
    this.recorder = null;

    this.startBuffering = this.startBuffering.bind(this);
    this.recordingStopped = this.recordingStopped.bind(this);
  }

  /**
   * Read the buffer and return it as WAVE file.
   *
   * @param secondsToRead
   * @returns {Blob} - The requested buffer in a blob with WAVE as mimeType.
   */
  readBufferAsWAV(secondsToRead) {
    const data = this.bufferNode.readBufferAsWAV(secondsToRead);
    const event = new Event('bufferdataavailable');

    if (data) {
      event.data = data;

      // Dispatch the data!
      this.recorder.dispatchEvent(event);
    }
  }

  /**
   * Start buffering audio!
   */
  startBuffering() {
    this.bufferNode = createBuffer(this.recorder.stream, this.secondsToBuffer);
    this.recorder.requestBufferedData = secondsToRead => {
      this.readBufferAsWAV(secondsToRead);
    };
  }

  /**
   * Stop buffering audio!
   */
  stopBuffering() {
    this.bufferNode = null;
    delete this.recorder.requestBufferedData;
  }

  /**
   * Handler for the recorder, this gets executed as soon as the recorder stops
   * recording. Based on the options it will stop buffering.
   */
  recordingStopped() {
    if (this.stopAfterRecording) {
      this.stopBuffering();
    }
  }

  /**
   * Start the plugin.
   */
  startPlugin() {
    if (this.immediateStart) {
      this.startBuffering();
    }

    this.recorder.addEventListener('start', this.startBuffering);
    this.recorder.addEventListener('stop', this.recordingStopped);
  }

  /**
   * This function gets called from itslanguage recorder side. It will pass
   * the recorder to it so we can use it.
   *
   * @param {MediaRecorder} recorder - Recorder for which this plugin needs to be
   * active on.
   */
  applyPlugin(recorder) {
    this.recorder = recorder;
    this.startPlugin();
  }
}

export default BufferPlugin;

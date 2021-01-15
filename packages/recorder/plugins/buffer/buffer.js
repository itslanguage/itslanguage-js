const AudioContext = window.AudioContext || /* istanbul ignore next */ window.webkitAudioContext;
let audioContext;

const BYTES_PER_SAMPLE = 2;

/**
 * Encode a Float32Array to an Uint8Array. Normalizes the audio.
 * Heavily inspired by the wave encode function from audio-recorder-polyfill.
 *
 * @param {Float32Array} buffer - The buffer to encode.
 * @returns {Uint8Array} - An Uint8Array with encoded audio.
 */
function encodeBuffer(buffer) {
  const { length } = buffer;
  const data = new Uint8Array(length * BYTES_PER_SAMPLE);
  for (let count = 0; count < length; count += 1) {
    const index = count * BYTES_PER_SAMPLE;
    let sample = buffer[count];

    /* istanbul ignore if */
    if (sample > 1) {
      sample = 1;
    }

    /* istanbul ignore if */
    if (sample < -1) {
      sample = -1;
    }
    sample *= 32768;
    data[index] = sample;
    // eslint-disable-next-line no-bitwise
    data[index + 1] = sample >> 8;
  }

  return data;
}

/**
 * Convert a buffer to valid WAV blob.
 * Heavily inspired by the wave dump function from audio-recorder-polyfill.
 *
 * @param {Float32Array} rawBuffer - The raw audio buffer to convert.
 * @param {number} sampleRate - Sample rate of the audio recorded.
 * @returns {Blob} - A valid wave "blob". Ready to be played (or downloaded).
 */
function bufferToWAV(rawBuffer, sampleRate) {
  const buffer = encodeBuffer(rawBuffer);

  const { length } = buffer;
  const wav = new Uint8Array(44 + length);
  const view = new DataView(wav.buffer);

  // RIFF identifier 'RIFF'
  view.setUint32(0, 1380533830, false);
  // file length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + length, true);
  // RIFF type 'WAVE'
  view.setUint32(8, 1463899717, false);
  // format chunk identifier 'fmt '
  view.setUint32(12, 1718449184, false);
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * BYTES_PER_SAMPLE, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, BYTES_PER_SAMPLE, true);
  // bits per sample
  view.setUint16(34, 8 * BYTES_PER_SAMPLE, true);
  // data chunk identifier 'data'
  view.setUint32(36, 1684108385, false);
  // data chunk length
  view.setUint32(40, length, true);

  // Set the data!
  wav.set(buffer, 44);

  // Return the blob;
  return new Blob([wav.buffer], { type: 'audio/wav' });
}

class BufferPlugin {
  /**
   * Event handler for the AudioProcess event. Will be called every time the
   * buffer is full and ready to be processed.
   *
   * @private
   * @param {AudioProcessingEvent} event - Audio processing event.
   */
  audioProcess(event) {
    const { inputBuffer } = event;

    // Add the buffer to the buffer (yes, very clear indeed);
    const recorderData = inputBuffer.getChannelData(0);

    // Shift stuff up;
    this.buffer.copyWithin(0, recorderData.length);
    this.buffer.set(recorderData, this.bufferSize - recorderData.length);
  }

  /**
   * Read from the buffer, provide how many seconds to read back from it.
   * IF passed nothing, 0 or more then there is in the buffer, the complete
   * buffer will be returned.
   *
   * @param {number} secondsToRead - How many seconds to read back.
   * @returns {Blob} - An WAVE file with the read buffer.
   */
  readBufferAsWAV(secondsToRead = null) {
    let rawBuffer;

    if (
      !secondsToRead
      || secondsToRead >= this.secondsToBuffer
      || secondsToRead === 0
    ) {
      // In this case we return the complete buffer;
      rawBuffer = this.buffer;
    } else {
      rawBuffer = this.buffer.slice(
        this.buffer.length - secondsToRead * audioContext.sampleRate,
      );
    }

    return bufferToWAV(rawBuffer, audioContext.sampleRate);
  }

  /**
   * Constructor method for the BufferPlugin object.
   *
   * @param {MediaStreamAudioSourceNode} audioSource - Audio source to buffer.
   * @param {number} [secondsToBuffer = 30] - Seconds to keep in buffer.
   */
  constructor(audioSource, secondsToBuffer = 30) {
    // Prepare (or re-use) this file its global audioContext;
    audioContext = audioContext || /* istanbul ignore next */ new AudioContext();

    /**
     * In seconds, how large (or how long) will be buffer?
     * @type {number}
     */
    this.secondsToBuffer = secondsToBuffer;

    /**
     * Total size of the buffer;
     * @type {number}
     */
    this.bufferSize = secondsToBuffer * audioContext.sampleRate;

    /**
     * The buffer!
     * @type {Float32Array}
     */
    this.buffer = new Float32Array(this.bufferSize);
    this.buffer.fill(0, 0);

    /**
     * Size of the buffer that will be filled with audio data.
     * @type {number}
     */
    this.scriptNodeBufferSize = 1024;

    /**
     * Audio source node.
     * @type {MediaStreamAudioSourceNode}
     */
    this.audioSource = audioSource;

    /**
     * Number of input channels to work with. Using mono as default.
     * @type {number}
     */
    this.inputChannels = 1;

    /**
     * Here we connect the Amplitudes ScriptProcessorNode to.
     * @type {GainNode}
     */
    this.outputChannel = audioContext.createGain();

    // Make sure to set `this` to the correct scope;
    this.audioProcess = this.audioProcess.bind(this);

    // Prepare a ScriptProcessorNode that will process our audio samples;
    this.scriptProcessorNode = audioContext.createScriptProcessor(
      this.scriptNodeBufferSize,
      this.inputChannels,
      1,
    );

    // Event listener to process the collected samples;
    this.scriptProcessorNode.addEventListener(
      'audioprocess',
      this.audioProcess,
    );

    // Set output volume to 0 so we don't create "sound" on any speakers;
    this.outputChannel.gain.value = 0;

    // Connect the audio source to the script processor;
    this.audioSource.connect(this.scriptProcessorNode);

    // Connect the script processor to the gain node;
    this.scriptProcessorNode.connect(this.outputChannel);

    // Finally, connect the gain node the the final destination;
    this.outputChannel.connect(audioContext.destination);
  }
}

/**
 * Factory function to create a BufferPlugin node.
 *
 * @param {MediaSource} mediaStream - MediaStream audio source, like provided
 * from a `navigator.getUserMedia` instance. Will be converted to a
 * MediaStreamAudioSourceNode. This can also be a file.
 * @param {number} [secondsToBuffer] - How many seconds to keep in the buffer.
 * @returns {BufferPlugin} - BufferPlugin node that buffers the audio of the stream.
 */
// eslint-disable-next-line import/prefer-default-export
export function createBuffer(mediaStream, secondsToBuffer) {
  // Prepare (or re-use) this file its global audioContext;
  audioContext = audioContext || new AudioContext();

  const audioSource = audioContext.createMediaStreamSource(mediaStream);
  return new BufferPlugin(audioSource, secondsToBuffer);
}

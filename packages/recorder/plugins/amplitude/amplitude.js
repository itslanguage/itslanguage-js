const AudioContext =
  window.AudioContext || /* istanbul ignore next */ window.webkitAudioContext;
let audioContext;

/**
 * Analyze the amplitude of sound with this object.
 *
 * Amplitude is the magnitude of vibration. Sound is vibration, so its amplitude is closely related
 * to volume/loudness.
 *
 * The original amplitude values for digital audio are between -1.0 and 1.0. But the RMS will always
 * be positive, because it is squared. And, rather than using instantaneous amplitude readings that
 * are sampled at a rate of 44,100 times per second, the RMS is an average over time which better
 * represents how we hear amplitude.
 */
class Amplitude {
  /**
   * Return all Amplitude readings at the moment it is called. The values it returns are based on
   * an array of amplitude values collected over a small period of time (n samples, equal to the
   * buffer size). The values will always be a value between 0.0 and 1.0.
   *
   * @returns {Object} - Amplitude readings as number between 0.0 and 1.0.
   */
  getCurrentLevels() {
    const { volume, volumePerChannel, averageVolumePerChannel } = this;

    return {
      volume,
      volumePerChannel: [...volumePerChannel],
      averageVolumePerChannel: [...averageVolumePerChannel],
    };
  }

  /**
   * Event handler for the AudioProcess event. Will be called every time the buffer is full and
   * ready to be processed.
   *
   * This function will calculate and store the volume and volume averages per input channel and
   * combined over all input channels.
   *
   * @private
   * @param {AudioProcessingEvent} event - Audio processing event.
   */
  audioProcess(event) {
    const { inputBuffer } = event;

    // Calculate and update average and RMS value for all available channels;
    for (
      let channelIndex = 0;
      channelIndex < inputBuffer.numberOfChannels;
      channelIndex += 1
    ) {
      const buffer = inputBuffer.getChannelData(channelIndex);
      const bufferLength = buffer.length;

      // Use reduce to calculate total and sum at the same time.
      // totals[0] is the average.
      // totals[1] is the sum.
      const totals = buffer.reduce(
        ([total, sum], item) => [total + item, sum + item * item],
        [0, 0],
      );

      // Calculate the volume average value.
      const average = totals[0] / bufferLength;

      // Calculate the RMS value.
      const rms = Math.sqrt(totals[1] / bufferLength);

      // Update the volume average for the current channel in the loop;
      this.averageVolumePerChannel[channelIndex] = Math.max(
        average,
        this.averageVolumePerChannel[channelIndex] * this.smoothing,
      );

      // Update the RMS value for the current channel in the loop;
      this.volumePerChannel[channelIndex] = Math.max(
        rms,
        this.volumePerChannel[channelIndex] * this.smoothing,
      );
    }

    // Calculate the sum of the RMS over all channels;
    const sumOfVolume = this.volumePerChannel.reduce(
      (acc, value) => acc + value,
    );

    // Store the average of this sum as the volume value.
    this.volume = sumOfVolume / this.volumePerChannel.length;
  }

  /**
   * Constructor method for the Amplitude object.
   *
   * @param {MediaStreamAudioSourceNode} audioSource - Audio source to analyse data from.
   * @param {number} [bufferSize = 1024] - Buffer size, or sample size, to work with.
   * @param {number} [smoothing = 0] - Smoothing to use when calculating volume information.
   * @param {number} [inputChannels = 2] - Number of input channels. Can be set here, but is
   * advisable to leave at default value.
   */
  constructor(
    audioSource,
    bufferSize = 1024,
    smoothing = 0,
    inputChannels = 2,
  ) {
    // Prepare (or re-use) this file its global audioContext;
    audioContext =
      audioContext || /* istanbul ignore next */ new AudioContext();

    /**
     * Size of the buffer that will be filled with audio data.
     * @type {number}
     */
    this.bufferSize = bufferSize;

    /**
     * Smoothing to apply to the amplitude readings.
     * @type {number}
     */
    this.smoothing = smoothing;

    /**
     * Audio source node.
     * @type {MediaStreamAudioSourceNode}
     */
    this.audioSource = audioSource;

    /**
     * Number of input channels to work with. Will mostly be 1 or 2 (mono or stereo).
     * @type {number}
     */
    this.inputChannels = inputChannels;

    /**
     * Here we connect the Amplitudes ScriptProcessorNode to.
     * @type {GainNode}
     */
    this.outputChannel = audioContext.createGain();

    /**
     * Volume level. Will be between 0.0 and 1.0.
     * @type {number}
     */
    this.volume = 0;

    // Prepare the stereoVolume and stereoAverage based on the number of channels.
    // Pre-fill the array with all zeros.
    const channelsArray = Array(inputChannels).fill(0);

    /**
     * Volume level per channel. Will be between 0.0 and 1.0.
     * @type {number[]}
     */
    this.volumePerChannel = [...channelsArray];

    /**
     * Average volume level, per channel. Value will be between 0.0 and 1.0.
     * @type {number[]}
     */
    this.averageVolumePerChannel = [...channelsArray];

    // Make sure to set `this` to the correct scope;
    this.getCurrentLevels = this.getCurrentLevels.bind(this);
    this.audioProcess = this.audioProcess.bind(this);

    // Prepare a ScriptProcessorNode that will process our audio samples;
    this.scriptProcessorNode = audioContext.createScriptProcessor(
      this.bufferSize,
      this.inputChannels,
      1,
    );

    // Add an event listner to the audioprocess event to process the collected samples;
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
 * Factory function to create a Amplitude node.
 *
 * @param {MediaSource} mediaStream - MediaStream audio source, like provided from a
 * `navigator.getUserMedia` instance. Will be converted to a MediaStreamAudioSourceNode. This can
 * also be a file.
 * @returns {Amplitude} - Amplitude node that analyses the amplitude of the provided audio stream.
 */
// eslint-disable-next-line import/prefer-default-export
export function createAmplitude(mediaStream) {
  // Prepare (or re-use) this file its global audioContext;
  audioContext = audioContext || new AudioContext();

  const audioSource = audioContext.createMediaStreamSource(mediaStream);
  return new Amplitude(audioSource);
}

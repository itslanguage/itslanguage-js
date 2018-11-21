import AudioContext from './AudioContext';

const DEFAULT_AUDIO_FORMAT = 'audio/wave';
const DEFAULT_CHANNELS = 1;
const DEFAULT_SAMPLE_WIDTH = 16;
const DEFAULT_SAMPLE_RATE = 48000;

/**
 * Recorder
 * Simple Audio Recorder based on Web Audio API technology.
 *
 * This audio recorder tries to capture audio in WAV format
 * with some defaults that should work best.
 *
 * If this does not supply in your case, build your own recorder!
 *
 * @module sdk/lib/WebAudio/Recorder
 */
export default class Recorder extends AudioContext {
  /** @private */
  audioFormat = null;

  /** @private */
  channels = null;

  /** @private */
  sampleRate = null;

  /** @private */
  sampleWidth = null;

  /** @private */
  stream = null;

  mediaStreamSource = null;

  constructor(options = {}) {
    super();

    const {
      audioFormat = DEFAULT_AUDIO_FORMAT,
      channels = DEFAULT_CHANNELS,
      sampleRate = DEFAULT_SAMPLE_RATE,
      sampleWidth = DEFAULT_SAMPLE_WIDTH,
    } = options;

    this.audioFormat = audioFormat;
    this.channels = channels;
    this.sampleRate = sampleRate;
    this.sampleWidth = sampleWidth;
  }

  createStream() {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.stream = stream;
      this.fireEvent('ready');
    }).catch(({ name, message }) => {
      this.error(`${name}: ${message}`);
    });
  }

  startRecording() {
    if (!this.stream) {
      this.createStream().then(() => {
        this.createAndConnect();
      });
    } else {
      this.createAndConnect();
    }
  }

  /**
   * @private
   */
  createAndConnect() {
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
    this.mediaStreamSource.connect(this.audioContext.destination);
    this.fireEvent('recording');
  }

  stopRecording() {
    this.mediaStreamSource.disconnect();
    this.stream.getAudioTracks().forEach((track) => {
      track.stop();
    });
    this.suspendAudioContext();
    this.fireEvent('recorded');
  }

  getAudioSpecs() {
    return {
      audioFormat: this.audioFormat,
      audioParameters: {
        channels: this.channels,
        frameRate: this.sampleRate,
        sampleWidth: this.sampleWidth,
      },
    };
  }
}

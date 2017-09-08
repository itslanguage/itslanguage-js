/**
 * Player
 * Audio player based on WebAudio technology
 */
export default class Player {
  /** @private */
  audioContext = null;
  /** @private */
  audioBuffer = null;
  /** @private */
  soundSource = null;

  /**
   * Construct the WebAudio.
   * Params can be passed to alter defaults.
   *
   * @param {Object} params - Accept an object to, maybe, override some defaults.
   */
  constructor(params = {}) {
    // Provide AudioContext object. If not passed the
    // default window.AudioContext will be used.
    if (params.audioContext) {
      this.audioContext = params.audioContext;
    } else {
      this.audioContext = this.getAudioContext();
    }

    this.currentTime = this.audioContext.currentTime;
    this.startPosition = 0;
    this.lastPlay = 0;
  }

  /**
   * Get the audio context or create one.
   *
   * @return {AudioContext}
   */
  getAudioContext() {
    if (!window.ItslAudioContext) {
      window.AudioContext =
        window.AudioContext || window.webkitAudioContext;
      window.ItslAudioContext = new window.AudioContext();
    }
    return window.ItslAudioContext;
  }

  /**
   * Load an URL to the audio player.
   *
   * @param {string} url - Url to load.
   */
  load(url) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.addEventListener('load', () => {
      if (request.status === 200 || request.status === 206) {
        this.audioContext.decodeAudioData(request.response, buffer => {
          this.audioBuffer = buffer;
        }); // add an onError as well..
      }
    });

    request.send();
  }

  bufferLoaded() {
    return Boolean(this.audioBuffer);
  }

  play(start = 0) {
    if (!this.bufferLoaded()) {
      return;
    }

    if (!this.soundSource) {
      // Create a sound source;
      this.soundSource = this.audioContext.createBufferSource();
    }

    // tell the source which sound to play
    this.soundSource.buffer = this.audioBuffer;

    // connect the source to the context's destination (the speakers)
    this.soundSource.connect(this.audioContext.destination);

    // play the source now
    this.soundSource.start(start);
  }
}

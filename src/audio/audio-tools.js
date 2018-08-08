/* eslint-disable
 new-cap
 */
/**
 * ITSLanguage Javascript Audio
 * @overview This is part of the ITSLanguage Javascript SDK to perform audio related functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */


/**
ITSLanguage Audio tools.
*/


import pcm from 'pcmjs';


/**
 * Generate a dummy Wave file for testing purposes.
 *
 * @param {number} duration - Length of audio in seconds.
 * @returns {string} A new URL containing the Wave file.
 */
export function generateWaveSample(duration) {
  const effect = [];
  const sampleRate = 22000;
  const loops = duration * sampleRate;
  for (let i = 0; i < loops; i++) {
    effect[i] = 64 + Math.round(
      32 * (Math.cos(i * i / 2000) + Math.sin(i * i / 4000)),
    );
  }
  const wave = new pcm({ channels: 1, rate: 22000, depth: 8 }).toWav(effect);
  return wave.encode();
}


export default class VolumeMeter {
  /**
   * Represents a volume meter.
   *
   * @param {AudioContext} audioContext - The WebAudio context.
   * @param {MediaStream} inputStream - The MediaStream to analyze.
   */
  constructor(audioContext, inputStream) {
    this.audioContext = audioContext;
    this.stream = inputStream;
    this.willAnimate = true;
  }


  /**
   * Start analysing the audio stream and provide updates to the specified callback function.
   *
   * @param {Function} callback - This function is called when there's a new volume reading is available.
   * First parameter is the volume.
   * @param {?Array} args - Optional array of parameters to pass to the callback after the volume parameter.
   */
  getVolumeIndication(callback, args) {
    if (!callback) {
      throw new Error('Callback parameter unspecified.');
    }

    // Convert single callback to Array of callbacks
    if (!(callback instanceof Array)) {
      callback = [callback];
    }

    this.volumeIndicationCallback = callback;
    this.volumeIndicationCallbackArgs = args || [];

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.stream.connect(this.analyserNode);

    this._updateAnalysers();
  }

  static _getAverageVolume(array) {
    let values = 0;

    const length = array.length;

    // Get all the frequency amplitudes
    for (let i = 0; i < length; i++) {
      values += array[i];
    }

    const average = values / length;
    return average;
  }

  /**
   * Calculate the volume, inform listeners by executing the callback.
   * Repeat indefinitely.
   */
  _updateAnalysers() {
    const volumeIndicationCallback = this.volumeIndicationCallback;
    const volumeIndicationCallbackArgs = this.volumeIndicationCallbackArgs;
    const analyserNode = this.analyserNode;
    const volumeMeter = this;
    let skippedCallbacks = 0;
    let lastVolume = -1;

    animloop();

    function animloop() {
      /* The Window.requestAnimationFrame() method tells the
       * browser that you wish to perform an animation and
       * requests that the browser call a specified function to
       * update an animation before the next repaint. The method
       * takes as an argument a callback to be invoked before
       * the repaint.
       */
      const requestAnimationFrame = window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame;

      const freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

      analyserNode.getByteFrequencyData(freqByteData);
      let averageVolume = VolumeMeter._getAverageVolume(freqByteData);

      if (volumeMeter.willAnimate) {
        requestAnimationFrame(animloop);
      } else {
        // Stop animating, provide callback with zero volume so the
        // meter doesn't appear to be stuck at the last volume level.
        averageVolume = 0;
      }

      // Callback only on substantial changes.
      const minDiff = 1;
      if (parseInt(averageVolume) >= lastVolume - minDiff
        && parseInt(averageVolume) <= lastVolume + minDiff) {
        // console.log('Skip same average: ' + lastVolume);
        return true;
      }
      // console.log('Got new volume: ' + parseInt(averageVolume) +
      // ' (old: ' + lastVolume + ')');
      lastVolume = parseInt(averageVolume);

      const args = [averageVolume].concat(volumeIndicationCallbackArgs);
      // Fire all callbacks.
      volumeIndicationCallback.forEach((cb) => {
        // This kludge prevents firing an averageVolume of zero
        // right away. The buffer probably needs filling before useful
        // values become available. 5 seems to be the magic number.
        if (skippedCallbacks < 5) {
          skippedCallbacks += 1;
          return true;
        }
        return cb(args);
      });
    }
  }

  /**
   * Stop calculating the volume.
   */
  stopAnalyser() {
    this.willAnimate = false;
  }

  /**
   * Start calculating the volume.
   */
  resumeAnalyser() {
    this.willAnimate = true;
  }
}

/* eslint-disable
 callback-return,
 max-len,
 new-cap
 */


/**
 * @title ITSLanguage Javascript Audio
 * @overview This is part of the ITSLanguage Javascript SDK to perform audio related functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */


/**
 @module its.Audio.Tools
 ITSLanguage Audio tools.
 */


const pcm = require('pcmjs');


/**
 * Generate a dummy Wave file for testing purposes.
 *
 * @param {number} duration Lenght of audio in seconds.
 * @returns A new URL containing the Wave file.
 */
function generateWaveSample(duration) {
  var effect = [];
  var sampleRate = 22000;
  var loops = duration * sampleRate;
  for (var i = 0; i < loops; i++) {
    effect[i] = 64 + Math.round(
        32 * (Math.cos(i * i / 2000) + Math.sin(i * i / 4000)));
  }
  var wave = new pcm({channels: 1, rate: 22000, depth: 8}).toWav(effect);
  return wave.encode();
}


class VolumeMeter {
  /**
   * Represents a volume meter.
   *
   * @constructor
   * @param {AudioContext} audioContext The WebAudio context.
   * @param {MediaStream} stream The MediaStream to analyze.
   */
  constructor(audioContext, inputStream) {
    this.audioContext = audioContext;
    this.stream = inputStream;
  }


  /**
   * Start analysing the audio stream and provide updates to the specified callback function.
   *
   * @param {function} callback This function is called when there's a new volume reading is available. First parameter is the volume.
   * @param {Array} [args] Optional array of parameters to pass to the callback after the volume parameter.
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
    var values = 0;
    var average;

    var length = array.length;

    // Get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
      values += array[i];
    }

    average = values / length;
    return average;
  }

  /**
   * Calculate the volume, inform listeners by executing the callback.
   * Repeat indefinitely.
   */
  _updateAnalysers() {
    var volumeIndicationCallback = this.volumeIndicationCallback;
    var volumeIndicationCallbackArgs = this.volumeIndicationCallbackArgs;
    var analyserNode = this.analyserNode;
    var willAnimate = this.willAnimate = {
      anim: true
    };
    var skippedCallbacks = 0;
    var lastVolume = -1;

    animloop();

    function animloop() {
      /* The Window.requestAnimationFrame() method tells the
       * browser that you wish to perform an animation and
       * requests that the browser call a specified function to
       * update an animation before the next repaint. The method
       * takes as an argument a callback to be invoked before
       * the repaint.
       */
      var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

      var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

      analyserNode.getByteFrequencyData(freqByteData);
      var averageVolume = VolumeMeter._getAverageVolume(freqByteData);

      if (willAnimate.anim) {
        requestAnimationFrame(animloop);
      } else {
        // Stop animating, provide callback with zero volume so the
        // meter doesn't appear to be stuck at the last volume level.
        averageVolume = 0;
      }

      // Callback only on substantial changes.
      var minDiff = 1;
      if (parseInt(averageVolume) >= (lastVolume - minDiff) &&
        parseInt(averageVolume) <= (lastVolume + minDiff)) {
        return true;
      }
      lastVolume = parseInt(averageVolume);

      var args = [averageVolume].concat(volumeIndicationCallbackArgs);
      // Fire all callbacks.
      volumeIndicationCallback.forEach(function(cb) {
        // This kludge prevents firing an averageVolume of zero
        // right away. The buffer probably needs filling before useful
        // values become available. 5 seems to be the magic number.
        if (skippedCallbacks < 5) {
          skippedCallbacks += 1;
          return true;
        }
        if (cb) {
          cb(args);
        }
      });
    }
  }

  /**
   * Stop calculating the volume.
   */
  stopAnalyser() {
    this.willAnimate.anim = false;
  }
}


module.exports = {
  generateWaveSample: generateWaveSample,
  VolumeMeter: VolumeMeter
};

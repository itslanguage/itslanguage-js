/**
 * @module recorder
 */

import MediaRecorder from 'audio-recorder-polyfill';
import AmplitudePlugin from './plugins/amplitude';
import BufferPlugin from './plugins/buffer';

/**
 * If the recorder is imported we rely on the MediaRecorder interface. In some
 * (important) browsers, like safari on IOS, that is not available. So with
 * the construct bellow we enforce to be able to use a MediaRecorder.
 *
 * Note though that this MediaRecorder enforces WAV as mimeType.
 */
/* istanbul ignore if */
if (!window.MediaRecorder) {
  window.MediaRecorder = MediaRecorder;
}

/**
 * Factory function to create a new MediaRecorder object. Note that if the
 * browser does not have a MediaRecorder it will use a polyfill. Also note that
 * by default we use the polyfill anyway. Our backend is currently best at
 * using audio/wav.
 *
 * @param {MediaStream} stream - Stream to record from.
 * @param {Object[]} [plugins = []] - Optionally an array with plugins to enable
 * on the recorder created.
 * @param {string} [mimeType=audio/wav] - The mimeType to use for the recorder.
 * @returns {MediaRecorder} - An instance of the created MediaRecorder.
 */
export function createRecorder(
  stream = null,
  plugins = [],
  mimeType = 'audio/wav',
) {
  // Create the MediaRecorder object.
  let recorder;

  if (mimeType && mimeType === 'audio/wav') {
    // In case someone insists on wanting wav, we use the polyfill.
    recorder = new MediaRecorder(
      stream,
      mimeType && {
        mimeType,
      },
    );
  } else {
    // Otherwise, use the browser native MediaRecorder
    recorder = new window.MediaRecorder(
      stream,
      mimeType && {
        mimeType,
      },
    );
  }

  // Prepare the plugins object, here we store an instance of a plugin.
  recorder.plugins = [];

  // Enhance the recorder with some (or none) plugins.
  plugins.forEach(plugin => {
    // Try to initialize the plugin.
    // And yes, if there is no `initPlugin` method, nothing happens!
    /* istanbul ignore else */
    if (plugin.applyPlugin) {
      plugin.applyPlugin(recorder);

      // Store the plugin!
      recorder.plugins.push(plugin);
    }
  });

  /**
   * For compliancy with the ITSLanguage backend this function still exists.
   * Once the nl.itslanguage.<challenge>.init_audio calls are removed we will
   * drop this function asap.
   *
   * Please don't use this in your code. If you need information about the
   * recorder and the settings it uses do it with your own logic.
   *
   * @returns {object} - An object that holds information about the specs or
   * settings of the current recorder.
   */
  recorder.getAudioSpecs = () => {
    let sampleRate;
    let sampleSize;
    let channels;

    if (recorder.mimeType === 'audio/wav') {
      const AudioContext =
        window.AudioContext ||
        /* istanbul ignore next */ window.webkitAudioContext;
      const audioContext = new AudioContext();
      // eslint-disable-next-line prefer-destructuring
      sampleRate = audioContext.sampleRate;
      sampleSize = 16;
      channels = 1;
    } else {
      const [audioTrack] = recorder.stream.getAudioTracks();
      const settings = audioTrack.getSettings();
      /* eslint-disable prefer-destructuring */
      sampleRate = settings.sampleRate;
      sampleSize = settings.sampleSize;
      /* eslint-enable prefer-destructuring */
      channels = settings.channelCount;
    }

    return {
      audioFormat: recorder.mimeType,
      audioParameters: {
        channels,
        sampleWidth: sampleSize,
        frameRate: sampleRate,
        sampleRate,
      },
    };
  };

  return recorder;
}

/**
 * Create a stream to connect the MediaRecorder to.
 * Note, if this functions throws an error that getUserMedia is not implemented, consider
 * adding a polyfill to your project that adds support for the getUserMedia function.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * @returns {Promise} - Promise with either the stream, or else an error message.
 */
export function createMediaStream() {
  if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
    return Promise.reject(
      new Error(
        'navigator.mediaDevices.getUserMedia not implemented in this browser',
      ),
    );
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

/**
 * Factory function to create an AmplitudePlugin. Use the result of this
 * function to pass to the plugin list of the recorder.
 *
 * @param {object} [options = {}] - Options to pass to the AmplitudePlugin.
 * @returns { AmplitudePlugin } - Instance of the AmplitudePlugin.
 */
export function createAmplitudePlugin(options = {}) {
  return new AmplitudePlugin(options);
}

/**
 * Factory function to create a BufferPlugin. Use the returned value of this
 * function to pass to the plugin list of the recorder.
 *
 * @param {object} [options = {}] - Options to pass to the BufferPlugin.
 * @returns {BufferPlugin} - Instance of the BufferPlugin.
 */
export function createBufferPlugin(options = {}) {
  return new BufferPlugin(options);
}

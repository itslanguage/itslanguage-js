/**
 * @module recorder
 */

import debug from 'debug';
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import BufferPlugin from './plugins/buffer';
import AmplitudePlugin from './plugins/amplitude';

const logger = debug('its-sdk:recorder');

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
export async function createRecorder(
  stream = null,
  plugins = [],
  mimeType = 'audio/wav',
) {
  // Register the wav encoder
  try {
    await register(await connect());
  } catch (e) {
    if (e.message.includes('There is already an encoder stored')) {
      // This happends when you try to make more than one recorder
      logger.debug('Tried registering an encoder when there is already one stored');
    } else {
      throw e;
    }
  }

  // Create the MediaRecorder object.
  const recorder = new MediaRecorder(
    stream,
    mimeType && {
      mimeType,
    },
  );

  // Add stream to the recorder for amplitude plugin
  recorder.stream = stream;

  // Prepare the plugins object, here we store an instance of a plugin.
  recorder.plugins = [];

  // Enhance the recorder with some (or none) plugins.
  plugins.forEach((plugin) => {
    // Try to initialize the plugin.
    // And yes, if there is no `initPlugin` method, nothing happens!
    /* istanbul ignore else */
    if (plugin.applyPlugin) {
      plugin.applyPlugin(recorder);

      // Store the plugin!
      recorder.plugins.push(plugin);
    }
  });

  return recorder;
}

/**
 * Create a stream to connect the MediaRecorder to.
 * Note, if this functions throws an error that getUserMedia is not implemented,
 * consider adding a polyfill to your project that adds support for the
 * getUserMedia function.
 *
 * We have set one constraint to the stream that is important for the
 * ITSLanguage speech technology to work on. We require a minimum sampleRate of
 * 16kHz. If that requirement is not met, the call to this function will throw
 * an `OverconstrainedError` exception. A client should then handle the error.
 *
 * There can be a bunch of errors thrown when calling getUserMedia. See the list
 * below for a short summary and a short description. Check the link below for
 * more comprehensive explaination on the errors.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 *
 * @throes {Error} If navigator.mediaDevices.getUserMedia not implemented in
 * this browser
 * @throws {AbortError} Some problem occurred which prevented the device from
 * being used.
 * @throws {NotAllowedError} One or more of the requested source devices cannot
 * be used at this time.
 * @throws {NotFoundError} No media tracks of the type specified were found that
 * satisfy the given constraints.
 * @throws {NotReadableError} Although the user granted permission to use the
 * matching devices, a hardware error occurred at the operating system, browser,
 * or Web page level which prevented access to the device.
 * @throws {OverconstrainedError} The specified constraints resulted in no
 * candidate devices which met the criteria requested.
 * @throws {SecurityError} User media support is disabled on the Document on
 * which getUserMedia() was called.
 * @throws {TypeError} The list of constraints specified is empty, or has all
 * constraints set to false.
 *
 * @param {MediaStreamConstraints} mediaStreamConstraints - Allow
 * MediaStreamConstraints. This also makes it possible to override the default
 * set by us. Note that we do not advice this!
 * @returns {Promise} - Promise which resolves the stream if successful.
 */
export function createMediaStream(mediaStreamConstraints = {}) {
  if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
    return Promise.reject(
      new Error(
        'navigator.mediaDevices.getUserMedia not implemented in this browser',
      ),
    );
  }

  // Because we do want to allow overriding settings we need to make sure we log
  // something to the user because we want to be sure it is intentional.
  if (
    mediaStreamConstraints
    && mediaStreamConstraints.audio
    && mediaStreamConstraints.audio.sampleRate
    && (mediaStreamConstraints.audio.sampleRate.min
      || mediaStreamConstraints.audio.sampleRate.ideal)
  ) {
    logger(
      'It is not recommended to override the sampleRate.min or sampleRate.ideal'
        + ' value. Make sure this is what you meant to do.',
    );
  }

  return navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: {
        min: 16000,
        ideal: 44100,
      },
      channelCount: 1,
    },
    ...mediaStreamConstraints,
  });
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

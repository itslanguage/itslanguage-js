/**
 * @module recorder
 */

import MediaRecorder from 'audio-recorder-polyfill';

/**
 * Override or set the MediaRecorder to the window object.
 *
 * @param {string} [ns='MediaRecorder'] - Give the object another name if required.
 */
export function addAsGlobal(ns = 'MediaRecorder') {
  if (window[ns]) {
    window[`Original${ns}`] = window[ns];
  }

  window[ns] = MediaRecorder;
}

/**
 * Uses the imported MediaRecorder to create a new MediaRecorder object from.
 * Note that the browser default is NOT used. This is because the support of the MediaRecorder API
 * is still not large.
 *
 * Another reason to not want to use the default is that the ITSLanguage backend currently only
 * supports WAVE as input.
 *
 * @param {MediaStream} stream - Stream to record from.
 * @param {boolean} [setToWindow=false] - Override or set MediaRecorder to the window object,
 * defaults to false.
 * @param {string} [asObject='MediaRecorder'] - Optionally give the object another name then
 * MediaRecorder.
 * @returns {MediaRecorder} - An instance of the created MediaRecorder.
 */
export function createRecorder(stream = null, setToWindow = false, asObject = 'MediaRecorder') {
  if (setToWindow) {
    addAsGlobal(asObject);
  }

  return new MediaRecorder(stream);
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
    return Promise.reject((
      new Error('navigator.mediaDevices.getUserMedia not implemented in this browser')
    ));
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

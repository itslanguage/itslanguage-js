/**
 * Some all-round re-usable utilities.
 *
 * @module api/utils
 */

/**
 * Convert the given ArrayBuffer to a base64 encoded string.
 *
 * @param {ArrayBuffer} data - The data to transform to base64.
 *
 * @returns {string} - The base64 encoded data.
 */
export function dataToBase64(data) {
  // eslint-disable-line import/prefer-default-export
  let binary = '';
  const bytes = new Uint8Array(data);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Async function to convert a Blob to an ArrayBuffer.
 * @param {Blob} blob - The blob to read as ArrayBuffer
 * @returns {Promise}
 */
export function asyncBlobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('loadend', () => {
      resolve(fileReader.result);
    });

    fileReader.addEventListener('error', () => {
      fileReader.abort();
      reject(fileReader.error);
    });

    fileReader.readAsArrayBuffer(blob);
  });
}

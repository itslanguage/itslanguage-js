/**
 * Some allround re-usable utilities.
 */

/**
 * Convert the given ArrayBuffer to a base64 encoded string.
 *
 * @param {ArrayBuffer} data - The data to transform to base64.
 *
 * @returns {string} - The base64 encoded data.
 */
export function dataToBase64(data) {
  let binary = '';
  const bytes = new Uint8Array(data);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

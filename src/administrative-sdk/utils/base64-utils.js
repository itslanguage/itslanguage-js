/**
 * @private
 */
export default class Base64Utils {
  /**
   * Convert an array buffer to a base64 encoded binary string.
   *
   * @param {buffer} buffer - Buffer of data.
   * @returns {string} Base64 encoded binary string.
   */
  static _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

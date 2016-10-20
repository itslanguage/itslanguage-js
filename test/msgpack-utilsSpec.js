const MsgPackUtils = require('../administrative-sdk/utils/msgpack-utils');
const msgpack = require('msgpack-js-v5');

describe('MsgPackUtils', () => {
  it('should encode binary data and serialize to msgpack', () => {
    const input = new Int16Array(5);
    input[0] = 0.32 * 0x7FFF;
    input[1] = 0.58 * 0x7FFF;
    input[2] = 0.29 * 0x7FFF;
    input[3] = 0.84 * 0x7FFF;
    input[4] = 0.32 * 0x7FFF;
    const buffer = input.buffer;
    const array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < array.byteLength; i++) {
      binary += String.fromCharCode(array[i]);
    }
    const output = MsgPackUtils._arrayBufferToMsgPack(input.buffer);
    const decoded = msgpack.decode(output);
    expect(decoded).toEqual(binary);
  });
});

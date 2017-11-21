/**
 * The unittests for the exported functions from `index.js`.
 */


import * as utils from './index';


describe('dataToBase64', () => {
  it('should base64 encode `ArrayBuffer`s you put in', () => {
    expect(utils.dataToBase64(new ArrayBuffer(16))).toEqual('AAAAAAAAAAAAAAAAAAAAAA==');
  });
});

/* eslint-disable
 camelcase,
 new-cap
 */

/* global
 describe,
 expect,
 it,
 spyOn,
 window,
 FormData
 */

const WavePacker = require('../wave-packer');

describe('Warning tests', function() {
  it('Should warn when the sample rates are invalid', function() {
    spyOn(console, 'warn');
    var warning = '48000 or 44100 are the only supported recordingSampleRates';
    var wavePacker = new WavePacker();
    wavePacker.init(0, 0, 0);
    expect(console.warn).toHaveBeenCalledWith(warning);
    expect(wavePacker.recordingSampleRate).toBeDefined();
    expect(wavePacker.sampleRate).toBeDefined();
    expect(wavePacker.channels).toBeDefined();

    warning = 'sampleRate must be equal, half or a quarter of the ' +
      'recording sample rate';
    wavePacker.init(48000, 0, 0);
    expect(console.warn).toHaveBeenCalledWith(warning);
    expect(wavePacker.recordingSampleRate).toBeDefined();
    expect(wavePacker.sampleRate).toBeDefined();
    expect(wavePacker.channels).toBeDefined();
  });
});

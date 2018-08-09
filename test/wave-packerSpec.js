import WavePacker from '../src/audio/wave-packer';

describe('WavePacker', () => {
  it('should warn when the sample rates are invalid', () => {
    spyOn(console, 'warn');
    let warning = '48000 or 44100 are the only supported recordingSampleRates';
    const wavePacker = new WavePacker();
    expect(() => {
      wavePacker.init(0, 0, 0);
    }).toThrowError(warning);

    warning = 'sampleRate must be equal, half or a quarter of the recording sample rate';
    expect(() => {
      wavePacker.init(48000, 0, 0);
    }).toThrowError(warning);
  });

  it('should interleave two channels', () => {
    const wavePacker = new WavePacker();
    wavePacker.init(48000, 48000, 2);
    const leftChannel = [0, 2, 4, 6, 8, 10];
    const rightChannel = [1, 3, 5, 7, 9, 11];
    const result = wavePacker.interleave(leftChannel, rightChannel);
    expect(result.length).toEqual(leftChannel.length + rightChannel.length);
    for (let i = 0; i < result.length; i += 1) {
      expect(result[i]).toEqual(i);
    }
  });

  it('should interleave and downsample two channels 2 times', () => {
    const wavePacker = new WavePacker();
    wavePacker.init(48000, 24000, 2);
    const leftChannel = [0, 2, 4, 6, 8, 10];
    const rightChannel = [1, 3, 5, 7, 9, 11];
    const result = wavePacker.interleave(leftChannel, rightChannel);
    expect(result.length).toEqual(leftChannel.length);
    for (let i = 0; i < result.length; i += 1) {
      const average = Math.round((leftChannel[i] + rightChannel[i]) / 2 * 100) / 100;
      expect(result[i]).toEqual(average);
    }
  });

  it('should interleave and downsample two channels 4 times', () => {
    const wavePacker = new WavePacker();
    wavePacker.init(44100, 11025, 2);
    const leftChannel = [0, 2, 4, 6, 8, 10];
    const rightChannel = [1, 3, 5, 7, 9, 11];
    const result = wavePacker.interleave(leftChannel, rightChannel);
    expect(result.length).toEqual(3);
    expect(result[0]).toEqual(1.5);
    expect(result[1]).toEqual(5.5);
    expect(result[2]).toEqual(9.5);
  });

  it('should handle two empty channels', () => {
    const wavePacker = new WavePacker();
    wavePacker.init(48000, 24000, 2);
    const leftChannel = [];
    const rightChannel = [];
    const result = wavePacker.interleave(leftChannel, rightChannel);
    expect(result.length).toEqual(0);
  });

  it('should interleave one channel', () => {
    const wavePacker = new WavePacker();
    wavePacker.init(48000, 24000, 1);
    const leftChannel = [0, 2, 4, 6, 8, 10];
    const rightChannel = [1, 3, 5, 7, 9, 11];
    const result = wavePacker.interleave(leftChannel, rightChannel);
    expect(result.length).toEqual(3);
    expect(result[0]).toEqual(1.5);
    expect(result[1]).toEqual(5.5);
    expect(result[2]).toEqual(9.5);
  });

  it('should clear', () => {
    const wavePacker = new WavePacker();
    wavePacker.recLength = 42;
    wavePacker.recBuffersL = [3, 7, 5, 3, 5, 7, 8];
    wavePacker.recBuffersR = [2985432, 43];
    wavePacker.clear();
    expect(wavePacker.recLength).toEqual(0);
    expect(wavePacker.recBuffersL).toEqual([]);
    expect(wavePacker.recBuffersR).toEqual([]);
  });

  it('should record small data', () => {
    const wavePacker = new WavePacker();
    wavePacker.clear();
    for (let i = 0; i < 10; i += 1) {
      wavePacker.record([1], [1]);
    }
    expect(wavePacker.recBuffersL).length = 10;
    expect(wavePacker.recBuffersR).length = 10;
    for (let i = 0; i < wavePacker.recBuffersL.length; i += 1) {
      expect(wavePacker.recBuffersL[i]).toEqual([1]);
      expect(wavePacker.recBuffersR[i]).toEqual([1]);
    }
    expect(wavePacker.recLength).toEqual(10);
  });

  it('should record big data', () => {
    const wavePacker = new WavePacker();
    wavePacker.clear();
    for (let i = 0; i < 10; i += 1) {
      wavePacker.record([100, 50, 25], [200, 25, 75]);
    }
    expect(wavePacker.recBuffersL).length = 30;
    expect(wavePacker.recBuffersR).length = 30;
    for (let i = 0; i < wavePacker.recBuffersL.length; i += 1) {
      expect(wavePacker.recBuffersL[i]).toEqual([100, 50, 25]);
      expect(wavePacker.recBuffersR[i]).toEqual([200, 25, 75]);
    }
    expect(wavePacker.recLength).toEqual(30);
  });

  it('should stream small data', () => {
    const wavePacker = new WavePacker();
    const cb = jasmine.createSpy('callback');
    wavePacker.clear();
    wavePacker.recordStreaming([0.3453], [0], cb);
    expect(cb).toHaveBeenCalledTimes(1);
    const { args } = cb.calls.mostRecent();
    expect(args.length).toEqual(1);
    expect(args[0]).toEqual(jasmine.any(ArrayBuffer));
  });

  it('should stream big data', () => {
    const wavePacker = new WavePacker();
    const cb = jasmine.createSpy('callback');
    wavePacker.clear();
    wavePacker.recordStreaming([0.99, -0.99, 0.543, 0.3453], 0, cb);
    expect(cb).toHaveBeenCalledTimes(1);
    const { args } = cb.calls.mostRecent();
    expect(args.length).toEqual(1);
    expect(args[0]).toEqual(jasmine.any(ArrayBuffer));
  });

  it('should encodeWAV', () => {
    const wavePacker = new WavePacker();
    wavePacker.init(48000, 48000, 2);
    const leftChannel = [0, 2, 4, 6, 8, 10];
    const rightChannel = [1, 3, 5, 7, 9, 11];
    const interleaved = wavePacker.interleave(leftChannel, rightChannel);
    const result = wavePacker.encodeWAV(interleaved);
    expect(result).toEqual(jasmine.any(Blob));
    expect(result.type).toEqual('audio/wav');
  });

  it('should merge two simple buffers', () => {
    const buffer = [[25, 50], [75, 100]];
    const result = WavePacker.mergeBuffers(buffer, 5);
    expect(result[0]).toEqual(25);
    expect(result[1]).toEqual(50);
    expect(result[2]).toEqual(75);
    expect(result[3]).toEqual(100);
    expect(result.length).toEqual(5);
  });

  it('should export wav', () => {
    const wavePacker = new WavePacker();
    wavePacker.clear();
    const cb = jasmine.createSpy('callback');
    wavePacker.record([100, 50, 25], [200, 25, 75]);
    wavePacker.exportWAV(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    const { args } = cb.calls.mostRecent();
    expect(args.length).toEqual(1);
    const result = args[0];
    expect(result).toEqual(jasmine.any(Blob));
    expect(result.type).toEqual('audio/wav');
  });

  it('should export mono wav', () => {
    const wavePacker = new WavePacker();
    wavePacker.clear();
    const cb = jasmine.createSpy('callback');
    wavePacker.record([100, 50, 25], [200, 25, 75]);
    wavePacker.exportMonoWAV(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    const { args } = cb.calls.mostRecent();
    expect(args.length).toEqual(1);
    const result = args[0];
    expect(result).toEqual(jasmine.any(Blob));
    expect(result.type).toEqual('audio/wav');
  });
});

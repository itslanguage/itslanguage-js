import VolumeMeter, { generateWaveSample } from '../src/audio/audio-tools';

describe('Audio tools', () => {
  it('should construct', () => {
    const context = {};
    const inputstream = {};
    const meter = new VolumeMeter(context, inputstream);
    expect(meter.audioContext).toEqual(context);
    expect(meter.stream).toEqual(inputstream);
  });

  it('should analyze an audio stream', () => {
    const fakeAnalyzer = {
      fftSize: null,
    };
    const context = {
      createAnalyser: jasmine.createSpy().and.returnValue(fakeAnalyzer),
    };
    const inputstream = {
      connect: jasmine.createSpy(),
    };
    const meter = new VolumeMeter(context, inputstream);
    spyOn(meter, 'updateAnalysers');
    const cb = jasmine.createSpy();
    meter.getVolumeIndication(cb);
    expect(meter.volumeIndicationCallback).toEqual([cb]);
    expect(meter.volumeIndicationCallbackArgs).toEqual([]);
    expect(meter.analyserNode).toEqual(fakeAnalyzer);
    expect(fakeAnalyzer.fftSize).toEqual(2048);
    expect(inputstream.connect).toHaveBeenCalledWith(fakeAnalyzer);
    expect(meter.updateAnalysers).toHaveBeenCalledTimes(1);
  });

  it('should not analyze an audio stream without callback', () => {
    const meter = new VolumeMeter();
    expect(() => {
      meter.getVolumeIndication();
    }).toThrowError('Callback parameter unspecified.');
  });

  it('should analyze an audio stream with a different callback type', () => {
    const fakeAnalyzer = {
      fftSize: null,
    };
    const context = {
      createAnalyser: jasmine.createSpy().and.returnValue(fakeAnalyzer),
    };
    const inputstream = {
      connect: jasmine.createSpy(),
    };
    const meter = new VolumeMeter(context, inputstream);
    spyOn(meter, 'updateAnalysers');
    let cb = jasmine.createSpy();
    cb = [cb];
    meter.getVolumeIndication(cb);
    expect(meter.volumeIndicationCallback).toEqual(cb);
    expect(meter.volumeIndicationCallbackArgs).toEqual([]);
    expect(meter.analyserNode).toEqual(fakeAnalyzer);
    expect(fakeAnalyzer.fftSize).toEqual(2048);
    expect(inputstream.connect).toHaveBeenCalledWith(fakeAnalyzer);
    expect(meter.updateAnalysers).toHaveBeenCalledTimes(1);
  });

  it('should get average volume', () => {
    let input = [0, 10];
    let average = VolumeMeter.getAverageVolume(input);
    expect(average).toEqual(5);

    input = [0, 10, 20];
    average = VolumeMeter.getAverageVolume(input);
    expect(average).toEqual(10);

    input = [5];
    average = VolumeMeter.getAverageVolume(input);
    expect(average).toEqual(5);
  });

  it('should update analyzers', () => {
    const cb = jasmine.createSpy();
    let args = ['arg1', 'arg2'];
    const meter = new VolumeMeter();
    meter.analyserNode = {
      frequencyBinCount: 0,
      getByteFrequencyData: jasmine.createSpy(),
    };
    meter.volumeIndicationCallbackArgs = args;
    meter.volumeIndicationCallback = [cb, cb, cb, cb, cb, cb];
    spyOn(VolumeMeter, 'getAverageVolume').and.returnValue(5);
    spyOn(window, 'requestAnimationFrame');
    meter.updateAnalysers();
    args = [5].concat(args);
    expect(cb).toHaveBeenCalledWith(args);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should update analyzers on Mozilla', () => {
    const cb = jasmine.createSpy();
    let args = ['arg1', 'arg2'];
    const meter = new VolumeMeter();
    meter.analyserNode = {
      frequencyBinCount: 0,
      getByteFrequencyData: jasmine.createSpy(),
    };
    meter.volumeIndicationCallbackArgs = args;
    meter.volumeIndicationCallback = [cb, cb, cb, cb, cb, cb];
    spyOn(VolumeMeter, 'getAverageVolume').and.returnValue(5);
    const oldReqAnimFrame = window.requestAnimationFrame;
    delete window.requestAnimationFrame;
    window.mozRequestAnimationFrame = jasmine.createSpy();
    meter.updateAnalysers();
    args = [5].concat(args);
    expect(cb).toHaveBeenCalledWith(args);
    expect(cb).toHaveBeenCalledTimes(1);
    window.requestAnimationFrame = oldReqAnimFrame;
  });

  it('should update analyzers with webkit', () => {
    const cb = jasmine.createSpy();
    let args = ['arg1', 'arg2'];
    const meter = new VolumeMeter();
    meter.analyserNode = {
      frequencyBinCount: 0,
      getByteFrequencyData: jasmine.createSpy(),
    };
    meter.volumeIndicationCallbackArgs = args;
    meter.volumeIndicationCallback = [cb, cb, cb, cb, cb, cb];
    spyOn(VolumeMeter, 'getAverageVolume').and.returnValue(5);
    const oldReqAnimFrame = window.requestAnimationFrame;
    delete window.requestAnimationFrame;
    delete window.mozRequestAnimationFrame;
    window.webkitRequestAnimationFrame = jasmine.createSpy();
    meter.updateAnalysers();
    args = [5].concat(args);
    expect(cb).toHaveBeenCalledWith(args);
    expect(cb).toHaveBeenCalledTimes(1);
    window.requestAnimationFrame = oldReqAnimFrame;
  });

  it('should update analyzers with ms', () => {
    const cb = jasmine.createSpy();
    let args = ['arg1', 'arg2'];
    const meter = new VolumeMeter();
    meter.analyserNode = {
      frequencyBinCount: 0,
      getByteFrequencyData: jasmine.createSpy(),
    };
    meter.volumeIndicationCallbackArgs = args;
    meter.volumeIndicationCallback = [cb, cb, cb, cb, cb, cb];
    spyOn(VolumeMeter, 'getAverageVolume').and.returnValue(5);
    const oldReqAnimFrame = window.requestAnimationFrame;
    delete window.requestAnimationFrame;
    delete window.mozRequestAnimationFrame;
    delete window.webkitRequestAnimationFrame;
    window.msRequestAnimationFrame = jasmine.createSpy();
    meter.updateAnalysers();
    args = [5].concat(args);
    expect(cb).toHaveBeenCalledWith(args);
    expect(cb).toHaveBeenCalledTimes(1);
    window.requestAnimationFrame = oldReqAnimFrame;
  });

  it('should update analyzers when it will not animate', () => {
    const cb = jasmine.createSpy();
    let args = ['arg1', 'arg2'];
    const meter = new VolumeMeter();
    meter.analyserNode = {
      frequencyBinCount: 0,
      getByteFrequencyData: jasmine.createSpy(),
    };
    meter.volumeIndicationCallbackArgs = args;
    meter.volumeIndicationCallback = [cb, cb, cb, cb, cb, cb];
    spyOn(VolumeMeter, 'getAverageVolume').and.returnValue(5);
    spyOn(window, 'requestAnimationFrame').and.callFake((animloop) => {
      meter.willAnimate = false;
      if (meter.willAnimate === false) {
        animloop();
      }
    });
    meter.updateAnalysers();
    args = [5].concat(args);
    expect(cb).toHaveBeenCalledWith(args);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should stop analyzing', () => {
    const meter = new VolumeMeter();
    meter.willAnimate = false;
    expect(meter.willAnimate).toBeFalsy();
    meter.willAnimate = true;
    expect(meter.willAnimate).toBeTruthy();
    meter.stopAnalyser();
    expect(meter.willAnimate).toBeFalsy();
  });

  it('should resume analyzing', () => {
    const meter = new VolumeMeter();
    expect(meter.willAnimate).toBeTruthy();
    meter.stopAnalyser();
    expect(meter.willAnimate).toBeFalsy();
    meter.resumeAnalyser();
    expect(meter.willAnimate).toBeTruthy();
  });

  it('should generate a wave file', () => {
    generateWaveSample(1);
  });
});

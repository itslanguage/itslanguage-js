import WebAudioRecorder from '../src/audio/web-audio-recorder';

describe('WebAudioRecorder', () => {
  let webAudioRecorder;
  let mockRecorder;
  let source;
  let packerMock;
  let mockEvent;
  let f32array;
  let cb;

  beforeEach(() => {
    mockRecorder = {
      connect: jasmine.createSpy()
    };
    source = {
      context: {
        sampleRate: 48000,
        destination: 'destination',
        createScriptProcessor: jasmine.createSpy().and.returnValue(mockRecorder)
      },
      connect: jasmine.createSpy()
    };
    packerMock = {
      init: jasmine.createSpy(),
      record: jasmine.createSpy(),
      recordStreaming: jasmine.createSpy()
    };
    mockEvent = {
      inputBuffer: {
        getChannelData: jasmine.createSpy().and.returnValue([10])
      }
    };
    f32array = new Float32Array([10]);
    cb = jasmine.createSpy();
    spyOn(console, 'log');
  });

  describe('Constructor', () => {
    it('should construct without callback', () => {
      webAudioRecorder = new WebAudioRecorder(source, source.context, null, packerMock);
      expect(webAudioRecorder.recording).toBeFalsy();
      expect(webAudioRecorder.recordedSampleRate).toEqual(48000);
      expect(webAudioRecorder.sampleRate).toEqual(24000);
      expect(webAudioRecorder.channels).toEqual(1);
      expect(webAudioRecorder.packer).toEqual(packerMock);
      expect(webAudioRecorder._recorder).toEqual(mockRecorder);
      expect(source.connect).toHaveBeenCalledTimes(1);
      expect(source.connect).toHaveBeenCalledWith(mockRecorder);
      expect(mockRecorder.onaudioprocess).toBeDefined();
      expect(mockRecorder.connect).toHaveBeenCalledTimes(1);
      expect(mockRecorder.connect).toHaveBeenCalledWith('destination');
      expect(console.log).toHaveBeenCalledWith('Recording at: 24000');
      expect(packerMock.init).toHaveBeenCalledWith(48000, 24000, 1);
    });

    it('should construct with callback', () => {
      webAudioRecorder = new WebAudioRecorder(source, source.context, cb, packerMock);
      expect(webAudioRecorder.recording).toBeFalsy();
      expect(webAudioRecorder.recordedSampleRate).toEqual(48000);
      expect(webAudioRecorder.sampleRate).toEqual(48000);
      expect(webAudioRecorder.channels).toEqual(1);
      expect(webAudioRecorder.packer).toEqual(packerMock);
      expect(webAudioRecorder._recorder).toEqual(mockRecorder);
      expect(source.connect).toHaveBeenCalledTimes(1);
      expect(source.connect).toHaveBeenCalledWith(mockRecorder);
      expect(mockRecorder.onaudioprocess).toBeDefined();
      expect(mockRecorder.connect).toHaveBeenCalledTimes(1);
      expect(mockRecorder.connect).toHaveBeenCalledWith('destination');
      expect(console.log).toHaveBeenCalledWith('Recording at: 48000');
      expect(packerMock.init).toHaveBeenCalledWith(48000, 48000, 1);
    });

    it('should respond to onaudioprocess without callback while recording', () => {
      webAudioRecorder = new WebAudioRecorder(source, source.context, null, packerMock);
      webAudioRecorder.recording = true;
      mockRecorder.onaudioprocess(mockEvent);
      expect(packerMock.record).toHaveBeenCalledWith(f32array, f32array);
      expect(packerMock.recordStreaming).not.toHaveBeenCalled();
    });

    it('should respond to onaudioprocess with callback while recording', () => {
      webAudioRecorder = new WebAudioRecorder(source, source.context, cb, packerMock);
      webAudioRecorder.recording = true;
      mockRecorder.onaudioprocess(mockEvent);
      expect(packerMock.record).toHaveBeenCalledWith(f32array, f32array);
      expect(packerMock.recordStreaming).toHaveBeenCalledWith(f32array, f32array, cb);
    });

    it('should respond to onaudioprocess while not recording', () => {
      webAudioRecorder = new WebAudioRecorder(source, source.context, cb, packerMock);
      mockRecorder.onaudioprocess(mockEvent);
      expect(packerMock.record).not.toHaveBeenCalled();
      expect(packerMock.recordStreaming).not.toHaveBeenCalled();
    });
  });

  it('should start recording audio', () => {
    packerMock.clear = jasmine.createSpy();
    webAudioRecorder = new WebAudioRecorder(source, source.context, cb, packerMock);
    webAudioRecorder.record();
    expect(packerMock.clear).toHaveBeenCalledTimes(1);
    expect(webAudioRecorder.recording).toBeTruthy();
  });

  it('should get encoded audio', () => {
    packerMock.exportWAV = jasmine.createSpy();
    const encodedCb = jasmine.createSpy();
    webAudioRecorder = new WebAudioRecorder(source, source.context, cb, packerMock);
    webAudioRecorder.getEncodedAudio(encodedCb);
    expect(packerMock.exportWAV).toHaveBeenCalledTimes(1);
    expect(packerMock.exportWAV).toHaveBeenCalledWith(encodedCb);
  });

  it('should stop recording', () => {
    packerMock.clear = jasmine.createSpy();
    webAudioRecorder = new WebAudioRecorder(source, source.context, cb, packerMock);

    webAudioRecorder.record();
    let isRecording = webAudioRecorder.isRecording();
    expect(isRecording).toBeTruthy();

    webAudioRecorder.stop();
    isRecording = webAudioRecorder.isRecording();
    expect(isRecording).toBeFalsy();
  });
});


import MediaRecorder from '../src/audio/media-recorder';

describe('Mediarecorder', () => {
  beforeEach(() => {
    spyOn(window, 'MediaRecorder');
  });

  it('should construct with callback', () => {
    const fakeRecorder = jasmine.createSpyObj('mediaRecorder', ['ondataavailable']);
    const cb = jasmine.createSpy();
    const fakeData = {
      data: '1234567890',
    };
    const expectedBlob = new Blob([fakeData.data]);
    window.MediaRecorder.and.returnValue(fakeRecorder);
    const recorder = new MediaRecorder();
    recorder.callback = cb;
    fakeRecorder.ondataavailable(fakeData);
    expect(recorder.recordedBlob).toEqual(jasmine.any(Blob));
    expect(recorder.recordedBlob.type).toEqual('audio/ogg');
    expect(cb).toHaveBeenCalledWith(expectedBlob);
    expect(recorder.callback).toBeNull();
  });

  it('should construct without callback', () => {
    const fakeRecorder = jasmine.createSpyObj('mediaRecorder', ['ondataavailable']);
    const fakeData = {
      data: '1234567890',
    };
    window.MediaRecorder.and.returnValue(fakeRecorder);
    const recorder = new MediaRecorder();
    fakeRecorder.ondataavailable(fakeData);
    expect(recorder.recordedBlob).toEqual(jasmine.any(Blob));
    expect(recorder.recordedBlob.type).toEqual('audio/ogg');
    expect(recorder.callback).toBeUndefined();
  });

  it('should record', () => {
    const recorder = new MediaRecorder();
    recorder.mediaRecorder = jasmine.createSpyObj('recorder', ['start']);
    recorder.record();
    expect(recorder.recordedBlob).toBeNull();
    expect(recorder.callback).toBeNull();
    expect(recorder.mediaRecorder.start).toHaveBeenCalledTimes(1);
  });

  it('should get recording state when recording', () => {
    const recorder = new MediaRecorder();
    recorder.mediaRecorder = {
      state: 'recording',
    };
    const result = recorder.isRecording();
    expect(result).toBeTruthy();
  });

  it('should get recording state when not recording', () => {
    const recorder = new MediaRecorder();
    recorder.mediaRecorder = {
      state: 'not recording',
    };
    const result = recorder.isRecording();
    expect(result).toBeFalsy();
  });

  it('should stop when recording', () => {
    const recorder = new MediaRecorder();
    recorder.mediaRecorder = jasmine.createSpyObj('recorder', ['stop']);
    spyOn(recorder, 'isRecording').and.returnValue(true);
    recorder.stop();
    expect(recorder.mediaRecorder.stop).toHaveBeenCalledTimes(1);
  });

  it('should stop when not recording', () => {
    const recorder = new MediaRecorder();
    recorder.mediaRecorder = jasmine.createSpyObj('recorder', ['stop']);
    spyOn(recorder, 'isRecording').and.returnValue(false);
    recorder.stop();
    expect(recorder.mediaRecorder.stop).not.toHaveBeenCalled();
  });

  it('should get encoded audio with callback and blob', () => {
    const recorder = new MediaRecorder();
    const expectedResult = new Blob(['1234567890']);
    recorder.recordedBlob = expectedResult;
    const cb = jasmine.createSpy();
    recorder.getEncodedAudio(cb);
    expect(cb).toHaveBeenCalledWith(expectedResult);
    expect(recorder.callback).toBeUndefined();
  });

  it('should get encoded audio with callback and without blob', () => {
    const recorder = new MediaRecorder();
    const cb = jasmine.createSpy();
    recorder.getEncodedAudio(cb);
    expect(recorder.callback).toEqual(cb);
  });

  it('should deliver audio when callback is registered later', () => {
    const fakeData = {
      data: '1234567890',
    };
    const expectedBlob = new Blob([fakeData.data]);
    const cb = jasmine.createSpy();
    const fakeRecorder = jasmine.createSpyObj('mediaRecorder', ['ondataavailable', 'stop']);
    fakeRecorder.stop.and.callFake(() => {
      fakeRecorder.ondataavailable(expectedBlob);
    });
    window.MediaRecorder.and.returnValue(fakeRecorder);
    const recorder = new MediaRecorder();
    spyOn(recorder, 'isRecording').and.returnValue(true);
    recorder.getEncodedAudio(cb);
    recorder.stop();
    expect(cb).toHaveBeenCalledWith(expectedBlob);
  });
});

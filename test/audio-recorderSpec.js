import * as WebAudioRecorder from '../src/audio/web-audio-recorder';
import AudioRecorder from '../src/audio/audio-recorder';
import Stopwatch from '../src/audio/tools';

describe('Audio recorder', () => {
  beforeEach(() => {
    spyOn(AudioRecorder.prototype, 'getBestRecorder').and.returnValue('recorder');
    spyOn(AudioRecorder.prototype, 'recordingCompatibility');
  });

  it('should construct with event functionality', () => {
    const recorder = new AudioRecorder();
    recorder.emitter = jasmine.createSpyObj('emitter', ['on', 'off', 'emit']);
    recorder.addEventListener('evt1', () => {});
    recorder.removeEventListener('evt1', () => {});
    recorder.fireEvent('evt1', ['args']);
    recorder.fireEvent('evt2');
    recorder.removeAllEventListeners();
    expect(recorder.emitter.on).toHaveBeenCalledWith('evt1', jasmine.any(Function));
    expect(recorder.emitter.off).toHaveBeenCalledWith('evt1', jasmine.any(Function));
    expect(recorder.emitter.emit).toHaveBeenCalledWith('evt1', 'args');
    expect(recorder.emitter.emit).toHaveBeenCalledWith('evt2');
  });

  it('should request microphone access', (done) => {
    const fakeStream = jasmine.createSpyObj('stream', ['getAudioTracks']);
    fakeStream.getAudioTracks.and.returnValue(['1']);
    window.navigator.mediaDevices.getUserMedia = jasmine.createSpy()
      .and.callFake(() => Promise.resolve(fakeStream));
    const recorder = new AudioRecorder({ audioContext: 'context' });
    spyOn(recorder, 'startUserMedia').and.returnValue('started media');
    spyOn(recorder, 'fireEvent').and.callFake(() => {
      expect(recorder.userMediaApproval).toBeTruthy();
      expect(recorder.startUserMedia).toHaveBeenCalledTimes(1);
      expect(recorder.fireEvent).toHaveBeenCalledWith('ready', ['context', 'started media']);
      done();
    });
    recorder.canMediaDevicesGetUserMedia = true;
    recorder.canGetUserMedia = true;
    recorder.requestUserMedia();
  });

  it('should request microphone access without audiotracks', (done) => {
    const fakeStream = jasmine.createSpyObj('stream', ['getAudioTracks']);
    window.navigator.mediaDevices.getUserMedia = jasmine.createSpy()
      .and.callFake(() => Promise.resolve(fakeStream));
    fakeStream.getAudioTracks.and.returnValue({});
    const recorder = new AudioRecorder({ audioContext: 'context' });
    spyOn(recorder, 'startUserMedia').and.returnValue('started media');
    spyOn(recorder, 'fireEvent').and.callFake(() => {
      expect(recorder.userMediaApproval).toBeTruthy();
      expect(recorder.startUserMedia).toHaveBeenCalledWith(fakeStream);
      expect(recorder.fireEvent).toHaveBeenCalledWith('ready', ['context', 'started media']);
      done();
    });
    recorder.canMediaDevicesGetUserMedia = true;
    recorder.canGetUserMedia = true;
    recorder.requestUserMedia();
  });

  it('should request microphone access using media devices', (done) => {
    const recorder = new AudioRecorder({ audioContext: 'context' });
    const fakeStream = jasmine.createSpyObj('stream', ['getAudioTracks']);
    fakeStream.getAudioTracks.and.returnValue({});
    window.navigator.mediaDevices.getUserMedia = jasmine.createSpy()
      .and.callFake(() => Promise.resolve(fakeStream));
    spyOn(recorder, 'startUserMedia').and.returnValue('started media');
    spyOn(recorder, 'fireEvent');
    recorder.canMediaDevicesGetUserMedia = false;
    recorder.canGetUserMedia = true;
    recorder.requestUserMedia().then(() => {
      expect(recorder.userMediaApproval).toBeTruthy();
      expect(recorder.startUserMedia).toHaveBeenCalledWith(fakeStream);
      expect(recorder.fireEvent).toHaveBeenCalledWith('ready', ['context', 'started media']);
      done();
    });
  });

  it('should request microphone access and handle errors', (done) => {
    const fakeStream = jasmine.createSpyObj('stream', ['getAudioTracks']);
    fakeStream.getAudioTracks.and.returnValue({});
    window.navigator.mediaDevices.getUserMedia = jasmine.createSpy()
      .and.callFake(() => Promise.reject());
    const recorder = new AudioRecorder();
    spyOn(recorder, 'startUserMedia').and.returnValue('started media');
    spyOn(recorder, 'fireEvent');
    recorder.canMediaDevicesGetUserMedia = false;
    recorder.canGetUserMedia = true;

    recorder.requestUserMedia().catch((error) => {
      expect(recorder.userMediaApproval).toBeFalsy();
      expect(recorder.startUserMedia).toHaveBeenCalledTimes(0);
      expect(recorder.fireEvent).not.toHaveBeenCalled();
      expect(error).toEqual(new Error('No live audio input available or permitted'));
      done();
    });
  });

  it('should request microphone access when it cannot request any media', () => {
    const recorder = new AudioRecorder({ audioContext: null });
    spyOn(recorder, 'startUserMedia');
    spyOn(recorder, 'fireEvent');
    recorder.canMediaDevicesGetUserMedia = false;
    recorder.canGetUserMedia = false;
    recorder.requestUserMedia();
    expect(recorder.userMediaApproval).toBeFalsy();
    expect(recorder.startUserMedia).toHaveBeenCalledTimes(0);
    expect(recorder.fireEvent).not.toHaveBeenCalled();
  });

  it('should start user media', () => {
    const audioContext = jasmine.createSpyObj('audioContext', ['createMediaStreamSource', 'createGain']);
    const recorder = new AudioRecorder({ audioContext });
    const fakeMic = jasmine.createSpyObj('micInput', ['connect']);
    recorder.audioContext.createMediaStreamSource.and.returnValue(fakeMic);
    recorder.audioContext.createGain.and.returnValue('gainNode');
    const result = recorder.startUserMedia('stream');
    expect(recorder.audioContext.createMediaStreamSource).toHaveBeenCalledWith('stream');
    expect(recorder.audioContext.createGain).toHaveBeenCalledTimes(1);
    expect(recorder.getBestRecorder).toHaveBeenCalledWith('gainNode');
    expect(result).toEqual('gainNode');
  });

  it('should get the best recorder with HTML5', () => {
    const fakeWebAudioRecorder = jasmine.createSpy();
    spyOn(WebAudioRecorder, 'default').and.callFake((inputgain, context, callback) => {
      callback('data');
      return fakeWebAudioRecorder;
    });
    const recorder = new AudioRecorder();
    spyOn(recorder, 'streamCallback').and.callThrough();
    spyOn(recorder, 'fireEvent');
    recorder.getBestRecorder.and.callThrough();
    recorder.canUserMediaRecorder = false;
    recorder.canGetUserMedia = true;
    const result = recorder.getBestRecorder();
    expect(result).toEqual(fakeWebAudioRecorder);
    expect(recorder.streamCallback).toHaveBeenCalledWith('data');
    expect(recorder.fireEvent).toHaveBeenCalledWith('dataavailable', ['data']);
  });

  it('should require get user media with recorder', () => {
    const recorder = new AudioRecorder();
    recorder.recorder = {};
    const result = recorder.requireGetUserMedia();
    expect(result).toBeTruthy();
  });

  it('should require get user media without recorder', () => {
    const recorder = new AudioRecorder();
    spyOn(recorder, 'requestUserMedia');
    recorder.recorder = null;
    const result = recorder.requireGetUserMedia();
    expect(recorder.requestUserMedia).toHaveBeenCalledTimes(1);
    expect(result).toBeFalsy();
  });

  it('should set a new recording session id with given id', () => {
    const recorder = new AudioRecorder();
    const result = recorder.startRecordingSession(1);
    expect(result).toEqual(1);
    expect(recorder.activeRecordingId).toEqual(1);
  });

  it('should set a new recording session id without given id', () => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['record']);
    const result = recorder.startRecordingSession();
    expect(result).toBeDefined();
    expect(recorder.activeRecordingId).toBeDefined();
  });

  it('should start recording microphone input until stopped', (done) => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['record']);
    recorder.activeRecordingId = undefined;
    spyOn(recorder, 'isRecording').and.returnValue(false);
    spyOn(recorder, 'requireGetUserMedia').and.returnValue(true);
    spyOn(recorder, 'startRecordingSession').and.callFake(() => {
      recorder.activeRecordingId = 1;
    });
    spyOn(recorder, 'fireEvent');
    recorder.record();

    setTimeout(() => {
      expect(recorder.requireGetUserMedia).toHaveBeenCalledTimes(1);
      expect(recorder.isRecording).toHaveBeenCalledTimes(1);
      expect(recorder.recorder.record).toHaveBeenCalledTimes(1);
      expect(recorder.startRecordingSession).toHaveBeenCalledTimes(1);
      expect(recorder.fireEvent).toHaveBeenCalledWith('recording', [1]);
      done();
    }, 100);
  });

  it('should start recording microphone input until stopped without being able to get usermedia', () => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['record']);
    const cb = jasmine.createSpy();
    spyOn(recorder, 'requireGetUserMedia').and.returnValue(false);
    const result = recorder.record(cb);
    expect(result).toEqual(undefined);
  });

  it('should start recording microphone input until stopped when already recording', () => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['record']);
    const cb = jasmine.createSpy();
    spyOn(recorder, 'isRecording').and.returnValue(true);
    spyOn(recorder, 'requireGetUserMedia').and.returnValue(true);
    spyOn(recorder, 'startRecordingSession');
    spyOn(recorder, 'fireEvent');
    expect(() => {
      recorder.record(cb);
    }).toThrowError('Already recording, stop recording first.');
    expect(recorder.requireGetUserMedia).toHaveBeenCalledTimes(1);
    expect(recorder.isRecording).toHaveBeenCalledTimes(1);
  });

  it('should start recording microphone input until stopped with an active recording id', (done) => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['record']);
    recorder.activeRecordingId = 1;
    spyOn(recorder, 'isRecording').and.returnValue(false);
    spyOn(recorder, 'requireGetUserMedia').and.returnValue(true);
    spyOn(recorder, 'startRecordingSession');
    spyOn(recorder, 'fireEvent');
    recorder.record();

    setTimeout(() => {
      expect(recorder.requireGetUserMedia).toHaveBeenCalledTimes(1);
      expect(recorder.isRecording).toHaveBeenCalledTimes(1);
      expect(recorder.recorder.record).toHaveBeenCalledTimes(1);
      expect(recorder.startRecordingSession).toHaveBeenCalledTimes(0);
      expect(recorder.fireEvent).toHaveBeenCalledWith('recording', [1]);
      done();
    }, 100);
  });

  it('should stop recording when recording', () => {
    const response = { type: 'type' };
    const recorder = new AudioRecorder();
    recorder.activeRecordingId = 1;
    spyOn(recorder, 'fireEvent');
    recorder.recorder = jasmine.createSpyObj('recorder', [
      'isRecording',
      'stop',
      'getEncodedAudio',
      'isPaused']);
    recorder.recorder.isRecording.and.returnValue(true);
    recorder.recorder.isPaused.and.returnValue(false);
    recorder.recorder.getEncodedAudio.and.callFake((callback) => {
      callback(response);
    });
    recorder.stop(false);
    expect(recorder.recorder.isRecording).toHaveBeenCalledTimes(1);
    expect(recorder.recorder.isPaused).toHaveBeenCalledTimes(1);
    expect(recorder.recorder.stop).toHaveBeenCalledTimes(1);
    expect(recorder.recorder.getEncodedAudio).toHaveBeenCalledWith(jasmine.any(Function));
    expect(recorder.fireEvent).toHaveBeenCalledWith('recorded', [1, response, false]);
  });

  it('should stop recording when not recording', () => {
    const recorder = new AudioRecorder();
    spyOn(recorder, 'fireEvent');
    recorder.recorder = jasmine.createSpyObj('recorder', [
      'isRecording',
      'stop',
      'getEncodedAudio',
      'isPaused',
    ]);
    recorder.recorder.isRecording.and.returnValue(false);
    recorder.recorder.isPaused.and.returnValue(false);
    recorder.stop(false);
    expect(recorder.recorder.isRecording).toHaveBeenCalledTimes(1);
    expect(recorder.recorder.isPaused).toHaveBeenCalledTimes(1);
    expect(recorder.recorder.stop).not.toHaveBeenCalled();
    expect(recorder.recorder.getEncodedAudio).not.toHaveBeenCalled();
    expect(recorder.fireEvent).not.toHaveBeenCalled();
  });

  it('should check for a recording in progress when not recording', () => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['isRecording']);
    recorder.recorder.isRecording.and.returnValue(false);
    const result = recorder.isRecording();
    expect(result).toBeFalsy();
  });

  it('should check for a recording in progress when recording', () => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['isRecording']);
    recorder.recorder.isRecording.and.returnValue(true);
    const result = recorder.isRecording();
    expect(result).toBeTruthy();
  });

  it('should check for a recording in progress recorder does not exist', () => {
    const recorder = new AudioRecorder();
    const result = recorder.isRecording();
    expect(result).toBeFalsy();
  });

  it('should check get audio specs', () => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['getAudioSpecs']);
    recorder.recorder.getAudioSpecs.and.returnValue('specs');
    const result = recorder.getAudioSpecs();
    expect(result).toEqual('specs');
  });

  it('should toggle recording when recording', () => {
    const recorder = new AudioRecorder();
    spyOn(recorder, 'isRecording').and.returnValue(true);
    spyOn(recorder, 'stop');
    spyOn(recorder, 'record');
    recorder.toggleRecording();
    expect(recorder.isRecording).toHaveBeenCalledTimes(1);
    expect(recorder.stop).toHaveBeenCalledTimes(1);
    expect(recorder.record).not.toHaveBeenCalled();
  });

  it('should toggle recording when not recording', () => {
    const recorder = new AudioRecorder();
    spyOn(recorder, 'isRecording').and.returnValue(false);
    spyOn(recorder, 'stop');
    spyOn(recorder, 'record');
    recorder.toggleRecording();
    expect(recorder.isRecording).toHaveBeenCalledTimes(1);
    expect(recorder.stop).not.toHaveBeenCalled();
    expect(recorder.record).toHaveBeenCalledTimes(1);
  });

  it('should bind and return stopwatch', () => {
    const recorder = new AudioRecorder();
    const cb = jasmine.createSpy();
    const result = recorder.bindStopwatch(cb);
    expect(result).toEqual(jasmine.any(Stopwatch));
    expect(result.tickCb).toEqual(cb);
  });

  it('should bind the stop function to a stopwatch', (done) => {
    const fakeWatch = jasmine.createSpyObj('stopwatch', ['start']);
    fakeWatch.value = 10;
    const recorder = new AudioRecorder();
    spyOn(recorder, 'requireGetUserMedia').and.returnValue(true);
    spyOn(recorder, 'isRecording').and.returnValue(false);
    spyOn(recorder, 'fireEvent');
    recorder.recorder = jasmine.createSpyObj('recorder', ['record', 'isPaused']);
    recorder.recorder.isPaused.and.returnValue(false);
    recorder.stopwatch = fakeWatch;
    recorder.activeRecordingId = 1;
    recorder.record();

    setTimeout(() => {
      expect(fakeWatch.value).toEqual(0);
      expect(fakeWatch.start).toHaveBeenCalledTimes(1);
      done();
    }, 100);
  });

  it('should bind the stop function to a stopwatch', () => {
    const fakeWatch = jasmine.createSpyObj('stopwatch', ['stop']);
    const recorder = new AudioRecorder();
    spyOn(recorder, 'requireGetUserMedia').and.returnValue(true);
    spyOn(recorder, 'isRecording').and.returnValue(false);
    spyOn(recorder, 'fireEvent');
    recorder.recorder = jasmine.createSpyObj('recorder', [
      'isRecording',
      'isPaused',
      'stop',
      'getEncodedAudio',
    ]);
    recorder.recorder.isRecording.and.returnValue(true);
    recorder.recorder.isPaused.and.returnValue(false);
    recorder.stopwatch = fakeWatch;
    spyOn(recorder, 'stop').and.callThrough();
    recorder.stop();
    expect(fakeWatch.stop).toHaveBeenCalledTimes(1);
    expect(recorder.stop).toHaveBeenCalledTimes(1);
  });

  it('should check if the user has given permission after constructing', () => {
    const recorder = new AudioRecorder();
    expect(recorder.hasUserMediaApproval()).toBeFalsy();
  });

  it('should check if the user has given permission after denying permission', () => {
    const recorder = new AudioRecorder();
    recorder.userMediaApproval = false;
    expect(recorder.hasUserMediaApproval()).toBeFalsy();
  });

  it('should check if the user has given permission after giving permission', () => {
    const recorder = new AudioRecorder();
    recorder.userMediaApproval = true;
    expect(recorder.hasUserMediaApproval()).toBeTruthy();
  });

  it('should be able to disable the delay', (done) => {
    const recorder = new AudioRecorder();
    recorder.recorder = jasmine.createSpyObj('recorder', ['record']);
    recorder.activeRecordingId = undefined;
    spyOn(recorder, 'isRecording').and.returnValue(false);
    spyOn(recorder, 'requireGetUserMedia').and.returnValue(true);
    spyOn(recorder, 'startRecordingSession').and.callFake(() => {
      recorder.activeRecordingId = 1;
    });
    spyOn(recorder, 'fireEvent');
    recorder.record(true);

    setTimeout(() => {
      expect(recorder.requireGetUserMedia).toHaveBeenCalledTimes(1);
      expect(recorder.isRecording).toHaveBeenCalledTimes(1);
      expect(recorder.recorder.record).toHaveBeenCalledTimes(1);
      expect(recorder.startRecordingSession).toHaveBeenCalledTimes(1);
      expect(recorder.fireEvent).toHaveBeenCalledWith('recording', [1]);
      done();
    }, 0);
  });
});

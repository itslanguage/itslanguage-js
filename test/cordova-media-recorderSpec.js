import CordovaMediaRecorder from '../src/audio/cordova-media-recorder';

describe('Cordova media recorder', () => {
  beforeEach(() => {
    window.Media = jasmine.createSpy();
  });

  afterEach(() => {
    delete window.Media;
  });

  it('should construct on android', () => {
    window.device = {platform: 'Android'};
    const player = new CordovaMediaRecorder();
    expect(player._isRecording).toBeFalsy();
    expect(player.filename).toEqual('recording.3gp');
    expect(player.mimetype).toEqual('audio/3gpp');
    expect(window.Media).toHaveBeenCalledWith('recording.3gp', jasmine.any(Function), jasmine.any(Function));
  });

  it('should construct on iOS', () => {
    window.device = {platform: 'iOS'};
    const player = new CordovaMediaRecorder();
    expect(player._isRecording).toBeFalsy();
    expect(player.filename).toEqual('recording.wav');
    expect(player.mimetype).toEqual('audio/wav');
    expect(window.Media).toHaveBeenCalledWith('documents://recording.wav', jasmine.any(Function), jasmine.any(Function));
  });

  it('should not construct on an unknown platform', () => {
    window.device = {platform: 'Unkown'};
    expect(() => {
      new CordovaMediaRecorder();
    }).toThrowError('Unable to detect Android or iOS platform for determining audio format.');
  });

  it('should construct and use the media callbacks', () => {
    window.device = {platform: 'Android'};
    window.Media = jasmine.createSpy().and.callFake((path, cb, errorcb) => {
      cb();
      return errorcb({code: 1337});
    });
    spyOn(console, 'log');
    spyOn(console, 'debug');
    const player = new CordovaMediaRecorder();
    expect(console.log).toHaveBeenCalledWith('Final recording written to: ' + player.filename);
    expect(console.debug).toHaveBeenCalledWith('recordAudio(): Audio Error: ' + 1337);
  });

  it('should start recording audio', () => {
    const player = new CordovaMediaRecorder();
    const mockRecorder = {
      startRecord: jasmine.createSpy()
    };
    player.mediaRecorder = mockRecorder;
    expect(player._isRecording).toBeFalsy();
    player.record();
    expect(mockRecorder.startRecord).toHaveBeenCalledTimes(1);
    expect(player._isRecording).toBeTruthy();
  });

  it('should get the recording state', () => {
    const player = new CordovaMediaRecorder();
    const mockRecorder = {
      startRecord: jasmine.createSpy()
    };
    player.mediaRecorder = mockRecorder;
    let result = player.isRecording();
    expect(result).toBeFalsy();
    player.record();
    result = player.isRecording();
    expect(result).toBeTruthy();
  });

  it('should stop recording when there is no recording in progress', () => {
    const player = new CordovaMediaRecorder();
    const mockRecorder = {
      stopRecord: jasmine.createSpy()
    };
    player.mediaRecorder = mockRecorder;
    player.stop();
    expect(mockRecorder.stopRecord).not.toHaveBeenCalled();
    expect(player._isRecording).toBeFalsy();
  });

  it('should stop recording when there is a recording in progress', () => {
    const player = new CordovaMediaRecorder();
    const mockRecorder = {
      stopRecord: jasmine.createSpy()
    };
    player.mediaRecorder = mockRecorder;
    player._isRecording = true;
    player.stop();
    expect(mockRecorder.stopRecord).toHaveBeenCalledTimes(1);
    expect(player._isRecording).toBeFalsy();
  });

  it('should request file path', () => {
    const fileName = 'filename123';
    const cb = jasmine.createSpy();
    const error = {name: 'error1337', code: 'error1337'};
    const entry = {
      name: 'FileEntry',
      file: jasmine.createSpy()
    };
    spyOn(window, 'PERSISTENT').and.returnValue(0);
    const fakeFS = {
      name: 'fakeFS',
      root: {
        getFile: jasmine.createSpy().and.callFake((filename, options, entrycb, errorcb) => {
          expect(options.create).toBeFalsy();
          errorcb(error);
          entrycb(entry);
        })
      }
    };
    spyOn(console, 'debug');
    window.requestFileSystem = jasmine.createSpy().and.callFake((fs, number, callback, errorcb) => {
      errorcb(error);
      callback(fakeFS);
    });
    const player = new CordovaMediaRecorder();
    player._requestFilepath(fileName, cb);
    expect(window.requestFileSystem).toHaveBeenCalledWith(window.PERSISTENT, 0, jasmine.any(Function),
      jasmine.any(Function));
    expect(console.debug).toHaveBeenCalledWith('Error calling requestFileSystem: ' + error.name);
    expect(console.debug).toHaveBeenCalledWith('Got filesystem name: ' + fakeFS.name);
    expect(console.debug).toHaveBeenCalledWith('Calling getFile in read mode: ' + fileName);
    expect(fakeFS.root.getFile).toHaveBeenCalledWith(fileName, jasmine.any(Object), jasmine.any(Function),
      jasmine.any(Function));
    expect(console.debug).toHaveBeenCalledWith('Error calling getFile: ' + error.code);
    expect(console.debug).toHaveBeenCalledWith('Got file entry: ' + entry.name);
    expect(entry.file).toHaveBeenCalledWith(cb);
  });

  it('should request encoded audio', () => {
    const player = new CordovaMediaRecorder();
    const cb = jasmine.createSpy();
    spyOn(player, '_requestFilepath').and.callFake((filename, callback) => callback());
    const fakeEvent = {
      target: {
        result: '1234567890'
      }
    };
    const fakeReader = {
      readAsArrayBuffer: jasmine.createSpy().and.callFake(() => {
        fakeReader.onloadend(fakeEvent);
      })
    };
    spyOn(window, 'FileReader').and.returnValue(fakeReader);
    player.getEncodedAudio(cb);
    expect(cb).toHaveBeenCalledWith(new Blob([fakeEvent.target.result]));
  });
});

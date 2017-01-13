import 'jasmine-ajax';
import CordovaMediaPlayer from '../src/audio/cordova-media-player';

describe('Cordova Media Player', () => {
  let player;
  describe('Constructor', () => {
    afterEach(() => {
      delete window.device;
    });

    it('should construct with Android', () => {
      window.device = {platform: 'Android'};
      player = new CordovaMediaPlayer();
      expect(player._isPlaying).toBeFalsy();
      expect(player._canPlay).toBeFalsy();
      expect(player.filename).toEqual('tempfile.3gp');
      expect(player.mimetype).toEqual('audio/3gpp');
      expect(player.filepath).toEqual('tempfile.3gp');
    });

    it('should construct with iOS', () => {
      window.device = {platform: 'iOS'};
      player = new CordovaMediaPlayer();
      expect(player._isPlaying).toBeFalsy();
      expect(player._canPlay).toBeFalsy();
      expect(player.filename).toEqual('tempfile.wav');
      expect(player.mimetype).toEqual('audio/wav');
      expect(player.filepath).toEqual('documents://tempfile.wav');
    });

    it('should not construct with an unknown environment', () => {
      window.device = {platform: 'unknown'};
      expect(() => {
        new CordovaMediaPlayer();
      }).toThrowError('Unable to detect Android or iOS platform for determining audio format.');
    });
  });

  beforeEach(() => {
    jasmine.Ajax.install();
    window.device = {platform: 'Android'};
    player = new CordovaMediaPlayer();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
    delete window.device;
  });

  it('should load a blob from a url', () => {
    const cb = jasmine.createSpy();
    const fakeSound = {duration: '10'};
    const url = 'blob:file://blobs/blob123.blob';
    const response = new Blob(['1234567890']);
    const fileName = 'tempfile.3gp';
    const fakeResponse = {
      status: 200,
      response
    };
    const fakeWriter = {
      onwriteend: null,
      write: jasmine.createSpy().and.callFake(() => {
        fakeWriter.onwriteend();
      })
    };
    const fakeFile = {
      createWriter: jasmine.createSpy().and.callFake(callback => {
        callback(fakeWriter);
      })
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    spyOn(player, '_writeFile').and.callFake((filename, callback) => {
      expect(filename).toEqual(fileName);
      callback(fakeFile);
    });
    spyOn(player, '_loadMedia').and.callFake((path, player_, callback) => {
      callback(fakeSound);
    });
    player.sound = fakeSound;
    player.load(url, true, cb);
    expect(player._writeFile).toHaveBeenCalledWith('tempfile.3gp', jasmine.any(Function));
    expect(fakeFile.createWriter).toHaveBeenCalledWith(jasmine.any(Function));
    expect(fakeWriter.write).toHaveBeenCalledWith(response, 'application/octet-stream');
    expect(player._loadMedia).toHaveBeenCalledWith('tempfile.3gp', player, cb);
    expect(cb).toHaveBeenCalledWith(fakeSound);
  });

  it('should handle server errors when loading from an url', () => {
    const cb = jasmine.createSpy();
    const url = 'blob:file://blobs/blob123.blob';
    const fakeResponse = {
      status: 404
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    player.load(url, true, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('should load media', () => {
    const cb = jasmine.createSpy();
    player.sound = {
      getDuration: jasmine.createSpy().and.callFake(() => 10)
    };
    spyOn(console, 'debug');
    const filePath = 'filePath/file.file';
    window.Media = function(path, callback, errorcb, statuscb) {
      expect(path).toEqual(filePath);
      this.name = 'mockSound';
      this.seekTo = jasmine.createSpy();
      errorcb({code: 1337});
      callback();
      return statuscb(0);
    };
    window.Media.MEDIA_STARTING = 0;
    const mockClosure = {
      _settings: {
        durationchangeCb: jasmine.createSpy(),
        canplayCb: jasmine.createSpy()
      }
    };
    player._loadMedia(filePath, mockClosure, cb);
    expect(player._canPlay).toBeTruthy();
    expect(mockClosure._settings.durationchangeCb).toHaveBeenCalledTimes(1);
    expect(mockClosure._settings.canplayCb).toHaveBeenCalledTimes(1);
    expect(player.sound.seekTo).toHaveBeenCalledWith(0);
    expect(console.debug).toHaveBeenCalledTimes(6);
    expect(console.debug).toHaveBeenCalledWith('Loading media: filePath/file.file');
    expect(console.debug).toHaveBeenCalledWith('Playback ended successfully.');
    expect(console.debug).toHaveBeenCalledWith('Playback failed: 1337');
    expect(console.debug).toHaveBeenCalledWith('Playback status update: 0');
    expect(console.debug).toHaveBeenCalledWith('Metadata is being loaded.');
    expect(console.debug).toHaveBeenCalledWith('Duration: 10');
    expect(cb).toHaveBeenCalledWith(player.sound);
  });

  it('should load media without loading metadata', () => {
    player.sound = {
      getDuration: jasmine.createSpy().and.callFake(() => 10)
    };
    spyOn(console, 'debug');
    const filePath = 'filePath/file.file';
    window.Media = function(path, callback, errorcb, statuscb) {
      expect(path).toEqual(filePath);
      this.name = 'mockSound';
      this.seekTo = jasmine.createSpy();
      errorcb({code: 1337});
      callback();
      return statuscb(0);
    };
    window.Media.MEDIA_STARTING = 1;
    const mockClosure = {
      _settings: {}
    };
    player._loadMedia(filePath, mockClosure);
    expect(player._canPlay).toBeTruthy();
    expect(player.sound.seekTo).toHaveBeenCalledWith(0);
    expect(console.debug).toHaveBeenCalledTimes(5);
    expect(console.debug).toHaveBeenCalledWith('Loading media: filePath/file.file');
    expect(console.debug).toHaveBeenCalledWith('Playback ended successfully.');
    expect(console.debug).toHaveBeenCalledWith('Playback failed: 1337');
    expect(console.debug).toHaveBeenCalledWith('Playback status update: 0');
    expect(console.debug).toHaveBeenCalledWith('Duration: 10');
  });

  it('should get a file', () => {
    const fileName = 'filename123';
    const cb = jasmine.createSpy();
    const error = {name: 'error1337', code: 'error1337'};
    const entry = {name: 'FileEntry'};
    spyOn(window, 'PERSISTENT').and.returnValue(0);
    const fakeFS = {
      name: 'fakeFS',
      root: {
        getFile: jasmine.createSpy().and.callFake((filename, options, entrycb, errorcb) => {
          expect(options.create).toBeTruthy();
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
    player._writeFile(fileName, cb);
    expect(window.requestFileSystem).toHaveBeenCalledWith(window.PERSISTENT, 0, jasmine.any(Function),
      jasmine.any(Function));
    expect(console.debug).toHaveBeenCalledWith('Error calling requestFileSystem: ' + error.name);
    expect(console.debug).toHaveBeenCalledWith('Got filesystem name: ' + fakeFS.name);
    expect(console.debug).toHaveBeenCalledWith('Calling getFile in read mode: ' + fileName);
    expect(fakeFS.root.getFile).toHaveBeenCalledWith(fileName, jasmine.any(Object), jasmine.any(Function),
      jasmine.any(Function));
    expect(console.debug).toHaveBeenCalledWith('Error calling getFile: ' + error.code);
    expect(console.debug).toHaveBeenCalledWith('Got file entry: ' + entry.name);
    expect(cb).toHaveBeenCalledWith(entry);
  });

  it('should play', () => {
    player.sound = {
      play: jasmine.createSpy()
    };
    const result = player.play(10);
    expect(player._isPlaying).toBeTruthy();
    expect(result).toEqual(10);
    expect(player.sound.play).toHaveBeenCalledTimes(1);
  });

  it('should reset', () => {
    player.sound = 'sound';
    player._canPlay = true;
    player.reset();
    expect(player._canPlay).toBeFalsy();
    expect(player.sound).toBeNull();
  });

  it('should stop', () => {
    player.sound = {
      stop: jasmine.createSpy()
    };
    player._isPlaying = true;
    player.stop();
    expect(player._canPlay).toBeFalsy();
    expect(player.sound.stop).toHaveBeenCalledTimes(1);
  });

  it('should pause', () => {
    player.sound = {
      pause: jasmine.createSpy()
    };
    player._isPlaying = true;
    player.pause();
    expect(player._canPlay).toBeFalsy();
    expect(player.sound.pause).toHaveBeenCalledTimes(1);
  });

  it('should scrub', () => {
    const result = player.scrub(10);
    expect(result).toEqual(10);
  });

  it('should get buffer fill', () => {
    const result = player.getBufferFill();
    expect(result).toEqual(100);
  });

  it('should get current time', () => {
    const result = player.getCurrentTime();
    expect(result).toEqual(0);
  });

  it('should get duration with no sound', () => {
    const result = player.getDuration();
    expect(result).toEqual(0);
  });

  it('should get duration with sound', () => {
    player.sound = {
      getDuration: () => 20
    };
    const result = player.getDuration();
    expect(result).toEqual(20);
  });

  it('should get duration with sound and undefined duration', () => {
    player.sound = {
      getDuration: () => -1
    };
    const result = player.getDuration();
    expect(result).toEqual(0);
  });

  it('should get the ready state of the player', () => {
    let result = player.canPlay();
    expect(result).toBeFalsy();
    player._canPlay = true;
    result = player.canPlay();
    expect(result).toBeTruthy();
  });

  it('should get the state of the player', () => {
    let result = player.isPlaying();
    expect(result).toBeFalsy();

    player._isPlaying = true;
    result = player.isPlaying();
    expect(result).toBeTruthy();
  });

  it('should call the preload method', () => {
    player.preload();
  });

  it('should call the get and set playbackRate methods', () => {
    player.getPlaybackRate();
    player.setPlaybackRate(1);
  });

  it('should set the audio volume', () => {
    player.sound = {
      setVolume: jasmine.createSpy()
    };
    player.setAudioVolume(0.5);
    expect(player.sound.setVolume).toHaveBeenCalledWith(0.5);

    player.setAudioVolume(0);
    expect(player.sound.setVolume).toHaveBeenCalledWith(0);

    player.setAudioVolume(1);
    expect(player.sound.setVolume).toHaveBeenCalledWith(1);
  });

  it('should call the get audio volume', () => {
    player.getAudioVolume();
  });
});

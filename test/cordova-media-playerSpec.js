require('jasmine-ajax');
const CordovaMediaPlayer = require('../cordova-media-player');

describe('Cordova Media Player', () => {
  let player;
  describe('Constructor', () => {
    afterEach(() => {
      delete window.device;
    });

    it('should construct with Android', () => {
      window.device = {platform: 'Android'};
      const player = new CordovaMediaPlayer();
      expect(player._isPlaying).toBeFalsy();
      expect(player._canPlay).toBeFalsy();
      expect(player.filename).toEqual('tempfile.3gp');
      expect(player.mimetype).toEqual('audio/3gpp');
      expect(player.filepath).toEqual('tempfile.3gp');
    });

    it('should construct with iOS', () => {
      window.device = {platform: 'iOS'};
      const player = new CordovaMediaPlayer();
      expect(player._isPlaying).toBeFalsy();
      expect(player._canPlay).toBeFalsy();
      expect(player.filename).toEqual('tempfile.wav');
      expect(player.mimetype).toEqual('audio/wav');
      expect(player.filepath).toEqual('documents://tempfile.wav');
    });

    it('should not construct with an unknown environment', ()=> {
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

  it('should load a blob from a url', done => {
    const duration = {duration: '10'};
    const url = 'blob:file://blobs/blob123.blob';
    const response = new Blob(['1234567890']);
    const fakeResponse = new Response(response, {
      status: 200
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    spyOn(player.fs, 'write').and.returnValue(Promise.resolve());
    spyOn(player, 'getFile').and.returnValue(Promise.resolve());
    spyOn(player, '_loadMedia').and.callFake(() => {
      console.log('calling loadmedia');
      return Promise.resolve({duration: '10'});
    });
    player.load(url, true)
      .then(result =>{
        console.log(JSON.stringify(result));
        expect(result).toEqual(duration);
        expect(player.getFile).toHaveBeenCalledWith('tempfile.3gp');
        expect(player.fs.write).toHaveBeenCalledWith('tempfile.3gp', response);
        expect(player._loadMedia).toHaveBeenCalledWith('tempfile.3gp', player);
      })
      .catch(fail)
      .then(done);
  });

  it('should handle server errors when loading from an url', done => {
    const cb = jasmine.createSpy();
    const url = 'blob:file://blobs/blob123.blob';
    const fakeResponse = new Response(JSON.stringify({}), {
      status: 404
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    player.load(url, true, cb)
      .then(fail)
      .catch(error =>{
        expect(error).toEqual(404);
      })
      .then(done);
  });

  it('should load media', done => {
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
      statuscb(0);
    };
    window.Media.MEDIA_STARTING = 0;
    const mockClosure = {
      settings: {
        durationchangeCb: jasmine.createSpy(),
        canplayCb: jasmine.createSpy()
      }
    };
    player._loadMedia(filePath, mockClosure)
      .then(result =>{
        expect(player._canPlay).toBeTruthy();
        expect(result).toEqual(jasmine.any(window.Media));
        expect(mockClosure.settings.durationchangeCb).toHaveBeenCalledTimes(1);
        expect(mockClosure.settings.canplayCb).toHaveBeenCalledTimes(1);
        expect(player.sound.seekTo).toHaveBeenCalledWith(0);
        expect(console.debug).toHaveBeenCalledTimes(6);
        expect(console.debug).toHaveBeenCalledWith('Loading media: filePath/file.file');
        expect(console.debug).toHaveBeenCalledWith('Playback ended successfully.');
        expect(console.debug).toHaveBeenCalledWith('Playback failed: 1337');
        expect(console.debug).toHaveBeenCalledWith('Playback status update: 0');
        expect(console.debug).toHaveBeenCalledWith('Metadata is being loaded.');
        expect(console.debug).toHaveBeenCalledWith('Duration: 10');
      })
      .catch(fail)
      .then(done);
  });

  it('should load media without loading metadata', done => {
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
      statuscb(0);
    };
    window.Media.MEDIA_STARTING = 1;
    const mockClosure = {
      settings: {}
    };
    player._loadMedia(filePath, mockClosure)
      .then(()=>{
        expect(player._canPlay).toBeTruthy();
        expect(player.sound.seekTo).toHaveBeenCalledWith(0);
        expect(console.debug).toHaveBeenCalledTimes(5);
        expect(console.debug).toHaveBeenCalledWith('Loading media: filePath/file.file');
        expect(console.debug).toHaveBeenCalledWith('Playback ended successfully.');
        expect(console.debug).toHaveBeenCalledWith('Playback failed: 1337');
        expect(console.debug).toHaveBeenCalledWith('Playback status update: 0');
        expect(console.debug).toHaveBeenCalledWith('Duration: 10');
      })
      .catch(fail)
      .then(done);
  });

  it('should get a file', done => {
    const fileName = 'filename123';
    spyOn(player.fs, 'file').and.returnValue(Promise.resolve(fileName));
    player.getFile(fileName)
      .then(result =>{
        expect(result).toEqual(fileName);
        expect(player.fs.file).toHaveBeenCalledWith(fileName);
      })
      .catch(fail)
      .then(done);
  });

  it('should get a file and handle errors', done => {
    const fileName = 'filename123';
    spyOn(player.fs, 'file').and.returnValue(Promise.reject('could not obtain file system'));
    player.getFile(fileName)
      .then(fail)
      .catch(error =>{
        expect(error).toEqual('could not obtain file system');
      })
      .then(done);
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
      pause: jasmine.createSpy()
    };
    player._isPlaying = true;
    player.stop();
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
});

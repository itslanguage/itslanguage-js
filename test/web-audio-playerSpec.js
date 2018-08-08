import WebAudioPlayer from '../src/audio/web-audio-player';

describe('WebAudioPlayer', () => {
  let audioMock;
  let webAudioPlayer;

  beforeEach(() => {
    audioMock = {
      constructor() {
      },
      addEventListener: () => {
      },
    };

    spyOn(window, 'Audio').and.returnValue(audioMock);
  });

  describe('Constructor', () => {
    beforeEach(() => {
      audioMock.pausedHandler = null;
      audioMock.firePausedEvent = () => {
        audioMock.pausedHandler();
      };
      spyOn(console, 'error');
    });

    it('should construct and call the appropiate event listeners', () => {
      const errorCodes = [0, 1, 2, 3, 4];
      audioMock.addEventListener = (name, handler) => {
        if (name === 'pause') {
          audioMock.pausedHandler = handler;
        }
        if (name === 'error') {
          const parameter = {
            target: {
              error: {
                code: null,
                MEDIA_ERR_ABORTED: 1,
                MEDIA_ERR_NETWORK: 2,
                MEDIA_ERR_DECODE: 3,
                MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
              },
            },
          };
          errorCodes.forEach((code) => {
            parameter.target.error.code = code;
            handler(parameter);
          });
        } else {
          handler();
        }
      };
      const options = jasmine.createSpyObj('options', [
        'playingCb',
        'timeupdateCb',
        'durationchangeCb',
        'canplayCb',
        'endedCb',
        'pauseCb',
        'stoppedCb',
        'playbackStoppedCb',
        'progressCb',
        'errorCb',
      ]);
      webAudioPlayer = new WebAudioPlayer(options);
      webAudioPlayer._pauseIsStop = true;
      audioMock.firePausedEvent();

      expect(webAudioPlayer._settings).toEqual(options);
      expect(webAudioPlayer._pauseIsStop).toBeFalsy();
      expect(options.playingCb).toHaveBeenCalledTimes(1);
      expect(options.timeupdateCb).toHaveBeenCalledTimes(1);
      expect(options.durationchangeCb).toHaveBeenCalledTimes(1);
      expect(options.canplayCb).toHaveBeenCalledTimes(1);
      expect(options.endedCb).toHaveBeenCalledTimes(1);
      expect(options.pauseCb).toHaveBeenCalledTimes(1);
      expect(options.stoppedCb).toHaveBeenCalledTimes(1);
      expect(options.playbackStoppedCb).toHaveBeenCalledTimes(2);
      expect(options.progressCb).toHaveBeenCalledTimes(1);
      expect(options.errorCb).toHaveBeenCalledTimes(5);
      expect(console.error).toHaveBeenCalledTimes(5);
      expect(console.error).toHaveBeenCalledWith('You aborted the playback.');
      expect(console.error).toHaveBeenCalledWith('A network error caused the audio download to fail.');
      expect(console.error).toHaveBeenCalledWith('The audio playback was aborted due to a corruption '
        + 'problem or because the media used features your browser did not support.');
      expect(console.error).toHaveBeenCalledWith('The audio could not be loaded, either because the '
        + 'server or network failed or because the format is not supported.');
      expect(console.error).toHaveBeenCalledWith('An unknown error occurred.');
    });

    it('should construct without event handlers', () => {
      audioMock.addEventListener = (name, handler) => {
        if (name === 'pause') {
          audioMock.pausedHandler = handler;
        }
        if (name === 'error') {
          const parameter = {
            target: {
              error: {
                code: null,
              },
            },
          };
          handler(parameter);
        } else {
          handler();
        }
      };
      webAudioPlayer = new WebAudioPlayer(null);
      webAudioPlayer._pauseIsStop = true;
      audioMock.firePausedEvent();
      expect(webAudioPlayer._settings).toEqual({});
      expect(webAudioPlayer._pauseIsStop).toBeFalsy();
    });
  });

  it('should preload audio', () => {
    audioMock.preload = null;
    spyOn(console, 'info');
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.preload();
    expect(audioMock.preload).toEqual('auto');
    expect(console.info).toHaveBeenCalledWith('Start preloading audio.');
    audioMock.preload = 'auto';
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.preload();
    expect(audioMock.preload).toEqual('auto');
  });

  describe('Preloading', () => {
    beforeEach(() => {
      audioMock.addEventListener = (name, handler) => {
        if (name === 'durationchange') {
          handler();
        }
      };
      audioMock.autobuffer = null;
      audioMock.preload = null;
      audioMock.duration = 10;

      spyOn(console, 'log');
      webAudioPlayer = new WebAudioPlayer();
    });

    it('should preload audio from an url', () => {
      const cb = jasmine.createSpy('callback');
      webAudioPlayer.load('url', true, cb);
      expect(audioMock.preload).toEqual('auto');
      expect(audioMock.autobuffer).toEqual(true);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(audioMock);
      expect(console.log).toHaveBeenCalledWith('Duration change for url to : 10');
    });

    it('should not preload audio from an url', () => {
      const cb = jasmine.createSpy('callback');
      webAudioPlayer.load('url', false, cb);
      expect(audioMock.preload).toEqual('none');
      expect(audioMock.autobuffer).toEqual(false);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(audioMock);
      expect(console.log).toHaveBeenCalledWith('Duration change for url to : 10');
    });

    it('should preload audio from an url with an undefined parameter', () => {
      webAudioPlayer.load('url');
      expect(audioMock.preload).toEqual('auto');
      expect(audioMock.autobuffer).toEqual(true);
    });

    it('should preload audio from an url without callback', () => {
      webAudioPlayer.load('url', true);
      expect(audioMock.preload).toEqual('auto');
      expect(audioMock.autobuffer).toEqual(true);
    });
  });

  describe('Playing', () => {
    beforeEach(() => {
      audioMock.play = jasmine.createSpy();
      audioMock.currentTime = 0;
      audioMock.preload = null;
      audioMock.HAVE_METADATA = 1;
      spyOn(console, 'debug');
      spyOn(console, 'warn');
      webAudioPlayer = new WebAudioPlayer();
    });

    it('should play audio from the start', () => {
      webAudioPlayer.play();
      expect(audioMock.play).toHaveBeenCalledTimes(1);
      expect(console.debug).toHaveBeenCalledWith(`Start playing from position: ${audioMock.currentTime}`);
    });

    it('should play audio from a position', () => {
      audioMock.readyState = 0;
      webAudioPlayer.play(2);
      expect(audioMock.play).toHaveBeenCalledTimes(1);
      expect(audioMock.preload).toEqual('auto');
      expect(console.warn).toHaveBeenCalledWith('Playing from a given position'
        + ' is not possible. Audio was not yet loaded. Try again.');
      expect(console.debug).toHaveBeenCalledWith(`Start playing from position: ${audioMock.currentTime}`);
    });

    it('should play and preload audio from a position', () => {
      audioMock.readyState = 1;
      const startTime = 2;
      webAudioPlayer.play(startTime);
      expect(audioMock.play).toHaveBeenCalledTimes(1);
      expect(audioMock.currentTime).toEqual(startTime);
      expect(console.debug).toHaveBeenCalledWith(`Scrub position to: ${startTime}`);
      expect(console.debug).toHaveBeenCalledWith(`Start playing from position: ${startTime}`);
    });
  });

  it('should unload audio', () => {
    webAudioPlayer = new WebAudioPlayer();
    spyOn(webAudioPlayer, '_initPlayer');
    webAudioPlayer.reset();

    expect(webAudioPlayer._initPlayer).toHaveBeenCalledTimes(1);
  });

  it('should stop playing audio', () => {
    audioMock.pause = () => {
    };
    audioMock.currentTime = 10;
    spyOn(audioMock, 'pause');
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.stop();

    expect(webAudioPlayer._pauseIsStop).toEqual(false);
    expect(audioMock.currentTime).toEqual(0);
    expect(audioMock.pause).toHaveBeenCalledTimes(1);
  });

  it('should pause playing audio', () => {
    audioMock.pause = () => {
    };
    audioMock.currentTime = 10;
    spyOn(audioMock, 'pause');
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.pause();

    expect(webAudioPlayer._pauseIsStop).toEqual(true);
    expect(audioMock.currentTime).toEqual(10);
    expect(audioMock.pause).toHaveBeenCalledTimes(1);
  });

  it('should scrub audio and preload', () => {
    audioMock.readyState = 0;
    audioMock.HAVE_METADATA = 1;

    spyOn(console, 'warn');
    webAudioPlayer = new WebAudioPlayer();
    spyOn(webAudioPlayer, 'preload');
    webAudioPlayer.scrub(10);

    expect(webAudioPlayer.preload).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('Scrubbing not possible. '
      + 'Audio was not yet loaded. Try again.');
  });

  it('should scrub audio', () => {
    let duration = 100;
    let percentage = 10;
    let expectedNewTime = 10;

    audioMock.readyState = 1;
    audioMock.HAVE_METADATA = 1;
    audioMock.currentTime = 0;
    audioMock.duration = duration;

    spyOn(console, 'log');
    webAudioPlayer = new WebAudioPlayer();

    webAudioPlayer.scrub(percentage);

    expect(console.log).toHaveBeenCalledWith(`Moving audio position to: ${
      percentage}%: ${expectedNewTime}s of total playing time: ${duration}`);
    expect(audioMock.currentTime).toEqual(expectedNewTime);

    duration = 50;
    percentage = 25;
    expectedNewTime = 12.5;
    audioMock.duration = duration;
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.scrub(percentage);

    expect(console.log).toHaveBeenCalledWith(`Moving audio position to: ${
      percentage}%: ${expectedNewTime}s of total playing time: ${duration}`);
    expect(audioMock.currentTime).toEqual(expectedNewTime);

    duration = 20;
    percentage = 50;
    expectedNewTime = 10;
    audioMock.duration = duration;
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.scrub(percentage);

    expect(console.log).toHaveBeenCalledWith(`Moving audio position to: ${
      percentage}%: ${expectedNewTime}s of total playing time: ${duration}`);
    expect(audioMock.currentTime).toEqual(expectedNewTime);

    duration = 50;
    percentage = 50;
    expectedNewTime = 25;
    audioMock.duration = duration;
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.scrub(percentage);

    expect(console.log).toHaveBeenCalledWith(`Moving audio position to: ${
      percentage}%: ${expectedNewTime}s of total playing time: ${duration}`);
    expect(audioMock.currentTime).toEqual(expectedNewTime);
  });

  it('should getBufferFill of an empty buffer', () => {
    webAudioPlayer = new WebAudioPlayer();
    let result = webAudioPlayer.getBufferFill();
    expect(result).toEqual(0);

    audioMock.buffered = [];
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.getBufferFill();
    expect(result).toEqual(0);
  });

  it('should getBufferFill', () => {
    let result;
    audioMock.buffered = [1];
    audioMock.buffered.start = jasmine.createSpy().and.returnValue(0);
    audioMock.buffered.end = jasmine.createSpy().and.returnValue(20);
    audioMock.duration = 20;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.getBufferFill();
    expect(result).toEqual(100);

    audioMock.buffered.end = jasmine.createSpy().and.returnValue(10);
    audioMock.duration = 20;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.getBufferFill();
    expect(result).toEqual(50);

    audioMock.buffered.end = jasmine.createSpy().and.returnValue(3);
    audioMock.duration = 8;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.getBufferFill();
    expect(result).toEqual(38);

    audioMock.buffered.end = jasmine.createSpy().and.returnValue(0);
    audioMock.duration = 8;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.getBufferFill();
    expect(result).toEqual(0);

    audioMock.buffered.start = jasmine.createSpy().and.returnValues(5, 0);
    audioMock.buffered.end = jasmine.createSpy().and.returnValue(0);
    audioMock.duration = 8;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.getBufferFill();
    expect(result).toEqual(0);
  });

  it('should get currentTime', () => {
    audioMock.currentTime = 10;
    webAudioPlayer = new WebAudioPlayer();
    const result = webAudioPlayer.getCurrentTime();
    expect(result).toEqual(10);
  });

  it('should get duration when it does not exist', () => {
    webAudioPlayer = new WebAudioPlayer();
    const result = webAudioPlayer.getDuration();
    expect(result).toEqual(0);
  });

  it('should get duration', () => {
    audioMock.duration = 10;
    webAudioPlayer = new WebAudioPlayer();
    const result = webAudioPlayer.getDuration();
    expect(result).toEqual(10);
  });

  it('should change playback rate', () => {
    audioMock.playbackRate = 1;
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.setPlaybackRate(2);
    expect(audioMock.playbackRate).toEqual(2);
  });

  it('should get the playback rate', () => {
    audioMock.playbackRate = 2;
    webAudioPlayer = new WebAudioPlayer();
    const result = webAudioPlayer.getPlaybackRate(2);
    expect(result).toEqual(2);
  });

  it('should get playing state', () => {
    audioMock.paused = true;
    webAudioPlayer = new WebAudioPlayer();
    let result = webAudioPlayer.isPlaying();
    expect(result).toBeFalsy();

    audioMock.paused = false;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.isPlaying();
    expect(result).toBeTruthy();
  });

  it('should get ready state', () => {
    audioMock.readyState = 0;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = 'source';
    audioMock.error = false;
    webAudioPlayer = new WebAudioPlayer();
    let result = webAudioPlayer.canPlay();
    expect(result).toBeTruthy();

    audioMock.readyState = 0;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = 'source';
    audioMock.error = true;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.canPlay();
    expect(result).toBeFalsy();

    audioMock.readyState = 0;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = null;
    audioMock.error = false;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.canPlay();
    expect(result).toBeFalsy();

    audioMock.readyState = 0;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = null;
    audioMock.error = true;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.canPlay();
    expect(result).toBeFalsy();

    audioMock.readyState = 1;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = 'source';
    audioMock.error = false;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.canPlay();
    expect(result).toBeTruthy();

    audioMock.readyState = 1;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = 'source';
    audioMock.error = true;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.canPlay();
    expect(result).toBeTruthy();

    audioMock.readyState = 1;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = null;
    audioMock.error = false;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.canPlay();
    expect(result).toBeTruthy();

    audioMock.readyState = 1;
    audioMock.HAVE_METADATA = 1;
    audioMock.src = '';
    audioMock.error = false;
    webAudioPlayer = new WebAudioPlayer();
    result = webAudioPlayer.canPlay();
    expect(result).toBeTruthy();
  });

  it('should set the audio volume', () => {
    webAudioPlayer = new WebAudioPlayer();
    webAudioPlayer.setAudioVolume(0.5);
    expect(audioMock.volume).toEqual(0.5);

    webAudioPlayer.setAudioVolume(0);
    expect(audioMock.volume).toEqual(0);

    webAudioPlayer.setAudioVolume(1);
    expect(audioMock.volume).toEqual(1);
  });

  it('should get the audio volume', () => {
    webAudioPlayer = new WebAudioPlayer();
    audioMock.volume = 0.5;
    expect(webAudioPlayer.getAudioVolume()).toEqual(0.5);

    audioMock.volume = 0;
    expect(webAudioPlayer.getAudioVolume()).toEqual(0);

    audioMock.volume = 1;
    expect(webAudioPlayer.getAudioVolume()).toEqual(1);
  });
});

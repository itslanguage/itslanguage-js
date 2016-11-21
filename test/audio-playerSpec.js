import AudioPlayer from '../audio-player';
import CordovaMediaPlayer from '../cordova-media-player';
import * as Stopwatch from '../tools';
import WebAudioPlayer from '../web-audio-player';

describe('Audio player', () => {
  let oldMedia;
  let oldAudio;

  beforeEach(() => {
    oldMedia = window.Media;
    oldAudio = window.Audio;
    spyOn(AudioPlayer.prototype, '_playbackCompatibility');
    spyOn(AudioPlayer.prototype, '_getBestPlayer');
  });

  afterEach(() => {
    window.Media = oldMedia;
    window.Audio = oldAudio;
  });

  it('should construct with event functionality', () => {
    const player = new AudioPlayer();
    let playbackStoppedCb = null;
    player._emitter = jasmine.createSpyObj('_emitter', ['on', 'off', 'emit']);
    player.resetEventListeners();
    player.addEventListener('evt1', () => {});
    player.removeEventListener('evt1', () => {});
    player._emitter.emit('evt1', ['args']);
    player._emitter.emit('evt2');
    expect(player._playbackCompatibility).toHaveBeenCalledTimes(1);
    expect(player._getBestPlayer).toHaveBeenCalledTimes(1);
    const callbacks = player._getBestPlayer.calls.mostRecent().args[0];
    expect(player.resetEventListeners).toEqual(jasmine.any(Function));
    expect(player.addEventListener).toEqual(jasmine.any(Function));
    expect(player.removeEventListener).toEqual(jasmine.any(Function));
    expect(player._emitter.emit).toEqual(jasmine.any(Function));
    for (const callback in callbacks) {
      if (callback === 'playbackStoppedCb') {
        playbackStoppedCb = callbacks[callback];
      }
      callbacks[callback]();
    }
    expect(player._emitter.on).toHaveBeenCalledWith('evt1', jasmine.any(Function));
    expect(player._emitter.off).toHaveBeenCalledWith('evt1', jasmine.any(Function));
    expect(player._emitter.emit).toHaveBeenCalledWith('evt1', ['args']);
    expect(player._emitter.emit).toHaveBeenCalledWith('evt2');
    player._stopwatch = jasmine.createSpyObj('_stopwatch', ['stop']);
    playbackStoppedCb();
    expect(player._stopwatch.stop).toHaveBeenCalledTimes(1);
  });

  describe('Compatibility', () => {
    beforeEach(() => {
      window.Media = jasmine.createSpy();
      window.Audio = jasmine.createSpy();
    });

    it('should recognize playback compatibility when all are available', () => {
      window.Audio.and.returnValue({
        canPlayType: () => 1
      });
      const player = new AudioPlayer();
      player._playbackCompatibility.and.callThrough();
      player._playbackCompatibility();
      expect(player.canUseAudio).toBeTruthy();
      expect(player.canUseCordovaMedia).toBeTruthy();
    });

    it('should recognize playback compatibility when only cordova is available', () => {
      window.Audio = undefined;
      const player = new AudioPlayer();
      player._playbackCompatibility.and.callThrough();
      player._playbackCompatibility();
      expect(player.canUseAudio).toBeFalsy();
      expect(player.canUseCordovaMedia).toBeTruthy();
    });

    it('should recognize playback compatibility when only HTML5 is available', () => {
      window.Media = undefined;
      window.Audio.and.returnValue({
        canPlayType: () => 1
      });
      const player = new AudioPlayer();
      player._playbackCompatibility.and.callThrough();
      player._playbackCompatibility();
      expect(player.canUseAudio).toBeTruthy();
      expect(player.canUseCordovaMedia).toBeFalsy();
    });

    it('should recognize playback compatibility when only HTML5 is available, but has no methods.', () => {
      window.Media = undefined;
      window.Audio.and.returnValue({
        canPlayType: 'Error'
      });
      const player = new AudioPlayer();
      player._playbackCompatibility.and.callThrough();
      expect(() => {
        player._playbackCompatibility();
      }).toThrowError('Unable to detect audio playback capabilities');
    });

    it('should recognize playback compatibility when none are available', () => {
      window.Media = undefined;
      window.Audio = undefined;
      const player = new AudioPlayer();
      player._playbackCompatibility.and.callThrough();
      expect(() => {
        player._playbackCompatibility();
      }).toThrowError('Some form of audio playback capability is required');
    });

    it('should recognize playback compatibility when neither wave nor mp3 can be played', () => {
      window.Media = undefined;
      window.Audio.and.returnValue({
        canPlayType: () => ''
      });
      const player = new AudioPlayer();
      player._playbackCompatibility.and.callThrough();
      expect(() => {
        player._playbackCompatibility();
      }).toThrowError('Native Wave or MP3 playback is required');
    });
  });

  it('should get the best player when it can use cordova', () => {
    window.device = {platform: 'Android'};
    const player = new AudioPlayer();
    AudioPlayer.prototype._getBestPlayer.and.callThrough();
    player.canUseCordovaMedia = true;
    const result = player._getBestPlayer();
    expect(result).toEqual(jasmine.any(CordovaMediaPlayer));
    delete window.device;
  });

  it('should get the best player when it can use HTML5', () => {
    const oldAudio_ = window.Audio;
    window.Audio = jasmine.createSpy().and.returnValue({
      canPlayType: () => 1
    });
    spyOn(WebAudioPlayer.prototype, '_initPlayer');
    const player = new AudioPlayer();
    player.canUseAudio = true;
    AudioPlayer.prototype._getBestPlayer.and.callThrough();
    const result = player._getBestPlayer();
    expect(result).toEqual(jasmine.any(WebAudioPlayer));
    window.Audio = oldAudio_;
  });

  it('should get the best player when it can use neither', () => {
    const player = new AudioPlayer();
    player.canUseCordovaMedia = false;
    player.canUseAudio = false;
    AudioPlayer.prototype._getBestPlayer.and.callThrough();
    expect(() => {
      player._getBestPlayer();
    }).toThrowError('Unable to find a proper player.');
  });

  it('should load from an url with preload', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['load']);
    const loadCb = jasmine.createSpy();
    spyOn(player._emitter, 'emit');
    player.load('url', true, loadCb);
    expect(player.player.load).toHaveBeenCalled();
    expect(player._emitter.emit).not.toHaveBeenCalled();
  });

  it('should load from an url without preload', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['load']);
    const loadCb = jasmine.createSpy();
    spyOn(player._emitter, 'emit');
    player.load('url', false, loadCb);
    expect(player.player.load).toHaveBeenCalledWith('url', false, loadCb);
    expect(player._emitter.emit).toHaveBeenCalledWith('canplay', []);
  });

  it('should reset', () => {
    const player = new AudioPlayer();
    spyOn(player, 'stop');
    spyOn(player._emitter, 'emit');
    player.player = jasmine.createSpyObj('player', ['reset']);
    player.reset();
    expect(player.player.reset).toHaveBeenCalledTimes(1);
    expect(player.stop).toHaveBeenCalledTimes(1);
    expect(player._emitter.emit).toHaveBeenCalledTimes(1);
  });

  it('should play', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['play', 'isPlaying']);
    player.player.isPlaying.and.returnValue(false);
    player.play(40);
    expect(player.player.play).toHaveBeenCalledWith(40);
  });

  it('should not play when already playing', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['play', 'isPlaying']);
    player.player.isPlaying.and.returnValue(true);
    player.play(40);
    expect(player.player.play).not.toHaveBeenCalled();
  });

  it('should stop', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['stop']);
    player.stop();
    expect(player.player.stop).toHaveBeenCalledTimes(1);
  });

  it('should pause', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['pause']);
    player.pause();
    expect(player.player.pause).toHaveBeenCalledTimes(1);
  });

  it('should toggle playback when playing', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['play', 'pause', 'isPlaying']);
    player.player.isPlaying.and.returnValue(true);
    player.togglePlayback();
    expect(player.player.isPlaying).toHaveBeenCalledTimes(1);
    expect(player.player.pause).toHaveBeenCalledTimes(1);
    expect(player.player.play).not.toHaveBeenCalled();
  });

  it('should toggle playback when not playing', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['play', 'pause', 'isPlaying']);
    player.player.isPlaying.and.returnValue(false);
    player.togglePlayback();
    expect(player.player.isPlaying).toHaveBeenCalledTimes(2);
    expect(player.player.pause).not.toHaveBeenCalledTimes(1);
    expect(player.player.play).toHaveBeenCalledTimes(1);
  });

  it('should preload', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['preload']);
    player.preload();
    expect(player.player.preload).toHaveBeenCalledTimes(1);
  });

  it('should scrub', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['scrub']);
    player.scrub(50);
    expect(player.player.scrub).toHaveBeenCalledWith(50);
  });

  it('should scrub and correct errors', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['scrub']);
    player.scrub(120);
    expect(player.player.scrub).toHaveBeenCalledWith(100);

    player.scrub(-9);
    expect(player.player.scrub).toHaveBeenCalledWith(0);
  });

  it('should get buffer fill', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['getBufferFill']);
    player.player.getBufferFill.and.returnValue(10);
    const result = player.getBufferFill();
    expect(player.player.getBufferFill).toHaveBeenCalledTimes(1);
    expect(result).toEqual(10);
  });

  it('should get current time', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['getCurrentTime']);
    player.player.getCurrentTime.and.returnValue(10);
    const result = player.getCurrentTime();
    expect(player.player.getCurrentTime).toHaveBeenCalledTimes(1);
    expect(result).toEqual(10);
  });

  it('should get duration', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['getDuration']);
    player.player.getDuration.and.returnValue(10);
    const result = player.getDuration();
    expect(player.player.getDuration).toHaveBeenCalledTimes(1);
    expect(result).toEqual(10);
  });

  it('should return playing state', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['isPlaying']);
    player.player.isPlaying.and.returnValue(true);
    const result = player.isPlaying();
    expect(player.player.isPlaying).toHaveBeenCalledTimes(1);
    expect(result).toBeTruthy();
  });

  it('should return ready state', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['canPlay']);
    player.player.canPlay.and.returnValue(true);
    const result = player.canPlay();
    expect(player.player.canPlay).toHaveBeenCalledTimes(1);
    expect(result).toBeTruthy();
  });

  it('should bind and return _stopwatch', () => {
    const player = new AudioPlayer();
    const cb = jasmine.createSpy();
    const fakeWatch = jasmine.createSpy().and.callFake(callback => {
      callback(10);
      return new Stopwatch(callback);
    });
    AudioPlayer.__set__('Stopwatch', fakeWatch);
    spyOn(player, 'getDuration').and.returnValue(1);
    const result = player.bindStopwatch(cb);
    expect(result).toEqual(jasmine.any(Stopwatch));
  });

  it('should bind and correct timer errors', () => {
    const player = new AudioPlayer();
    const cb = jasmine.createSpy();
    const fakeWatch = jasmine.createSpy().and.callFake(callback => callback(15));
    AudioPlayer.__set__('Stopwatch', fakeWatch);
    spyOn(player, 'getDuration').and.returnValue(1);
    player.player = jasmine.createSpyObj('player', ['bindStopwatch']);
    player.bindStopwatch(cb);
    expect(cb).toHaveBeenCalledWith(10);
  });

  it('should bind the play function to the _stopwatch', () => {
    const fakePlayer = jasmine.createSpyObj('_stopwatch', ['play', 'getCurrentTime', 'isPlaying']);
    fakePlayer.getCurrentTime.and.returnValue(1);
    fakePlayer.isPlaying.and.returnValue(false);
    const fakeWatch = jasmine.createSpyObj('_stopwatch', ['start']);
    fakeWatch.value = 10;
    const player = new AudioPlayer();
    player.player = fakePlayer;
    player._stopwatch = fakeWatch;
    player.play();
    expect(fakeWatch.value).toEqual(10);
    expect(fakeWatch.start).toHaveBeenCalledTimes(1);
  });

  it('should bind the pause function to the _stopwatch', () => {
    const fakePlayer = jasmine.createSpyObj('_stopwatch', ['pause']);
    const fakeWatch = jasmine.createSpyObj('_stopwatch', ['stop']);
    const player = new AudioPlayer();
    player.player = fakePlayer;
    player._stopwatch = fakeWatch;
    player.pause();
    expect(fakeWatch.stop).toHaveBeenCalledTimes(1);
  });

  it('should bind the stop function to the _stopwatch', () => {
    const fakePlayer = jasmine.createSpyObj('_stopwatch', ['stop']);
    const fakeWatch = jasmine.createSpyObj('_stopwatch', ['reset', 'stop']);
    const player = new AudioPlayer();
    player.player = fakePlayer;
    player._stopwatch = fakeWatch;
    player.stop();
    expect(fakeWatch.reset).toHaveBeenCalledTimes(1);
    expect(fakeWatch.stop).toHaveBeenCalledTimes(1);
  });

  it('should bind a _stopwatch and scrub audio', () => {
    const fakeWatch = jasmine.createSpyObj('_stopwatch', ['reset']);
    fakeWatch.value = 0;
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['scrub', 'getCurrentTime']);
    player.player.getCurrentTime.and.returnValue(1);
    player._stopwatch = fakeWatch;
    player.scrub(50);
    expect(player.player.getCurrentTime).toHaveBeenCalledTimes(1);
    expect(fakeWatch.value).toEqual(10);
  });

  it('should bind the reset function with a _stopwatch', () => {
    const player = new AudioPlayer();
    player.stop = jasmine.createSpy();
    player.player = jasmine.createSpyObj('player', ['reset']);
    player.reset();
    expect(player.stop).toHaveBeenCalledTimes(1);
  });
});


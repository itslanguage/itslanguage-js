const AudioPlayer = require('../audio-player');
const CordovaMediaPlayer = require('../cordova-media-player');
const WebAudioPlayer = require('../web-audio-player');

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
    player.emitter = jasmine.createSpyObj('emitter', ['on', 'off', 'emit']);
    player.resetEventListeners();
    player.addEventListener('evt1', () => {});
    player.removeEventListener('evt1', () => {});
    player.emitter.emit('evt1', ['args']);
    player.emitter.emit('evt2');
    expect(player._playbackCompatibility).toHaveBeenCalledTimes(1);
    expect(player._getBestPlayer).toHaveBeenCalledTimes(1);
    const callbacks = player._getBestPlayer.calls.mostRecent().args[0];
    expect(player.resetEventListeners).toEqual(jasmine.any(Function));
    expect(player.addEventListener).toEqual(jasmine.any(Function));
    expect(player.removeEventListener).toEqual(jasmine.any(Function));
    expect(player.emitter.emit).toEqual(jasmine.any(Function));
    for (const callback in callbacks) {
      callbacks[callback]();
    }
    expect(player.emitter.on).toHaveBeenCalledWith('evt1', jasmine.any(Function));
    expect(player.emitter.off).toHaveBeenCalledWith('evt1', jasmine.any(Function));
    expect(player.emitter.emit).toHaveBeenCalledWith('evt1', ['args']);
    expect(player.emitter.emit).toHaveBeenCalledWith('evt2');
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
    spyOn(player.emitter, 'emit');
    player.load('url', true, loadCb);
    expect(player.player.load).toHaveBeenCalled();
    expect(player.emitter.emit).not.toHaveBeenCalled();
  });

  it('should load from an url without preload', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['load']);
    const loadCb = jasmine.createSpy();
    spyOn(player.emitter, 'emit');
    player.load('url', false, loadCb);
    expect(player.player.load).toHaveBeenCalledWith('url', false, loadCb);
    expect(player.emitter.emit).toHaveBeenCalledWith('canplay', []);
  });

  it('should reset', () => {
    const player = new AudioPlayer();
    spyOn(player, 'stop');
    spyOn(player.emitter, 'emit');
    player.player = jasmine.createSpyObj('player', ['reset']);
    player.reset();
    expect(player.player.reset).toHaveBeenCalledTimes(1);
    expect(player.stop).toHaveBeenCalledTimes(1);
    expect(player.emitter.emit).toHaveBeenCalledTimes(1);
  });

  it('should play', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['play']);
    player.play(40);
    expect(player.player.play).toHaveBeenCalledWith(40);
  });

  it('should stop', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['stop']);
    player.stop();
    expect(player.player.stop).toHaveBeenCalledTimes(1);
  });

  it('should toggle playback when playing', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['play', 'stop', 'isPlaying']);
    player.player.isPlaying.and.returnValue(true);
    player.togglePlayback();
    expect(player.player.isPlaying).toHaveBeenCalledTimes(1);
    expect(player.player.stop).toHaveBeenCalledTimes(1);
    expect(player.player.play).not.toHaveBeenCalled();
  });

  it('should toggle playback when not playing', () => {
    const player = new AudioPlayer();
    player.player = jasmine.createSpyObj('player', ['play', 'stop', 'isPlaying']);
    player.player.isPlaying.and.returnValue(false);
    player.togglePlayback();
    expect(player.player.isPlaying).toHaveBeenCalledTimes(1);
    expect(player.player.stop).not.toHaveBeenCalledTimes(1);
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
});


const WebAudioPlayer = require('../web-audio-player');

describe('WebAudioPlayer', function() {
  it('should call the appropiate event listeners', function() {
    var errorCodes = [0, 1, 2, 3, 4];
    var audioMock =
      {
        constructor() {
        },
        pausedHandler: null,
        firePausedEvent: function() {
          this.pausedHandler();
        },
        addEventListener: function(name, handler) {
          if (name === 'pause') {
            this.pausedHandler = handler;
          }
          if (name === 'error') {
            var parameter =
              {
                target: {
                  error: {
                    code: null,
                    MEDIA_ERR_ABORTED: 1,
                    MEDIA_ERR_NETWORK: 2,
                    MEDIA_ERR_DECODE: 3,
                    MEDIA_ERR_SRC_NOT_SUPPORTED: 4
                  }
                }
              };
            errorCodes.forEach(function(code) {
              parameter.target.error.code = code;
              handler(parameter);
            });
          } else {
            handler();
          }
        }
      };

    spyOn(window, 'Audio').and.returnValue(audioMock);
    spyOn(console, 'error');

    var options = jasmine.createSpyObj('options', [
      'playingCb',
      'timeupdateCb',
      'durationchangeCb',
      'canplayCb',
      'endedCb',
      'pauseCb',
      'progressCb',
      'errorCb'
    ]);

    var webAudioPlayer = new WebAudioPlayer(options);
    webAudioPlayer._pauseIsStop = true;
    audioMock.firePausedEvent();

    expect(options.playingCb).toHaveBeenCalledTimes(1);
    expect(options.timeupdateCb).toHaveBeenCalledTimes(1);
    expect(options.durationchangeCb).toHaveBeenCalledTimes(1);
    expect(options.canplayCb).toHaveBeenCalledTimes(1);
    expect(options.endedCb).toHaveBeenCalledTimes(1);
    expect(options.pauseCb).toHaveBeenCalledTimes(1);
    expect(options.progressCb).toHaveBeenCalledTimes(1);
    expect(options.errorCb).toHaveBeenCalledTimes(5);

    expect(console.error).toHaveBeenCalledTimes(5);
    expect(console.error).toHaveBeenCalledWith('You aborted the playback.');
    expect(console.error).toHaveBeenCalledWith('A network error caused the audio download to fail.');
    expect(console.error).toHaveBeenCalledWith('The audio playback was aborted due to a corruption ' +
      'problem or because the media used features your browser did not support.');
    expect(console.error).toHaveBeenCalledWith('The audio could not be loaded, either because the ' +
      'server or network failed or because the format is not supported.');
    expect(console.error).toHaveBeenCalledWith('An unknown error occurred.');
  });
});

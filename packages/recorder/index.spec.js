import MediaRecorder from 'audio-recorder-polyfill';
import debug from 'debug';
import * as mediaRecorder from './index';
import AmplitudePlugin from './plugins/amplitude';
import BufferPlugin from './plugins/buffer';

const STREAM = null;

describe('MediaRecorder', () => {
  describe('general', () => {
    it('should have window.MediaRecorder available', () => {
      expect(window.MediaRecorder).toBeDefined();
    });
  });

  describe('createRecorder', () => {
    it('should return a recorder based on MediaRecorder', () => {
      const recorder = mediaRecorder.createRecorder(STREAM);

      expect(recorder instanceof MediaRecorder).toBeTruthy();
    });

    it('should return a recorder based on MediaRecorder without passing a stream', () => {
      const recorder = mediaRecorder.createRecorder();

      expect(recorder instanceof MediaRecorder).toBeTruthy();
    });

    it('should have a function getAudioSpecs', () => {
      const recorder = mediaRecorder.createRecorder(STREAM);

      expect(recorder.getAudioSpecs).toBeDefined();
    });

    it('should create a recorder with a plugin', async () => {
      const stream = await mediaRecorder.createMediaStream();
      const amplitudePlugin = mediaRecorder.createAmplitudePlugin();
      const recorder = mediaRecorder.createRecorder(stream, [amplitudePlugin]);

      expect(recorder.plugins[0]).toEqual(amplitudePlugin);
    });

    it('should create a recorder with different mimeType', async () => {
      const mimeType = 'audio/webm;codecs=opus';
      const stream = await mediaRecorder.createMediaStream();
      const recorder = mediaRecorder.createRecorder(stream, [], mimeType);

      expect(recorder.mimeType).toEqual(mimeType);
    });
  });

  describe('getAudioSpecs', () => {
    it('should return an object with audio specs', () => {
      const recorder = mediaRecorder.createRecorder(STREAM);
      const audioSpecs = recorder.getAudioSpecs();

      const AudioContext =
        window.AudioContext ||
        /* istanbul ignore next */ window.webkitAudioContext;
      const audioContext = new AudioContext();
      // eslint-disable-next-line prefer-destructuring
      const sampleRate = audioContext.sampleRate;
      const sampleWidth = 16;
      const channels = 1;

      const specsMock = {
        audioFormat: 'audio/wav',
        audioParameters: {
          channels,
          sampleWidth,
          sampleRate,
          frameRate: sampleRate,
        },
      };

      expect(audioSpecs).toEqual(specsMock);
    });

    it('should return an object with audio specs when a different mimeType is used', async () => {
      const mimeType = 'audio/webm;codecs=opus';
      const stream = await mediaRecorder.createMediaStream();
      const recorder = mediaRecorder.createRecorder(stream, [], mimeType);
      const audioSpecs = recorder.getAudioSpecs();

      const specsMock = {
        audioFormat: mimeType,
        audioParameters: {
          channels: 1,
          sampleWidth: 16,
          frameRate: 48000,
          sampleRate: 48000,
        },
      };

      expect(audioSpecs).toEqual(specsMock);
    });
  });

  describe('createMediaStream', () => {
    beforeEach(() => {
      debug.enable('its-sdk:recorder');
    });

    afterEach(() => {
      debug.disable('its-sdk:recorder');
    });

    it('should returnn a Promise object', () => {
      const stream = mediaRecorder.createMediaStream();

      expect(stream instanceof Promise).toBeTruthy();
    });

    it('should reject with an error if getUserMedia is not available', done => {
      spyOnProperty(navigator, 'mediaDevices').and.returnValue({});

      mediaRecorder
        .createMediaStream()
        .then(done.fail)
        .catch(({ message }) => {
          expect(message).toBe(
            'navigator.mediaDevices.getUserMedia not implemented in this browser',
          );
          done();
        });
    });

    it('should log a warning when overriding sampleRate min via capabilities', done => {
      const loggerSpy = spyOn(console, 'log');

      mediaRecorder
        .createMediaStream({
          audio: {
            sampleRate: { min: 1 },
          },
        })
        .then(() => {
          expect(loggerSpy).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(done.fail);
    });

    it('should log a warning when overriding sampleRate ideal via capabilities', done => {
      const loggerSpy = spyOn(console, 'log');

      mediaRecorder
        .createMediaStream({
          audio: {
            sampleRate: { ideal: 1 },
          },
        })
        .then(() => {
          expect(loggerSpy).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(done.fail);
    });

    it('should log a warning when overriding sampleRate min and ideal via capabilities', done => {
      const loggerSpy = spyOn(console, 'log');

      mediaRecorder
        .createMediaStream({
          audio: {
            sampleRate: { min: 1, ideal: 1 },
          },
        })
        .then(() => {
          expect(loggerSpy).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(done.fail);
    });

    it('should not log a warning when not overriding sampleRate via capabilities', done => {
      const loggerSpy = spyOn(console, 'log');

      mediaRecorder
        .createMediaStream({
          audio: {
            someFakeSampleRate: { min: 1, ideal: 1 },
          },
        })
        .then(() => {
          expect(loggerSpy).toHaveBeenCalledTimes(0);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('createAmplitudePlugin', () => {
    it('should return a AmplitudePlugin instance', () => {
      const amplitudePlugin = mediaRecorder.createAmplitudePlugin();

      expect(amplitudePlugin instanceof AmplitudePlugin).toBeTruthy();
    });
  });

  describe('createBufferPlugin', () => {
    it('should return a BufferPlugin instance', () => {
      const bufferPlugin = mediaRecorder.createBufferPlugin();

      expect(bufferPlugin instanceof BufferPlugin).toBeTruthy();
    });
  });
});

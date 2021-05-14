import { MediaRecorder } from 'extendable-media-recorder';
import debug from 'debug';
import * as mediaRecorder from './index';
import AmplitudePlugin from './plugins/amplitude';

describe('MediaRecorder', () => {
  describe('general', () => {
    it('should have window.MediaRecorder available', () => {
      expect(window.MediaRecorder).toBeDefined();
    });
  });

  describe('createRecorder', () => {
    it('should return a recorder based on MediaRecorder', async () => {
      const stream = await mediaRecorder.createMediaStream();
      const recorder = await mediaRecorder.createRecorder(stream);

      expect(recorder instanceof MediaRecorder).toBeTruthy();
    });

    it('should create a recorder with a plugin', async () => {
      const stream = await mediaRecorder.createMediaStream();
      const amplitudePlugin = mediaRecorder.createAmplitudePlugin();
      const recorder = await mediaRecorder.createRecorder(stream, [amplitudePlugin]);

      expect(recorder.plugins[0]).toEqual(amplitudePlugin);
    });

    it('should create a recorder with different mimeType', async () => {
      const mimeType = 'audio/webm;codecs=opus';
      const stream = await mediaRecorder.createMediaStream();
      const recorder = await mediaRecorder.createRecorder(stream, [], mimeType);

      expect(recorder.mimeType).toEqual(mimeType);
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

    it('should reject with an error if getUserMedia is not available', (done) => {
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

    it('should log a warning when overriding sampleRate min via capabilities', (done) => {
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

    it('should log a warning when overriding sampleRate ideal via capabilities', (done) => {
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

    it('should log a warning when overriding sampleRate min and ideal via capabilities', (done) => {
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

    it('should not log a warning when not overriding sampleRate via capabilities', (done) => {
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
});

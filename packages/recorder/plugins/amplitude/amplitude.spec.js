import * as amplitude from './amplitude';
import { createMediaStream } from '../../index';

describe('Amplitude', () => {
  describe('createAmplitude', () => {
    it('should create an Amplitude object', async () => {
      const stream = await createMediaStream();
      const amplitudeNode = amplitude.createAmplitude(stream);

      expect(amplitudeNode.constructor.name).toEqual('Amplitude');
    });
  });

  describe('getCurrentLevels', () => {
    it('should return an object with volume information', async () => {
      const stream = await createMediaStream();
      const amplitudeNode = amplitude.createAmplitude(stream);
      const measurement = amplitudeNode.getCurrentLevels();

      expect(measurement).toEqual({
        volume: 0,
        volumePerChannel: [0, 0],
        averageVolumePerChannel: [0, 0],
      });
    });
  });
});

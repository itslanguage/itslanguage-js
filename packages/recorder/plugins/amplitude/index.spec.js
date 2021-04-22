import {
  createAmplitudePlugin,
  createMediaStream,
  createRecorder,
} from '../../index';

describe('AmplitudePlugin', () => {
  it('should start the plugin immediately', async () => {
    const stream = await createMediaStream();
    const amplitudePlugin = createAmplitudePlugin({
      immediateStart: true,
    });
    const startDispatchingSpy = spyOn(amplitudePlugin, 'startDispatching');
    const recorder = await createRecorder(stream, [amplitudePlugin]);

    expect(startDispatchingSpy).toHaveBeenCalledTimes(1);
    recorder.start();
    recorder.dispatchEvent(new Event('dataavailable'));
    recorder.stop();

    expect(startDispatchingSpy).toHaveBeenCalledTimes(2);
  });

  it('should not stop the plugin after recording ends', async () => {
    const stream = await createMediaStream();
    const amplitudePlugin = createAmplitudePlugin({
      stopAfterRecording: false,
    });
    const stopDispatchingSpy = spyOn(amplitudePlugin, 'stopDispatching');
    const recorder = await createRecorder(stream, [amplitudePlugin]);
    recorder.start();
    recorder.stop();

    expect(stopDispatchingSpy).toHaveBeenCalledTimes(0);
  });

  it('should not call dispatchLevelsAnimationLoop if the loop was already started', async () => {
    const stream = await createMediaStream();
    const amplitudePlugin = createAmplitudePlugin({
      immediateStart: true,
    });

    const requestAnimationFrameSpy = spyOn(window, 'requestAnimationFrame');

    const recorder = await createRecorder(stream, [amplitudePlugin]);
    recorder.start();
    recorder.stop();

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
  });
});

import {
  createBufferPlugin,
  createMediaStream,
  createRecorder,
} from '../../index';

function wait(seconds = 2) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

describe('BufferPlugin', () => {
  it('should start the plugin immediately', async () => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin({
      immediateStart: true,
    });
    const startBufferingSpy = spyOn(bufferPlugin, 'startBuffering');
    const recorder = createRecorder(stream, [bufferPlugin]);

    expect(startBufferingSpy).toHaveBeenCalledTimes(1);
    recorder.start();
    recorder.stop();

    expect(startBufferingSpy).toHaveBeenCalledTimes(2);
  });

  it('should default to stop the plugin after recording ends', async () => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin();
    const recorder = createRecorder(stream, [bufferPlugin]);

    const stopBufferingSpy = spyOn(bufferPlugin, 'stopBuffering');

    recorder.start();
    await wait(1); // Record for 1 second;
    recorder.stop();

    await wait(2);

    expect(stopBufferingSpy).toHaveBeenCalledTimes(1);
  });

  it('should not stop the plugin after recording ends', async () => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin({
      stopAfterRecording: false,
    });
    const stopBufferingSpy = spyOn(bufferPlugin, 'stopBuffering');

    const recorder = createRecorder(stream, [bufferPlugin]);

    recorder.start();
    await wait(1); // Record for 1 second;
    recorder.stop();

    await wait(2);

    expect(stopBufferingSpy).toHaveBeenCalledTimes(0);
  });

  it('should dispatch an event when requesting buffered data', async (done) => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin({
      immediateStart: true,
    });

    const recorder = createRecorder(stream, [bufferPlugin]);

    recorder.addEventListener('bufferdataavailable', () => {
      done();
    });

    recorder.requestBufferedData(1);
    await wait(2);
  });

  it('should not dispatch an event when requesting buffered gave no data', async () => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin({
      immediateStart: true,
    });
    const recorder = createRecorder(stream, [bufferPlugin]);
    const dispatchEventSpy = spyOn(recorder, 'dispatchEvent');

    spyOn(bufferPlugin.bufferNode, 'readBufferAsWAV').and.returnValue(null);
    bufferPlugin.readBufferAsWAV(1);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(0);
  });

  it('should return 3 seconds of the buffer', async (done) => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin({
      immediateStart: true,
    });
    const recorder = createRecorder(stream, [bufferPlugin]);

    recorder.addEventListener('bufferdataavailable', async ({ data }) => {
      const audio = new Audio(URL.createObjectURL(data));
      await wait(2);

      expect(audio.duration).toBe(3);
      done();
    });

    recorder.requestBufferedData(3);
    await wait(2);
  });

  it('should return everything in the buffer', async (done) => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin({
      immediateStart: true,
      secondsToBuffer: 30,
    });
    const recorder = createRecorder(stream, [bufferPlugin]);

    recorder.addEventListener('bufferdataavailable', async ({ data }) => {
      const audio = new Audio(URL.createObjectURL(data));
      await wait(2);

      expect(audio.duration).toBe(30);
      done();
    });

    recorder.requestBufferedData();
    await wait(2);
  });

  it('should dispatch a custsom event when requesting buffered data', async (done) => {
    const stream = await createMediaStream();
    const bufferPlugin = createBufferPlugin({
      immediateStart: true,
      eventToDispatch: 'blablabla',
    });

    const recorder = createRecorder(stream, [bufferPlugin]);

    recorder.addEventListener('blablabla', () => {
      done();
    });

    recorder.requestBufferedData(1);
    await wait(2);
  });
});

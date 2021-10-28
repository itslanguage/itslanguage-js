# ITSLanguage Recorder Package

Speech technology for language education. 📣

This package exposes a very simple wrapper around a polyfill for the MediaRecorder API. We have two
reasons to use the polyfill:

1. The MediaRecorder API is not available in some browser (like safari). With this
   polyfill it is.
1. The polyfill supports WAVE which is what we need for the backend.

In the future we want to be able to support both the browser default MediaRecorder,
and this polyfill.

## Getting started

Install with npm:

```sh
npm install @itslanguage/recorder
```

Example usage, in code:

```js
import { createRecorder, createMediaStream } from '@itslanguage/recorder';

// Ask and wait for the user to give permission and get an audio stream.
createMediaStream().then(stream => {
  // Create a MediaRecorder instance with the stream you got.
  const recorder = createRecorder(stream);

  // Store audio chunks
  let audioChunks = [];

  // Start listening to onDataavailable to process data
  // This event will be raised per x milliseconds, per
  // recorder.requestData() call or on the end.
  recorder.addEventListener('dataavailable', event => {
    audioChunks.push(event.data);
  });

  // Let's record approximately 25 seconds of audio, and automatically playback
  recorder.start();

  window.setTimeout(() => {
    recorder.stop();

    // Now we can loop over the audio chunks and display them to the browser
    audioChunks.forEach(chunk => {
      const audioElm = document.createElement('audio');
      audioElm.controls = true;
      audioElm.src = URL.createObjectURL(chunk);

      // Just a quick way to display the audio element to the screen
      document.getElementsByTagName('body')[0].appendChild(audioElm);

      // At this point you will see some audio elements on the
      // screen which you can use to listen to the audio recorded.
    });
  }, 25000);
});
```

## Plugins

The recorder is prepared to be extended with plugins. For example, we have
written a plugin called `AmplitudePlugin` that will output (emit) volume
information directly via the recorder. This information can, for example, be
used to create a volume meter to indicate recording to an end user. For more
information on this plugin, check the [plugin](./plugins/amplitude) itself.

Plugins can be used to create an instance of the plugin, and then add it to the
recorder. The recorder will then call the `apply` function of the plugin.

This is an example on how one could use the `AmplitudePlugin`.

```js
import {
  createRecorder,
  createMediaStream,
  createAmplitudePlugin,
} from '@itslanguage/recorder';

// Ask and wait for the user to give permission and get an audio stream.
createMediaStream().then(stream => {
  const amplitudePlugin = createAmplitudePlugin(/* options here*/);

  // Create a MediaRecorder instance with the stream you got. Also, pass the
  // plugins as the second argument.
  const recorder = createRecorder(stream, [amplitudePlugin]);

  // Start listening to amplitudelevels. Once fired, it will return
  // an object with volume information.
  recorder.addEventListener('amplitudelevels', event => {
    // log the current volume of the recorder to the console.
    console.log(event.data.volume);
  });

  // Start recording!
  recorder.start();
});
```

## API

### createRecorder

```js
createRecorder([stream], [plugins], [(mimeType = 'audio/wav')]);
```

This function is a factory method that just instantiates and returns a
`MediaRecorder` object.

#### Arguments

- `[stream : MediaStream]`: Pass a `MediaStream` object to the constructor
  of `MediaStream`. This param is not required, even though if you would omit it,
  recording would not work obviously (no stream = no data).
- `[plugins: Array]`: Pass plugins to the recorder to initialize.
- `[mimeType: 'audio/wav' : String]`: Override the default mimeType for the
  recorder. Whether a mimeType is valid or not can be checked with
  `MediaRecorder.isTypeSupported()`. Defaults to `audio/wav`.

### createMediaStream

```js
createMediaStream();
```

This method will (try to) call `navigator.mediaDevices.getUserMedia()`. This will
give you the required (authorized) stream to use with the `MediaRecorder` object.

Also, this function will trigger the browser to ask the user for permission to
access the microphone.

It returns a promise and if all good the promise resolve with a `MediaStream`
object

### createAmplitudePlugin

```js
createAmplitudePlugin(
  (options = { immediateStart: false, stopAfterRecording: true }),
);
```

Factory function to create an amplitude plugin. It will accept some options and
if all good it will return an `AmplitudePlugin` object that can be passed to the
plugin array for `createRecorder`.

The amplitude plugin wil dispatch `amplitudelevels` events on the recorder with
information about the volume levels (per input channel if possible).

#### Arguments

- `[options: Object]`: Pass an object with options to control how the plugin
  behaves.
- `[options.immediateStart: false : Boolean]`: Start dispatching volume levels
  when instantiating the plugin. If false (default value) it will start when
  the recording is started.
- `[options.stopAfterRecording: true : Boolean]`: Stop dispatching volume levels
  when the recorder is stopped, which is the default behaviour.

### createBufferPlugin

```js
createBufferPlugin(
  (options = {
    immediateStart: false,
    stopAfterRecording: true,
    secondsToBuffer: 30,
    eventToDispatch: 'bufferdataavailable',
  }),
);
```

Factory function to create a buffer plugin. It will accept some options and if
all good it will return a `BufferPlugin` object that can be passed to the plugin
array for `createRecorder`.

The buffer plugin will dispatch buffered audio as `audio/wav` blob to the
recorder via the `bufferdataavailable` event. When instantiated it will register
a function `requestBufferedData` on the recorder. When invoking that function the
configured event will be dispatched with the requested data. See below for the
API of `requestBufferedData`.

#### Arguments

- `[options: Object]`: Pass an object with options to control how the plugin
  behaves.
- `[options.immediateStart: false : Boolean]`: Start buffering audio when
  instantiating the plugin. If false (default value) it will start when
  the recording is started.
- `[options.stopAfterRecording: true : Boolean]`: Stop buffering audio when the
  recorder is stopped, which is the default behaviour.
- `[options.secondsToBuffer: 30: Number]`: Value that controls how many seconds
  of audio will always be in the buffer. Defaults to 30 seconds.
- `[options.eventToDispatch: bufferdataavailable: String]`: The event that is
  used to dispatch the buffered audio on when requested. Use this option to
  override the default value.

##### requestBufferedData

```js
requestBufferedData((secondsToRead = 3));
```

This function will be registered on a recorder and allow you to get the buffered
data. When invoked it will make sure the configured event (by default
`bufferdataavailable`) will be dispatched.

The function will be registered when audio buffering is started, and will be
deleted once the buffering stops.

###### Arguments

- `[secondsToRead: 3: Number]`: Use this param to define how may seconds there
  will be read from the buffer. By default there will be gathered 3 seconds of
  audio. If the value of `secondsToRead` is 0 or equal or larger than the amount
  of audio in the buffer the buffer will be returned completely.

###### Example

```js
import {
  createRecorder,
  createMediaStream,
  createBufferPlugin,
} from '@itslanguage/recorder';

// Ask and wait for the user to give permission and get an audio stream.
createMediaStream().then(stream => {
  const bufferPlugin = createBufferPlugin(/* options here*/);

  // Create a MediaRecorder instance with the stream you got. Also, pass the
  // plugins as the second argument.
  const recorder = createRecorder(stream, [bufferPlugin]);

  // Start listening to bufferdataavailable. Once fired, it will return
  // a Blob with the requested audio from the buffer.
  recorder.addEventListener('bufferdataavailable', event => {
    console.log(event.data); // Outputs a Blob {};
  });

  // Start recording!
  recorder.start();

  // At a certain point in time you will want to get some audio from the buffer
  recorder.requestBufferedData();
});
```

## Read more

Read more on the MediaStream Recording API on MDN:
https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

Read more on the polyfill we used: https://github.com/ai/audio-recorder-polyfill

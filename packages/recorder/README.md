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
import createRecorder from '@itslanguage/recorder';

// Ask the user for permission and get an audio stream.
const stream = createMediaStream();

// Create a MediaRecorder instance with the stream you got.
const recorder = createRecorder(stream);

// Store audio chunks
let audioChunks = [];

// Start listening to onDataavailable to process data
// This event will be raised per x milliseconds, per
// recorder.requestData() call or on the end.
recorder.addEventListener('dataavailable', (event) => {
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
```

## API

### addAsGlobal

```js
addAsGlobal([ns='MediaRecorder'])
```

Add the imported `MediaRecorder` to the specified namespace. The default namespace
will be set to `MediaRecorder`. Any object already defined will be copied and 
prefixed with `Original` (i.e. `OriginalMediaRecorder`).

If you want to set the imported `MediaRecorder` to a custom object, just pass a
string to `addAsGloabl`. See the arguments below.

The reference to the imported `MediaRecorder` is the polyfill this package uses.

#### Arguments

- ```[ns = 'MediaRecorder: string]```: Use this parameter to pass in the name
of the object you want to store the `MediaRecorder` object to.

### createRecorder

```js
createRecorder([stream], [setToWindow=false], [asObject='MediaRecorder'])
```

This function is a factory method that just instantiates a `MediaRecorder` object.

#### Arguments

- ```[stream : MediaStream]```: Pass a `MediaStream` object to the constructor
of `MediaStream`. This param is not required, even though if you would omit it,
recording would not work obviously (no stream = no data).
- ```[setToWindow = false : boolean]```: Set the imported `MediaRecorder` also to
the `window` object. Default behavious is not doing that. Could be usefull in some
cases but in general you probably won't need this.
- ```[asObject = 'MediaRecorder': string]```: If `setToWindow` is true, you can
use this param to override the object where you want the `MediaRecorder` to live.

### createMediaStream

```js
createMediaStream()
```

This method will (try to) call `navigator.mediaDevices.getUserMedia()`. This will
give you the required (authorized) stream to use with the `MediaRecorder` object.

Also, this function will trigger the browser to ask the user for permission to
access the microphone.

## Read more

Read more on the MediaStream Recording API on MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

Read more on the polyfill we used: https://github.com/ai/audio-recorder-polyfill

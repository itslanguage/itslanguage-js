import React, { useState, useEffect } from 'react';
import {
  createMediaStream,
  createRecorder,
  createBufferPlugin,
} from '../../../../../packages/recorder';
import Input from '../Form/Input';
import Button from '../Button';

import './index.css';

let recorder;
let bufferPlugin;

function App() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [secondsToBuffer, setSecondsToBuffer] = useState(30);
  const [bufferRead, setBufferRead] = useState(3);
  const [errors, setErrors] = useState([]);

  const recordingStarted = () => {
    setRecording(true);
    console.log('recorder started');
    console.log(recorder);
  };

  const recordingEnded = data => {
    setRecording(false);
    console.log('recorder stopped');
  };

  const processData = event => {
    setAudioChunks(chunks => [...chunks, event.data]);
  };

  useEffect(() => {
    createMediaStream()
      .then(stream => {
        bufferPlugin = createBufferPlugin({ secondsToBuffer });
        recorder = createRecorder(
          stream,
          [bufferPlugin],
          'audio/webm;codecs=opus',
        );
        recorder.addEventListener('bufferdataavailable', processData);
        recorder.addEventListener('start', recordingStarted);
        recorder.addEventListener('stop', recordingEnded);
      })
      .catch(error => {
        const message = `${error.name}: ${error.message}`;
        setErrors(errors => [...errors, message]);
      });
  }, [secondsToBuffer]);

  const toggleRecording = () => {
    if (!recording) {
      recorder.start();
    } else {
      recorder.stop();
    }
  };

  const readBuffer = () => {
    // Get part of the buffer;
    if (recording) {
      recorder.requestBufferedData(bufferRead);
    }
  };

  return (
    <div className="App">
      <div>
        <h1>Buffer plugin example</h1>
        <p>
          Live demonstration of a recorder with <code>BufferPlugin</code>{' '}
          enabled. The buffer plugin will capture all recorded data while
          recording. During or after the recording it will be possible to get
          data as valid audio from the buffer. You can either get all data (at
          once) or only the last x seconds.
        </p>
      </div>
      {errors.length > 0 && (
        <div>
          {errors.map(error => (
            <p className="error">{error}</p>
          ))}
        </div>
      )}
      <div>
        <p>
          Use the button below to start or stop the recorder.
          <br />
          <Button onClick={toggleRecording}>
            {recording ? 'stop' : 'start'} recording
          </Button>
        </p>
        <p></p>
        <p>
          Number of seconds to keep in buffer.
          <br />
          <Input
            type="number"
            name="secondsToBuffer"
            value={secondsToBuffer}
            onChange={event => {
              setSecondsToBuffer(event.target.value * 1);
            }}
          />
        </p>
        <p>
          Number of seconds to get from the buffer.
          <br />
          <Input
            type="number"
            name="bufferRead"
            value={bufferRead}
            onChange={event => {
              setBufferRead(event.target.value * 1);
            }}
          />
        </p>
        <p>
          <Button onClick={readBuffer}>Read data from buffer</Button>
        </p>
      </div>
      {audioChunks.length > 0 && (
        <div>
          <h3>Recorded chunk{audioChunks.length > 1 && 's'}</h3>
          {audioChunks.map((chunk, index) => (
            <React.Fragment key={index}>
              <audio controls src={URL.createObjectURL(chunk)} />
              <br />
              <br />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

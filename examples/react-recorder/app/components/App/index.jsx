import React, { useState, useEffect } from 'react';
import {
  createMediaStream,
  createRecorder,
} from '../../../../../packages/recorder';
import Input from '../Form/Input';
import Select from '../Form/Select';
import Button from '../Button';

import './index.css';

const mediaTypes = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/webm;codecs=pcm',
  'audio/ogg',
  'audio/vorbis',
];

function App() {
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingLength, setRecordingLength] = useState(5);
  const [timeslice, setTimeslice] = useState(0);
  const [mimeType, setMimeType] = useState(undefined);
  const [errors, setErrors] = useState([]);
  let recorder;

  const processData = event => {
    setAudioChunks(chunks => [...chunks, event.data]);
  };

  const recordingStarted = () => {
    window.setTimeout(() => {
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    }, recordingLength * 1000);
  };

  useEffect(() => {
    createMediaStream()
      .then(stream => {
        recorder = createRecorder(stream, [], mimeType);
        recorder.addEventListener('dataavailable', processData);
        recorder.addEventListener('start', recordingStarted);
      })
      .catch(error => {
        const message = `${error.name}: ${error.message}`;
        setErrors(errors => [...errors, message]);
      });

    return () => {
      if (recorder) {
        recorder.removeEventListener('dataavailable', processData);
        recorder.removeEventListener('start', recordingStarted);
      }
    };
  }, [timeslice, recordingLength, mimeType]);

  const startRecording = () => {
    if (recorder) {
      if (timeslice && timeslice > 0) {
        recorder.start(timeslice);
      } else {
        recorder.start();
      }
    }
  };

  return (
    <div className="App">
      <div>
        <h1>Recording example</h1>
        <p>Live demonstration of recorder and capabilities in the browser.</p>
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
          Recording length (in seconds).
          <br />
          <Input
            type="number"
            name="recordingLength"
            value={recordingLength}
            onChange={event => {
              setRecordingLength(event.target.value);
            }}
          />
        </p>
        <p>
          Timeslice (in miliseconds). Set to empty or 0 to disable.
          <br />
          <Input
            type="number"
            name="chunkSize"
            value={timeslice}
            onChange={event => {
              setTimeslice(event.target.value);
            }}
          />
        </p>
        <p>
          Select the media format to use for the recorder.
          <br />
          Only supported values are shown but note that audio/wav is always
          supported.
          <br />
          <Select
            name="mimeType"
            onChange={event => {
              setMimeType(event.target.value);
            }}
          >
            <option value="default">Use default</option>
            <option value="audio/wav">audio/wav</option>
            {mediaTypes.map(
              type =>
                window.MediaRecorder.isTypeSupported(type) && (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ),
            )}
          </Select>
        </p>
        <p>
          Click on the button to start recording
          <br />
          <Button
            disabled={recorder && recorder.state === 'recording'}
            onClick={startRecording}
          >
            Start recording
          </Button>
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

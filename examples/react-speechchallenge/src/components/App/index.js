import React from 'react';
import './index.css';

// eslint can't find the imports, cra can.
/* eslint-disable import/no-unresolved */
import { createItslApi } from 'packages/api';
import { createMediaStream, createRecorder } from 'packages/recorder';
/* eslint-enable import/no-unresolved */

import Input from '../Form/Input';
import Button from '../Button';

const itslApi = createItslApi();
let recorder;

function App() {
  const [me, setMe] = React.useState(null);
  const [challenge, setChallenge] = React.useState(null);
  const [recording, setRecording] = React.useState(null);
  const [recordingState, setRecordingState] = React.useState(false);
  const [values, setValues] = React.useState({
    apiUrl: '',
    wsUrl: '',
    authorizationToken: '',
  });

  function handleChange(event) {
    event.persist();
    setValues(oldValues => ({
      ...oldValues,
      [event.target.name]: event.target.value,
    }));
  }

  async function getUser() {
    try {
      const currentUser = await itslApi.users.getCurrent();
      setMe(currentUser);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  async function getChallenge() {
    try {
      const speechChallenge = await itslApi.challenges.speech.getById(
        'speechChallenge_demo_1',
      );

      setChallenge(speechChallenge);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  React.useEffect(() => {
    if (me && me.id) {
      getChallenge();
    }
  }, [me]);

  React.useEffect(() => {
    if (typeof itslApi !== 'undefined') {
      itslApi.communication.updateSettings({
        ...values,
      });
    }
  }, [values]);

  async function prepareRecording() {
    const { speechRecording } = itslApi.challenges;

    try {
      const stream = await createMediaStream();
      // Create the recorder with default settings.
      // An example to record audio in webm:
      // recorder = createRecorder(stream, [], 'audio/webm;codecs=opus');
      recorder = createRecorder(stream);

      speechRecording
        .record(challenge.id, recorder)
        .then(result => {
          setRecording(result);
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error(error);
        });

      return 'ready';
    } catch (error) {
      return error;
    }
  }

  function takeChallenge() {
    if (recorder && recordingState) {
      recorder.stop();
      setRecordingState(false);
    } else {
      prepareRecording().then(() => {
        // Record audio and sent it to the backend in chunks of 1000ms
        recorder.start(1000);
        setRecordingState(true);
      });
    }
  }

  function secureUrl(url) {
    return itslApi.communication.addAccessToken(url);
  }

  return (
    <div className="App">
      <div>
        <h1>Speech Challenge example</h1>
        <p>
          Live demonstration of how to use the recorder and take a Speech
          Challenge.
        </p>
        <p>
          With this example you can create a recording for a challenge with ID{' '}
          <code>speechChallenge_demo_1</code>. If you want to try it out
          yourself, you will have to make sure you are able to connect to an
          ITSLanguage backend and have that challenge available for you.
        </p>
      </div>
      <div>
        <p>
          API Host
          <br />
          <Input
            type="text"
            name="apiUrl"
            value={values.apiUrl}
            onChange={handleChange}
          />
        </p>
        <p>
          Websocket Host
          <br />
          <Input
            type="text"
            name="wsUrl"
            value={values.wsUrl}
            onChange={handleChange}
          />
        </p>
        <p>
          Authentication Token
          <br />
          <Input
            type="text"
            name="authorizationToken"
            value={values.authorizationToken}
            onChange={handleChange}
          />
        </p>
      </div>
      <div>
        <p>
          <Button onClick={getUser}>Check communication</Button>
        </p>
      </div>
      <div>
        {me && (
          <p>
            Authenticated as: <b>{me.id}</b>
            <br />
            You may record audio now.
          </p>
        )}
      </div>
      <div>
        {challenge ? (
          <>
            <p>Click on the button to start recording</p>
            <p>
              <Button onClick={takeChallenge}>
                {recordingState ? 'Stop' : 'Start'} recording
              </Button>
            </p>
          </>
        ) : (
          <p>Not able to record (yet).</p>
        )}
      </div>
      {recording && recording.audioUrl && (
        <p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={secureUrl(recording.audioUrl)} />
        </p>
      )}
    </div>
  );
}

export default App;

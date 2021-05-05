import React from 'react';
import PropTypes from 'prop-types';

import Layout from '../components/layout';
import Button from '../components/button';
import fetch from '../libs/fetch';

import getRecorder from '../utils/itslanguage';
import { establishConnection, stop, start } from '../../../packages/websocket';

let recorder;

export async function getStaticProps() {
  const apiHost = process.env.API_HOST;

  return {
    props: {
      apiHost,
    },
  };
}

function Challenge({ apiHost }) {
  const [prompt, setPrompt] = React.useState(null);
  const [recordingState, setRecordingState] = React.useState(false);
  const [recordingUrl, setRecordingUrl] = React.useState(null);

  function loadPrompt() {
    fetch('api/prompt').then((data) => setPrompt(data[0]));
  }

  async function prepareRecording() {
    try {
      if (!recorder) {
        recorder = await getRecorder();
      }

      const token = await fetch('api/wstoken');
      establishConnection(
        token,
        `${apiHost}/prompt`,
        recorder,
        (feedback) => {
          // eslint-disable-next-line no-console
          console.log(feedback);
        },
        (rec) => {
          setRecordingUrl(`/api/recording/${rec.recordingId}`);
        },
      );
      return 'ready';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return error;
    }
  }
  function record() {
    if (recorder && recordingState) {
      stop();
      recorder.stop();
      setRecordingState(false);
    } else {
      prepareRecording().then(() => {
        // Start recording audio
        start(prompt, 'adult').then(() => {
          setRecordingState(true);
        });
      });
    }
  }

  return (
    <Layout>
      <div>
        <p>Click the button to start the speech challenge.</p>
        {prompt && prompt.srt ? (
          <div>
            <p>
              Prompt:
              <b>
                {prompt.srt}
              </b>
              is loaded
            </p>
            <Button onClick={record}>
              {recordingState ? 'Stop' : 'Start'}
            </Button>
          </div>
        ) : (
          <div>
            <p>
              <Button onClick={loadPrompt}>Load Prompt</Button>
            </p>
          </div>
        )}
        {recordingUrl ? (
          <div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls="controls" src={recordingUrl} type="audio/wav" />
          </div>
        ) : (
          <div />
        )}
      </div>
    </Layout>
  );
}

Challenge.propTypes = {
  apiHost: PropTypes.string.isRequired,
};

export default Challenge;

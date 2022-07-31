import { React, useCallback } from 'react';
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

function Recording({ apiHost }) {
  const [recordingState, setRecordingState] = React.useState(false);
  const [recordingUrl, setRecordingUrl] = React.useState(null);

  const apiUrl = `${apiHost}/recording`;

  async function prepareRecording() {
    try {
      if (!recorder) {
        recorder = await getRecorder();
      }

      const token = await fetch('api/wstoken');
      establishConnection(
        token,
        apiUrl,
        recorder,
        () => {},
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
        start().then(() => {
          setRecordingState(true);
        });
      });
    }
  }
  const recordClick = useCallback(() => record(), []);

  return (
    <Layout>
      <div>
        <p>Click the button to start the recording.</p>
        <Button onClick={recordClick}>
          {recordingState ? 'Stop' : 'Start'}
        </Button>
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

Recording.propTypes = {
  apiHost: PropTypes.string.isRequired,
};

export default Recording;

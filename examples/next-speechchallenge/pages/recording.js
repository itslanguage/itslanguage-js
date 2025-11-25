import { React, useState, useCallback } from 'react';
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
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  let recordingState = false;

  const apiUrl = `${apiHost}/recording`;
  function volumeLevelChanged({ data }) {
    // Volume level will be a value between 0.00 and 1.00
    const volume = Math.min(
      Math.max(parseInt(data.volume * 30 * 64, 10), 4),
      24,
    );
    setVolumeLevel(volume);
  }

  async function prepareRecording() {
    try {
      if (!recorder) {
        recorder = await getRecorder();
        recorder.addEventListener('amplitudelevels', volumeLevelChanged);
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
      recordingState = false;
    } else {
      prepareRecording().then(() => {
        // Start recording audio
        start().then(() => {
          recordingState = true;
        });
      });
    }
  }
  const recordClick = useCallback(() => record(), []);

  return (
    <Layout>
      <div>
        <p>Click the button to start the recording.</p>
        <svg
          className="AmplitudeMeter"
          width="64px"
          height="64px"
          viewBox="0 0 536 716"
        >
          <circle cx="256" cy="256" r="256" fill="#dadada" />
          <circle cx="256" cy="256" r={volumeLevel} fill="#e9573e" />
          <text
            x="50%"
            y="100%"
            textAnchor="middle"
            stroke="#000000"
            strokeWidth="2px"
            fontSize="120px"
            fontFamily="Fira Mono"
          >
            {volumeLevel}
          </text>
        </svg>
        <br />
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

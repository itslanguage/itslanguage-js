import React from 'react';
import PropTypes from 'prop-types';
import {
  createMediaStream,
  createRecorder,
  createAmplitudePlugin,
} from '../../../../../packages/recorder';
import './index.css';

class AmplitudeMeter extends React.Component {
  state = {
    currentVolume: 0,
  };

  componentWillMount() {
    this.initializeRecorder();
  }

  componentWillUpdate(nextProps) {
    const { enableMeter } = this.props;
    if (nextProps.enableMeter !== enableMeter) {
      if (nextProps.enableMeter) {
        this.start();
      } else {
        this.stop();
      }
    }
  }

  componentWillUnmount() {
    this.recorder.removeEventListener('amplitudelevels', this.updateVolume);
  }

  start = () => {
    this.recorder.start();
  };

  stop = () => {
    this.setState({ currentVolume: 0 }, () => {
      this.recorder.stop();
    });
  };

  updateVolume = ({ data }) => {
    this.setState({ currentVolume: data.volume });
  };

  initializeRecorder = async () => {
    const stream = await createMediaStream();
    const recorderPlugins = [createAmplitudePlugin()];

    this.recorder = createRecorder(stream, recorderPlugins);
    this.recorder.addEventListener('amplitudelevels', this.updateVolume);
  };

  render() {
    const { currentVolume } = this.state;
    const volume = Math.min(
      Math.max(parseInt(currentVolume * 30 * 64, 10), 16),
      256,
    );
    const currentVolumeRounded = parseFloat(
      Math.round(currentVolume * 100) / 100,
      10,
    ).toFixed(2);

    return (
      <svg
        className="AmplitudeMeter"
        width="64px"
        height="64px"
        viewBox="0 0 536 716"
      >
        <circle cx="256" cy="256" r="256" fill="#dadada" />
        <circle cx="256" cy="256" r={volume} fill="#e9573e" />
        <text
          x="50%"
          y="100%"
          textAnchor="middle"
          stroke="#000000"
          strokeWidth="2px"
          fontSize="120px"
          fontFamily="Fira Mono"
        >
          {currentVolumeRounded}
        </text>
      </svg>
    );
  }
}

AmplitudeMeter.propTypes = {
  enableMeter: PropTypes.bool,
};

AmplitudeMeter.defaultProps = {
  enableMeter: false,
};

export default AmplitudeMeter;

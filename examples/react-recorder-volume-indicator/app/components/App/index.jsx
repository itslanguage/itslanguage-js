import React from 'react';
import AmplitudeMeter from '../AmplitudeMeter';
import Button from '../Button';

import './index.css';

class App extends React.Component {
  state = {
    enableMeter: false,
  };

  toggleMeter = () => {
    this.setState(prevState => ({
      enableMeter: !prevState.enableMeter,
    }));
  };

  render() {
    const { enableMeter } = this.state;
    return (
      <div className="App">
        <div>
          <h2>Volume indication example</h2>
          <p>
            Live demonstration of a recorder with <code>AmplitudePlugin</code>{' '}
            enabled. If the <code>AmplitudePlugin</code> is enabled on the
            recorder, the recorder will regulary emit an{' '}
            <code>amplitude-level</code> event that has the current amplitude
            level information. We can use that value to animate the circle.
            Click on the "Enable meter" button to enable the recorder and show
            the volume meter received from the recorder.
          </p>
        </div>
        <div className="center">
          <AmplitudeMeter enableMeter={enableMeter} />
          <br />
          <Button onClick={this.toggleMeter}>
            {enableMeter ? 'Disable' : 'Enable'} meter
          </Button>
        </div>
        <div>
          <h3>About volume</h3>
          <p>
            The volume object that gets emitted by the recorder looks like
            below.
          </p>
          <pre>
            <code>
              {`{
  "averageVolumePerChannel": [0, 0],
  "volumePerChannel": [0.12, 0.10],
  "volume": 0.11
}`}
            </code>
          </pre>
          <p>
            This example output uses a recorder with 2 output channels (i.e.
            stereo). The volume will always be a positive number between 0.0 and
            1.0
          </p>
        </div>
      </div>
    );
  }
}

export default App;

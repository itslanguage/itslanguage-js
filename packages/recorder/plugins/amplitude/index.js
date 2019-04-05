import { createAmplitude } from './amplitude';

/**
 * This object defines the Amplitude plugin.
 *
 * @param {object} options - Options to pass to the plugin.
 * @param {boolean} options.immediateStart - Immediately start emitting the
 * `amplitudelevels` events, or wait for the recorder to start.
 * @param {boolean} options.stopAfterRecording - Stop emitting the events after the
 * recorder stops recording.
 * information.
 */
function AmplitudePlugin({
  immediateStart = false,
  stopAfterRecording = true,
}) {
  this.immediateStart = immediateStart;
  this.stopAfterRecording = stopAfterRecording;

  this.animationFrameStarted = false;
  this.animationFrame = null;
  this.amplitudeNode = null;
  this.recorder = null;

  /**
   * This is the loop, based on `requestAnimationFrame`, that will run to query
   * and emit Amplitude information.
   *
   * @fires AmplitudePlugin#amplitudlevels - Fires an event on the recorder with
   * the Amplitude levels computed from the audio source.
   */
  this.dispatchLevelsAnimationLoop = () => {
    // Get the levels from the Amplitude object;
    const levels = this.amplitudeNode.getCurrentLevels();

    // Create an event object to dispatch to the recorder;
    const event = new Event('amplitudelevels');
    event.data = { ...levels };

    // Dispatch the data!
    this.recorder.dispatchEvent(event);

    // Request the next frame to run;
    this.animationFrame = requestAnimationFrame(
      this.dispatchLevelsAnimationLoop,
    );
  };

  /**
   * Start the loop, only if it is not already running.
   */
  this.startDispatching = () => {
    if (!this.animationFrameStarted) {
      this.animationFrame = requestAnimationFrame(
        this.dispatchLevelsAnimationLoop,
      );
      this.animationFrameStarted = true;
    }
  };

  /**
   * Stop and reset the loop.
   */
  this.stopDispatching = () => {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrameStarted = false;
  };

  /**
   * Handler for the recorder, this gets executed as soon as the recorder stops
   * recording. Based on the options it will stop the loop that emits the
   * Amplitude levels.
   */
  this.recordingStopped = () => {
    if (this.stopAfterRecording) {
      this.stopDispatching();
    }
  };

  /**
   * Start the plugin.
   */
  this.startPlugin = () => {
    this.amplitudeNode = createAmplitude(this.recorder.stream);

    if (this.immediateStart) {
      this.startDispatching();
    }

    this.recorder.addEventListener('start', this.startDispatching);
    this.recorder.addEventListener('stop', this.recordingStopped);
  };
}

/**
 * This function gets called from itslanguage recorder side. It will pass
 * the recorder to it so we can use it.
 *
 * @param {MediaRecorder} recorder - Recorder for which this plugin needs to be
 * active on.
 */
// eslint-disable-next-line func-names
AmplitudePlugin.prototype.apply = function(recorder) {
  this.recorder = recorder;
  this.startPlugin();
};

export default AmplitudePlugin;

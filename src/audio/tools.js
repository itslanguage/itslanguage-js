/**
 * @title ITSLanguage Javascript
 * @overview This is part of the ITSLanguage Javascript SDK to perform helper functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */

const ee = require('event-emitter');

/**
ITSLanguage helper tools.
*/

/**
 * A simple stopwatch that ticks every 100 ms. It can be bound to an {@link AudioPlayer} or {@link AudioRecorder}
 * which binds the stop and playing functionality to the stopping and starting of the Watch.
 * It can also be listened to by other entities.
 * @experimental When binding to an Audio Recorder, the stopwatch is not always synced properly.
 * A difference of 0.1s or 0.2s too high may occur when counting. When binding to an Audio Player however, the timer
 * will sync properly and show the correct duration of the loaded audio file.
 */
export default class Stopwatch {
  /**
   * @param {Function} tickCb - The callback that is invoked on every tick (every 100ms).
   * @throws {Error} If tickCb is missing.
   */
  constructor(tickCb) {
    if (!tickCb) {
      throw new Error('tickCb parameter required');
    }
    this._interval = null;
    this._value = 0;
    this._tickCb = tickCb;
    this._emitter = ee({});
  }

  /**
   * Start counting and tick every 100 ms.
   */
  start() {
    console.debug('Start counting');
    // Tick every 100ms (0.1s)
    const self = this;
    this._interval = setInterval(() => {
      self.update();
    }, 100);
  }

  /**
   * Stop counting.
   */
  stop() {
    console.debug('Stop counting');
    clearInterval(this._interval);
    this.tick();
    this._interval = null;
  }

  /**
   * Reset count to 0.
   */
  reset() {
    console.debug('Reset count');
    this._value = 0;
    this.tick();
  }

  /**
   * Tick once and increment the value by 1.
   */
  update() {
    this.tick();
    this._value++;
  }

  /**
   * Invoke the tick callback with the current value.
   */
  tick() {
    this._tickCb(this._value);
    this._emitter.emit('tick', this._value);
  }

  registerListener(tickCb) {
    this._emitter.on('tick', tickCb);
  }

  stopListening(tickCb) {
    this._emitter.off('tick', tickCb);
  }
}

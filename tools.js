/**
 * @title ITSLanguage Javascript
 * @overview This is part of the ITSLanguage Javascript SDK to perform helper functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */

const ee = require('event-emitter');

/**
@module its.Tools
ITSLanguage helper tools.
*/


export default class Stopwatch {
  /**
   * A simple stopwatch
   *
   * @param {Function} [tickCb] The callback that is invoked on every tick (every 100ms).
   */
  constructor(tickCb) {
    if (!tickCb) {
      throw new Error('tickCb parameter required');
    }
    this.interval = null;
    this.value = 0;
    this.tickCb = tickCb;
    this.emitter = ee({});
  }

  /**
   * Start counting
   */
  start() {
    console.debug('Start counting');
    // Tick every 100ms (0.1s)
    const self = this;
    this.interval = setInterval(() => {
      self.update();
    }, 100);
  }

  /**
   * Stop counting
   */
  stop() {
    console.debug('Stop counting');
    clearInterval(this.interval);
    this.tick();
    this.interval = null;
  }

  /**
   * Reset count
   */
  reset() {
    console.debug('Reset count');
    this.value = 0;
    this.tick();
  }

  update() {
    this.tick();
    this.value++;
  }

  tick() {
    this.tickCb(this.value);
    this.emitter.emit('tick', this.value);
  }

  registerListener(tickCb) {
    this.emitter.on('tick', tickCb);
  }

  stopListening(tickCb) {
    this.emitter.off('tick', tickCb);
  }

}

/**
 * @title ITSLanguage Javascript
 * @overview This is part of the ITSLanguage Javascript SDK to perform helper functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */


/**
@module its.Tools
ITSLanguage helper tools.
*/


class Stopwatch {
  /**
   * A simple stopwatch
   *
   * @param {Function} [tickCb] The callback that is invoked on every tick (every 100ms).
   */
  constructor(tickCb) {
    this.interval = null;
    this.value = 0;
    this.tickCb = tickCb;
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
  }

  update() {
    this.value++;
    if (this.tickCb) {
      this.tickCb(this.value);
    }
  }
}

module.exports = {
  Stopwatch
};

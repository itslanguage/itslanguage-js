const Stopwatch = require('../tools').Stopwatch;

describe('Stopwatch', () => {
  it('should construct', () => {
    const cb = jasmine.createSpy();
    const stopwatch = new Stopwatch(cb);
    expect(stopwatch.interval).toBeNull();
    expect(stopwatch.value).toEqual(0);
    expect(stopwatch.tickCb).toEqual(cb);
  });

  it('should throw an error if tickCb is missing', () => {
    expect(() => {
      new Stopwatch();
    }).toThrowError('tickCb parameter required');
  });

  it('should start ticking', done => {
    const cb = jasmine.createSpy();
    const stopwatch = new Stopwatch(cb);
    spyOn(stopwatch, 'update').and.callThrough();
    stopwatch.start();
    setTimeout(() => {
      expect(stopwatch.update).toHaveBeenCalledTimes(10);
      expect(cb).toHaveBeenCalledTimes(10);
      done();
    }, 1000);
  });

  it('should stop ticking', done => {
    const cb = jasmine.createSpy();
    const stopwatch = new Stopwatch(cb);
    spyOn(stopwatch, 'update').and.callThrough();
    stopwatch.start();
    setTimeout(() => {
      expect(stopwatch.interval).not.toBeNull();
      stopwatch.stop();
      expect(stopwatch.interval).toBeNull();
      expect(stopwatch.update).toHaveBeenCalledTimes(3);
      expect(cb).toHaveBeenCalledTimes(4);
      done();
    }, 300);
  });

  it('should reset count', done => {
    const cb = jasmine.createSpy();
    const stopwatch = new Stopwatch(cb);
    stopwatch.start();
    setTimeout(() => {
      stopwatch.stop();
      expect(stopwatch.value).toEqual(3);
      stopwatch.reset();
      expect(stopwatch.value).toEqual(0);
      expect(cb).toHaveBeenCalledTimes(5);
      done();
    }, 300);
  });

  it('should update with cb', () => {
    const cb = jasmine.createSpy();
    const stopwatch = new Stopwatch(cb);
    stopwatch.update();
    expect(stopwatch.value).toEqual(1);
    expect(cb).toHaveBeenCalledWith(0);
    stopwatch.update();
    expect(stopwatch.value).toEqual(2);
    expect(cb).toHaveBeenCalledWith(1);
  });

  it('should register one listener', () => {
    const tickCb = jasmine.createSpy();
    const stopwatch = new Stopwatch(tickCb);
    const listenerCb = jasmine.createSpy();
    stopwatch.registerListener(listenerCb);
    stopwatch.update();
    stopwatch.update();
    expect(listenerCb).toHaveBeenCalledTimes(2);
    expect(listenerCb).toHaveBeenCalledWith(0);
    expect(listenerCb).toHaveBeenCalledWith(1);
  });

  it('should register multiple listeners', () => {
    const tickCb = jasmine.createSpy();
    const stopwatch = new Stopwatch(tickCb);
    const interestedListener1 = jasmine.createSpy();
    const interestedListener2 = jasmine.createSpy();
    stopwatch.registerListener(interestedListener1);
    stopwatch.registerListener(interestedListener2);
    stopwatch.update();
    stopwatch.update();
    expect(tickCb).toHaveBeenCalledTimes(2);
    expect(tickCb).toHaveBeenCalledWith(0);
    expect(tickCb).toHaveBeenCalledWith(1);
    expect(interestedListener1).toHaveBeenCalledTimes(2);
    expect(interestedListener1).toHaveBeenCalledWith(0);
    expect(interestedListener1).toHaveBeenCalledWith(1);
    expect(interestedListener2).toHaveBeenCalledTimes(2);
    expect(interestedListener2).toHaveBeenCalledWith(0);
    expect(interestedListener2).toHaveBeenCalledWith(1);
  });

  it('should register one listener and then stop listening', () => {
    const tickCb = jasmine.createSpy();
    const stopwatch = new Stopwatch(tickCb);
    const listenerCb = jasmine.createSpy();
    stopwatch.registerListener(listenerCb);
    stopwatch.update();
    stopwatch.stopListening(listenerCb);
    stopwatch.update();
    expect(listenerCb).toHaveBeenCalledTimes(1);
    expect(listenerCb).toHaveBeenCalledWith(0);
  });
});

const Stopwatch = require('../tools').Stopwatch;

describe('Stopwatch', () => {
  it('should construct', () => {
    const cb = jasmine.createSpy();
    const stopwatch = new Stopwatch(cb);
    expect(stopwatch.interval).toBeNull();
    expect(stopwatch.value).toEqual(0);
    expect(stopwatch.tickCb).toEqual(cb);
  });

  it('should start ticking', done => {
    const stopwatch = new Stopwatch();
    spyOn(stopwatch, 'update');
    stopwatch.start();
    setTimeout(() => {
      expect(stopwatch.update).toHaveBeenCalledTimes(10);
      done();
    }, 1000);
  });

  it('should stop ticking', done => {
    const stopwatch = new Stopwatch();
    spyOn(stopwatch, 'update');
    stopwatch.start();
    setTimeout(() => {
      expect(stopwatch.interval).not.toBeNull();
      stopwatch.stop();
      expect(stopwatch.interval).toBeNull();
      done();
    }, 300);
  });

  it('should reset count', done => {
    console.log('reset');
    const stopwatch = new Stopwatch();
    stopwatch.start();
    setTimeout(() => {
      stopwatch.stop();
      expect(stopwatch.value).toEqual(3);
      stopwatch.reset();
      expect(stopwatch.value).toEqual(0);
      console.log('reset done');
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

  it('should update without cb', () => {
    const stopwatch = new Stopwatch();
    stopwatch.update();
    expect(stopwatch.value).toEqual(1);
    stopwatch.update();
    expect(stopwatch.value).toEqual(2);
  });
});

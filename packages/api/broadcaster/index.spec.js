/**
 * The tests for the accompanying `broadcaster.js` file.
 */

import ee from 'event-emitter';
import broadcaster from './index';

describe('broadcaster', () => {
  it('should be an instance of event-emitter', () => {
    expect(broadcaster).toEqual(ee());
  });
});

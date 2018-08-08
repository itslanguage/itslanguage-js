/**
 * The tests for the acompanying `broadcaster.js` file.
 */

import broadcaster from './index';
import ee from 'event-emitter';


describe('broadcaster', () => {
  it('should be an instance of event-emitter', () => {
    expect(broadcaster).toEqual(ee());
  });
});

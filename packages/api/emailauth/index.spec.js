/**
 * The unit tests for the exported functions from `emailauth.js`.
 */

import * as communication from '../communication';
import * as emailauth from '.';


describe('emailauth', () => {
  describe('create', () => {
    it('should make an authorised request without passing userId', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      emailauth.create({ email: 'mark@starkindustries.marvel', password: 'captain_america_is_cool' })
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['POST', '/user/emailauths', {
            email: 'mark@starkindustries.marvel',
            password: 'captain_america_is_cool',
          }]);
          done();
        })
        .catch(done.fail);
    });

    it('should make an authorised request and passing userId', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      emailauth.create({ email: 'mark@starkindustries.marvel', password: 'captain_america_is_cool' }, 'mark')
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['POST', '/user/mark/emailauths', {
            email: 'mark@starkindustries.marvel',
            password: 'captain_america_is_cool',
          }]);
          done();
        })
        .catch(done.fail);
    });
  });
});

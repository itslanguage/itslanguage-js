/**
 * The unittests for the exported functions from `basicauth.js`.
 */

import * as basicauth from './index';
import * as communication from '../communication';


describe('basicauth', () => {
  describe('create', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

      basicauth.create({username: 'Mark', password: 'captain_america_is_cool'})
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['POST', '/user/basicauths', {
            username: 'Mark',
            password: 'captain_america_is_cool'
          }]);
          done();
        }, done.fail);
    });
  });
});

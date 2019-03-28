/**
 * The unit tests for the exported functions from `index.js`.
 */

import * as communication from '../../communication';
import * as feedback from './index';

describe('feedback Challenge API', () => {
  describe('create', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      feedback
        .create({
          challengeId: 'challenge12',
          errors: 1337,
        })
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();

          expect(createRequest.args).toEqual([
            'POST',
            '/feedback',
            {
              challengeId: 'challenge12',
              errors: 1337,
            },
          ]);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getById', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      feedback
        .getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/feedback/c4t']);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getAll', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      feedback
        .getAll()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/feedback']);
          done();
        })
        .catch(done.fail);
    });
  });
});

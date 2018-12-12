/**
 * The unit tests for the exported functions from `index.js`.
 */

import * as communication from '../../communication';
import * as pronunciation from './index';


describe('Pronunciation Challenge API', () => {
  describe('create', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      pronunciation.create({ question: 'poes?' })
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['POST', '/challenges/pronunciation', { question: 'poes?' }]);
          done();
        })
        .catch(done.fail);
    });
  });


  describe('getById', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      pronunciation.getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/challenges/pronunciation/c4t']);
          done();
        })
        .catch(done.fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      pronunciation.getAll()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/challenges/pronunciation']);
          done();
        })
        .catch(done.fail);
    });

    it('should allow filters if they are a URLSearchParams object', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      const filters = new URLSearchParams();
      filters.set('theme', 'm30w');

      pronunciation.getAll(filters)
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/challenges/pronunciation?theme=m30w']);
          done();
        })
        .catch(done.fail);
    });

    it('should reject when something other than URLSearchParams is given as the filters', (done) => {
      pronunciation.getAll('this is not an instance of URLSearchParams')
        .then(done.fail)
        .catch(() => {
          done();
        });
    });
  });


  describe('deleteChallenge', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      pronunciation.deleteChallenge('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['DELETE', '/challenges/pronunciation/c4t']);
          done();
        })
        .catch(done.fail);
    });
  });
});

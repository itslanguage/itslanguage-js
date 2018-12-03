/**
 * The unit tests for the exported functions from `progress.js`.
 */

import * as communication from '../communication';
import * as progress from '../..';


describe('progress', () => {
  describe('getById', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      progress.getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories/c4t/progress']);
          done();
        }, fail);
    });

    it('should add one group to the authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      progress.getById('c4t', ['fish'])
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories/c4t/progress?group=fish']);
          done();
        }, fail);
    });

    it('should add multiple groups to the authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      progress.getById('c4t', ['fish', 'fork', 'net'])
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories/c4t/progress?group=fish&group=fork&group=net']);
          done();
        }, fail);
    });

    it('should add a role to the authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      progress.getById('c4t', [], 'CAPTAIN_AMERICA')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories/c4t/progress?role=CAPTAIN_AMERICA']);
          done();
        }, fail);
    });

    it('should add a group and a role to the authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      progress.getById('c4t', ['fish'], 'CAPTAIN_AMERICA')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories/c4t/progress?group=fish&role=CAPTAIN_AMERICA']);
          done();
        }, fail);
    });

    it('should add multiple groups and a role to the authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      progress.getById('c4t', ['fish', 'fork', 'net'], 'CAPTAIN_AMERICA')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args)
            .toEqual(['GET', '/categories/c4t/progress?group=fish&group=fork&group=net&role=CAPTAIN_AMERICA']);
          done();
        }, fail);
    });
  });
});

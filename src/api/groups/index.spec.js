/**
 * The unittests for the exported functions from `groups.js`.
 */

import * as communication from '../communication';
import * as groups from './index';


describe('groups', () => {
  describe('create', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      groups.create({ name: 'poes' })
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['POST', '/groups', { name: 'poes' }]);
          done();
        }, fail);
    });
  });


  describe('getById', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      groups.getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/groups/c4t']);
          done();
        }, fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      groups.getAll()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/groups']);
          done();
        }, fail);
    });

    it('should allow filters if they are a URLSearchParams object', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      const filters = new URLSearchParams();
      filters.set('parent', 'd4ddyc4t');

      groups.getAll(filters)
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/groups?parent=d4ddyc4t']);
          done();
        }, fail);
    });

    it('should reject when something other than URLSearchParams is given as the filters', (done) => {
      groups.getAll('this is not an instance of URLSearchParams')
        .then(fail, done);
    });
  });
});

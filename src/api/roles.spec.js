/**
 * The unittests for the exported functions from `roles.js`.
 */

import * as communication from './communication';
import * as roles from './roles';


describe('roles', () => {
  describe('getById', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

      roles.getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/roles/c4t']);
          done();
        }, fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

      roles.getAll()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/roles']);
          done();
        }, fail);
    });

    it('should allow filters if they are a URLSearchParams object', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

      const filters = new URLSearchParams();
      filters.set('parent', 'd4ddyc4t');

      roles.getAll(filters)
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/roles?parent=d4ddyc4t']);
          done();
        }, fail);
    });

    it('should reject when something other than URLSearchParams is given as the filters', done => {
      roles.getAll('this is not an instance of URLSearchParams')
        .then(fail, done);
    });
  });
});

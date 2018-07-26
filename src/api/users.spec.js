/**
 * The unittests for the exported functions from `users.js`.
 */

import * as communication from './communication';
import * as users from './users';


describe('user', () => {
  describe('create', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

      users.create({name: 'poes'})
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['POST', '/users', {name: 'poes'}]);
          done();
        }, fail);
    });
  });

  describe('getCurrent', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

      users.getCurrent()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/user']);
          done();
        }, fail);
    });
  });

  describe('getById', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

      users.getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/users/c4t']);
          done();
        }, fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

      users.getAll()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/users']);
          done();
        }, fail);
    });

    it('should allow filters if they are a URLSearchParams object', done => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

      const filters = new URLSearchParams();
      filters.set('parent', 'd4ddyc4t');

      users.getAll(filters)
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/users?parent=d4ddyc4t']);
          done();
        }, fail);
    });

    it('should reject when something other than URLSearchParams is given as the filters', done => {
      users.getAll('this is not an instance of URLSearchParams')
        .then(fail, done);
    });
  });
});

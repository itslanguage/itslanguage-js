/**
 * The unit tests for the exported functions from `roles.js`.
 */

import * as communication from '../communication';
import * as tenants from '.';


describe('tenants', () => {
  describe('create', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      tenants.create({ id: 'demo', name: 'DEMO' })
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();

          expect(createRequest.args).toEqual(['POST', '/tenants', {
            id: 'demo',
            name: 'DEMO',
          }]);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getById', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      tenants.getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/tenants/c4t']);
          done();
        })
        .catch(done.fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      tenants.getAll()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/tenants']);
          done();
        })
        .catch(done.fail);
    });
  });
});

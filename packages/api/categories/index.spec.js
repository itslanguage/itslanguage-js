/**
 * The unit tests for the exported functions from `categories.js`.
 */

import * as categories from './index';
import * as communication from '../communication';


describe('categories', () => {
  describe('create', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      categories.create({ name: 'poes' })
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['POST', '/categories', { name: 'poes' }]);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('update', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      categories.update('c4t', { name: 'poes' })
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual(['PUT', '/categories/c4t', { name: 'poes' }]);
          done();
        })
        .catch(done.fail);
    });
  });


  describe('getById', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      categories.getById('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories/c4t']);
          done();
        })
        .catch(done.fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      categories.getAll()
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories']);
          done();
        })
        .catch(done.fail);
    });

    it('should allow filters if they are a URLSearchParams object', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      const filters = new URLSearchParams();
      filters.set('parent', 'd4ddyc4t');

      categories.getAll(filters)
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories?parent=d4ddyc4t']);
          done();
        })
        .catch(done.fail);
    });

    it('should reject when something other than URLSearchParams is given as the filters', (done) => {
      categories.getAll('this is not an instance of URLSearchParams')
        .then(done.fail)
        .catch(() => {
          done();
        });
    });
  });

  describe('getAllWithParentId', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      categories.getAllWithParentId('poes')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/categories/poes/categories']);
          done();
        })
        .catch(done.fail);
    });
  });
});

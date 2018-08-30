/**
 * The unittests for the exported functions from `recognition.js`.
 */

import * as recognition from './recognition';
import * as communication from '../../communication';

describe('Choice Recognition Challenge API', () => {
  describe('create', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      recognition.create('c4t', null, 'c4t')
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual([
            'POST',
            '/challenges/choice/c4t/recognitions',
            {
              audio: null,
              recognised: 'c4t',
            },
          ]);
          done();
        }, fail);
    });

    it('should make an authorised request and pass an ID', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      recognition.create('c4t', null, 'c4t', '123')
        .then(() => {
          const createRequest = authorisedRequestSpy.calls.mostRecent();
          expect(createRequest.args).toEqual([
            'POST',
            '/challenges/choice/c4t/recognitions',
            {
              id: '123',
              audio: null,
              recognised: 'c4t',
            },
          ]);
          done();
        }, fail);
    });
  });


  describe('getByID', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      recognition.getById('c4t', 'd0g')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/challenges/choice/c4t/recognitions/d0g']);
          done();
        }, fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      recognition.getAll('c4t')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();
          expect(getRequest.args).toEqual(['GET', '/challenges/choice/c4t/recognitions']);
          done();
        }, fail);
    });
  });
});

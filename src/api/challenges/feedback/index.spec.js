/**
 * The unittests for the exported functions from `index.js`.
 */

import * as communication from '../../communication';
import * as feedback from './index';


describe('createFeedback', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

    feedback.createFeedback({
      challengeId: 'challenge12',
      errors: 1337,
    })
      .then(() => {
        const createRequest = authorisedRequestSpy.calls.mostRecent();
        expect(createRequest.args).toEqual(['POST', '/feedback', {
          challengeId: 'challenge12',
          errors: 1337,
        }]);
        done();
      }, fail);
  });
});


describe('getFeedbackById', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

    feedback.getFeedbackById('c4t')
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/feedback/c4t']);
        done();
      }, fail);
  });
});


describe('getAllFeedback', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

    feedback.getAllFeedback()
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/feedback']);
        done();
      }, fail);
  });
});

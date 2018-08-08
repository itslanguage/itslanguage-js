/**
 * The unittests for the exported functions from `index.js`.
 */

import * as communication from '../../communication';
import * as speech from './index';


describe('createSpeechChallenge', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

    speech.createSpeechChallenge({ question: 'poes?' })
      .then(() => {
        const createRequest = authorisedRequestSpy.calls.mostRecent();
        expect(createRequest.args).toEqual(['POST', '/challenges/speech', { question: 'poes?' }]);
        done();
      }, fail);
  });
});


describe('getSpeechChallengeByID', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

    speech.getSpeechChallengeByID('c4t')
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/speech/c4t']);
        done();
      }, fail);
  });
});


describe('getAllSpeechChallenges', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

    speech.getAllSpeechChallenges()
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/speech']);
        done();
      }, fail);
  });

  it('should allow filters if they are a URLSearchParams object', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

    const filters = new URLSearchParams();
    filters.set('theme', 'm30w');

    speech.getAllSpeechChallenges(filters)
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/speech?theme=m30w']);
        done();
      }, fail);
  });

  it('should reject when something other than URLSearchParams is given as the filters', (done) => {
    speech.getAllSpeechChallenges('this is not an instance of URLSearchParams')
      .then(fail, done);
  });
});

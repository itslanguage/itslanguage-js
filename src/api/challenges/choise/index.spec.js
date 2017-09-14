/**
 * The unittests for the exported functions from `index.js`.
 */

import * as choice from './choice';
import * as communication from '../../communication';


describe('createChoiceChallenge', () => {
  it('should make an authorised request', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

    choice.createChoiceChallenge({question: 'poes?'})
      .then(() => {
        const createRequest = authorisedRequestSpy.calls.mostRecent();
        expect(createRequest.args).toEqual(['POST', '/challenges/choice', {question: 'poes?'}]);
        done();
      }, fail);
  });
});


describe('getChoiceChallengeByID', () => {
  it('should make an authorised request', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

    choice.getChoiceChallengeByID('c4t')
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/choice/c4t']);
        done();
      }, fail);
  });
});


describe('getAllChoiceChallenges', () => {
  it('should make an authorised request', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

    choice.getAllChoiceChallenges()
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/choice']);
        done();
      }, fail);
  });

  it('should allow filters if they are a URLSearchParams object', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

    const filters = new URLSearchParams();
    filters.set('theme', 'm30w');

    choice.getAllChoiceChallenges(filters)
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/choice?theme=m30w']);
        done();
      }, fail);
  });

  it('should reject when something other than URLSearchParams is given as the filters', done => {
    choice.getAllChoiceChallenges('this is not an instance of URLSearchParams')
      .then(fail, done);
  });
});

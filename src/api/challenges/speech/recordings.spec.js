/**
 * The unittests for the exported functions from `recordings.js`.
 */

import * as communication from '../../communication';
import * as recordings from './recordings';


describe('getrecordingsRecordingByID', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

    recordings.getSpeechRecordingByID('ch4', 'r3c')
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/speech/ch4/recordings/r3c']);
        done();
      }, fail);
  });
});


describe('getAllrecordingsRecordings', () => {
  it('should make an authorised request', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'r3c' }]));

    recordings.getAllSpeechRecordings('ch4')
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/speech/ch4/recordings']);
        done();
      }, fail);
  });

  it('should allow filters if they are a URLSearchParams object', (done) => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

    const filters = new URLSearchParams();
    filters.set('theme', 'm30w');

    recordings.getAllSpeechRecordings('ch4', filters)
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/challenges/speech/ch4/recordings?theme=m30w']);
        done();
      }, fail);
  });

  it('should reject when something other than URLSearchParams is given as the filters', (done) => {
    recordings.getAllSpeechRecordings('ch4', 'this is not an instance of URLSearchParams')
      .then(done.fail)
      .catch(() => {
        done();
      });
  });
});


describe('createSpeechRecording', () => {

});

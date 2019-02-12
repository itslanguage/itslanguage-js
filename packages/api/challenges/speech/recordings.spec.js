/**
 * The unit tests for the exported functions from `recordings.js`.
 */

import * as communication from '../../communication';
import * as recordings from './recordings';
import * as websocket from '../../communication/websocket';
import * as utils from '../../utils/audio-over-socket';

describe('Speech Challenge Recording API', () => {
  describe('getById', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      recordings.getById('ch4', 'r3c')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/challenges/speech/ch4/recordings/r3c']);
          done();
        })
        .catch(done.fail);
    });
  });


  describe('getAll', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'r3c' }]));

      recordings.getAll('ch4')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/challenges/speech/ch4/recordings']);
          done();
        })
        .catch(done.fail);
    });

    it('should allow filters if they are a URLSearchParams object', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve([{ id: 'c4t' }]));

      const filters = new URLSearchParams();
      filters.set('theme', 'm30w');

      recordings.getAll('ch4', filters)
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/challenges/speech/ch4/recordings?theme=m30w']);
          done();
        })
        .catch(done.fail);
    });

    it('should reject when something other than URLSearchParams is given as the filters', (done) => {
      recordings.getAll('ch4', 'this is not an instance of URLSearchParams')
        .then(done.fail)
        .catch(() => {
          done();
        });
    });
  });

  describe('record', () => {
    let makeWebsocketCallSpy;
    let encodeAndSendAudioOnDataAvailableSpy;
    let prepareServerForAudioSpy;
    let recorderStub;

    beforeEach(() => {
      makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      encodeAndSendAudioOnDataAvailableSpy = spyOn(utils, 'encodeAndSendAudioOnDataAvailable');
      encodeAndSendAudioOnDataAvailableSpy.and.returnValue(new Promise(resolve => resolve()));

      prepareServerForAudioSpy = spyOn(utils, 'prepareServerForAudio');
      prepareServerForAudioSpy.and.returnValue(new Promise(resolve => resolve()));

      recorderStub = jasmine.createSpyObj('Recorder', ['addEventListener']);
      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback({
          data: new Blob(
            ['Knees weak, arms are heavy.'],
            { type: 'text/plain' },
          ),
        });
      });
    });

    it('should record some data', (done) => {
      recordings.record('challengeId', recorderStub)
        .then(() => {
          expect(makeWebsocketCallSpy).toHaveBeenCalledTimes(3);
          expect(prepareServerForAudioSpy).toHaveBeenCalledTimes(1);
          expect(encodeAndSendAudioOnDataAvailableSpy).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(done.fail);
    });
  });
});

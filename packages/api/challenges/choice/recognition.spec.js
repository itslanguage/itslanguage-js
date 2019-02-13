/**
 * The unit tests for the exported functions from `recognition.js`.
 */

import * as recognition from './recognition';
import * as communication from '../../communication';
import * as websocket from '../../communication/websocket';
import * as utils from '../../utils/audio-over-socket';

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
        })
        .catch(done.fail);
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
        })
        .catch(done.fail);
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
        })
        .catch(done.fail);
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
        })
        .catch(done.fail);
    });
  });


  describe('prepare', () => {
    it('should call choice.init_recognition', (done) => {
      const makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      recognition.prepare()
        .then(() => {
          expect(makeWebsocketCallSpy).toHaveBeenCalledWith('choice.init_recognition');
          done();
        })
        .catch(done.fail);
    });
  });


  describe('prepareChallenge', () => {
    it('should call choice.init_challenge with recognitionId and challengeId', (done) => {
      const makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      recognition.prepareChallenge('recognitionId', 'challengeId')
        .then(() => {
          expect(makeWebsocketCallSpy)
            .toHaveBeenCalledWith('choice.init_challenge', {
              args: ['recognitionId', 'challengeId'],
            });
          done();
        })
        .catch(done.fail);
    });
  });


  describe('recogniseAudioStream', () => {
    it('should call choice.recognise', (done) => {
      const makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      const registerStreamForRecorderSpy = spyOn(utils, 'registerStreamForRecorder');
      registerStreamForRecorderSpy.and.returnValue(new Promise((resolve) => {
        resolve({
          procedure: 'fakeProcedure',
        });
      }));

      recognition.recogniseAudioStream('recognitionId', 'nothing')
        .then(() => {
          expect(makeWebsocketCallSpy)
            .toHaveBeenCalledWith('choice.recognise', { args: ['recognitionId', 'fakeProcedure'] });
          done();
        })
        .catch(done.fail);
    });
  });


  describe('recognise', () => {
    let makeWebsocketCallSpy;
    let registerStreamForRecorderSpy;

    beforeEach(() => {
      makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      registerStreamForRecorderSpy = spyOn(utils, 'registerStreamForRecorder');
      registerStreamForRecorderSpy.and.returnValue(new Promise((resolve) => {
        resolve({
          procedure: 'fakeProcedure',
        });
      }));
    });

    it('should return a promise', () => {
      expect(recognition.recognise('', null) instanceof Promise).toBeTruthy();
    });

    it('should call all the needed functions', (done) => {
      recognition.recognise('challengeId', 'noRecorder')
        .then(() => {
          expect(makeWebsocketCallSpy).toHaveBeenCalledTimes(3);
          expect(registerStreamForRecorderSpy).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(done.fail);
    });
  });
});

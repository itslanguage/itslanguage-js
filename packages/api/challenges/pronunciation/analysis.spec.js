/**
 * The unit tests for the exported functions from `analysis.js`.
 */

import * as analysis from './analysis';
import * as communication from '../../communication';
import * as websocket from '../../communication/websocket';
import * as utils from '../../utils/audio-over-socket';

describe('Pronunciation Analysis Challenge Recording API', () => {
  describe('getById', () => {
    it('should make an authorised request', (done) => {
      const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
      authorisedRequestSpy.and.returnValue(Promise.resolve({ id: 'c4t' }));

      analysis.getById('ch4', 'r3c')
        .then(() => {
          const getRequest = authorisedRequestSpy.calls.mostRecent();

          expect(getRequest.args).toEqual(['GET', '/challenges/pronunciation/ch4/analyses/r3c']);
          done();
        })
        .catch(done.fail);
    });
  });


  describe('prepare', () => {
    it('should call pronunciation.init_analysis', (done) => {
      const makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      analysis.prepare()
        .then(() => {
          expect(makeWebsocketCallSpy).toHaveBeenCalledWith('pronunciation.init_analysis');
          done();
        })
        .catch(done.fail);
    });
  });


  describe('prepareChallenge', () => {
    it('should call pronunciation.init_challenge with analysisId and challengeId', (done) => {
      const makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      analysis.prepareChallenge('analysisId', 'challengeId')
        .then(() => {
          expect(makeWebsocketCallSpy)
            .toHaveBeenCalledWith('pronunciation.init_challenge', {
              args: ['analysisId', 'challengeId'],
            });
          done();
        })
        .catch(done.fail);
    });
  });


  describe('alignChallenge', () => {
    it('should call pronunciation.alignment with analysisId', (done) => {
      const makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));

      analysis.alignChallenge('analysisId')
        .then(() => {
          expect(makeWebsocketCallSpy)
            .toHaveBeenCalledWith('pronunciation.alignment', {
              args: ['analysisId'],
            });
          done();
        })
        .catch(done.fail);
    });
  });


  describe('prepareAudio', () => {
    let recorderStub;
    let makeWebsocketCallSpy;

    const audioSpecs = {
      audioFormat: 'audio/wave',
      audioParameters: {
        channels: 1,
        sampleWidth: 16,
        frameRate: 48000,
        sampleRate: 48000,
      },
    };

    beforeEach(() => {
      recorderStub = jasmine.createSpyObj('Recorder', ['getAudioSpecs']);
      makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');

      recorderStub.getAudioSpecs.and.returnValue(audioSpecs);
      makeWebsocketCallSpy.and.returnValue(new Promise(resolve => resolve()));
    });


    it('should call pronunciation.init_audio with audio specs', (done) => {
      analysis.prepareAudio('analysisId', recorderStub)
        .then(() => {
          expect(makeWebsocketCallSpy)
            .toHaveBeenCalledWith('pronunciation.init_audio', {
              args: ['analysisId', 'audio/wave'],
              kwargs: audioSpecs.audioParameters,
            });
          done();
        })
        .catch(done.fail);
    });
  });

  describe('streamAudio', () => {
    it('should call to encodeAndSendAudioOnDataAvailable with analyseId and a recorder', (done) => {
      const encodeAndSendAudioOnDataAvailableSpy = spyOn(utils, 'encodeAndSendAudioOnDataAvailable');
      encodeAndSendAudioOnDataAvailableSpy.and.returnValue(Promise.resolve());

      analysis.streamAudio('analyseId', 'noRecorder')
        .then(() => {
          expect(encodeAndSendAudioOnDataAvailableSpy)
            .toHaveBeenCalledWith('analyseId', 'noRecorder', 'pronunciation.write');
          done();
        })
        .catch(done.fail);
    });
  });


  describe('endStreamAudio', () => {
    it('should call pronunciation.analyse with analysisId and progressCb', (done) => {
      const makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
      makeWebsocketCallSpy.and.returnValue(Promise.resolve());

      analysis.endStreamAudio('analyseId', 'progressCb')
        .then(() => {
          expect(makeWebsocketCallSpy)
            .toHaveBeenCalledWith('pronunciation.analyse', {
              args: ['analyseId'],
              progressCb: 'progressCb',
            });
          done();
        })
        .catch(done.fail);
    });
  });
});

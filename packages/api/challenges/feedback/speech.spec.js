/**
 * The unit tests for the exported functions from `speech.js`.
 */

import * as speech from './speech';
import * as websocket from '../../communication/websocket';
import * as utils from '../../utils/audio-over-socket';

describe('Feedback Speech Challenge API', () => {
  let makeWebsocketCallSpy;
  let registerStreamForRecorderSpy;
  let progressCbSpy;

  beforeEach(() => {
    makeWebsocketCallSpy = spyOn(websocket, 'makeWebsocketCall');
    makeWebsocketCallSpy.and.returnValue(Promise.resolve());

    registerStreamForRecorderSpy = spyOn(utils, 'registerStreamForRecorder');
    registerStreamForRecorderSpy.and.returnValue(Promise.resolve({
      procedure: 'registration.procedure',
    }));

    progressCbSpy = jasmine.createSpy('progressCb');
  });

  describe('prepare', () => {
    it('should call feedback.prepare with challengeId', (done) => {
      speech.prepare('challengeId').then(() => {
        expect(makeWebsocketCallSpy)
          .toHaveBeenCalledWith('feedback.prepare', {
            args: ['challengeId'],
          });
        done();
      }).catch(done.fail);
    });
  });


  describe('listenAndReply', () => {
    it('should call registerStreamForRecorder with recorder and rpcNameToRegister', (done) => {
      speech.listenAndReply('feedbackId', progressCbSpy, 'recorder').then(() => {
        expect(registerStreamForRecorderSpy)
          .toHaveBeenCalledWith('recorder', jasmine.stringMatching('feedback.stream.'));
        done();
      }).catch(done.fail);
    });

    it('should call feedback.listen_and_reply with feedbackId, registration.procedure and progressCb', (done) => {
      speech.listenAndReply('feedbackId', progressCbSpy, 'recorder').then(() => {
        expect(makeWebsocketCallSpy)
          .toHaveBeenCalledWith(
            'feedback.listen_and_reply', {
              args: ['feedbackId', 'registration.procedure'],
              progressCb: jasmine.anything(),
            },
          );
        done();
      }).catch(done.fail);
    });
  });


  describe('pause', () => {
    it('should call feedback.pause with feedbackId', (done) => {
      speech.pause('feedbackId').then(() => {
        expect(makeWebsocketCallSpy)
          .toHaveBeenCalledWith('feedback.pause', {
            args: ['feedbackId'],
          });
        done();
      }).catch(done.fail);
    });
  });


  describe('resume', () => {
    it('should call feedback.resume with feedbackId and sentence 0', (done) => {
      speech.resume('feedbackId').then(() => {
        expect(makeWebsocketCallSpy)
          .toHaveBeenCalledWith('feedback.resume', {
            args: ['feedbackId', 0],
          });
        done();
      }).catch(done.fail);
    });

    it('should call feedback.resume with feedbackId and sentence 10', (done) => {
      speech.resume('feedbackId', 10).then(() => {
        expect(makeWebsocketCallSpy)
          .toHaveBeenCalledWith('feedback.resume', {
            args: ['feedbackId', 10],
          });
        done();
      }).catch(done.fail);
    });
  });


  describe('feedback', () => {
    it('should return a promise', () => {
      expect(speech.feedback() instanceof Promise).toBeTruthy();
    });

    it('should call feedback.prepare with challengeId', (done) => {
      speech.feedback('challengeId', progressCbSpy, 'recorder')
        .then(() => {
          expect(makeWebsocketCallSpy)
            .toHaveBeenCalledWith('feedback.prepare', {
              args: ['challengeId'],
            });
          done();
        }).catch(done.fail);
    });
  });
});

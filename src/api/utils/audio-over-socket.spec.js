/**
 * The unit tests for the exported functions from `audio-over-socket.js`.
 */

import * as aos from './audio-over-socket';
import * as communication from '../communication/websocket';
import * as utils from './index';
import broadcaster from '../broadcaster';


describe('encodeAndSendAudioOnDataAvailable', () => {
  let recorderStub;
  let makeWebsocketCallSpy;
  let dataToBase64Spy;

  beforeEach(() => {
    recorderStub = jasmine.createSpyObj('Recorder', ['addEventListener']);
    makeWebsocketCallSpy = spyOn(communication, 'makeWebsocketCall');
    dataToBase64Spy = spyOn(utils, 'dataToBase64');
  });

  it('should send the data when the recorder fires the event', (done) => {
    dataToBase64Spy.and.returnValue('There\'s vomit on his sweater already, mom\'s spaghetti');
    makeWebsocketCallSpy.and.returnValue(Promise.resolve('He\'s nervous, but on the surface he looks calm and ready'));
    recorderStub.addEventListener.and.callFake((event, callback) => {
      // Pretend as if the event has been fired and thus call the callback.
      callback('Knees weak, arms are heavy.');
    });

    aos.encodeAndSendAudioOnDataAvailable('r353rv3d1d', recorderStub, 'his.palms.are.sweaty')
      .then((result) => {
        expect(makeWebsocketCallSpy).toHaveBeenCalledWith(
          'his.palms.are.sweaty',
          {
            args: [
              'r353rv3d1d',
              'There\'s vomit on his sweater already, mom\'s spaghetti',
              'base64',
            ],
          },
        );
        expect(result).toEqual('He\'s nervous, but on the surface he looks calm and ready');
        done();
      }, fail);
  });

  it('should reject if the `makeWebsocketCall` rejected', (done) => {
    dataToBase64Spy.and.returnValue('There\'s vomit on his sweater already, mom\'s spaghetti');
    makeWebsocketCallSpy.and.returnValue(Promise.reject((
      new Error('Websocket server has received and rejected the call.')
    )));
    recorderStub.addEventListener.and.callFake((event, callback) => {
      // Pretend as if the event has been fired and thus call the callback.
      callback('Knees weak, arms are heavy.');
    });

    aos.encodeAndSendAudioOnDataAvailable('r353rv3d1d', recorderStub, 'his.palms.are.sweaty')
      .then(fail, ({ message }) => {
        expect(makeWebsocketCallSpy).toHaveBeenCalledWith(
          'his.palms.are.sweaty',
          {
            args: [
              'r353rv3d1d',
              'There\'s vomit on his sweater already, mom\'s spaghetti',
              'base64',
            ],
          },
        );
        expect(message).toBe('Websocket server has received and rejected the call.');
        done();
      }, fail);
  });
});


describe('prepareServerForAudio', () => {
  let recorderStub;
  let makeWebsocketCallSpy;
  let broadcasterSpy;

  beforeEach(() => {
    recorderStub = jasmine.createSpyObj('Recorder', ['getAudioSpecs']);
    makeWebsocketCallSpy = spyOn(communication, 'makeWebsocketCall');
    broadcasterSpy = spyOn(broadcaster, 'emit');
  });

  it('should broadcast when the websocket server has successfully been prepped and resolve in the reserved ID', (done) => {
    recorderStub.getAudioSpecs.and.returnValue({
      audioFormat: 'audio/ogg',
      audioParameters: {
        bitrate: 9001,
      },
    });
    makeWebsocketCallSpy.and.returnValue((
      Promise.resolve('Websocket server has received and handled the call.')
    ));

    aos.prepareServerForAudio('r353rv3d1d', recorderStub, 'write.this.down.kiddo')
      .then((result) => {
        expect(makeWebsocketCallSpy).toHaveBeenCalledWith(
          'write.this.down.kiddo',
          {
            args: ['r353rv3d1d', 'audio/ogg'],
            kwargs: {
              bitrate: 9001,
            },
          },
        );
        expect(result).toEqual('r353rv3d1d');
        expect(broadcasterSpy).toHaveBeenCalledWith('websocketserverreadyforaudio');
        done();
      }, fail);
  });

  it('should reject if the `makeWebsocketCall` rejected', (done) => {
    recorderStub.getAudioSpecs.and.returnValue({
      audioFormat: 'audio/ogg',
      audioParameters: {
        bitrate: 9001,
      },
    });
    makeWebsocketCallSpy.and.returnValue(Promise.reject((
      new Error('Websocket server has received and rejected the call.')
    )));

    aos.prepareServerForAudio('r353rv3d1d', recorderStub, 'write.this.down.kiddo')
      .then(fail, () => {
        expect(makeWebsocketCallSpy).toHaveBeenCalledWith(
          'write.this.down.kiddo',
          {
            args: ['r353rv3d1d', 'audio/ogg'],
            kwargs: {
              bitrate: 9001,
            },
          },
        );
        done();
      });
  });
});


describe('waitForUserMediaApproval', () => {
  let recorderStub;

  beforeEach(() => {
    recorderStub = jasmine.createSpyObj('Recorder', ['hasUserMediaApproval', 'addEventListener']);
  });

  it('should resolve with the reserved ID when the recorder already has user approval', (done) => {
    recorderStub.hasUserMediaApproval.and.returnValue(true);

    aos.waitForUserMediaApproval('r353rv3d1d', recorderStub)
      .then((result) => {
        expect(result).toEqual('r353rv3d1d');
        done();
      }, fail);
  });

  it('should await the user\'s approval', (done) => {
    recorderStub.hasUserMediaApproval.and.returnValue(false);
    recorderStub.addEventListener.and.callFake((event, callback) => {
      // Pretend as if the event has been fired and thus call the callback.
      callback();
    });

    aos.waitForUserMediaApproval('r353rv3d1d', recorderStub)
      .then((result) => {
        expect(result).toEqual('r353rv3d1d');
        done();
      }, fail);
  });

  it('should reject if the user does not allow to record', (done) => {
    const error = new Error('The user does not want to be recorded.');
    recorderStub.hasUserMediaApproval.and.returnValue(false);
    recorderStub.addEventListener.and.callFake(() => {
      throw error;
    });

    aos.waitForUserMediaApproval('r353rv3d1d', recorderStub)
      .then(fail, (result) => {
        expect(result).toBe(error);
        done();
      });
  });
});

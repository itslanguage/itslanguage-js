/**
 * The unit tests for the exported functions from `audio-over-socket.js`.
 */

import autobahn from 'autobahn';
import * as aos from './audio-over-socket';
import { settings } from '../communication';
import * as communication from '../communication/websocket';
import * as utils from '.';
import broadcaster from '../broadcaster';

describe('Audio Over socket', () => {
  beforeEach(() => {
    // Make sure we have enough time to complete some tests.
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  beforeAll(() => {
    settings.wsUrl = 'wss://fake.ws.url';
  });

  describe('registerStreamForRecorder', () => {
    const rpcName = 'rpcName';
    let recorderStub;
    let connectionOpenSpy;
    let connectionSessionStub;

    beforeEach(() => {
      recorderStub = jasmine.createSpyObj('Recorder', ['addEventListener']);

      spyOn(autobahn.Connection.prototype, 'close');
      connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
      connectionSessionStub = jasmine.createSpyObj('Session', ['call', 'register', 'unregister']);
      connectionSessionStub.call.and.callFake(() => {
        // eslint-disable-next-line new-cap
        const defer = new autobahn.when.defer();
        defer.resolve();
        return defer.promise;
      });

      connectionSessionStub.register.and.callFake((...args) => {
        const [rpc, callback] = args;

        return Promise.resolve({
          id: '123',
          rpc,
          callback,
        });
      });

      connectionSessionStub.unregister.and.returnValue(Promise.resolve());

      // We cannot use arrow functions because of this scope.
      connectionOpenSpy.and.callFake(function () { // eslint-disable-line func-names
        // This property is returned through the session "property" of a
        // connection instance. Sadly only the get is defined with the
        // `Object.defineProperty` which forces us to mock the internals.
        this._session = connectionSessionStub; // eslint-disable-line no-underscore-dangle
        this.onopen();
      });
    });

    it('should register an RPC call named nl.itslanguage.rpcName', (done) => {
      aos.registerStreamForRecorder(recorderStub, rpcName)
        .then((result) => {
          expect(result.rpc).toEqual(`nl.itslanguage.${rpcName}`);
          done();
        })
        .catch(done.fail);
    });

    it('should emit websocketserverreadyforaudio when ready to receive audio', (done) => {
      const broadcastSpy = spyOn(broadcaster, 'emit');
      aos.registerStreamForRecorder(recorderStub, rpcName)
        .then(() => {
          expect(broadcastSpy).toHaveBeenCalledWith('websocketserverreadyforaudio');
          done();
        })
        .catch(done.fail);
    });

    it('should stream audio to the backend', (done) => {
      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback({
          data: new Blob(
            ['Knees weak, arms are heavy.'],
            { type: 'text/plain' },
          ),
        });
      });

      aos.registerStreamForRecorder(recorderStub, rpcName)
        .then((result) => {
          const detailsSpy = jasmine.createSpyObj('details', ['progress']);
          result.callback([], {}, detailsSpy).then(() => {
            // eslint-disable-next-line jasmine/prefer-toHaveBeenCalledWith
            expect(detailsSpy.progress).toHaveBeenCalled();
          }).catch(done.fail);
          done();
        })
        .catch(done.fail);
    });

    it('should not stream audio if the progress function does not exist', (done) => {
      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback({
          data: new Blob(
            ['Knees weak, arms are heavy.'],
            { type: 'text/plain' },
          ),
        });
      });

      aos.registerStreamForRecorder(recorderStub, rpcName)
        .then((result) => {
          const detailsSpy = jasmine.createSpy('details');
          result.callback([], {}, detailsSpy).then(() => {
            expect(detailsSpy.progress).not.toHaveBeenCalled();
          }).catch(done.fail);
          done();
        })
        .catch(done.fail);
    });

    it('should only resolve on the last chunk', (done) => {
      let dataavailableCallback = null;
      let stopCallback = null;
      const blob = {
        data: new Blob(
          ['Knees weak, arms are heavy.'],
          { type: 'text/plain' },
        ),
      };

      recorderStub.addEventListener.and.callFake((event, callback) => {
        switch (event) {
          case 'dataavailable':
            dataavailableCallback = callback;
            break;
          case 'stop':
            stopCallback = callback;
            break;
          default:
            break;
        }
      });

      aos.registerStreamForRecorder(recorderStub, rpcName)
        .then((result) => {
          const detailsSpy = jasmine.createSpyObj('details', ['progress']);
          result.callback([], {}, detailsSpy)
            .then(() => {
              expect(detailsSpy.progress).toHaveBeenCalledTimes(2);
              done();
            })
            .catch(done.fail);

          dataavailableCallback(blob);

          // We need to wait a bit before we can send the rest.
          setTimeout(() => {
            // Send the stop event
            stopCallback();

            // Send the final chunk!
            dataavailableCallback(blob);
          }, 1000);
        })
        .catch(done.fail);
    });
  });

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
        callback({
          data: new Blob(
            ['Knees weak, arms are heavy.'],
            { type: 'text/plain' },
          ),
        });
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
        })
        .catch(done.fail);
    });

    it('should reject if the `makeWebsocketCall` rejected', (done) => {
      dataToBase64Spy.and.returnValue('There\'s vomit on his sweater already, mom\'s spaghetti');
      makeWebsocketCallSpy.and.returnValue(Promise.reject((
        new Error('Websocket server has received and rejected the call.')
      )));
      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback({
          data: new Blob(
            ['Knees weak, arms are heavy.'],
            { type: 'text/plain' },
          ),
        });
      });

      aos.encodeAndSendAudioOnDataAvailable('r353rv3d1d', recorderStub, 'his.palms.are.sweaty')
        .then(done.fail)
        .catch(({ message }) => {
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
        })
        .catch(done.fail);
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
        })
        .catch(done.fail);
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
        .then(done.fail)
        .catch(() => {
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
});

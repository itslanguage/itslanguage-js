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
      recorderStub = jasmine.createSpyObj('Recorder', [
        'addEventListener',
        'removeEventListener',
        'dispatchEvent',
      ]);

      spyOn(autobahn.Connection.prototype, 'close');
      connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
      connectionSessionStub = jasmine.createSpyObj('Session', [
        'call',
        'register',
        'unregister',
      ]);
      connectionSessionStub.call.and.callFake(() => {
        // eslint-disable-next-line new-cap
        const defer = new autobahn.when.defer();
        defer.resolve();
        return defer.promise;
      });

      connectionSessionStub.registrations = [];

      connectionSessionStub.register.and.callFake((...args) => {
        const [rpc, callback] = args;
        const registration = {
          id: '123',
          rpc,
          callback,
        };
        connectionSessionStub.registrations.push(registration);
        return Promise.resolve(registration);
      });

      connectionSessionStub.unregister.and.callFake((...args) => {
        const [registration] = args;
        const { registrations } = connectionSessionStub;
        registrations.splice(
          registrations.findIndex(reg => reg.id === registration.id),
          1,
        );
        return Promise.resolve();
      });

      // We cannot use arrow functions because of `this` scope.
      // eslint-disable-next-line func-names
      connectionOpenSpy.and.callFake(function() {
        // This property is returned through the session "property" of a
        // connection instance. Sadly only the get is defined with the
        // `Object.defineProperty` which forces us to mock the internals.
        this._session = connectionSessionStub; // eslint-disable-line no-underscore-dangle
        this.onopen();
      });
    });

    it('should register an RPC call named nl.itslanguage.rpcName', async () => {
      await expectAsync(
        aos.registerStreamForRecorder(recorderStub, rpcName),
      ).toBeResolvedTo({
        id: '123',
        rpc: `nl.itslanguage.${rpcName}`,
        callback: jasmine.any(Function),
      });
    });

    it('should remove a previously registered RCP', async () => {
      const reg = {
        id: '456',
        rpc: `nl.itslanguage.${rpcName}`,
        callback: Function,
      };

      connectionSessionStub.registrations = [reg];
      await aos.registerStreamForRecorder(recorderStub, rpcName);

      expect(connectionSessionStub.registrations.length).toBe(1);
    });

    it('should emit websocketserverreadyforaudio when ready to receive audio', async () => {
      const broadcastSpy = spyOn(broadcaster, 'emit');

      await aos.registerStreamForRecorder(recorderStub, rpcName);

      expect(broadcastSpy).toHaveBeenCalledWith('websocketserverreadyforaudio');
    });

    it('should stream audio to the backend', async () => {
      const data = {
        data: new Blob(['Knees weak, arms are heavy.'], { type: 'text/plain' }),
      };

      // Make sure to convert the data to what is actually being sent to the backend: an array
      // with integers.
      const arrayBuffer = await utils.asyncBlobToArrayBuffer(data.data);
      const intArray = Array.from(new Uint8Array(arrayBuffer));

      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback(data);
      });

      const result = await aos.registerStreamForRecorder(recorderStub, rpcName);

      const detailsSpy = jasmine.createSpyObj('details', ['progress']);
      await result.callback([], {}, detailsSpy);

      expect(detailsSpy.progress).toHaveBeenCalledWith([intArray]);
    });

    it('should not stream audio if the progress function does not exist', async () => {
      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback({
          data: new Blob(['Knees weak, arms are heavy.'], {
            type: 'text/plain',
          }),
        });
      });

      const result = await aos.registerStreamForRecorder(recorderStub, rpcName);

      await expectAsync(result.callback([], {}, {})).toBeRejectedWith(
        'no progress function registered',
      );
    });

    it('should only resolve on the last chunk', async () => {
      let dataavailableCallback = null;
      let stopCallback = null;
      const blob = {
        data: new Blob(['Knees weak, arms are heavy.'], { type: 'text/plain' }),
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

      const result = await aos.registerStreamForRecorder(recorderStub, rpcName);
      const detailsSpy = jasmine.createSpyObj('details', ['progress']);
      result.callback([], {}, detailsSpy);

      dataavailableCallback(blob);

      // We need to wait a bit before we can send the rest.
      setTimeout(async () => {
        // Send the stop event
        stopCallback();

        // Send the final chunk!
        dataavailableCallback(blob);
      }, 1000);

      await result.callback([], {}, detailsSpy);

      expect(detailsSpy.progress).toHaveBeenCalledTimes(2);
    });
  });

  describe('encodeAndSendAudioOnDataAvailable', () => {
    let recorderStub;
    let makeWebsocketCallSpy;
    let dataToBase64Spy;

    beforeEach(() => {
      recorderStub = jasmine.createSpyObj('Recorder', [
        'addEventListener',
        'removeEventListener',
        'dispatchEvent',
      ]);
      makeWebsocketCallSpy = spyOn(communication, 'makeWebsocketCall');
      dataToBase64Spy = spyOn(utils, 'dataToBase64');
    });

    it('should send the data when the recorder fires the event', async () => {
      dataToBase64Spy.and.returnValue(
        "There's vomit on his sweater already, mom's spaghetti",
      );
      makeWebsocketCallSpy.and.returnValue(
        Promise.resolve(
          "He's nervous, but on the surface he looks calm and ready",
        ),
      );
      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback({
          data: new Blob(['Knees weak, arms are heavy.'], {
            type: 'text/plain',
          }),
        });
      });

      const result = await aos.encodeAndSendAudioOnDataAvailable(
        'r353rv3d1d',
        recorderStub,
        'his.palms.are.sweaty',
      );

      expect(makeWebsocketCallSpy).toHaveBeenCalledWith(
        'his.palms.are.sweaty',
        {
          args: [
            'r353rv3d1d',
            "There's vomit on his sweater already, mom's spaghetti",
            'base64',
          ],
        },
      );

      expect(result).toEqual(
        "He's nervous, but on the surface he looks calm and ready",
      );
    });

    it('should reject if the `makeWebsocketCall` rejected', async () => {
      dataToBase64Spy.and.returnValue(
        "There's vomit on his sweater already, mom's spaghetti",
      );
      makeWebsocketCallSpy.and.returnValue(
        Promise.reject(
          new Error('Websocket server has received and rejected the call.'),
        ),
      );
      recorderStub.addEventListener.and.callFake((event, callback) => {
        // Pretend as if the event has been fired and thus call the callback.
        callback({
          data: new Blob(['Knees weak, arms are heavy.'], {
            type: 'text/plain',
          }),
        });
      });

      try {
        await aos.encodeAndSendAudioOnDataAvailable(
          'r353rv3d1d',
          recorderStub,
          'his.palms.are.sweaty',
        );
        fail('encodeAndSendAudioOnDataAvailable should have failed');
      } catch ({ message }) {
        expect(message).toBe(
          'Websocket server has received and rejected the call.',
        );

        expect(makeWebsocketCallSpy).toHaveBeenCalledWith(
          'his.palms.are.sweaty',
          {
            args: [
              'r353rv3d1d',
              "There's vomit on his sweater already, mom's spaghetti",
              'base64',
            ],
          },
        );
      }
    });
  });

  describe('prepareServerForAudio', () => {
    let recorderStub;
    let makeWebsocketCallSpy;
    let broadcasterSpy;

    beforeEach(() => {
      recorderStub = jasmine.createSpyObj('Recorder', [
        'getAudioSpecs',
        'dispatchEvent',
      ]);
      makeWebsocketCallSpy = spyOn(communication, 'makeWebsocketCall');
      broadcasterSpy = spyOn(broadcaster, 'emit');
    });

    it('should broadcast when the websocket server has successfully been prepped and resolve in the reserved ID', async () => {
      recorderStub.getAudioSpecs.and.returnValue({
        audioFormat: 'audio/ogg',
        audioParameters: {
          bitrate: 9001,
        },
      });
      makeWebsocketCallSpy.and.returnValue(
        Promise.resolve('Websocket server has received and handled the call.'),
      );

      const result = await aos.prepareServerForAudio(
        'r353rv3d1d',
        recorderStub,
        'write.this.down.kiddo',
      );

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

      expect(broadcasterSpy).toHaveBeenCalledWith(
        'websocketserverreadyforaudio',
      );
    });

    it('should reject if the `makeWebsocketCall` rejected', async () => {
      recorderStub.getAudioSpecs.and.returnValue({
        audioFormat: 'audio/ogg',
        audioParameters: {
          bitrate: 9001,
        },
      });
      makeWebsocketCallSpy.and.returnValue(
        Promise.reject(
          new Error('Websocket server has received and rejected the call.'),
        ),
      );

      try {
        await aos.prepareServerForAudio(
          'r353rv3d1d',
          recorderStub,
          'write.this.down.kiddo',
        );
        fail('prepareServerForAudio should have failed');
      } catch (error) {
        expect(makeWebsocketCallSpy).toHaveBeenCalledWith(
          'write.this.down.kiddo',
          {
            args: ['r353rv3d1d', 'audio/ogg'],
            kwargs: {
              bitrate: 9001,
            },
          },
        );
      }
    });
  });
});

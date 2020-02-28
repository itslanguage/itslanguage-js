/**
 * The unit tests for the exported functions from `audio-over-socket.js`.
 */

import autobahn from 'autobahn';
import * as aos from './audio-over-socket';
import { settings } from '../communication';
import * as communication from '../communication/websocket';
import * as utils from '.';
import broadcaster from '../broadcaster';

const rpcName = 'rpcName';

function wait(seconds = 2) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

function setupStubsSimple() {
  const recorderStub = jasmine.createSpyObj('Recorder', [
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
    'getAudioSpecs',
  ]);

  const makeWebsocketCallSpy = spyOn(communication, 'makeWebsocketCall');
  const dataToBase64Spy = spyOn(utils, 'dataToBase64');
  const broadcasterSpy = spyOn(broadcaster, 'emit');

  return {
    recorderStub,
    makeWebsocketCallSpy,
    dataToBase64Spy,
    broadcasterSpy,
  };
}

function setupStubs() {
  const recorderStub = jasmine.createSpyObj('Recorder', [
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
  ]);

  spyOn(autobahn.Connection.prototype, 'close');
  const connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
  const connectionSessionStub = jasmine.createSpyObj('Session', [
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

  return {
    recorderStub,
    connectionOpenSpy,
    connectionSessionStub,
  };
}

describe('Audio Over socket', () => {
  beforeEach(() => {
    // Make sure we have enough time to complete some tests.
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  beforeAll(() => {
    settings.wsUrl = 'wss://fake.ws.url';
  });

  describe('registerStreamForRecorder', () => {
    it('should register an RPC call named nl.itslanguage.rpcName', async () => {
      const { recorderStub } = setupStubs();
      await expectAsync(
        aos.registerStreamForRecorder(recorderStub, rpcName),
      ).toBeResolvedTo({
        id: '123',
        rpc: `nl.itslanguage.${rpcName}`,
        callback: jasmine.any(Function),
      });
    });

    it('should remove a previously registered RCP', async () => {
      const { recorderStub, connectionSessionStub } = setupStubs();
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
      const { recorderStub } = setupStubs();
      const broadcastSpy = spyOn(broadcaster, 'emit');

      await aos.registerStreamForRecorder(recorderStub, rpcName);

      expect(broadcastSpy).toHaveBeenCalledWith('websocketserverreadyforaudio');
    });

    it('should stream audio to the backend', async () => {
      const { recorderStub } = setupStubs();
      let dataavailableCallback = null;
      let stopCallback = null;
      const data = {
        data: new Blob(['Knees weak, arms are heavy.'], { type: 'text/plain' }),
      };

      // Make sure to convert the data to what is actually being sent to the backend: an array
      // with integers.
      const arrayBuffer = await utils.asyncBlobToArrayBuffer(data.data);
      const intArray = Array.from(new Uint8Array(arrayBuffer));

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

      dataavailableCallback(data);

      await wait(1); // Wait a second before sending stop;
      stopCallback();

      // Add a wait to make sure the events are properly processed.
      await wait();

      expect(detailsSpy.progress).toHaveBeenCalledWith([intArray]);
    });

    it('should not stream audio if the progress function does not exist', async () => {
      const { recorderStub } = setupStubs();
      const data = {
        data: new Blob(['Knees weak, arms are heavy.'], { type: 'text/plain' }),
      };

      recorderStub.addEventListener.and.callFake((event, callback) => {
        if (event === 'dataavailable') {
          callback(data);
        }
      });

      const result = await aos.registerStreamForRecorder(recorderStub, rpcName);
      await expectAsync(result.callback([], {}, {})).toBeRejectedWith(
        'no progress function registered',
      );
    });

    it('should only resolve on the last chunk', async () => {
      const { recorderStub } = setupStubs();
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
      const resultCB = result.callback([], {}, detailsSpy);

      dataavailableCallback(blob);

      await wait(1); // Wait a second before sending stop;
      stopCallback();

      await wait(1); // Wait a second before sending stop;
      dataavailableCallback(blob);

      await expectAsync(resultCB).toBeResolved();
    });

    it('should resolve if stopped without sending data', async () => {
      const { recorderStub } = setupStubs();
      let stopCallback = null;

      recorderStub.addEventListener.and.callFake((event, callback) => {
        if (event === 'stop') {
          stopCallback = callback;
        }
      });

      const result = await aos.registerStreamForRecorder(recorderStub, rpcName);
      const detailsSpy = jasmine.createSpyObj('details', ['progress']);
      const resultCB = result.callback([], {}, detailsSpy);

      stopCallback();
      await expectAsync(resultCB).toBeResolved();
    });
  });

  describe('encodeAndSendAudioOnDataAvailable', () => {
    it('should send the data when the recorder fires the event', async () => {
      const {
        recorderStub,
        makeWebsocketCallSpy,
        dataToBase64Spy,
      } = setupStubsSimple();

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
      const {
        recorderStub,
        makeWebsocketCallSpy,
        dataToBase64Spy,
      } = setupStubsSimple();

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
    it('should broadcast when the websocket server has successfully been prepped and resolve in the reserved ID', async () => {
      const {
        recorderStub,
        makeWebsocketCallSpy,
        broadcasterSpy,
      } = setupStubsSimple();

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
      const { recorderStub, makeWebsocketCallSpy } = setupStubsSimple();

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

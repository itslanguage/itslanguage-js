/**
 * This file contains the unit tests for all exported functions in the
 * accompanying `websocket.js` file.
 */

import autobahn from 'autobahn';
import * as communication from './index';
import * as websocket from './websocket';

// Set fake url to settings
communication.settings.wsUrl = 'wss://fake.ws.url';

describe('Websocket API', () => {
  beforeEach(() => {
    // Make sure we have enough time to complete some tests.
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  afterEach(async () => {
    // Make sure there is no existing connection after each test.
    await websocket.closeWebsocketConnection();
  });

  describe('handleWebsocketAuthorisationChallenge', () => {
    /* Let it be known that this is a extremely hacky way to test internal code.
     *
     * The authorisation mechanism of authobahn might be triggered and challenge
     * the given token. We do have a internal function as this is of no use
     * anywhere else in the SDK or beyond.
     *
     * The `onchallenge` handler provided in the `autobahn.Connection`
     * constructor options parameter can be triggered through the instance of the
     * connection using its "internal/private" _options property.
     */
    let onchallengeOption;

    beforeEach(() => {
      spyOn(autobahn.Connection.prototype, 'close');
      const connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
      // We cannot use arrow functions because of `this` scope.
      // eslint-disable-next-line func-names
      connectionOpenSpy.and.callFake(function() {
        // Get a reference to the thing we actually want to test.
        // eslint-disable-next-line no-underscore-dangle
        onchallengeOption = this._options.onchallenge;
        this.onopen();
      });

      return websocket.openWebsocketConnection();
    });

    it('should return the `authorizationToken` when the ticket method is used', () => {
      communication.updateSettings({ authorizationToken: 'much_secure' });
      const session = {};

      expect(onchallengeOption(session, 'ticket')).toEqual('much_secure');
    });

    it('should throw a Error when a unsupported method is used', () => {
      const session = {};
      const errorMessage =
        'The websocket server tried to use the unknown ' +
        'authentication challenge: "unsupported method"';

      expect(() =>
        onchallengeOption(session, 'unsupported method'),
      ).toThrowError(Error, errorMessage);
    });
  });

  describe('openWebsocketConnection', () => {
    it("should open a connection if there isn't one already", done => {
      const connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
      // We cannot use arrow functions because of `this` scope.
      // eslint-disable-next-line func-names
      connectionOpenSpy.and.callFake(function() {
        this.onopen();
      });

      websocket
        .openWebsocketConnection()
        .then(result => {
          expect(result).toEqual(
            'Successfully established a websocket connection.',
          );
          done();
        })
        .catch(done.fail);
    });

    it('should reject if the connection could not be established', async () => {
      await expectAsync(websocket.openWebsocketConnection()).toBeRejectedWith(
        'The connection is erroneous; check if all ' +
          'required settings have been injected using ' +
          'the `updateSettings()` function. If the ' +
          'problem persists please post a issue on our ' +
          'GitHub repository.',
      );

      // There shouldn't be a reference to the erroneos connection. We can
      // validate this by trying to "close" the connection. The
      // `closeWebsocketConnection` should not pass its falsy check and thus
      // resolve in 'There is no websocket connection to close.'.
      await expectAsync(websocket.closeWebsocketConnection()).toBeResolvedTo(
        'There is no websocket connection to close.',
      );
    });
  });

  describe('closeWebsocketConnection', () => {
    let connectionOpenSpy;
    let connectionCloseSpy;

    beforeEach(() => {
      connectionCloseSpy = spyOn(autobahn.Connection.prototype, 'close');
      connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
      // We cannot use arrow functions because of `this` scope.
      // eslint-disable-next-line func-names
      connectionOpenSpy.and.callFake(function() {
        this.onopen();
      });
    });

    it('should resolve if there is no open connection', async () => {
      await expectAsync(websocket.closeWebsocketConnection()).toBeResolvedTo(
        'There is no websocket connection to close.',
      );
    });

    it('should successfully close a open connection', async () => {
      await websocket.openWebsocketConnection();

      // Now we've opened the connection; close it again.
      await expectAsync(websocket.closeWebsocketConnection()).toBeResolvedTo(
        'The websocket connection has been closed successfully.',
      );
    });

    it('should resolve when the connection was already closed', async () => {
      connectionCloseSpy.and.callFake(() => {
        throw new Error('connection already closed');
      });

      await websocket.openWebsocketConnection();

      // Now we've opened the connection; close it again.
      await expectAsync(websocket.closeWebsocketConnection()).toBeResolvedTo(
        'The websocket connection has already been closed.',
      );
    });

    it('should also remove the reference to the connection once it is closed', async () => {
      await websocket.openWebsocketConnection();

      // Now we've opened the connection; close it again.
      await websocket.closeWebsocketConnection();

      // The internal reference is set to `null` when the connection is
      // closed. The `closeWebsocketConnection` function would therefore not
      // pass its falsy check. The result should therefore be the same as:
      // `it('should resolve if there is no open connection', ...);`
      await expectAsync(websocket.closeWebsocketConnection()).toBeResolvedTo(
        'There is no websocket connection to close.',
      );
    });
  });

  describe('makeWebsocketCall', () => {
    let connectionOpenSpy;
    let connectionSessionStub;

    beforeEach(() => {
      spyOn(autobahn.Connection.prototype, 'close');
      connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
      connectionSessionStub = jasmine.createSpyObj('Session', ['call']);
      connectionSessionStub.call.and.callFake(() => {
        // eslint-disable-next-line new-cap
        const defer = new autobahn.when.defer();
        defer.resolve();
        return defer.promise;
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

    it('should prefix the `rpc` parameter and pass the rest into the websocket session call', async () => {
      await websocket.openWebsocketConnection();
      await websocket.makeWebsocketCall('do.a.rpc', {
        args: ['accept', 'these'],
        kwargs: { kwarg: 'value' },
        options: { option: 'value' },
      });

      expect(connectionSessionStub.call).toHaveBeenCalledWith(
        'nl.itslanguage.do.a.rpc',
        ['accept', 'these'],
        { kwarg: 'value' },
        { option: 'value' },
      );
    });

    it("should open a websocket connection if there isn't one already", async () => {
      await websocket.openWebsocketConnection();
      await websocket.makeWebsocketCall('do.a.rpc', {
        args: ['accept', 'these'],
        kwargs: { kwarg: 'value' },
        options: { option: 'value' },
      });

      // eslint-disable-next-line jasmine/prefer-toHaveBeenCalledWith
      expect(connectionOpenSpy).toHaveBeenCalled();
      expect(connectionSessionStub.call).toHaveBeenCalledWith(
        'nl.itslanguage.do.a.rpc',
        ['accept', 'these'],
        { kwarg: 'value' },
        { option: 'value' },
      );
    });

    it('should set receive_progress to true if progress callback is passed', async () => {
      const progressCb = jasmine.createSpy('progressCb');

      await websocket.openWebsocketConnection();
      await websocket.makeWebsocketCall('do.a.rpc', {
        args: ['accept', 'these'],
        kwargs: { kwarg: 'value' },
        options: { option: 'value' },
        progressCb,
      });

      // eslint-disable-next-line jasmine/prefer-toHaveBeenCalledWith
      expect(connectionOpenSpy).toHaveBeenCalled();
      expect(connectionSessionStub.call).toHaveBeenCalledWith(
        'nl.itslanguage.do.a.rpc',
        ['accept', 'these'],
        { kwarg: 'value' },
        {
          option: 'value',
          receive_progress: true,
        },
      );
    });

    it('should catch an error if Session.call fails', async () => {
      const args = {
        args: ['accept', 'these'],
        kwargs: { kwarg: 'value' },
        options: { option: 'value' },
      };

      const expectedError = new Error('wrong');
      expectedError.data = {
        args: [...args.args],
        kwargs: { ...args.kwargs },
      };

      connectionSessionStub.call.and.callFake(() => {
        // eslint-disable-next-line new-cap
        const defer = new autobahn.when.defer();
        defer.reject({
          error: 'wrong',
          args: [],
          kwargs: {},
          options: {},
        });
        return defer.promise;
      });

      await websocket.openWebsocketConnection();
      await expectAsync(
        websocket.makeWebsocketCall('do.a.rpc', args),
      ).toBeRejectedWith(expectedError);
    });

    it('should fail when no options are passed', async () => {
      const expectedError = new Error('wrong');
      expectedError.data = {
        args: [],
        kwargs: {},
      };

      connectionSessionStub.call.and.callFake(() => {
        // eslint-disable-next-line new-cap
        const defer = new autobahn.when.defer();
        defer.reject({
          error: 'wrong',
          args: [],
          kwargs: {},
          options: {},
        });
        return defer.promise;
      });

      await websocket.openWebsocketConnection();
      await expectAsync(
        websocket.makeWebsocketCall('do.a.rpc'),
      ).toBeRejectedWith(expectedError);
    });
  });
});

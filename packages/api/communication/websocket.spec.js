/**
 * This file contains the unit tests for all exported functions in the
 * accompanying `websocket.js` file.
 */

import autobahn from 'autobahn';
import * as communication from './index';
import * as websocket from './websocket';

// Set fake url to settings
communication.settings.wsUrl = 'wss://fake.ws.url';

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

  beforeEach((done) => {
    spyOn(autobahn.Connection.prototype, 'close');
    const connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
    // We cannot use arrow functions because of this scope.
    connectionOpenSpy.and.callFake(function () { // eslint-disable-line func-names
      // Get a reference to the thing we actually want to test.
      // eslint-disable-next-line no-underscore-dangle
      onchallengeOption = this._options.onchallenge;
      this.onopen();
    });
    websocket.openWebsocketConnection()
      .then(done);
  });

  afterEach((done) => {
    // Make sure there is no existing connection after each test.
    websocket.closeWebsocketConnection()
      .then(done);
  });

  it('should return the `authorizationToken` when the ticket method is used', () => {
    communication.updateSettings({ authorizationToken: 'much_secure' });
    const session = {};
    expect(onchallengeOption(session, 'ticket')).toEqual('much_secure');
  });

  it('should throw a Error when a unsupported method is used', () => {
    const session = {};
    const errorMessage = 'The websocket server tried to use the unknown '
                         + 'authentication challenge: "unsupported method"';
    expect(() => onchallengeOption(session, 'unsupported method')).toThrowError(Error, errorMessage);
  });
});


describe('openWebsocketConnection', () => {
  afterEach((done) => {
    // Make sure there is no existing connection after each test.
    websocket.closeWebsocketConnection()
      .then(done);
  });

  it('should open a connection if there isn\'t one already', (done) => {
    const connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
    // We cannot use arrow functions because of this scope.
    connectionOpenSpy.and.callFake(function () { // eslint-disable-line func-names
      this.onopen();
    });

    websocket.openWebsocketConnection()
      .then((result) => {
        expect(result).toEqual('Successfully established a websocket connection.');
        done();
      }, fail);
  });

  it('should reject if the connection could not be established', (done) => {
    websocket.openWebsocketConnection()
      .then(fail, (result) => {
        expect(result).toEqual('The connection is erroneous; check if all '
                               + 'required settings have been injected using '
                               + 'the `updateSettings()` function. If the '
                               + 'problem persists please post a issue on our '
                               + 'GitHub repository.');
        // There shouldn't be a reference to the erroneos connection. We can
        // validate this by trying to "close" the connection. The
        // `closeWebsocketConnection` should not pass its falsy check and thus
        // resolve in 'There is no websocket connection to close.'.
        return websocket.closeWebsocketConnection();
      })
      .then((result) => {
        expect(result).toEqual('There is no websocket connection to close.');
        done();
      }, fail);
  });
});


describe('closeWebsocketConnection', () => {
  let connectionOpenSpy;
  let connectionCloseSpy;

  beforeEach(() => {
    connectionCloseSpy = spyOn(autobahn.Connection.prototype, 'close');
    connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
    // We cannot use arrow functions because of this scope.
    connectionOpenSpy.and.callFake(function () { // eslint-disable-line func-names
      this.onopen();
    });
  });

  afterEach((done) => {
    // Make sure there is no existing connection after each test.
    websocket.closeWebsocketConnection()
      .then(done);
  });

  it('should resolve if there is no open connection', (done) => {
    websocket.closeWebsocketConnection()
      .then((result) => {
        expect(result).toEqual('There is no websocket connection to close.');
        done();
      }, fail);
  });

  it('should successfully close a open connection', (done) => {
    websocket.openWebsocketConnection()
      // Now we've opened the connection; close it again.
      .then(() => websocket.closeWebsocketConnection(), fail)
      .then((result) => {
        expect(result).toEqual('The websocket connection has been closed successfully.');
        done();
      }, fail);
  });

  it('should resolve when the connection was already closed', (done) => {
    connectionCloseSpy.and.callFake(() => {
      throw new Error('connection already closed');
    });

    websocket.openWebsocketConnection()
      // Now we've opened the connection; close it again.
      .then(() => websocket.closeWebsocketConnection(), fail)
      .then((result) => {
        expect(result).toEqual('The websocket connection has already been closed.');
        done();
      }, fail);
  });

  it('should also remove the reference to the connection once it is closed', (done) => {
    websocket.openWebsocketConnection()
      // Now we've opened the connection; close it again.
      .then(() => websocket.closeWebsocketConnection(), fail)
      .then(() => websocket.closeWebsocketConnection(), fail)
      .then((result) => {
        // The internal reference is set to `null` when the connection is
        // closed. The `closeWebsocketConnection` function would therefore not
        // pass its falsy check. The result should therefore be the same as:
        // `it('should resolve if there is no open connection', ...);`
        expect(result).toEqual('There is no websocket connection to close.');
        done();
      }, fail);
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

    // We cannot use arrow functions because of this scope.
    connectionOpenSpy.and.callFake(function () { // eslint-disable-line func-names
      // This property is returned through the session "property" of a
      // connection instance. Sadly only the get is defined with the
      // `Object.defineProperty` which forces us to mock the internals.
      this._session = connectionSessionStub; // eslint-disable-line no-underscore-dangle
      this.onopen();
    });
  });

  afterEach((done) => {
    // Make sure there is no existing connection after each test.
    websocket.closeWebsocketConnection()
      .then(done);
  });

  it('should prefix the `rpc` parameter and pass the rest into the websocket session call', (done) => {
    websocket.openWebsocketConnection()
      .then(() => websocket.makeWebsocketCall(
        'do.a.rpc',
        {
          args: ['accept', 'these'],
          kwargs: { kwarg: 'value' },
          options: { option: 'value' },
        },
      ))
      .then(() => {
        expect(connectionSessionStub.call).toHaveBeenCalledWith(
          'nl.itslanguage.do.a.rpc',
          ['accept', 'these'],
          { kwarg: 'value' },
          { option: 'value' },
        );
        done();
      }, fail);
  });

  it('should open a websocket connection if there isn\'t one already', (done) => {
    websocket.makeWebsocketCall('do.a.rpc', {
      args: ['accept', 'these'],
      kwargs: { kwarg: 'value' },
      options: { option: 'value' },
    }).then(() => {
      expect(connectionOpenSpy).toHaveBeenCalled();
      expect(connectionSessionStub.call).toHaveBeenCalledWith(
        'nl.itslanguage.do.a.rpc',
        ['accept', 'these'],
        { kwarg: 'value' },
        { option: 'value' },
      );
      done();
    }, fail);
  });

  it('should set receive_progress to true if progress callback is passed', (done) => {
    const progressCb = jasmine.createSpy('progressCb');

    websocket.makeWebsocketCall('do.a.rpc', {
      args: ['accept', 'these'],
      kwargs: { kwarg: 'value' },
      options: { option: 'value' },
      progressCb,
    }).then(() => {
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
      done();
    }, fail);
  });

  it('should catch an error if Session.call fails', (done) => {
    const args = {
      args: ['accept', 'these'],
      kwargs: { kwarg: 'value' },
      options: { option: 'value' },
    };

    connectionSessionStub.call.and.callFake(() => {
      // eslint-disable-next-line new-cap
      const defer = new autobahn.when.defer();
      defer.reject({
        error: 'wrong',
        ...args,
      });
      return defer.promise;
    });

    websocket.makeWebsocketCall('do.a.rpc', args)
      .then(() => done.fail)
      .catch((error) => {
        expect(error.message).toBe('wrong');
        expect(error.data.options).toBeUndefined();
        expect(error.data.args).toEqual(args.args);
        expect(error.data.kwargs).toEqual(args.kwargs);
        done();
      });
  });

  it('should fail when no options are passed', (done) => {
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

    websocket.makeWebsocketCall('do.a.rpc')
      .then(() => done.fail)
      .catch((error) => {
        expect(error.message).toBe('wrong');
        done();
      });
  });
});

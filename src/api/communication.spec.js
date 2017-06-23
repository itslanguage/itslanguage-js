/**
 * This file contains the unittests for all exported functions in the
 * acompanying `communication.js` file.
 */

import * as communication from './communication';
import autobahn from 'autobahn';

const TEST_API_URL = 'https://www.example.com';


describe('updateSettings', () => {
  it('should allow to pass any object', () => {
    const newSettings = {
      fi: 'fi',
      fa: 'fa',
      fo: 'fo'
    };

    expect(() => communication.updateSettings(newSettings)).not.toThrowError();
  });

  it('should throw an error when something other than a object is given', () => {
    const faultyNewSettings = 'this is not the kind of object you are looking for';

    expect(() => communication.updateSettings(faultyNewSettings))
      .toThrowError(Error, 'Please, only provide objects as settings.');
  });
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
  let onchallenge;

  beforeEach(done => {
    spyOn(autobahn.Connection.prototype, 'close');
    const connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
    connectionOpenSpy.and.callFake(function() {
      // Get a reference to the thing we actually want to test.
      onchallenge = this._options.onchallenge;
      this.onopen();
    });
    communication.openWebsocketConnection()
      .then(done);
  });

  afterEach(done => {
    // Make sure there is no existing connection after each test.
    communication.closeWebsocketConnection()
      .then(done);
  });

  it('should return the `authorizationToken` when the ticket method is used', () => {
    communication.updateSettings({authorizationToken: 'much_secure'});
    const session = {};
    expect(onchallenge(session, 'ticket')).toEqual('much_secure');
  });

  it('should throw a Error when a unsupported method is used', () => {
    const session = {};
    const errorMessage = 'The websocket server tried to use the unknown ' +
                         'authentication challenge: "unsupported method"';
    expect(() => onchallenge(session, 'unsupported method')).toThrowError(Error, errorMessage);
  });
});


describe('openWebsocketConnection', () => {
  afterEach(done => {
    // Make sure there is no existing connection after each test.
    communication.closeWebsocketConnection()
      .then(done);
  });

  it('should open a connection if there isn\'t one already', done => {
    const connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
    connectionOpenSpy.and.callFake(function() {
      this.onopen();
    });

    communication.openWebsocketConnection()
      .then(result => {
        expect(result).toEqual('Successfully established a websocket connection.');
        done();
      }, fail);
  });

  it('should reject if the connection could not be established', done => {
    communication.openWebsocketConnection()
      .then(fail, result => {
        expect(result).toEqual('The connection is erroneous; check if all ' +
                               'required settings have been injected using ' +
                               'the `updateSettings()` function. If the ' +
                               'problem persists please post a issue on our ' +
                               'GitHub repository.');
        // There shouldn't be a reference to the erroneos connection. We can
        // validate this by trying to "close" the connection. The
        // `closeWebsocketConnection` should not pass its falsy check and thus
        // resolve in 'There is no websocket connection to close.'.
        return communication.closeWebsocketConnection();
      })
      .then(result => {
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
    connectionOpenSpy.and.callFake(function() {
      this.onopen();
    });
  });

  afterEach(done => {
    // Make sure there is no existing connection after each test.
    communication.closeWebsocketConnection()
      .then(done);
  });

  it('should resolve if there is no open connection', done => {
    communication.closeWebsocketConnection()
      .then(result => {
        expect(result).toEqual('There is no websocket connection to close.');
        done();
      }, fail);
  });

  it('should successfully close a open connection', done => {
    communication.openWebsocketConnection()
      // Now we've opened the connection; close it again.
      .then(() => communication.closeWebsocketConnection(), fail)
      .then(result => {
        expect(result).toEqual('The websocket connection has been closed successfully.');
        done();
      }, fail);
  });

  it('should resolve when the connection was already closed', done => {
    connectionCloseSpy.and.callFake(() => {
      throw new Error('connection already closed');
    });

    communication.openWebsocketConnection()
      // Now we've opened the connection; close it again.
      .then(() => communication.closeWebsocketConnection(), fail)
      .then(result => {
        expect(result).toEqual('The websocket connection has already been closed.');
        done();
      }, fail);
  });

  it('should also remove the reference to the connection once it is closed', done => {
    communication.openWebsocketConnection()
      // Now we've opened the connection; close it again.
      .then(() => communication.closeWebsocketConnection(), fail)
      .then(() => communication.closeWebsocketConnection(), fail)
      .then(result => {
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
    connectionSessionStub = jasmine.createSpyObj('Session', ['call']);
    connectionOpenSpy = spyOn(autobahn.Connection.prototype, 'open');
    connectionOpenSpy.and.callFake(function() {
      // This property is returned through the session "property" of a
      // conncection instance. Sadly only the get is defined with the
      // `Object.defineProperty` which forces us to mock the internals.
      this._session = connectionSessionStub;
      this.onopen();
    });
  });

  afterEach(done => {
    // Make sure there is no existing connection after each test.
    communication.closeWebsocketConnection()
      .then(done);
  });

  it('should prefix the `rpc` parameter and pass the rest into the websocket session call', done => {
    communication.openWebsocketConnection()
      .then(() => communication.makeWebsocketCall(
        'do.a.rpc',
        ['accept', 'these'],
        {kwarg: 'value'},
        {option: 'value'}
      ))
      .then(() => {
        expect(connectionSessionStub.call).toHaveBeenCalledWith(
          'nl.itslanguage.do.a.rpc',
          ['accept', 'these'],
          {kwarg: 'value'},
          {option: 'value'}
        );
        done();
      }, fail);
  });

  it('should open a websocket connection if there isn\'t one already', done => {
    communication.makeWebsocketCall('do.a.rpc', ['accept', 'these'], {kwarg: 'value'}, {option: 'value'})
      .then(() => {
        expect(connectionOpenSpy).toHaveBeenCalled();
        expect(connectionSessionStub.call).toHaveBeenCalledWith(
          'nl.itslanguage.do.a.rpc',
          ['accept', 'these'],
          {kwarg: 'value'},
          {option: 'value'}
        );
        done();
      }, fail);
  });
});


describe('request', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch');
    communication.updateSettings({apiURL: TEST_API_URL});
  });

  it('should make the request for the given params and handle its response', done => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const responseBody = {location: 'South East Asia'};
    const response = new Response(JSON.stringify(responseBody), {headers});
    fetchSpy.and.returnValue(Promise.resolve(response));

    const requestBody = {packed: 'suitcase'};

    communication.request('POST', '/lets/go/somewhere', requestBody)
      .then(result => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/lets/go/somewhere`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          }
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });

  it('should keep a URLSearchParams body as URLSearchParams', done => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const responseBody = {location: 'South East Asia'};
    const response = new Response(JSON.stringify(responseBody), {headers});
    fetchSpy.and.returnValue(Promise.resolve(response));

    const requestBody = new URLSearchParams();
    requestBody.set('packed', 'suitcase');

    communication.request('POST', '/lets/go/somewhere', requestBody)
      .then(result => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/lets/go/somewhere`,
          {
            method: 'POST',
            headers,
            body: requestBody
          }
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });

  it('should keep a FormData body as FormData', done => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const responseBody = {location: 'South East Asia'};
    const response = new Response(JSON.stringify(responseBody), {headers});
    fetchSpy.and.returnValue(Promise.resolve(response));

    const requestBody = new FormData();
    requestBody.set('memory', new Blob(), 'a nice pictrue taken on the journey');

    communication.request('POST', '/lets/go/somewhere', requestBody)
      .then(result => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/lets/go/somewhere`,
          {
            method: 'POST',
            headers,
            body: requestBody
          }
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });

  it('should reject with the custom JSON errors from the API', done => {
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');
    const responseBody = {
      unexpected_error: 'The Spanish Inquisition' // eslint-disable-line camelcase
    };

    const response = new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: responseHeaders
    });
    fetchSpy.and.returnValue(Promise.resolve(response));

    communication.request('GET', '/give/me/coffee')
      .then(fail, result => {
        expect(result).toEqual(responseBody);
        done();
      });
  });

  it('should reject with the plain HTTP error status if the response does have a JSON body', done => {
    const response = new Response('I am a teapot', {
      status: 418,
      statusText: 'I am a teapot'
    });
    fetchSpy.and.returnValue(Promise.resolve(response));

    communication.request('GET', '/give/me/coffee')
      .then(fail, message => {
        expect(message).toEqual(`${response.status}: ${response.statusText}`);
        done();
      });
  });

  it('should return the response if it is an OK response, but doesn\'t have a JSON body', done => {
    const response = new Response('I wish I was a teapot');
    fetchSpy.and.returnValue(Promise.resolve(response));

    communication.request('GET', '/give/me/coffee')
      .then(result => {
        expect(result).toBe(response);
        done();
      }, fail);
  });
});


describe('authorisedRequest', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = spyOn(window, 'fetch');
    communication.updateSettings({
      apiURL: TEST_API_URL,
      authorizationToken: 'token'
    });
  });

  // XXX Currently it is only a warning that is logged. Most of the SDK is
  // still building a complete URL which blocks this feature. Once all those
  // comlete URLs are changed to relative URLs, this comment should be
  // removed and this test should be executed.
  xit('should only allow relative urls', done => {
    communication.authorisedRequest('PUT', 'https://domain.ext/path', {foo: 'bar'})
      .then(fail, message => {
        expect(message).toEqual('Only relative ITSLanguage API URLs are allowed.');
        done();
      });
  });

  // XXX This test should be removed if when te 'should only allow relative
  // URLs' test is included in the test run.
  it('warns the develors that a change needs to be made to the SDK for every full URL', done => {
    const warnSpy = spyOn(console, 'warn');
    fetchSpy.and.returnValue(Promise.resolve(new Response()));

    const expectedRequestHeaders = new Headers();
    expectedRequestHeaders.set('Authorization', 'Bearer token');

    communication.authorisedRequest('GET', 'https://domain.ext/path')
      .then(() => {
        expect(warnSpy).toHaveBeenCalledWith('Complete URLs will soon be disallowed in authorised requests.');
        done();
      }, fail);
  });

  it('should reject when there is no authorizationToken set in the settings', done => {
    communication.updateSettings({authorizationToken: null});
    communication.authorisedRequest('PUT', '/path', {foo: 'bar'})
      .then(fail, message => {
        expect(message).toEqual('Please authenticate first.');
        done();
      });
  });

  it('should set the Authorization header with the authorizationToken as a bearer token', done => {
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');

    const responseBody = {location: 'South East Asia'};
    const response = new Response(JSON.stringify(responseBody), {
      headers: responseHeaders
    });
    fetchSpy.and.returnValue(Promise.resolve(response));

    const expectedRequestHeaders = new Headers();
    expectedRequestHeaders.set('Authorization', 'Bearer token');

    communication.authorisedRequest('GET', '/foo')
      .then(result => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/foo`,
          {
            method: 'GET',
            headers: expectedRequestHeaders,
            body: undefined
          }
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });
});

/**
 * This file contains the unit tests for all exported functions in the
 * accompanying `index.js` file.
 */

import * as communication from './index';

const TEST_API_URL = 'https://api.itslanguage.nl';


describe('settings', () => {
  it('should expose the settings object', () => {
    // Expect that the default keys are not undefined, they are either null,
    // or something else by default.
    expect(communication.settings.apiUrl).not.toBe(undefined);
    expect(communication.settings.wsUrl).not.toBe(undefined);
    expect(communication.settings.authorizationToken).not.toBe(undefined);
  });
});


describe('updateSettings', () => {
  it('should allow to pass any object', () => {
    const newSettings = {
      fi: 'fi',
      fa: 'fa',
      fo: 'fo',
    };

    expect(() => communication.updateSettings(newSettings)).not.toThrowError();
    // Expect that all these separately because there might be more in the
    // settings object due to it being used in multiple tests.
    expect(communication.settings.fi).toEqual('fi');
    expect(communication.settings.fa).toEqual('fa');
    expect(communication.settings.fo).toEqual('fo');
  });

  it('should throw an error when something other than a object is given', () => {
    const faultyNewSettings = 'this is not the kind of object you are looking for';

    expect(() => communication.updateSettings(faultyNewSettings))
      .toThrowError(Error, 'Please, only provide objects as settings.');
  });
});


describe('request', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch');
    communication.updateSettings({ apiUrl: TEST_API_URL });
  });

  it('should make the request for the given params and handle its response', (done) => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const responseBody = { location: 'South East Asia' };
    const response = new Response(JSON.stringify(responseBody), { headers });
    fetchSpy.and.returnValue(Promise.resolve(response));

    const requestBody = { packed: 'suitcase' };

    communication.request('POST', '/lets/go/somewhere', requestBody)
      .then((result) => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/lets/go/somewhere`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
          },
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });

  it('should keep a URLSearchParams body as URLSearchParams', (done) => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const responseBody = { location: 'South East Asia' };
    const response = new Response(JSON.stringify(responseBody), { headers });
    fetchSpy.and.returnValue(Promise.resolve(response));

    const requestBody = new URLSearchParams();
    requestBody.set('packed', 'suitcase');

    communication.request('POST', '/lets/go/somewhere', requestBody)
      .then((result) => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/lets/go/somewhere`,
          {
            method: 'POST',
            headers,
            body: requestBody,
          },
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });

  it('should keep a FormData body as FormData', (done) => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const responseBody = { location: 'South East Asia' };
    const response = new Response(JSON.stringify(responseBody), { headers });
    fetchSpy.and.returnValue(Promise.resolve(response));

    const requestBody = new FormData();
    requestBody.set('memory', new Blob(), 'a nice pictrue taken on the journey');

    communication.request('POST', '/lets/go/somewhere', requestBody)
      .then((result) => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/lets/go/somewhere`,
          {
            method: 'POST',
            headers,
            body: requestBody,
          },
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });

  it('should reject with the custom JSON errors from the API', (done) => {
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');
    const responseBody = {
      unexpected_error: 'The Spanish Inquisition', // eslint-disable-line camelcase
    };

    const response = new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: responseHeaders,
    });
    fetchSpy.and.returnValue(Promise.resolve(response));

    communication.request('GET', '/give/me/coffee')
      .then(fail, (result) => {
        expect(result).toEqual(responseBody);
        done();
      });
  });

  it('should reject with the plain HTTP error status if the response does have a JSON body', (done) => {
    const response = new Response('I am a teapot', {
      status: 418,
      statusText: 'I am a teapot',
    });
    fetchSpy.and.returnValue(Promise.resolve(response));

    communication.request('GET', '/give/me/coffee')
      .then(done.fail)
      .catch(({ message }) => {
        expect(message).toEqual(`${response.status}: ${response.statusText}`);
        done();
      });
  });

  it('should return the response if it is an OK response, but doesn\'t have a JSON body', (done) => {
    const response = new Response('I wish I was a teapot');
    fetchSpy.and.returnValue(Promise.resolve(response));

    communication.request('GET', '/give/me/coffee')
      .then((result) => {
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
      apiUrl: TEST_API_URL,
      authorizationToken: 'token',
    });
  });

  it('should only allow relative urls', (done) => {
    communication.authorisedRequest('PUT', 'https://domain.ext/path', { foo: 'bar' })
      .then(fail)
      .catch(({ message }) => {
        expect(message).toEqual('Only relative ITSLanguage API URLs are allowed.');
        done();
      });
  });

  it('should reject when there is no authorizationToken set in the settings', (done) => {
    communication.updateSettings({ authorizationToken: null });
    communication.authorisedRequest('PUT', '/path', { foo: 'bar' })
      .then(fail)
      .catch(({ message }) => {
        expect(message).toEqual('Please authenticate first.');
        done();
      });
  });

  it('should set the Authorization header with the authorizationToken as a bearer token', (done) => {
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');

    const responseBody = { location: 'South East Asia' };
    const response = new Response(JSON.stringify(responseBody), {
      headers: responseHeaders,
    });
    fetchSpy.and.returnValue(Promise.resolve(response));

    const expectedRequestHeaders = new Headers();
    expectedRequestHeaders.set('Authorization', 'Bearer token');

    communication.authorisedRequest('GET', '/foo')
      .then((result) => {
        const request = fetchSpy.calls.mostRecent();
        expect(request.args).toEqual([
          `${TEST_API_URL}/foo`,
          {
            method: 'GET',
            headers: expectedRequestHeaders,
            body: undefined,
          },
        ]);

        expect(result).toEqual(responseBody);
        done();
      }, fail);
  });
});

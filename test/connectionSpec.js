/* eslint-disable
camelcase
 */

require('jasmine-ajax');
const Connection = require('../administrative-sdk/connection/connection-controller');
const BasicAuth = require('../administrative-sdk/basic-auth/basic-auth');

describe('Secure GET test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should throw error on required auth credentials', () => {
    const api = new Connection();
    expect(() => {
      api._secureAjaxGet();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authCredentials: 'secret'
    });
    const url = api.settings.apiUrl;
    const fakeResponse = new Response(JSON.stringify({}), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    api._secureAjaxGet(url)
      .then(() => {
        const request = window.fetch.calls.mostRecent().args;
        // That's the correct base64 representation of 'principal:secret'
        expect(request[1].headers.get('Authorization')).toEqual('Basic cHJpbmNpcGFsOnNlY3JldA==');
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});

describe('Secure POST test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should throw error on required auth credentials', () => {
    const api = new Connection();
    expect(() => {
      api._secureAjaxPost();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authCredentials: 'secret'
    });
    const url = api.settings.apiUrl;
    const fakeResponse = new Response(JSON.stringify({}), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    api._secureAjaxPost(url)
      .then(() => {
        const request = window.fetch.calls.mostRecent().args;
        // That's the correct base64 representation of 'principal:secret'
        expect(request[1].headers.get('Authorization')).toEqual('Basic cHJpbmNpcGFsOnNlY3JldA==');
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      }).then(done);
  });
});

describe('Connection oauth2 token get', () => {
  it('should handle server error on invalid scope', done => {
    const content = {
      error: 'invalid_scope'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 400,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const api = new Connection({
      authPrincipal: 'principal',
      authCredentials: 'credentials'
    });
    const basicAuth = new BasicAuth('', 'principal', 'credentials');
    api.getOauth2Token(basicAuth)
      .then(fail)
      .catch(error => {
        expect(error).toEqual(content);
      })
      .then(done);
  });

  it('should handle server errors on invalid credentials', done => {
    const content = {
      error: 'invalid_request'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 400,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const api = new Connection({
      authPrincipal: 'invalid',
      authCredentials: 'invalid'
    });
    const basicAuth = new BasicAuth('', 'invalid', 'invalid');
    api.getOauth2Token(basicAuth)
      .then(fail)
      .catch(error => {
        expect(error).toEqual(content);
      })
      .then(done);
  });

  it('should get a token', done => {
    const content = {
      access_token: '2b198b6bc87db1bdb',
      token_type: 'Bearer',
      scope: 'tenant/4'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    const basicAuth = new BasicAuth('4', 'principal', 'credentials');
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const api = new Connection({
      authPrincipal: 'principal',
      authCredentials: 'credentials'
    });
    api.getOauth2Token(basicAuth)
      .then(result => {
        expect(result.token_type).toEqual('Bearer');
        expect(result.access_token).toEqual('2b198b6bc87db1bdb');
        expect(result.scope).toEqual('tenant/4');
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      })
      .then(done);
  });
});

require('jasmine-ajax');
const Connection = require('../administrative-sdk/connection/connection-controller');

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

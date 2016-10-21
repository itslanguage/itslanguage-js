require('jasmine-ajax');
const Connection = require('../administrative-sdk/connection/connection-controller');
const BasicAuth = require('../administrative-sdk/basic-auth/basic-auth');
const BasicAuthController = require('../administrative-sdk/basic-auth/basic-auth-controller');

describe('BasicAuth object test', () => {
  it('should require all required fields in constructor', () => {
    [0, 4, undefined, false, null].map(v => {
      expect(() => {
        new BasicAuth(v);
      }).toThrowError(
        'tenantId parameter of type "string" is required');
    });

    [0, 4, false].map(v => {
      expect(() => {
        new BasicAuth('tenantId', v);
      }).toThrowError(
        'principal parameter of type "string|null|undefined" is required');
    });

    [0, 4, false].map(v => {
      expect(() => {
        new BasicAuth('tenantId', 'principal', v);
      }).toThrowError(
        'credentials parameter of type "string|null|undefined" is required');
    });
  });

  it('should instantiate an BasicAuth with tenantId', () => {
    const o = new BasicAuth('tenantId');
    expect(o).toBeDefined();
    expect(o.tenantId).toBe('tenantId');
    expect(o.principal).toBeUndefined();
    expect(o.credentials).toBeUndefined();
  });

  it('should instantiate a full BasicAuth', () => {
    const o = new BasicAuth('tenantId', 'principal', 'creds');
    expect(o).toBeDefined();
    expect(o.tenantId).toBe('tenantId');
    expect(o.principal).toBe('principal');
    expect(o.credentials).toBe('creds');
  });
});

describe('BasicAuth API interaction test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should create a new BasicAuth through API', done => {
    const basicauth = new BasicAuth('4', 'principal');
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const controller = new BasicAuthController(api);
    const url = 'https://api.itslanguage.nl/basicauths';
    const content = {
      tenantId: '4',
      principal: 'principal',
      credentials: 'secret'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createBasicAuth(basicauth)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        const expected = {tenantId: '4', principal: 'principal'};
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(expected));
        expect(result.tenantId).toBe('4');
        expect(result.principal).toBe('principal');
        expect(result.credentials).toBe('secret');
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new basicauth', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const basicauth = new BasicAuth('4', 'principal');
    const controller = new BasicAuthController(api);
    const content = {
      message: 'Validation failed',
      errors: [{
        resource: 'BasicAuth',
        field: 'credentials',
        code: 'missing'
      }]
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 422,
      header: {
        'Content-type': 'application/json'
      }
    });

    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createBasicAuth(basicauth)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        const expected = {tenantId: '4', principal: 'principal'};
        const url = 'https://api.itslanguage.nl/basicauths';
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(expected));
        expect(error).toEqual(content);
      })
      .then(done);
  });
});

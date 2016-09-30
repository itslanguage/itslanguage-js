/* eslint-disable
 camelcase,
 new-cap
 */

/* global
 afterEach,
 beforeEach,
 describe,
 expect,
 it,
 jasmine,
 window,
 FormData
 */

require('jasmine-ajax');

const Connection = require('../administrative-sdk/connection').Connection;
const BasicAuth = require('../administrative-sdk/basicAuth').BasicAuth;

describe('BasicAuth object test', function() {
  it('should require all required fields in constructor', function() {
    [0, 4, undefined, false, null].map(function(v) {
      expect(function() {
        new BasicAuth(v);
      }).toThrowError(
        'tenantId parameter of type "string" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new BasicAuth('tenantId', v);
      }).toThrowError(
        'principal parameter of type "string|null|undefined" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new BasicAuth('tenantId', 'principal', v);
      }).toThrowError(
        'credentials parameter of type "string|null|undefined" is required');
    });
  });

  it('should instantiate an BasicAuth with tenantId', function() {
    var o = new BasicAuth('tenantId');
    expect(o).toBeDefined();
    expect(o.tenantId).toBe('tenantId');
    expect(o.principal).toBeUndefined();
    expect(o.credentials).toBeUndefined();
  });

  it('should instantiate a full BasicAuth', function() {
    var o = new BasicAuth('tenantId', 'principal', 'creds');
    expect(o).toBeDefined();
    expect(o.tenantId).toBe('tenantId');
    expect(o.principal).toBe('principal');
    expect(o.credentials).toBe('creds');
  });
});

describe('BasicAuth API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new BasicAuth through API', function() {
    var basicauth = new BasicAuth('4', 'principal');
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = basicauth.createBasicAuth(api, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/basicauths';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {tenantId: '4', principal: 'principal'};
    expect(request.data()).toEqual(expected);

    var content = {
      tenantId: '4',
      principal: 'principal',
      credentials: 'secret'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });
    expect(cb).toHaveBeenCalledWith(basicauth);
    expect(basicauth.tenantId).toBe('4');
    expect(basicauth.principal).toBe('principal');
    expect(basicauth.credentials).toBe('secret');
  });

  it('should handle errors while creating a new basicauth', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var basicauth = new BasicAuth('4', 'principal');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = basicauth.createBasicAuth(api, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/basicauths';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {tenantId: '4', principal: 'principal'};
    expect(request.data()).toEqual(expected);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'BasicAuth',
          field: 'credentials',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{
      resource: 'BasicAuth',
      field: 'credentials',
      code: 'missing'
    }];
    expect(ecb).toHaveBeenCalledWith(errors, basicauth);
    expect(output).toBeUndefined();
  });
});

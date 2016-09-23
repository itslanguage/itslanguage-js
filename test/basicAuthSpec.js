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
 spyOn,
 window,
 FormData
 */

require('jasmine-ajax');
require('jasmine-as-promised')();
const autobahn = require('autobahn');
var Promise = require('es6-promise').Promise;
const its = require('..');

describe('BasicAuth object test', function() {
  it('should require all required fields in constructor', function() {
    [0, 4, undefined, false, null].map(function(v) {
      expect(function() {
        new its.BasicAuth(v);
      }).toThrowError(
        'tenantId parameter of type "string" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.BasicAuth('tenantId', v);
      }).toThrowError(
        'principal parameter of type "string|null|undefined" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.BasicAuth('tenantId', 'principal', v);
      }).toThrowError(
        'credentials parameter of type "string|null|undefined" is required');
    });
  });

  it('should instantiate an BasicAuth with tenantId', function() {
    var o = new its.BasicAuth('tenantId');
    expect(o).toBeDefined();
    expect(o.tenantId).toBe('tenantId');
    expect(o.principal).toBeUndefined();
    expect(o.credentials).toBeUndefined();
  });

  it('should instantiate a full BasicAuth', function() {
    var o = new its.BasicAuth('tenantId', 'principal', 'creds');
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
    var basicauth = new its.BasicAuth('4', 'principal');
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/basicauths';
    var content = {
      tenantId: '4',
      principal: 'principal',
      credentials: 'secret'
    };
    var fakeResponse = {
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.createBasicAuth(basicauth);
    var request = jasmine.Ajax.requests.mostRecent();

    expect(output).toEqual(jasmine.any(Promise));

    return output.then(function(result) {
      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      var expected = {tenantId: '4', principal: 'principal'};
      expect(request.data()).toEqual(expected);
      expect(basicauth.tenantId).toBe('4');
      expect(basicauth.principal).toBe('principal');
      expect(basicauth.credentials).toBe('secret');
    }).catch(function(error) {
      fail('Error should not be thrown ' + error);
    });
  });

  it('should handle errors while creating a new basicauth', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var basicauth = new its.BasicAuth('4', 'principal');
    var content = {
      message: 'Validation failed',
      errors: [{
        resource: 'BasicAuth',
        field: 'credentials',
        code: 'missing'
      }]
    };
    var fakeResponse = {
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    var url = 'https://api.itslanguage.nl/basicauths';
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.createBasicAuth(basicauth);
    expect(output).toEqual(jasmine.any(Promise));

    var request = jasmine.Ajax.requests.mostRecent();
    var expected = {tenantId: '4', principal: 'principal'};

    return output.then(function() {
      fail('No result should be returned');
    }).catch(function(error) {
      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      expect(request.data()).toEqual(expected);
      expect(error.errors).toEqual(content);
    });
  });
});

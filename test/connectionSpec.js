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

const its = require('../administrative-sdk/connection');


describe('Secure GET test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should throw error on required auth credentials', function() {
    var api = new its.Connection();

    expect(function() {
      api._secureAjaxGet();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', function() {
    var api = new its.Connection({
      authPrincipal: 'principal',
      authCredentials: 'secret'
    });

    api._secureAjaxGet();

    var request = jasmine.Ajax.requests.mostRecent();
    // That's the correct base64 representation of 'principal:secret'
    expect(request.requestHeaders).toEqual({
      Authorization: 'Basic cHJpbmNpcGFsOnNlY3JldA=='
    });
  });
});

describe('Secure POST test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should throw error on required auth credentials', function() {
    var api = new its.Connection();

    expect(function() {
      api._secureAjaxPost();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', function() {
    var api = new its.Connection({
      authPrincipal: 'principal',
      authCredentials: 'secret'
    });

    api._secureAjaxPost();

    var request = jasmine.Ajax.requests.mostRecent();
    // That's the correct base64 representation of 'principal:secret'
    expect(request.requestHeaders).toEqual({
      Authorization: 'Basic cHJpbmNpcGFsOnNlY3JldA=='
    });
  });
});

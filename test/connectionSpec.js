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

describe('Secure GET test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should throw error on required auth credentials', function() {
    var api = new its.Sdk();
    expect(function() {
      api.secureAjaxGet();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authCredentials: 'secret',
    });
    var url = 'https://api.itslanguage.nl/basicauths';
    jasmine.Ajax.stubRequest(url).andReturn(
      {
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify({})
      }
    );
    var output = api.secureAjaxGet(url);

    return output
      .then(function(result) {
        console.log('output is ' + JSON.stringify(output));
        var request = jasmine.Ajax.requests.mostRecent();
        console.log('request is  ' + request);
        // That's the correct base64 representation of 'principal:secret'
        expect(request.requestHeaders).toEqual({
          Authorization: 'Basic cHJpbmNpcGFsOnNlY3JldA=='
        });

      })
      .catch(function(error) {

        fail('No error should be thrown: ' + error);

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
    var api = new its.Sdk();
    expect(function() {
      api.secureAjaxPost();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authCredentials: 'secret'
    });
    var url = api.settings.apiUrl;
    jasmine.Ajax.stubRequest(url).andReturn(
      {
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify({})
      }
    );
    var output = api.secureAjaxPost(url);

    return output
      .then(function(result) {

        var request = jasmine.Ajax.requests.mostRecent();
        // That's the correct base64 representation of 'principal:secret'
        expect(request.requestHeaders).toEqual({
          Authorization: 'Basic cHJpbmNpcGFsOnNlY3JldA=='
        });

      })
      .catch(function(error) {

        fail('No error should be thrown: ' + error);

      });
  });
});

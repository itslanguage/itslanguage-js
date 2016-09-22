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
const its = require('../src');

describe('Organisation object test', function() {
  it('should instantiate an Organisation without id', function() {
    var o = new its.Organisation();
    expect(o).toBeDefined();
    expect(o.id).toBeUndefined();
    expect(o.name).toBeUndefined();
  });

  it('should instantiate an Organisation with id and metadata', function() {
    var o = new its.Organisation('test', 'School of silly walks');
    expect(o).toBeDefined();
    expect(o.id).toBe('test');
    expect(o.name).toBe('School of silly walks');
  });
});

describe('Organisation API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new organisation through API', function() {
    var organisation = new its.Organisation('1', 'School of silly walks');
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations';
    var expected = {id: '1', name: 'School of silly walks'};
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    var fakeResponse = {
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.createOrganisation(organisation);
    expect(output).toEqual(jasmine.any(Promise));

    return output.then(function(result) {
      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      expect(request.data()).toEqual(expected);
      var stringDate = '2014-12-31T23:59:59Z';
      expect(result).toEqual(organisation);
      expect(organisation.id).toBe('1');
      expect(organisation.created).toEqual(new Date(stringDate));
      expect(organisation.updated).toEqual(new Date(stringDate));
      expect(organisation.name).toBe('School of silly walks');
    }).catch(function(error) {
      fail('No error should be thrown : ' + error);
    });
  });

  it('should handle errors while creating a new organisation', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var organisation = new its.Organisation('1');
    var url = 'https://api.itslanguage.nl/organisations';
    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'Organisation',
          field: 'name',
          code: 'missing'
        }
      ]
    };
    var fakeResponse = {
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.createOrganisation(organisation);

    expect(output).toEqual(jasmine.any(Promise));


        return output.then(function(result){

          fail('An error should be thrown! Instead got result ' + result);
          expect(result).toBeUndefined();

        }).catch(function(error){
          var request = jasmine.Ajax.requests.mostRecent();
          expect(request.url).toBe(url);
          expect(request.method).toBe('POST');
          expect(error.errors).toEqual(content);

        });
  });

  it('should get an existing organisation through API', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/4';
    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.getOrganisation('4');
    expect(output).toEqual(jasmine.any(Promise));

    return output.then(function(result) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');

      var stringDate = '2014-12-31T23:59:59Z';
      var organisation = new its.Organisation('4', 'School of silly walks');
      organisation.created = new Date(stringDate);
      organisation.updated = new Date(stringDate);
      expect(result).toEqual(organisation);

    }).catch(function(error) {

      fail('No error should be thrown: ' + error);

    });
  });

  it('should get a list of existing organisations through API', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations';
    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    }];
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.listOrganisations();
    expect(output).toEqual(jasmine.any(Promise));

    return output.then(function(result) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      var stringDate = '2014-12-31T23:59:59Z';
      var organisation = new its.Organisation('4', 'School of silly walks');
      organisation.created = new Date(stringDate);
      organisation.updated = new Date(stringDate);
      expect(result[0]).toEqual(organisation);
      expect(result.length).toBe(1);

    }).catch(function(error) {

      fail('No error should be thrown: ' + error);

    });
  });
});

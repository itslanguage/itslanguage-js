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
const Organisation = require('../administrative-sdk/organisation').Organisation;
const Connection = require('../administrative-sdk/connection').Connection;

describe('Organisation object test', function() {
  it('should instantiate an Organisation without id', function() {
    var o = new Organisation();
    expect(o).toBeDefined();
    expect(o.id).toBeUndefined();
    expect(o.name).toBeUndefined();
  });

  it('should instantiate an Organisation with id and metadata', function() {
    var o = new Organisation('test', 'School of silly walks');
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

  it('should create a new organisation through API', function(done) {
    var organisation = new Organisation('1', 'School of silly walks');
    var api = new Connection({
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
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    organisation.createOrganisation(api)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(expected));
        var stringDate = '2014-12-31T23:59:59Z';
        expect(result).toEqual(organisation);
        expect(result.id).toBe('1');
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
        expect(result.name).toBe('School of silly walks');
      })
       .catch(function(error) {
         fail('No error should be thrown : ' + error);
       }).then(done);
  });

  it('should handle errors while creating a new organisation', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var organisation = new Organisation('1');
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
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 422,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    organisation.createOrganisation(api)
      .then(function(result) {
        fail('An error should be thrown! Instead got result ' + result);
      })
      .catch(function(error) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(error).toEqual(content);
      })
      .then(done);
  });

  it('should get an existing organisation through API', function(done) {
    var api = new Connection({
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
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    Organisation.getOrganisation(api, '4')
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var organisation = new Organisation('4', 'School of silly walks');
        organisation.created = new Date(stringDate);
        organisation.updated = new Date(stringDate);
        expect(result).toEqual(organisation);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing organisations through API', function(done) {
    var api = new Connection({
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
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    Organisation.listOrganisations(api)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var organisation = new Organisation('4', 'School of silly walks');
        organisation.created = new Date(stringDate);
        organisation.updated = new Date(stringDate);
        expect(result[0]).toEqual(organisation);
        expect(result.length).toBe(1);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});

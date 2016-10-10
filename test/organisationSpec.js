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

  it('should create a new organisation through API', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var organisation = new Organisation('1', 'School of silly walks', api);
    var cb = jasmine.createSpy('callback');

    var output = organisation.createOrganisation(api, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {id: '1', name: 'School of silly walks'};
    expect(request.data()).toEqual(expected);

    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    expect(cb).toHaveBeenCalledWith(organisation);
    expect(organisation.id).toBe('1');
    expect(organisation.created).toEqual(new Date(stringDate));
    expect(organisation.updated).toEqual(new Date(stringDate));
    expect(organisation.name).toBe('School of silly walks');
  });

  it('should handle errors while creating a new organisation', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var organisation = new Organisation('1');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = organisation.createOrganisation(api, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {id: '1'};
    expect(request.data()).toEqual(expected);

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
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{
      resource: 'Organisation',
      field: 'name',
      code: 'missing'
    }];
    expect(ecb).toHaveBeenCalledWith(errors, organisation);
    expect(output).toBeUndefined();
  });

  it('should get an existing organisation through API', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var cb = jasmine.createSpy('callback');

    var output = Organisation.getOrganisation(api, '4', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/4';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var organisation = new Organisation('4', 'School of silly walks');
    organisation.created = new Date(stringDate);
    organisation.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith(organisation);
  });

  it('should get a list of existing organisations through API', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = Organisation.listOrganisations(api, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var organisation = new Organisation('4', 'School of silly walks');
    organisation.created = new Date(stringDate);
    organisation.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith([organisation]);
  });
});

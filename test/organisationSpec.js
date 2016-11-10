require('jasmine-ajax');
const Organisation = require('../administrative-sdk/organisation/organisation');
const OrganisationController = require('../administrative-sdk/organisation/organisation-controller');
const Connection = require('../administrative-sdk/connection/connection-controller');

describe('Organisation object test', () => {
  it('should instantiate an Organisation without id', () => {
    const o = new Organisation();
    expect(o).toBeDefined();
    expect(o.id).toBeUndefined();
    expect(o.name).toBeUndefined();
  });

  it('should instantiate an Organisation with id and metadata', () => {
    const o = new Organisation('test', 'School of silly walks');
    expect(o).toBeDefined();
    expect(o.id).toBe('test');
    expect(o.name).toBe('School of silly walks');
  });
});

describe('Organisation API interaction test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should create a new organisation through API', done => {
    const organisation = new Organisation('1', 'School of silly walks');
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new OrganisationController(api);
    const url = 'https://api.itslanguage.nl/organisations';
    const expected = {id: '1', name: 'School of silly walks'};
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createOrganisation(organisation)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(expected));
        const stringDate = '2014-12-31T23:59:59Z';
        organisation.created = new Date(stringDate);
        organisation.updated = new Date(stringDate);
        expect(result).toEqual(organisation);
        expect(result.id).toBe('1');
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
        expect(result.name).toBe('School of silly walks');
      })
       .catch(error => {
         fail('No error should be thrown : ' + error);
       }).then(done);
  });

  it('should handle errors while creating a new organisation', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new OrganisationController(api);
    const organisation = new Organisation('1');
    const url = 'https://api.itslanguage.nl/organisations';
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'Organisation',
          field: 'name',
          code: 'missing'
        }
      ]
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 422,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createOrganisation(organisation)
      .then(result => {
        fail('An error should be thrown! Instead got result ' + result);
      })
      .catch(error => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(error).toEqual(content);
      })
      .then(done);
  });

  it('should get an existing organisation through API', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/organisations/4';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new OrganisationController(api);
    controller.getOrganisation('4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const organisation = new Organisation('4', 'School of silly walks');
        organisation.created = new Date(stringDate);
        organisation.updated = new Date(stringDate);
        expect(result).toEqual(organisation);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing organisations through API', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/organisations';
    const content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new OrganisationController(api);
    controller.listOrganisations()
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const organisation = new Organisation('4', 'School of silly walks');
        organisation.created = new Date(stringDate);
        organisation.updated = new Date(stringDate);
        expect(result[0]).toEqual(organisation);
        expect(result.length).toBe(1);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});

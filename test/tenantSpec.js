import Connection from '../administrative-sdk/connection/connection-controller';
import Tenant from '../administrative-sdk/tenant/tenant';
import TenantController from '../administrative-sdk/tenant/tenant-controller';

describe('Tenant', () => {
  it('should create a tenant', done => {
    const stringDate = '2014-12-31T23:59:59Z';
    const content = {
      id: '1',
      created: stringDate,
      updated: stringDate
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    const api = new Connection({
      oAuth2Token: 'token'
    });

    const tenant = new Tenant('1', 'tenant');
    const controller = new TenantController(api);
    const url = 'https://api.itslanguage.nl/tenants';
    controller.createTenant(tenant)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(result.id).toEqual('1');
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      })
      .then(done);
  });
});

import Tenant from './tenant';

/**
 * Controller class for the Tenant model.
 */
export default class TenantController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this._connection = connection;
  }

  /**
   * Create a tenant.
   *
   * @param {its.Tenant} tenant Object to create.
   * @returns Promise containing the newly created object.
   * @rejects If the server returned an error..
   */
  createTenant(tenant) {
    const url = this._connection.settings.apiUrl + '/tenants';
    const fd = JSON.stringify(tenant);
    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new Tenant(data.id, data.name);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }
}

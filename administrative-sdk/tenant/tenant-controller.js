import Tenant from './tenant';

/**
 * Controller class for the Tenant model.
 */
export default class TenantController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    this._connection = connection;
  }

  /**
   * Create a tenant.
   *
   * @param {Tenant} tenant - Object to create.
   * @returns {Promise} Promise containing the newly created object.
   * @throws {Promise} If the server returned an error.
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

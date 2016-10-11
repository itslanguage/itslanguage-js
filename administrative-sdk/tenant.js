/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
class Tenant {
  /**
   * Tenant domain model.
   *
   * @constructor
   * @param {string} [id] The tenant identifier. If none is given, one is generated.
   * @param {string} name name of the tenant.
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  /**
   * Create a tenant.
   *
   * @param {its.Tenant} tenant A tenant domain model instance.
   * @param {Sdk~tenantCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~tenantCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createTenant(connection) {
    var url = connection.settings.apiUrl + '/tenants';
    var fd = JSON.stringify(this);
    return connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        this.id = data.id;
        this.created = new Date(data.created);
        this.updated = new Date(data.updated);
        return this;
      });
  }
}

module.exports = {
  Tenant: Tenant
};

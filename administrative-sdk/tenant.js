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
  constructor(id, name, connection) {
    this.id = id;
    this.name = name;
    this.connection = connection;
  }

  /**
   * Callback used by createTenant.
   *
   * @callback Sdk~tenantCreatedCallback
   * @param {its.Tenant} tenant Updated tenant domain model instance.
   */
  tenantCreatedCallback(tenant) {}

  /**
   * Error callback used by createTenant.
   *
   * @callback Sdk~tenantCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.Tenant} tenant Tenant domain model instance with unapplied changes.
   */
  tenantCreatedErrorCallback(errors, tenant) {}

  /**
   * Create a tenant.
   *
   * @param {its.Tenant} tenant A tenant domain model instance.
   * @param {Sdk~tenantCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~tenantCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createTenant(cb, ecb) {
    var self = this;
    var _cb = function(data) {
      // Update the id in case domain model didn't contain one.
      self.id = data.id;
      self.created = new Date(data.created);
      self.updated = new Date(data.updated);
      if (cb) {
        cb(self);
      }
    };

    var _ecb = function(errors) {
      if (ecb) {
        ecb(errors, self);
      }
    };

    var url = this.connection.settings.apiUrl + '/tenants';
    var fd = JSON.stringify(this);
    this.connection._secureAjaxPost(url, fd, _cb, _ecb);
  }
}

module.exports = {
  Tenant: Tenant
};

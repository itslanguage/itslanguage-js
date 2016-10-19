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
}

module.exports = {
  Tenant
};

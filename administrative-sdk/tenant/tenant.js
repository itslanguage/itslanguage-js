export default class Tenant {
  /**
   * Tenant domain model.
   *
   * @param {string} [id] - The tenant identifier. If none is given, one is generated.
   * @param {string} name - Name of the tenant.
   */
  constructor(id, name) {
    /**
     * The tenant identifier.
     * @type {string}
     */
    this.id = id;

    /**
     * Name of the tenant.
     * @type {string}
     */
    this.name = name;
  }
}

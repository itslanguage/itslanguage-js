/**
 * Role domain model. Represents a role a {@link User} can take on.
 */
export default class Role {
  /**
   * Create a Role.
   *
   * @param {string} name - Name of the role.
   * @param {Array.<string>} permissions - Permissions this role can take on.
   * @throws {Error} role parameter of type "string" is required.
   * @throws {Error} permission parameter of type "Array.<string>" is required.
   */
  constructor(name, permissions) {
    if (typeof name !== 'string') {
      throw new Error('role parameter of type "string" is required');
    }

    if (!(permissions instanceof Array) || permissions.length === 0) {
      throw new Error('permission parameter of type "Array.<string>" is required');
    }

    /**
     * @type {string} Name of the role.
     */
    this.name = name;

    /**
     * @type {Array.<string>} Permissions this role can take on.
     */
    this.permissions = permissions;
  }
}

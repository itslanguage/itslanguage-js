import Role from './role';

/**
 * Controller class for the Role model.
 * @private
 */
export default class RoleController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    /**
     * Object to use for making a connection to the REST API and Websocket server.
     * @type {Connection}
     */
    this._connection = connection;
  }

  /**
   * List all roles available in the API.
   *
   * @returns {Promise.<Role[]>} Promise containing an array of Roles.
   */
  listRoles() {
    const url = this._connection._settings.apiUrl + '/roles';
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const roles = [];
        data.forEach(datum => {
          const role = new Role(datum.name, datum.permissions);
          roles.push(role);
        });
        return roles;
      });
  }

  /**
   * Get a single role.
   *
   * @param {string} roleId - Identifier of the role.
   * @returns {Promise.<Role>} Promise containing a Role.
   * @throws {Promise.<Error>} roleId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getRole(roleId) {
    if (typeof roleId !== 'string') {
      return Promise.reject(new Error('roleId parameter of type "string" is required'));
    }
    const url = this._connection._settings.apiUrl + '/roles/' + roleId;
    return this._connection._secureAjaxGet(url)
      .then(data => new Role(data.name, data.permissions));
  }
}

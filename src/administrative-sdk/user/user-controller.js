import User from './user';

/**
 * Controller class for the User model.
 * @private
 */
export default class UserController {
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
   * Create a user. The user will be created in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {User} user - User to create.
   * @returns {Promise.<User>} Promise containing the newly created User.
   * @throws {Promise.<Error>} user parameter of type "User" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createUser(user) {
    if (!(user instanceof User)) {
      return Promise.reject(new Error('user parameter of type "User" is required'));
    }
    const url = this._connection._settings.apiUrl + '/users';
    const fd = JSON.stringify(user);
    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new User(data.id, data.profile, data.groups, data.roles);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get a user in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} userId - Specify a user identifier.
   * @returns {Promise.<User>} Promise containing a User.
   * @throws {Promise.<Error>} userId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getUser(userId) {
    if (typeof userId !== 'string') {
      return Promise.reject(new Error('userId parameter of type "string" is required'));
    }
    const url = this._connection._settings.apiUrl + '/users/' + userId;
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const user = new User(data.id, data.profile, data.groups, data.roles);
        user.created = new Date(data.created);
        user.updated = new Date(data.updated);
        return user;
      });
  }

  /**
   * List all users in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<User[]>} Promise containing an array of Users.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getUsers() {
    const url = this._connection._settings.apiUrl + '/users';
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const users = [];
        data.forEach(datum => {
          const user = new User(datum.id, datum.profile, datum.groups, datum.roles);
          user.created = new Date(datum.created);
          user.updated = new Date(datum.updated);
          users.push(user);
        });
        return users;
      });
  }

  /**
   * Get the current authenticated user.
   *
   * @returns {Promise.<User>} The current authenticated user.
   * @throws {Promise.<Error>} If something went wrong in the server.
   */
  getCurrentUser() {
    const url = this._connection._settings.apiUrl + '/user';
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const user = new User(data.id, data.profile, data.groups, data.roles);
        user.created = new Date(data.created);
        user.updated = new Date(data.updated);
        return user;
      });
  }
}

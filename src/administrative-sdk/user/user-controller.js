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
   * Create a user.
   *
   * @param {User} user - User to create.
   * @returns {Promise.<User>} Promise containing the newly created User.
   * @throws {Promise.<Error>} {@link User#organisationId} field is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createUser(user) {
    if (!user.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/organisations/' +
      user.organisationId + '/users';
    const fd = JSON.stringify(user);

    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new User(user.organisationId, data.id, data.firstName, data.lastName, data.gender,
          data.birthYear);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get a user in the given {@link Organisation}.
   *
   * @param {string} organisationId - Specify an organisation identifier.
   * @param {string} userId - Specify a user identifier.
   * @returns {Promise.<User>} Promise containing a User.
   * @throws {Promise.<Error>} {@link Organisation#id} field is required.
   * @throws {Promise.<Error>} {@link User#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getUser(organisationId, userId) {
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    if (!userId) {
      return Promise.reject(new Error('userId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/organisations/' +
      organisationId + '/users/' + userId;
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const user = new User(organisationId, data.id, data.firstName,
          data.lastName, data.gender, data.birthYear);
        user.created = new Date(data.created);
        user.updated = new Date(data.updated);
        return user;
      });
  }

  /**
   * List all users in the organisation.
   *
   * @param {string} organisationId - Specify an organisation identifier.
   * @returns {Promise.<User[]>} Promise containing an array of Users.
   * @throws {Promise.<Error>} {@link Organisation#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listUsers(organisationId) {
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/organisations/' +
      organisationId + '/users';
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const users = [];
        data.forEach(datum => {
          const user = new User(organisationId, datum.id,
            datum.firstName, datum.lastName, datum.gender, datum.birthYear);
          user.created = new Date(datum.created);
          user.updated = new Date(datum.updated);
          users.push(user);
        });
        return users;
      });
  }
}

import Progress from './progress';

/**
 * Controller class for the Progress model.
 * @private
 */
export default class ProgressController {
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
   * Get Progress corresponding to a {@Link Category} for the current active {@Link User} derived from
   * the OAuth2 scope. If a user is allowed to see the progress of multiple users (depending of its
   * {@Link Role} and permissions) then more Progress objects could be returned. This can be controlled
   * with the groupId parameter. This way, only users in a specific group will be returned as a result.
   *
   * Progress is always being fetched for a single category, identified with a categoryId.
   *
   * @param {string} categoryId - Specify a Category identifier.
   * @param {?string} groupId - Specify a Group identifier.
   * @param {?Array} roles - Specify user roles as a filter to the result.
   * @returns {Promise.<Progress[]>} Array of Progress.
   * @throws {Promise.<Error>} categoryId parameter of type "string" is required.
   * @throws {Promise.<Error>} groupId parameter of type "string|null" is required.
   * @throws {Promise.<Error>} roles parameter of type "Array|null" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  getProgress(categoryId, groupId = null, roles = null) {
    let urlMod = '';

    if (typeof categoryId !== 'string') {
      return Promise.reject(new Error('categoryId parameter of type "string" is required'));
    }

    if (groupId !== null && typeof groupId !== 'string') {
      return Promise.reject(new Error('groupId parameter of type "string|null" is required'));
    }

    if (roles !== null && !Array.isArray(roles)) {
      return Promise.reject(new Error('roles parameter of type "Array|null" is required'));
    }

    if (groupId) {
      urlMod = `?group=${groupId}`;
    }

    if (groupId && roles) {
      roles.map(role => {
        urlMod += `&role=${role}`;
      });
    }

    const url = `${this._connection._settings.apiUrl}/categories/${categoryId}/progress${urlMod}`;

    return this._connection._secureAjaxGet(url)
      .then(data => data.map(({user, category, percentage, challenges}) =>
        new Progress(user, category, String(percentage), challenges)
      ));
  }
}

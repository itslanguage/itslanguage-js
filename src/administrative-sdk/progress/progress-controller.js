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
   * {@Link Role} and permissions) then more Progress objects could be returned.
   *
   * Progress is always being fetched for a single category, identified with a categoryId.
   *
   * @param {string} categoryId - Specify a Category identifier.
   * @returns {Promise.<Progress[]>} Array of Progress.
   * @throws {Promise.<Error>} categoryId parameter of type "string" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  getProgress(categoryId) {
    if (typeof categoryId !== 'string') {
      return Promise.reject(new Error('categoryId parameter of type "string" is required'));
    }

    const url = `${this._connection._settings.apiUrl}/categories/${categoryId}/progress`;

    return this._connection._secureAjaxGet(url)
      .then(data => data.map(({user, category, percentage, challenges}) =>
        new Progress(user, category, String(percentage), challenges)
      ));
  }
}

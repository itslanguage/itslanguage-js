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

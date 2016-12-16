import EmailCredentials from './email-credentials';

/**
 * Controller class for the Email Credentials model.
 * @private
 */
export default class EmailCredentialsController {
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
   * Register credentials to the given user. Multiple credentials can be registered to one user.
   *
   * @param {string} userId - The identifier of the user to register credentials to.
   * @param {EmailCredentials} emailCredentials - The credentials to register to the user.
   * @returns {Promise.<EmailCredentials>} A promise containing the created EmailCredentials.
   * @throws {Promise} UserId field is required.
   * @throws {Promise} EmailCredentials field is required.
   * @throws {Promise} If the server returned an error.
   */
  createEmailCredentials(userId, emailCredentials) {
    if (typeof userId !== 'string') {
      return Promise.reject(new Error('userId field is required'));
    }

    if (!(emailCredentials instanceof EmailCredentials)) {
      return Promise.reject(new Error('emailCredentials field is required'));
    }

    const url = this._connection._settings.apiUrl + '/users/' + userId + '/emailauths';
    const fd = JSON.stringify(emailCredentials);
    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new EmailCredentials(data.email, data.password);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }
}

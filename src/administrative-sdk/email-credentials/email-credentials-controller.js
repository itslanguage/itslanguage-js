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
   * @throws {Promise.<Error>} userId parameter of type "string" is required.
   * @throws {Promise.<Error>} emailCredentials parameter of type "EmailCredentials" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createEmailCredentials(userId, emailCredentials) {
    if (typeof userId !== 'string') {
      return Promise.reject(new Error('userId parameter of type "string" is required'));
    }

    if (!(emailCredentials instanceof EmailCredentials)) {
      return Promise.reject(new Error('emailCredentials parameter of type "EmailCredentials" is required'));
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

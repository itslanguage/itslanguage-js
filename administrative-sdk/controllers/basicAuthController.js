class BasicAuthController {
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Create a basic authorization.
   *
   * @param {BasicAuth} basicAuth Object to create.
   * @returns Promise containing the newly created object.
   * @rejects If the server returned an error.
   */
  createBasicAuth(basicAuth) {
    var url = this.connection.settings.apiUrl + '/basicauths';
    var formData = JSON.stringify(basicAuth);
    return this.connection._secureAjaxPost(url, formData)
      .then(data => {
        basicAuth.principal = data.principal;
        basicAuth.created = new Date(data.created);
        basicAuth.updated = new Date(data.updated);
        // Credentials are only supplied when generated by the backend.
        if (data.credentials) {
          basicAuth.credentials = data.credentials;
        }
        return basicAuth;
      });
  }
}

module.exports = {
  BasicAuthController: BasicAuthController
};

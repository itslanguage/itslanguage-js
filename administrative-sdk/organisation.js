/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
class Organisation {
  /**
   * Organisation domain model.
   *
   * @constructor
   * @param {string} [id] The organisation identifier. If none is given, one is generated.
   * @param {string} [name] name of the organisation.
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  /**
   * Create an organisation.
   *
   * @param {its.Organisation} organisation An organisation domain model instance.
   * @param {Sdk~organisationCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~organisationCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createOrganisation(connection) {
    var url = connection.settings.apiUrl + '/organisations';
    var fd = JSON.stringify(this);

    return connection._secureAjaxPost(url, fd)
      .then(data => {
        this.id = data.id;
        this.created = new Date(data.created);
        this.updated = new Date(data.updated);
        return this;
      });
  }

  /**
   * Get an organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~getCallback} [cb] The callback that handles the response.
   * @param {Sdk~getErrorCallback} [ecb] The callback that handles the error response.
   */
  static getOrganisation(connection, organisationId) {
    var url = connection.settings.apiUrl + '/organisations/' + organisationId;

    return connection._secureAjaxGet(url)
      .then(data => {
        var organisation = new Organisation(data.id, data.name);
        organisation.created = new Date(data.created);
        organisation.updated = new Date(data.updated);
        return (organisation);
      });
  }

  /**
   * List all organisations in the organisation.
   *
   * @param {Sdk~listCallback} cb The callback that handles the response.
   * @param {Sdk~listErrorCallback} [ecb] The callback that handles the error response.
   */
  static listOrganisations(connection) {
    var url = connection.settings.apiUrl + '/organisations';

    return connection._secureAjaxGet(url)
      .then(data => {
        var organisations = [];
        data.forEach(function(datum) {
          var organisation = new Organisation(datum.id, datum.name);
          organisation.created = new Date(datum.created);
          organisation.updated = new Date(datum.updated);
          organisations.push(organisation);
        });
        return organisations;
      });
  }
}

module.exports = {
  Organisation: Organisation
};

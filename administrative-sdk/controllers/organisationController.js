const Organisation = require('../models/organisation').Organisation;

/**
 * Controller class for the Organisation model.
 */
class OrganisationController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Create an organisation.
   *
   * @param {its.Organisation} organisation Object to create.
   * @returns Promise containing the newly created object.
   * @throws If the server returned an error.
   */
  createOrganisation(organisation) {
    var url = this.connection.settings.apiUrl + '/organisations';
    var fd = JSON.stringify(organisation);

    return this.connection._secureAjaxPost(url, fd)
      .then(data => {
        organisation.id = data.id;
        organisation.created = new Date(data.created);
        organisation.updated = new Date(data.updated);
        return organisation;
      });
  }

  /**
   * Get an organisation.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise containing an Organisation.
   * @rejects If no result could not be found.
   */
  static getOrganisation(connection, organisationId) {
    const url = connection.settings.apiUrl + '/organisations/' + organisationId;

    return connection._secureAjaxGet(url)
      .then(data => {
        const organisation = new Organisation(data.id, data.name);
        organisation.created = new Date(data.created);
        organisation.updated = new Date(data.updated);
        return organisation;
      });
  }

  /**
   * List all organisations.
   *
   * @returns Promise containing a list of Organisations.
   * @rejects If no result could not be found.
   */
  static listOrganisations(connection) {
    const url = connection.settings.apiUrl + '/organisations';

    return connection._secureAjaxGet(url)
      .then(data => {
        const organisations = [];
        data.forEach(datum => {
          const organisation = new Organisation(datum.id, datum.name);
          organisation.created = new Date(datum.created);
          organisation.updated = new Date(datum.updated);
          organisations.push(organisation);
        });
        return organisations;
      });
  }
}

module.exports = {
  OrganisationController
};

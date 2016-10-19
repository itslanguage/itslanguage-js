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
   * @param {Connection} connection Object to connect to.
   * @param {its.Organisation} organisation An organisation domain model instance.
   * @returns Promise containing this.
   * @throws If the server returned an error.
   */
  createOrganisation(connection) {
    const url = connection.settings.apiUrl + '/organisations';
    const fd = JSON.stringify(this);

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
   * List all organisations in the organisation.
   *
   * @param {Connection} connection Object to connect to.
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
  Organisation
};

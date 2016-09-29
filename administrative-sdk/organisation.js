/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
'use strict';

class Organisation {
  /**
   * Organisation domain model.
   *
   * @constructor
   * @param {string} [id] The organisation identifier. If none is given, one is generated.
   * @param {string} [name] name of the organisation.
   */
  constructor(id, name, connection) {
    this.id = id;
    this.name = name;
    this.connection = connection;
  }

  /**
   * Callback used by createOrganisation.
   *
   * @callback Sdk~organisationCreatedCallback
   * @param {its.Organisation} organisation Updated organisation domain model instance.
   */
  organisationCreatedCallback(organisation) {}

  /**
   * Error callback used by createOrganisation.
   *
   * @callback Sdk~organisationCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.Organisation} organisation Organisation domain model instance with unapplied changes.
   */
  organisationCreatedErrorCallback(errors, organisation) {}

  /**
   * Create an organisation.
   *
   * @param {its.Organisation} organisation An organisation domain model instance.
   * @param {Sdk~organisationCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~organisationCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createOrganisation(cb, ecb) {
    var self = this;
    var _cb = function(data) {
      // Update the id in case domain model didn't contain one.
      self.id = data.id;
      self.created = new Date(data.created);
      self.updated = new Date(data.updated);
      if (cb) {
        cb(self);
      }
    };

    var _ecb = function(errors) {
      if (ecb) {
        ecb(errors, self);
      }
    };

    var url = this.connection.settings.apiUrl + '/organisations';
    var fd = JSON.stringify(this);
    this.connection._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getOrganisation.
   *
   * @callback Sdk~organisationGetCallback
   * @param {its.Organisation} organisation Retrieved organisation domain model instance.
   */
  organisationGetCallback(organisation) {}

  /**
   * Error callback used by getOrganisation.
   *
   * @callback Sdk~organisationGetErrorCallback
   * @param {object[]} errors Array of errors.
   */
  organisationGetErrorCallback(errors) {}

  /**
   * Get an organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~getCallback} [cb] The callback that handles the response.
   * @param {Sdk~getErrorCallback} [ecb] The callback that handles the error response.
   */
  getOrganisation(organisationId, cb, ecb) {
    var _cb = function(data) {
      var organisation = new Organisation(data.id, data.name);
      organisation.created = new Date(data.created);
      organisation.updated = new Date(data.updated);
      if (cb) {
        cb(organisation);
      }
    };
    var url = this.connection.settings.apiUrl + '/organisations/' + organisationId;
    this.connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listOrganisations.
   *
   * @callback Sdk~listCallback
   * @param {its.Organisation[]} organisation Retrieved organisation domain model instances.
   */
  organisationListCallback(organisation) {}

  /**
   * Error callback used by listOrganisations.
   *
   * @callback Sdk~listErrorCallback
   * @param {object[]} errors Array of errors.
   */
  organisationListErrorCallback(errors) {}

  /**
   * List all organisations in the organisation.
   *
   * @param {Sdk~listCallback} cb The callback that handles the response.
   * @param {Sdk~listErrorCallback} [ecb] The callback that handles the error response.
   */
  listOrganisations(cb, ecb) {
    var _cb = function(data) {
      var organisations = [];
      data.forEach(function(datum) {
        var organisation = new Organisation(datum.id, datum.name);
        organisation.created = new Date(datum.created);
        organisation.updated = new Date(datum.updated);
        organisations.push(organisation);
      });
      if (cb) {
        cb(organisations);
      }
    };
    var url = this.connection.settings.apiUrl + '/organisations';
    this.connection._secureAjaxGet(url, _cb, ecb);
  }
}

module.exports = {
  Organisation: Organisation
};

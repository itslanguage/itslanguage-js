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
}

module.exports = {
  Organisation
};

export default class Organisation {
  /**
   * Organisation domain model.
   *
   * @constructor
   * @param {string} [id] The organisation identifier. If none is given, one is generated.
   * @param {string} name name of the organisation.
   */
  constructor(id, name) {
    if (id && typeof id !== 'string') {
      throw new Error('id parameter of type "string|null" is required');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('name parameter of type "string" is required');
    }

    this.id = id;
    this.name = name;
  }
}

export default class Organisation {
  /**
   * Organisation domain model.
   *
   * @param {?string} id - The organisation identifier. If none is given, one is generated.
   * @param {string} name - Name of the organisation.
   */
  constructor(id = null, name) {
    if (id !== null && typeof id !== 'string') {
      throw new Error('id parameter of type "string|null" is required');
    }

    if (typeof name !== 'string') {
      throw new Error('name parameter of type "string" is required');
    }

    /**
     * @type {string}
     */
    this.id = id;

    /**
     * @type {string}
     */
    this.name = name;
  }
}

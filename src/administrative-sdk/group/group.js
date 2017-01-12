/**
 * Group domain model. A {@link User} can be part of one or multiple groups
 */
export default class Group {
  /**
   * Create a group.
   *
   * @param {?string} id - The group identifier. If none is given, one is generated.
   * @param {string} name - The name of the group.
   * @throws {Error} id parameter of type "string|null" is required
   * @throws {Error} name parameter of type "string" is required
   */
  constructor(id, name) {
    if (id !== null && typeof id !== 'string') {
      throw new Error('id parameter of type "string|null" is required');
    }

    /**
     * @type {string} The group identifier. If none is given, one is generated.
     */
    this.id = id;

    if (typeof name !== 'string') {
      throw new Error('name parameter of type "string" is required');
    }

    /**
     * @type {string} The name of the group.
     */
    this.name = name;
  }
}

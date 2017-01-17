/**
 * A category for a challenge.
 * It is used to give a challenge front end attributes such as an icon, a color palette etc.
 */
export default class Category {
  /**
   * Create a category.
   *
   * @param {?string} id - Identifier of this category. If none is given one is generated upon creation in the API.
   * @param {?string} parent - Identifier of the parent category.
   * @param {?string} name - Name associated with this category.
   * @param {?string} description - Description associated with this category.
   * @param {?string} color - Color code in hexadecimal format associated with this category.
   * @param {?Array.<string>} speechChallenges - Identifiers of the challenges this category contains.
   * A category can only contain either more categories or challenges.
   * @throws {Error} id parameter of type "string|null" is required.
   * @throws {Error} name parameter of type "string|null" is required.
   * @throws {Error} description parameter of type "string|null" is required.
   * @throws {Error} color parameter of type "string|null" is required.
   * @throws {Error} speechChallenges parameter of type "Array.<string>|null" is required.
   */
  constructor(id = null, parent = null, name = null, description = null, color = null, speechChallenges = null) {
    if (id !== null && typeof id !== 'string') {
      throw new Error('id parameter of type "string|null" is required');
    }

    if (parent !== null && typeof parent !== 'string') {
      throw new Error('parent parameter of type "string|null" is required');
    }

    if (typeof name !== 'string') {
      throw new Error('name parameter of type "string|null" is required');
    }

    if (description !== null && typeof description !== 'string') {
      throw new Error('description parameter of type "string|null" is required');
    }

    if (color !== null && typeof color !== 'string') {
      throw new Error('color parameter of type "string|null" is required');
    }

    if (speechChallenges !== null && !Array.isArray(speechChallenges)) {
      throw new Error('speechChallenges parameter of type "Array.<string>|null" is required');
    }

    /**
     * Identifier of this category. If none is given one is generated upon creation in the API.
     * @type {string}
     */
    this.id = id;

    /**
     * Identifier of the parent category.
     * @type {string}
     */
    this.parent = parent;

    /**
     * Name associated with this category.
     * @type {string}
     */
    this.name = name;

    /**
     * Description associated with this category.
     * @type {string}
     */
    this.description = description;

    /**
     * Color code in hexadecimal format associated with this category.
     * @type {string}
     */
    this.color = color;

    /**
     * Download URL of the image associated with this category. This URL is only generated from the backend.
     * @type {string}
     */
    this.imageUrl = null;

    /**
     * Download URL of the icon associated with this category. This URL is only generated from the backend.
     * @type {string}
     */
    this.iconUrl = null;

    /**
     * Challenges this category contains. A category can only contain either more categories or challenges.
     * @type {Array.<string>}
     */
    this.speechChallenges = speechChallenges;
  }
}

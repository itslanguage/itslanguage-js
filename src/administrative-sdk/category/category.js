import Progress from '../progress/progress';

/**
 * A category for a challenge.
 * It is used to give a challenge front end attributes such as an icon, a color palette etc.
 */
export default class Category {
  /**
   * Create a category.
   *
   * @param {?string} id - Identifier of this category. If none is given one is generated upon creation in the API.
   * @param {string} name - Name associated with this category.
   * @param {?string} description - Description associated with this category.
   * @param {?string} color - Color associated with this category.
   * @param {?string} image - Image associated with this category.
   * @param {string} icon - Icon associated with this category.
   * @param {?Array.<Category>} categories - Other categories this category contains. A category can only contain
   * either more categories or challenges.
   * @param {?Array.<SpeechChallenge>} speechChallenges - Challenges this category contains. A category can only contain
   * either more categories or challenges.
   * @param {?Progress} progress - Progress values of this category.
   * @throws {Error} id parameter of type "string|null" is required.
   * @throws {Error} name parameter of type "string" is required.
   * @throws {Error} description parameter of type "string" is required.
   * @throws {Error} color parameter of type "string" is required.
   * @throws {Error} image parameter of type "string" is required.
   * @throws {Error} icon parameter of type "string" is required.
   * @throws {Error} categories parameter of type "Array.<Category>|null" is required.
   * @throws {Error} speechChallenges parameter of type "Array.<SpeechChallenge>|null" is required.
   * @throws {Error} progress parameter of type "Progress" is required.
   */
  constructor(id = null, name, description = null, color = null, image = null, icon = null, categories,
              speechChallenges, progress = null) {
    if (id !== null && typeof id !== 'string') {
      throw new Error('id parameter of type "string|null" is required');
    }

    if (typeof name !== 'string') {
      throw new Error('name parameter of type "string" is required');
    }

    if (description !== null && typeof description !== 'string') {
      throw new Error('description parameter of type "string|null" is required');
    }

    if (color !== null && typeof color !== 'string') {
      throw new Error('color parameter of type "string|null" is required');
    }

    if (image !== null && typeof image !== 'string') {
      throw new Error('image parameter of type "string|null" is required');
    }

    if (icon !== null && typeof icon !== 'string') {
      throw new Error('icon parameter of type "string|null" is required');
    }

    if (categories !== null && (!Array.isArray(categories) || categories.length === 0)) {
      throw new Error('categories parameter of type "Array.<Category>|null" is required');
    }

    if (speechChallenges !== null && (!Array.isArray(speechChallenges) || speechChallenges.length === 0)) {
      throw new Error('speechChallenges parameter of type "Array.<SpeechChallenge>|null" is required');
    }

    if (progress !== null && !(progress instanceof Progress)) {
      throw new Error('progress parameter of type "Progress|null" is required');
    }

    /**
     * Identifier of this category. If none is given one is generated upon creation in the API.
     * @type {string}
     */
    this.id = id;

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
     * Color associated with this category.
     * @type {string}
     */
    this.color = color;

    /**
     * Image associated with this category.
     * @type {string}
     */
    this.image = image;

    /**
     * Icon associated with this category.
     * @type {string}
     */
    this.icon = icon;

    /**
     * Other categories this category contains. A category can only contain either more categories or challenges.
     * @type {Array.<Category>}
     */
    this.categories = categories;

    /**
     * Challenges this category contains. A category can only contain either more categories or challenges.
     * @type {Array.<SpeechChallenge>}
     */
    this.speechChallenges = speechChallenges;

    /**
     * Progress values of this category.
     * @type {Progress}
     */
    this.progress = progress;
  }
}

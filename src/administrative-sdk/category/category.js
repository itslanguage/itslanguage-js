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
   * @param {string} description - Description associated with this category.
   * @param {string} color - Color associated with this category.
   * @param {string} image - Image associated with this category.
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
  constructor(id, name, description, color, image, icon, categories, speechChallenges, progress) {
    if (id !== null && typeof id !== 'string') {
      throw new Error('id parameter of type "string|null" is required');
    }

    if (typeof name !== 'string') {
      throw new Error('name parameter of type "string" is required');
    }

    if (typeof description !== 'string') {
      throw new Error('description parameter of type "string" is required');
    }

    if (typeof color !== 'string') {
      throw new Error('color parameter of type "string" is required');
    }

    if (typeof image !== 'string') {
      throw new Error('image parameter of type "string" is required');
    }

    if (typeof icon !== 'string') {
      throw new Error('icon parameter of type "string" is required');
    }

    if (categories !== null && (!Array.isArray(categories) || categories.length === 0)) {
      throw new Error('categories parameter of type "Array.<Category>|null" is required');
    }

    if (speechChallenges !== null && (!Array.isArray(speechChallenges) || speechChallenges.length === 0)) {
      throw new Error('speechChallenges parameter of type "Array.<SpeechChallenge>|null" is required');
    }

    if (!(progress instanceof Progress)) {
      throw new Error('progress parameter of type "Progress" is required');
    }

    /**
     * @type {string} Identifier of this category. If none is given one is generated upon creation in the API.
     */
    this.id = id;

    /**
     * @type {string} Name associated with this category.
     */
    this.name = name;

    /**
     * @type {string} Description associated with this category.
     */
    this.description = description;

    /**
     * @type {string} Color associated with this category.
     */
    this.color = color;

    /**
     * @type {string} Image associated with this category.
     */
    this.image = image;

    /**
     * @type {string} Icon associated with this category.
     */
    this.icon = icon;

    /**
     * @type {Array.<Category>} Other categories this category contains. A category can only contain
     * either more categories or challenges.
     */
    this.categories = categories;

    /**
     * @type {Array.<SpeechChallenge>} Challenges this category contains. A category can only contain
     * either more categories or challenges.
     */
    this.speechChallenges = speechChallenges;

    /**
     * @type {Progress} Progress values of this category.
     */
    this.progress = progress;
  }
}

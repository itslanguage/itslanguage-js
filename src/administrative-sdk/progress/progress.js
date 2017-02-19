/**
 * Progress object for challenges. Progress keeps track of the total challenges in a category and
 * the amount of SpeechChallenges that are completed.
 */
export default class Progress {
  /**
   * Create a Progress object.
   *
   * @param {Object} user - Some user information that belongs to the progress.
   * @param {string} category - The category identifier to which this progress object refers.
   * @param {?string} percentage - The percentage of completeness of all (underlying) challenges.
   * @param {?Array.<Object>} challenges - Challenges belonging to the progress.
   *
   * @throws {Error} user parameter of type "Object" is required
   * @throws {Error} category parameter of type "string" is required
   * @throws {Error} percentage parameter of type "string|null" is required
   * @throws {Error} challenges parameter of type "Array.<Objects>|null" is required
   */
  constructor(user, category, percentage = null, challenges = null) {
    if (typeof user !== 'object') {
      throw new Error('user parameter of type "Object" is required');
    }

    if (typeof category !== 'string') {
      throw new Error('category parameter of type "string" is required');
    }

    if (percentage !== null && typeof percentage !== 'string') {
      throw new Error('percentage parameter of type "string|null" is required');
    }

    if (challenges !== null && !Array.isArray(challenges)) {
      throw new Error('challenges parameter of type "Array.<Objects>|null" is required');
    }

    /**
     * @type {Object} Some user information that belongs to the progress.
     */
    this.user = user;

    /**
     * @type {string} The category identifier to which this progress object refers.
     */
    this.category = category;

    /**
     * @type {string|null} The percentage of completeness of all (underlying) challenges.
     */
    this.percentage = percentage;

    /**
     * @type {Object} Challenges belonging to the progress.
     */
    this.challenges = challenges;
  }
}

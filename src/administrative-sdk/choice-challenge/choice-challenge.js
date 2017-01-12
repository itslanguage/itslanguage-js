/**
 * ChoiceChallenge domain model.
 */
export default class ChoiceChallenge {
  /**
   * Create a choice challenge domain model.
   *
   * @param {?string} id - The {@link ChoiceChallenge} identifier. If none is given, one is generated.
   * @param {?string} question - A hint or question related to the choices.
   * @param {string[]} choices - The sentences of which at most one may be recognised.
   * @throws {Error} id parameter of type "string|null" is required.
   * @throws {Error} question parameter of type "string|null|undefined" is required.
   * @throws {Error} non-empty choices parameter is required.
   * @throws {Error} choices parameter of type "string|object Array" is required.
   * @throws {Error} no numbers allowed in choices.
   */
  constructor(id = null, question = null, choices) {
    if (id !== null && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }

    if (typeof question !== 'string') {
      throw new Error(
        'question parameter of type "string" is required');
    }

    /**
     *
     * @type {string} [question] A hint or question related to the choices.
     */
    this.question = question;

    if (!Array.isArray(choices)) {
      throw new Error(
        'choices parameter of type "Array" is required');
    }

    /**
     * @type {string[]} choices The sentences of which at most one may be recognised.
     */
    this.choices = choices;

    /**
     * @type {Date} created The creation date of the challenge entity.
     */
    this.created = null;

    /**
     * @type {Date} updated The most recent update date of the challenge entity.
     */
    this.updated = null;

    /**
     * @type {string} [status] The status of the challenge's preparation. Either 'unprepared', 'preparing' or
     * 'prepared'.
     */
    this.status = null;
  }
}

/**
 * @class ChoiceChallenge
 *
 * @member {string} organisationId The organisation identifier this challenge is an entry in.
 * @member {string} [id] The choice challenge identifier.
 * @member {date} created The creation date of the challenge entity.
 * @member {date} updated The most recent update date of the challenge entity.
 * @member {string} [question] A hint or question related to the choices.
 * @member {string} [status] The status of the challenge's preparation. Either 'unprepared', 'preparing' or 'prepared'.
 * @member {string[]} choices The sentences of which at most one may be recognised.
 */
module.exports = class ChoiceChallenge {
  /**
   * Create a choice challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this challenge is an entry in.
   * @param {string} [id] The pronunciation challenge identifier. If none is given, one is generated.
   * @param {string} [question] A hint or question related to the choices.
   * @param {string[]} choices The sentences of which at most one may be recognised.
   * @return {ChoiceChallenge}
   */
  constructor(organisationId, id, question, choices) {
    if (typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string" is required');
    }
    this.organisationId = organisationId;
    if (typeof id !== 'string' && id !== null && id !== undefined) {
      throw new Error(
        'id parameter of type "string|null|undefined" is required');
    }
    if (typeof id === 'string' && id.length === 0) {
      throw new Error(
        'id parameter should not be an empty string');
    }
    this.id = id;
    if (typeof question !== 'string' &&
      question !== null &&
      question !== undefined) {
      throw new Error(
        'question parameter of type "string|null|undefined" is required');
    }
    this.question = question;
    if (typeof choices !== 'object') {
      throw new Error(
        'choices parameter of type "Array" is required');
    }
    this.choices = choices;
  }
};

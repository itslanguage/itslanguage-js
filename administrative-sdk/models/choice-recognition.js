/**
 * @class ChoiceRecognition
 *
 * @member {ChoiceChallenge} challenge The challenge identifier.
 * @member {Student} student The student identifier on whose behalve this audio is uploaded.
 * @member {string} id The choice recognition identifier.
 * @member {Date} created The creation date of the entity.
 * @member {Date} updated The most recent update date of the entity.
 * @member {blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 * @member {string} recognised The recognised sentence.
 */
module.exports = class ChoiceRecognition {
  /**
   * Create a choice recognition domain model.
   *
   * @constructor
   * @param {PronunciationChallenge} challenge The choiceChall identifier.
   * @param {Student} student The student identifier on whose behalve this audio is uploaded.
   * @param {string} id The choice recognition identifier.
   * @param {Date} created The creation date of the entity.
   * @param {Date} updated The most recent update date of the entity.
   * @param {string} audioUrl The audio fragment as streaming audio link.
   * @param {string} recognised The recognised sentence.
   */
  constructor(challenge, student, id, created, updated, audioUrl, recognised) {
    this.id = id;
    this.challenge = challenge;
    this.student = student;
    this.created = created;
    this.updated = updated;
    this.audioUrl = audioUrl;
    this.recognised = recognised;
  }


};

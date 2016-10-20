/**
 * @class PronunciationAnalysis
 *
 * @member {PronunciationChallenge} challenge The challenge identifier.
 * @member {Student} student The student identifier on whose behalve this audio is uploaded.
 * @member {string} id The pronunciation analysis identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 * @member {number} score The average score of all phonemes grading the entire attempt.
 * @member {float} confidenceScore This value provides a reliable prediction that the pronounced phonemes are
 * actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
 * @member {its.Word[][]} words The spoken sentence, split in graphemes per word.
 */
module.exports = class PronunciationAnalysis {
  /**
   * Create a pronunciation analysis domain model.
   *
   * @constructor
   * @param {PronunciationChallenge} challenge The challenge identifier.
   * @param {Student} student The student identifier on whose behalve this audio is uploaded.
   * @param {string} id The pronunciation analysis identifier.
   * @param {date} created The creation date of the entity.
   * @param {date} updated The most recent update date of the entity.
   * @param {string} audioUrl The audio fragment as streaming audio link.
   */
  constructor(challenge, student, id, created, updated, audioUrl) {
    this.id = id;
    this.challenge = challenge;
    this.student = student;
    this.created = created;
    this.updated = updated;
    this.audioUrl = audioUrl;
  }
};

/**
 * @class PronunciationAnalysis
 */
export default class PronunciationAnalysis {
  /**
   * Create a pronunciation analysis domain model.
   *
   * @param {PronunciationChallenge} challenge - The challenge identifier.
   * @param {Student} student - The student identifier on whose behalf this audio is uploaded.
   * @param {string} id - The pronunciation analysis identifier.
   * @param {Date} created - The creation date of the entity.
   * @param {Date} updated - The most recent update date of the entity.
   * @param {string} audioUrl - The audio fragment as streaming audio link.
   */
  constructor(challenge, student, id, created, updated, audioUrl) {
    /**
     * The pronunciation analysis identifier.
     * @type {string}
     */
    this.id = id;

    /**
     * The {@link PronunciationChallenge} identifier.
     * @type {PronunciationChallenge}
     */
    this.challenge = challenge;

    /**
     * The student identifier on whose behalf this audio is uploaded.
     * @type {Student}
     */
    this.student = student;

    /**
     * The creation date of the entity.
     * @type {Date}
     */
    this.created = created;

    /**
     * The most recent update date of the entity.
     * @type {Date}
     */
    this.updated = updated;

    /**
     * The audio fragment as streaming audio link.
     * @type {string}
     */
    this.audioUrl = audioUrl;

    /**
     * The recorded audio fragment.
     * @type {Blob}
     */
    this.audio = null;

    /**
     * The average score of all phonemes grading the entire attempt.
     * @type {Number}
     */
    this.score = null;

    /**
     * This value provides a reliable prediction that the pronounced phonemes are
     * actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
     * @type {float}
     */
    this.confidenceScore = null;

    /**
     * The spoken sentence, split in graphemes per word.
     * @type {Word[][]}
     */
    this.words = null;
  }
}

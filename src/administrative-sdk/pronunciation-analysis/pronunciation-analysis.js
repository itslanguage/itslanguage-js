/**
 * @class PronunciationAnalysis
 */
export default class PronunciationAnalysis {
  /**
   * Create a pronunciation analysis domain model.
   *
   * @param {string} challengeId - The challenge identifier.
   * @param {string} studentId - The student identifier on whose behalf this audio is uploaded.
   * @param {string} id - The pronunciation analysis identifier.
   * @param {Date} created - The creation date of the entity.
   * @param {Date} updated - The most recent update date of the entity.
   * @param {string} audioUrl - The audio fragment as streaming audio link.
   * @param {number} score - The average score of all phonemes grading the entire attempt.
   * @param {float} confidenceScore - This value provides a reliable prediction that the pronounced phonemes are
   * actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
   * @param {Word[]} words - The spoken sentence, split in graphemes per word.
   */
  constructor(challengeId, studentId, id, created, updated, audioUrl, score, confidenceScore, words) {
    /**
     * The pronunciation analysis identifier.
     * @type {string}
     */
    this.id = id;

    /**
     * The {@link PronunciationChallenge} identifier.
     * @type {string}
     */
    this.challengeId = challengeId;

    /**
     * The student identifier on whose behalf this audio is uploaded.
     * @type {string}
     */
    this.studentId = studentId;

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
     * The average score of all phonemes grading the entire attempt.
     * @type {number}
     */
    this.score = score;

    /**
     * This value provides a reliable prediction that the pronounced phonemes are
     * actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
     * @type {float}
     */
    this.confidenceScore = confidenceScore;

    /**
     * The spoken sentence, split in graphemes per word.
     * @type {Word[][]}
     */
    this.words = words;
  }
}

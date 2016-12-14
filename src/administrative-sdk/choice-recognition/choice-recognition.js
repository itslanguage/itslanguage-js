/**
 * ChoiceRecognition domain model.
 */
export default class ChoiceRecognition {
  /**
   * Create a choice recognition domain model.
   *
   * @param {string} challengeId - The {@link ChoiceChallenge} identifier.
   * @param {string} studentId - The {@link Student} identifier on whose behalf this audio is uploaded.
   * @param {string} id - The {@link ChoiceRecognition} identifier.
   * @param {Date} created - The creation date of the entity.
   * @param {Date} updated - The most recent update date of the entity.
   * @param {string} audioUrl - The audio fragment as streaming audio link.
   * @param {string} recognised - The recognised sentence.
   */
  constructor(challengeId, studentId, id, created, updated, audioUrl, recognised) {
    /**
     *
     * @type {string}
     */
    this.id = id;

    /**
     *
     * @type {string}
     */
    this.challengeId = challengeId;

    /**
     *
     * @type {string}
     */
    this.studentId = studentId;

    /**
     *
     * @type {Date}
     */
    this.created = created;

    /**
     *
     * @type {Date}
     */
    this.updated = updated;

    /**
     *
     * @type {string}
     */
    this.audioUrl = audioUrl;

    /**
     *
     * @type {string}
     */
    this.recognised = recognised;
  }
}

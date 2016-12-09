/**
 * @class SpeechRecording domain model
 */
export default class SpeechRecording {
  /**
   * Create a speech recording domain model.
   *
   * @param {string} challengeId - The SpeechChallenge identifier this speech is recorded for.
   * @param {string} userId - The User identifier on whose behalf this audio is recorded.
   * @param {string} id - The speech recording identifier.
   * @param {Date} created - The creation date of the entity.
   * @param {Date} updated - The most recent update date of the entity.
   * @param {string} audioUrl - The audio fragment as streaming audio link.
   */
  constructor(challengeId, userId, id, created, updated, audioUrl) {
    /**
     * The speech recording identifier.
     * @type {string}
     */
    this.id = id;

    /**
     * The SpeechChallenge identifier this speech is recorded for.
     * @type {string}
     */
    this.challengeId = challengeId;

    /**
     * The User instance on whose behalf this audio is recorded.
     * @type {string}
     */
    this.userId = userId;

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
  }
}

/**
 * @class SpeechRecording domain model
 */
export default class SpeechRecording {
  /**
   * Create a speech recording domain model.
   *
   * @param {SpeechChallenge} challenge - The SpeechChallenge instance this speech is recorded for.
   * @param {Student} student - The Student instance on whose behalf this audio is recorded.
   * @param {string} [id] - The speech recording identifier. If none is given, one is generated.
   * @param {Blob} audio - The recorded audio fragment.
   */
  constructor(challenge, student, id, created, updated, audioUrl) {
    /**
     * The speech recording identifier.
     * @type {string}
     */
    this.id = id;

    /**
     * The SpeechChallenge instance this speech is recorded for.
     * @type {SpeechChallenge}
     */
    this.challenge = challenge;

    /**
     * The Student instance on whose behalf this audio is recorded.
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
  }
}

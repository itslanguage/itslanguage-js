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
  constructor(challenge, student, id, audio) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    /**
     * The speech recording identifier.
     * @type {string}
     */
    this.id = id;
    if (typeof challenge !== 'object' || !challenge) {
      throw new Error(
        'challenge parameter of type "SpeechChallenge" is required');
    }

    /**
     * The SpeechChallenge instance this speech is recorded for.
     * @type {SpeechChallenge}
     */
    this.challenge = challenge;
    if (typeof student !== 'object' || !student) {
      throw new Error(
        'student parameter of type "Student" is required');
    }
    /**
     * The Student instance on whose behalf this audio is recorded.
     * @type {Student}
     */
    this.student = student;

    if (!(audio instanceof Blob || audio === null || audio === undefined)) {
      throw new Error(
        'audio parameter of type "Blob|null" is required');
    }
    /**
     * The recorded audio fragment.
     * @type {Blob}
     */
    this.audio = audio;

    /**
     * The creation date of the entity.
     * @type {Date}
     */
    this.created = null;

    /**
     * The most recent update date of the entity.
     * @type {Date}
     */
    this.updated = null;

    /**
     * The audio fragment as streaming audio link.
     * @type {string}
     */
    this.audioUrl = null;
  }
}

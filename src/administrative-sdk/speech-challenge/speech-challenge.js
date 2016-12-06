/**
 * @class SpeechChallenge domain model.
 */
export default class SpeechChallenge {
  /**
   * Create a speech SpeechChallenge domain model.
   *
   * @param {string} [id] - The speech challenge identifier. If none is given, one is generated.
   * @param {string} [topic] - A question or topic serving as guidance.
   * @param {Blob} [referenceAudio] - The reference audio fragment.
   */
  constructor(id, topic, referenceAudio) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    /**
     * The speech challenge identifier. If none is given, one is generated.
     * @type {string}
     */
    this.id = id;

    if (topic && typeof topic !== 'string') {
      throw new Error(
        'topic parameter of type "string" is required');
    }
    /**
     * A question or topic serving as guidance.
     * @type {string}
     */
    this.topic = topic;
    // Field is optional, but if given, then it's validated.
    if (typeof referenceAudio !== 'object' && referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }
    /**
     * The reference audio fragment.
     * @type {Blob}
     */
    this.referenceAudio = referenceAudio || null;
    /**
     * The reference audio fragment as streaming audio link.
     * @type {string}
     */
    this.referenceAudioUrl = null;

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
  }
}

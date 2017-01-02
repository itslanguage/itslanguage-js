/**
 * @class SpeechChallenge domain model.
 */
export default class SpeechChallenge {
  /**
   * Create a speech SpeechChallenge domain model.
   *
   * @param {?string} id - The speech challenge identifier. If none is given, one is generated.
   * @param {?string} topic - A question or topic serving as guidance.
   * @param {?string} referenceAudioUrl - The reference audio fragment URL. If one is not yet available or audio is
   * not yet registered to the challenge it can be set to 'null'.
   */
  constructor(id, topic, referenceAudioUrl) {
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

    if (referenceAudioUrl !== null && typeof referenceAudioUrl !== 'string') {
      throw new Error(
        'referenceAudioUrl parameter of type "string|null" is required');
    }

    /**
     * The reference audio fragment as streaming audio link.
     * @type {string}
     */
    this.referenceAudioUrl = referenceAudioUrl;

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

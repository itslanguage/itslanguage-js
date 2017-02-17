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
   * @param {?string} srtUrl - URL of a possible .srt file to accompany this challenge.
   * @param {?string} imageUrl - URL of a possible image file to accompany this challenge.
   * @param {?string} metadata - Metadata string. Can contain any kind of information that helps.
   * @throws {Error} srtUrl parameter of type "string|null" is required.
   * @throws {Error} imageUrl parameter of type "string|null" is required.
   * @throws {Error} metadata parameter of type "string|null" is required.
   */
  constructor(id = null, topic = null, referenceAudioUrl = null, srtUrl = null, imageUrl = null, metadata = null) {
    if (id !== null && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }

    if (topic !== null && typeof topic !== 'string') {
      throw new Error(
        'topic parameter of type "string|null" is required');
    }

    if (referenceAudioUrl !== null && typeof referenceAudioUrl !== 'string') {
      throw new Error(
        'referenceAudioUrl parameter of type "string|null" is required');
    }

    if (srtUrl !== null && typeof srtUrl !== 'string') {
      throw new Error('srtUrl parameter of type "string|null" is required');
    }

    if (imageUrl !== null && typeof imageUrl !== 'string') {
      throw new Error('imageUrl parameter of type "string|null" is required');
    }

    if (metadata !== null && typeof metadata !== 'string') {
      throw new Error('metadata parameter of type "string|null" is required');
    }

    /**
     * The speech challenge identifier. If none is given, one is generated.
     * @type {string}
     */
    this.id = id;

    /**
     * A question or topic serving as guidance.
     * @type {string}
     */
    this.topic = topic;

    /**
     * The reference audio fragment as streaming audio link.
     * @type {string}
     */
    this.referenceAudioUrl = referenceAudioUrl;

    /**
     * URL of a possible .srt file to accompany this challenge.
     * @type {string}
     */
    this.srtUrl = srtUrl;

    /**
     * URL of a possible image file to accompany this challenge.
     * @type {string}
     */
    this.imageUrl = imageUrl;

    /**
     * Metadata string. Can contain any kind of information that helps.
     * @type {string}
     */
    this.metadata = metadata;
  }
}

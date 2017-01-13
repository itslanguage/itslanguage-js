/**
 * @class PronunciationChallenge domain model
 */
export default class PronunciationChallenge {
  /**
   * Create a pronunciation challenge domain model.
   *
   * @param {?string} id - The pronunciation challenge identifier. If none is given, one is generated.
   * @param {string} transcription - The spoken word or sentence as plain text.
   * @param {?string} referenceAudioUrl - The reference audio fragment URL. If one is not yet available or audio is
   * not yet registered to the challenge it can be set to 'null'.
   * @throws {Error} referenceAudioUrl parameter of type "string|null" is required
   */
  constructor(id, transcription, referenceAudioUrl = null) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    /**
     * The pronunciation challenge identifier.
     * @type {string}
     */
    this.id = id;
    if (typeof transcription !== 'string') {
      throw new Error(
        'transcription parameter of type "string" is required');
    }
    /**
     * The spoken word or sentence as plain text.
     * @type {string}
     */
    this.transcription = transcription;

    /**
     * The creation date of the challenge entity.
     * @type {Date}
     */
    this.created = null;

    /**
     * The most recent update date of the challenge entity.
     * @type {Date}
     */
    this.updated = null;

    /**
     * The status of the challenge's preparation. Either 'unprepared', 'preparing' or 'prepared'.
     * @type {string}
     */
    this.status = null;

    if (referenceAudioUrl !== null && typeof referenceAudioUrl !== 'string') {
      throw new Error('referenceAudioUrl parameter of type "string|null" is required');
    }

    /**
     * The reference audio fragment as streaming audio link.
     * @type {string}
     */
    this.referenceAudioUrl = referenceAudioUrl;
  }
}

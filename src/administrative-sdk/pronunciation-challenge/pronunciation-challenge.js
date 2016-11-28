/**
 * @class PronunciationChallenge domain model
 */
export default class PronunciationChallenge {
  /**
   * Create a pronunciation challenge domain model.
   *
   * @param {string} organisationId - The organisation identifier this challenge is an entry in.
   * @param {string} [id] - The pronunciation challenge identifier. If none is given, one is generated.
   * @param {string} transcription - The spoken word or sentence as plain text.
   * @param {Blob} referenceAudio - The reference audio fragment.
   */
  constructor(organisationId, id, transcription, referenceAudio) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    /**
     * The pronunciation challenge identifier.
     * @type {string}
     */
    this.id = id;
    if (!organisationId || typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string" is required');
    }
    /**
     * The organisation identifier this challenge is an entry in.
     * @type {string}
     */
    this.organisationId = organisationId;
    if (typeof transcription !== 'string') {
      throw new Error(
        'transcription parameter of type "string" is required');
    }
    /**
     * The spoken word or sentence as plain text.
     * @type {string}
     */
    this.transcription = transcription;
    if (typeof referenceAudio !== 'object' && referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }
    /**
     * The reference audio fragment.
     * @type {Blob}
     */
    this.referenceAudio = referenceAudio;

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

    /**
     * The reference audio fragment as streaming audio link.
     * @type {string}
     */
    this.referenceAudioUrl = null;
  }
}

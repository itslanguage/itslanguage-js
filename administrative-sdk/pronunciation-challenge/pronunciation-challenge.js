/**
 * @class PronunciationChallenge
 *
 * @member {string} organisationId The organisation identifier this challenge is an entry in.
 * @member {string} [id] The pronunciation challenge identifier.
 * @member {date} [created] The creation date of the challenge entity.
 * @member {date} [updated] The most recent update date of the challenge entity.
 * @member {string} transcription The spoken word or sentence as plain text.
 * @member {blob} [referenceAudio] The reference audio fragment.
 * @member {string} [referenceAudioUrl] The reference audio fragment as streaming audio link.
 * @member {string} [status] The status of the challenge's preparation. Either 'unprepared', 'preparing' or 'prepared'.
 */
module.exports = class PronunciationChallenge {
  /**
   * Create a pronunciation challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this challenge is an entry in.
   * @param {string} [id] The pronunciation challenge identifier. If none is given, one is generated.
   * @param {string} transcription The spoken word or sentence as plain text.
   * @param {blob} referenceAudio The reference audio fragment.
   * @return {PronunciationChallenge}
   */
  constructor(organisationId, id, transcription, referenceAudio) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    this.id = id;
    if (!organisationId || typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string" is required');
    }
    this.organisationId = organisationId;
    if (typeof transcription !== 'string') {
      throw new Error(
        'transcription parameter of type "string" is required');
    }
    this.transcription = transcription;
    if (typeof referenceAudio !== 'object' && referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }
    this.referenceAudio = referenceAudio;
  }
};

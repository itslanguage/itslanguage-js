/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
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
class PronunciationChallenge {
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
    if (organisationId && typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string|null" is required');
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

  /**
   * Create a pronunciation challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @returns Promise containing this object.
   * @rejects If the server returned an error.
   */
  createPronunciationChallenge(connection) {
    if (!this.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    if (typeof this.referenceAudio !== 'object' || !this.referenceAudio) {
      return Promise.reject(new Error(
        'referenceAudio parameter of type "Blob" is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/challenges/pronunciation';
    var fd = new FormData();
    if (typeof this.id !== 'undefined' &&
      this.id !== null) {
      fd.append('id', this.id);
    }
    fd.append('transcription', this.transcription);
    fd.append('referenceAudio', this.referenceAudio);

    return connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        this.id = data.id;
        this.created = new Date(data.created);
        this.updated = new Date(data.updated);
        this.referenceAudioUrl = data.referenceAudioUrl;
        this.status = data.status;
        return this;
      });
  }

  /**
   * Get a pronunciation challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a pronunciation challenge identifier.
   * @returns Promise containing a PronunciationChallenge.
   * @rejects If no result could not be found.
   */
  static getPronunciationChallenge(connection, organisationId, challengeId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation/' + challengeId;
    return connection._secureAjaxGet(url)
      .then(data => {
        var challenge = new PronunciationChallenge(organisationId, data.id,
          data.transcription);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        challenge.referenceAudioUrl = data.referenceAudioUrl;
        challenge.status = data.status;
        return challenge;
      });
  }

  /**
   * List all pronunciation challenges in the organisation.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise containing a list of PronunciationChallenges.
   * @rejects If no result could not be found.
   */
  static listPronunciationChallenges(connection, organisationId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation';
    return connection._secureAjaxGet(url)
      .then(data => {
        var challenges = [];
        data.forEach(function(datum) {
          var challenge = new PronunciationChallenge(
            organisationId, datum.id, datum.transcription);
          challenge.created = new Date(datum.created);
          challenge.updated = new Date(datum.updated);
          challenge.referenceAudioUrl = datum.referenceAudioUrl;
          challenge.status = datum.status;
          challenges.push(challenge);
        });
        return challenges;
      });
  }

  /**
   * Delete a pronunciation challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @returns Promise containing this.
   * @rejects If the server returned an error.
   */
  deletePronunciationChallenge(connection) {
    if (!this.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    if (!this.id) {
      return Promise.reject(new Error('id field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/challenges/pronunciation/' +
      this.id;
    return connection._secureAjaxDelete(url)
      .then(() => (this));
  }
}

module.exports = {
  PronunciationChallenge: PronunciationChallenge
};

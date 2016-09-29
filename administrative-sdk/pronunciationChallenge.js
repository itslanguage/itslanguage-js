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
  constructor(organisationId, id, transcription, referenceAudio, connection) {
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
    this.connection = connection;
  }

  /**
   * Callback used by createPronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeCreatedCallback
   * @param {its.PronunciationChallenge} challenge Updated speech challenge domain model instance.
   */
  pronunciationChallengeCreatedCallback(challenge) {}

  /**
   * Error callback used by createPronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.PronunciationChallenge} challenge Pronunciation challenge domain model instance with unapplied changes.
   */
  pronunciationChallengeCreatedErrorCallback(errors, challenge) {}

  /**
   * Create a pronunciation challenge.
   *
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @param {Sdk~pronunciationChallengeCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~pronunciationChallengeCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createPronunciationChallenge(cb, ecb) {
    var self = this;
    var _cb = function(data) {
      // Update the id in case domain model didn't contain one.
      self.id = data.id;
      self.created = new Date(data.created);
      self.updated = new Date(data.updated);
      self.referenceAudioUrl = data.referenceAudioUrl;
      self.status = data.status;
      if (cb) {
        cb(self);
      }
    };

    var _ecb = function(errors) {
      if (ecb) {
        ecb(errors, self);
      }
    };

    // Validate required domain model fields.
    if (!this.organisationId) {
      throw new Error('organisationId field is required');
    }

    if (typeof this.referenceAudio !== 'object' ||
      !this.referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }

    var fd = new FormData();
    if (typeof this.id !== 'undefined' &&
      this.id !== null) {
      fd.append('id', this.id);
    }
    fd.append('transcription', this.transcription);
    fd.append('referenceAudio', this.referenceAudio);

    var url = this.connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/challenges/pronunciation';
    this.connection._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getPronunciationChallenge.
   *
   * @callback Sdk~getPronunciationChallengeCallback
   * @param {its.PronunciationChallenge} challenge Retrieved pronunciation challenge domain model instance.
   */
  getPronunciationChallengeCallback(challenge) {}

  /**
   * Error callback used by getPronunciationChallenge.
   *
   * @callback Sdk~getPronunciationChallengeErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getPronunciationChallengeErrorCallback(errors) {}

  /**
   * Get a pronunciation challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a pronunciation challenge identifier.
   * @param {Sdk~getPronunciationChallengeCallback} [cb] The callback that handles the response.
   * @param {Sdk~getPronunciationChallengeErrorCallback} [ecb] The callback that handles the error response.
   */
  getPronunciationChallenge(
    organisationId, challengeId, cb, ecb) {
    var _cb = function(data) {
      var challenge = new PronunciationChallenge(organisationId, data.id,
        data.transcription);
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      challenge.referenceAudioUrl = data.referenceAudioUrl;
      challenge.status = data.status;
      if (cb) {
        cb(challenge);
      }
    };

    var url = this.connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation/' + challengeId;
    this.connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listPronunciationChallenges.
   *
   * @callback Sdk~listPronunciationChallengesCallback
   * @param {its.PronunciationChallenge[]} challenges Retrieved pronunciation challenge domain model instances.
   */
  listPronunciationChallengesCallback(challenges) {}

  /**
   * Error callback used by listPronunciationChallenges.
   *
   * @callback Sdk~listPronunciationChallengesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listPronunciationChallengesErrorCallback(errors) {}

  /**
   * List all pronunciation challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listPronunciationChallengesCallback} cb The callback that handles the response.
   * @param {Sdk~listPronunciationChallengesErrorCallback} [ecb] The callback that handles the error response.
   */
  listPronunciationChallenges(
    organisationId, cb, ecb) {
    var _cb = function(data) {
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
      if (cb) {
        cb(challenges);
      }
    };

    var url = this.connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation';
    this.connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by deletePronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeDeletedCallback
   */
  pronunciationChallengeDeletedCallback(challenge) {}

  /**
   * Error callback used by deletePronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeDeletedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.PronunciationChallenge} challenge Pronunciation challenge domain model instance with unapplied changes.
   */
  pronunciationChallengeDeletedErrorCallback(errors, challenge) {}

  /**
   * Delete a pronunciation challenge.
   *
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @param {Sdk~pronunciationChallengeDeletedCallback} [cb] The callback that handles the response.
   * @param {Sdk~pronunciationChallengeDeletedErrorCallback} [ecb] The callback that handles the error response.
   */
  deletePronunciationChallenge(cb, ecb) {
    var self = this;
    var _cb = function(response) {
      if (cb) {
        cb(self);
      }
    };

    var _ecb = function(errors) {
      if (ecb) {
        ecb(errors, self);
      }
    };

    // Validate required domain model fields.
    if (!this.organisationId) {
      throw new Error('organisationId field is required');
    }

    if (!this.id) {
      throw new Error('id field is required');
    }

    var url = this.connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/challenges/pronunciation/' +
      this.id;
    this.connection._secureAjaxDelete(url, _cb, _ecb);
  }
}

module.exports = {
  PronunciationChallenge: PronunciationChallenge
};

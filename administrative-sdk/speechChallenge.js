/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
/**
 * @class SpeechChallenge
 *
 * @member {string} organisationId The organisation identifier this challenge is an entry in.
 * @member {string} [id] The speech challenge identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {string} [topic] A question or topic serving as guidance.
 * @member {blob} [referenceAudio] The reference audio fragment.
 * @member {string} [referenceAudioUrl] The reference audio fragment as streaming audio link.
 */
class SpeechChallenge {
  /**
   * Create a speech choiceChall domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this choiceChall is an entry in.
   * @param {string} [id] The speech choiceChall identifier. If none is given, one is generated.
   * @param {string} [topic] A question or topic serving as guidance.
   * @param {blob} [referenceAudio] The reference audio fragment.
   * @return {choiceRecog.SpeechChallenge}
   */
  constructor(organisationId, id, topic, referenceAudio) {
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
    if (topic && typeof topic !== 'string') {
      throw new Error(
        'topic parameter of type "string" is required');
    }
    this.topic = topic;
    // Field is optional, but if given, then it's validated.
    if (typeof referenceAudio !== 'object' && referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }
    this.referenceAudio = referenceAudio || null;
    this.referenceAudioUrl = null;
  }

  /**
   * Callback used by createSpeechChallenge.
   *
   * @callback Sdk~speechChallengeCreatedCallback
   * @param {its.SpeechChallenge} challenge Updated speech challenge domain model instance.
   */
  speechChallengeCreatedCallback(challenge) {}

  /**
   * Error callback used by createSpeechChallenge.
   *
   * @callback Sdk~speechChallengeCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechChallenge} challenge Speech challenge domain model instance with unapplied changes.
   */
  speechChallengeCreatedErrorCallback(errors, challenge) {}

  /**
   * Create a speech challenge.
   *
   * @param {its.SpeechChallenge} challenge A speech challenge object.
   * @param {Sdk~speechChallengeCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~speechChallengeCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createSpeechChallenge(connection, cb, ecb) {
    var self = this;
    var _cb = function(data) {
      // Update the id in case domain model didn't contain one.
      self.id = data.id;
      self.created = new Date(data.created);
      self.updated = new Date(data.updated);
      self.referenceAudioUrl = data.referenceAudioUrl || null;
      if (cb) {
        cb(self);
      }
    };

    var _ecb = function(errors) {
      if (ecb) {
        ecb(errors, self);
      }
    };

    if (!this.organisationId) {
      throw new Error('organisationId field is required');
    }

    var fd = new FormData();
    if (typeof this.id !== 'undefined' &&
      this.id !== null) {
      fd.append('id', this.id);
    }
    fd.append('topic', this.topic);
    if (this.referenceAudio) {
      fd.append('referenceAudio', this.referenceAudio);
    }

    var url = connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/challenges/speech';
    connection._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getSpeechChallenge.
   *
   * @callback Sdk~getSpeechChallengeCallback
   * @param {its.SpeechChallenge} challenge Retrieved speech challenge domain model instance.
   */
  getSpeechChallengeCallback(challenge) {}

  /**
   * Error callback used by getSpeechChallenge.
   *
   * @callback Sdk~getSpeechChallengeErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getSpeechChallengeErrorCallback(errors) {}

  /**
   * Get a speech challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a speech challenge identifier.
   * @param {Sdk~getSpeechChallengeCallback} [cb] The callback that handles the response.
   * @param {Sdk~getSpeechChallengeErrorCallback} [ecb] The callback that handles the error response.
   */
  getSpeechChallenge(connection, organisationId, challengeId, cb, ecb) {
    var _cb = function(data) {
      var challenge = new SpeechChallenge(organisationId, data.id, data.topic);
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      if (cb) {
        cb(challenge);
      }
    };

    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech/' + challengeId;
    connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listSpeechChallenges.
   *
   * @callback Sdk~listSpeechChallegesCallback
   * @param {its.SpeechChallenge[]} challenges Retrieved speech challenge domain model instances.
   */
  listSpeechChallengeCallback(challenges) {}

  /**
   * Error callback used by listSpeechChallenges.
   *
   * @callback Sdk~listSpeechChallengesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listSpeechChallengeErrorCallback(errors) {}

  /**
   * List all speech challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listSpeechChallengesCallback} cb The callback that handles the response.
   * @param {Sdk~listSpeechChallengesErrorCallback} [ecb] The callback that handles the error response.
   */
  listSpeechChallenges(connection, organisationId, cb, ecb) {
    var _cb = function(data) {
      var challenges = [];
      data.forEach(function(datum) {
        var challenge = new SpeechChallenge(organisationId, datum.id,
          datum.topic);
        challenge.created = new Date(datum.created);
        challenge.updated = new Date(datum.updated);
        challenges.push(challenge);
      });
      if (cb) {
        cb(challenges);
      }
    };

    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech';
    connection._secureAjaxGet(url, _cb, ecb);
  }
}

module.exports = {
  SpeechChallenge: SpeechChallenge
};

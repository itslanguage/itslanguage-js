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
   * Create a speech challenge.
   *
   * @param {its.SpeechChallenge} challenge A speech challenge object.
   * @param {Sdk~speechChallengeCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~speechChallengeCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createSpeechChallenge(connection) {
    if (!this.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
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

    return connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        this.id = data.id;
        this.created = new Date(data.created);
        this.updated = new Date(data.updated);
        this.referenceAudioUrl = data.referenceAudioUrl || null;
        return this;
      });
  }

  /**
   * Get a speech challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a speech challenge identifier.
   * @param {Sdk~getSpeechChallengeCallback} [cb] The callback that handles the response.
   * @param {Sdk~getSpeechChallengeErrorCallback} [ecb] The callback that handles the error response.
   */
  static getSpeechChallenge(connection, organisationId, challengeId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech/' + challengeId;

    return connection._secureAjaxGet(url)
      .then(data => {
        var challenge = new SpeechChallenge(organisationId, data.id, data.topic);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        return challenge;
      });
  }

  /**
   * List all speech challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listSpeechChallengesCallback} cb The callback that handles the response.
   * @param {Sdk~listSpeechChallengesErrorCallback} [ecb] The callback that handles the error response.
   */
  static listSpeechChallenges(connection, organisationId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech';

    return connection._secureAjaxGet(url)
      .then(data => {
        var challenges = [];
        data.forEach(function(datum) {
          var challenge = new SpeechChallenge(organisationId, datum.id,
            datum.topic);
          challenge.created = new Date(datum.created);
          challenge.updated = new Date(datum.updated);
          challenges.push(challenge);
        });
        return challenges;
      });
  }
}

module.exports = {
  SpeechChallenge: SpeechChallenge
};

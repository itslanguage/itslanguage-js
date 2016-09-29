/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
'use strict';

/**
 * @class ChoiceChallenge
 *
 * @member {string} organisationId The organisation identifier this challenge is an entry in.
 * @member {string} [id] The choice challenge identifier.
 * @member {date} created The creation date of the challenge entity.
 * @member {date} updated The most recent update date of the challenge entity.
 * @member {string} [question] A hint or question related to the choices.
 * @member {string} [status] The status of the challenge's preparation. Either 'unprepared', 'preparing' or 'prepared'.
 * @member {string[]} choices The sentences of which at most one may be recognised.
 */
class ChoiceChallenge {
  /**
   * Create a choice challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this challenge is an entry in.
   * @param {string} [id] The pronunciation challenge identifier. If none is given, one is generated.
   * @param {string} [question] A hint or question related to the choices.
   * @param {string[]} choices The sentences of which at most one may be recognised.
   * @return {ChoiceChallenge}
   */
  constructor(organisationId, id, question, choices, connection) {
    if (typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string" is required');
    }
    this.organisationId = organisationId;
    if (typeof id !== 'string' && id !== null && id !== undefined) {
      throw new Error(
        'id parameter of type "string|null|undefined" is required');
    }
    if (typeof id === 'string' && id.length === 0) {
      throw new Error(
        'id parameter should not be an empty string');
    }
    this.id = id;
    if (typeof question !== 'string' &&
      question !== null &&
      question !== undefined) {
      throw new Error(
        'question parameter of type "string|null|undefined" is required');
    }
    this.question = question;
    if (typeof choices !== 'object') {
      throw new Error(
        'choices parameter of type "Array" is required');
    }
    this.choices = choices;
    this.connection = connection;
  }

  /**
   * Callback used by createChoiceChallenge.
   *
   * @callback Sdk~choiceChallengeCreatedCallback
   * @param {its.ChoiceChallenge} challenge Updated choice challenge domain model instance.
   */
  choiceChallengeCreatedCallback(challenge) {}

  /**
   * Error callback used by createChoiceChallenge.
   *
   * @callback Sdk~choiceChallengeCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.ChoiceChallenge} challenge Choice challenge domain model instance with unapplied changes.
   */
  choiceChallengeCreatedErrorCallback(errors, challenge) {}

  /**
   * Create a choice challenge.
   *
   * @param {its.ChoiceChallenge} challenge A choice challenge object.
   * @param {Sdk~choiceChallengeCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~choiceChallengeCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createChoiceChallenge(cb, ecb) {
    var self = this;
    var _cb = function(data) {
      // Update the id in case domain model didn't contain one.
      self.id = data.id;
      self.created = new Date(data.created);
      self.updated = new Date(data.updated);
      self.status = data.status;
      self.choices = [];
      data.choices.forEach(function(pair) {
        self.choices.push(pair.choice);
      });
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

    var url = this.connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/challenges/choice';

    var fd = new FormData();
    if (this.id !== undefined &&
      this.id !== null) {
      fd.append('id', this.id);
    }
    fd.append('question', this.question);
    this.choices.forEach(function(choice) {
      fd.append('choices', choice);
    });
    this.connection._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getChoiceChallenge.
   *
   * @callback Sdk~getChoiceChallengeCallback
   * @param {its.ChoiceChallenge} challenge Retrieved choice challenge domain model instance.
   */
  getChoiceChallengeCallback(challenge) {}

  /**
   * Error callback used by getChoiceChallenge.
   *
   * @callback Sdk~getChoiceChallengeErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getChoiceChallengeErrorCallback(errors) {}

  /**
   * Get a choice challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a choice challenge identifier.
   * @param {Sdk~getChoiceChallengeCallback} [cb] The callback that handles the response.
   * @param {Sdk~getChoiceChallengeErrorCallback} [ecb] The callback that handles the error response.
   */
  getChoiceChallenge(
    organisationId, challengeId, cb, ecb) {
    var _cb = function(data) {
      var challenge = new ChoiceChallenge(organisationId, data.id,
        data.question, data.choices);
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      challenge.status = data.status;
      challenge.choices = [];
      data.choices.forEach(function(pair) {
        challenge.choices.push(pair.choice);
      });
      if (cb) {
        cb(challenge);
      }
    };

    var url = this.connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice/' + challengeId;
    this.connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listChoiceChallenges.
   *
   * @callback Sdk~listChoiceChallengesCallback
   * @param {its.ChoiceChallenge[]} challenges Retrieved choice challenge domain model instances.
   */
  listChoiceChallengesCallback(challenges) {}

  /**
   * Error callback used by listSpeechChallenges.
   *
   * @callback Sdk~listChoiceChallengesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listChoiceChallengesErrorCallback(errors) {}

  /**
   * List all choice challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listChoiceChallengesCallback} cb The callback that handles the response.
   * @param {Sdk~listChoiceChallengesErrorCallback} [ecb] The callback that handles the error response.
   */
  listChoiceChallenges(
    organisationId, cb, ecb) {
    var _cb = function(data) {
      var challenges = [];
      data.forEach(function(datum) {
        var challenge = new ChoiceChallenge(
          organisationId, datum.id, datum.question, datum.choices);
        challenge.created = new Date(datum.created);
        challenge.updated = new Date(datum.updated);
        challenge.status = datum.status;
        challenge.choices = [];
        datum.choices.forEach(function(pair) {
          challenge.choices.push(pair.choice);
        });
        challenges.push(challenge);
      });
      if (cb) {
        cb(challenges);
      }
    };

    var url = this.connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice';
    this.connection._secureAjaxGet(url, _cb, ecb);
  }
}

module.exports = {
  ChoiceChallenge: ChoiceChallenge
};

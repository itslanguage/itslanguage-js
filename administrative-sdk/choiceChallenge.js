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
  constructor(organisationId, id, question, choices) {
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
  }

  /**
   * Create a choice challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @returns Promise containing this.
   * @rejects If the server returned an error.
   */
  createChoiceChallenge(connection) {
    var self = this;
    // Validate required domain model fields.
    if (!this.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
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
    return connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        this.id = data.id;
        this.created = new Date(data.created);
        this.updated = new Date(data.updated);
        this.status = data.status;
        this.choices = [];
        data.choices.forEach(function(pair) {
          self.choices.push(pair.choice);
        });
        return this;
      });
  }

  /**
   * Get a choice challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a choice challenge identifier.
   * @returns Promise containing a ChoiceChallenge.
   * @rejects If no result could not be found.
   */
  static getChoiceChallenge(connection, organisationId, challengeId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice/' + challengeId;
    return connection._secureAjaxGet(url)
      .then(data => {
        var challenge = new ChoiceChallenge(organisationId, data.id,
          data.question, data.choices);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        challenge.status = data.status;
        challenge.choices = [];
        data.choices.forEach(function(pair) {
          challenge.choices.push(pair.choice);
        });
        return challenge;
      });
  }

  /**
   * List all choice challenges in the organisation.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise containing a list of ChoiceChallenges.
   * @rejects If no result could not be found.
   */
  static listChoiceChallenges(connection, organisationId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice';
    return connection._secureAjaxGet(url)
      .then(data => {
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
        return challenges;
      });
  }
}

module.exports = {
  ChoiceChallenge: ChoiceChallenge
};

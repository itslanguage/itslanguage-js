const ChoiceChallenge = require('../models/choiceChallenge');

/**
 * Controller class for the ChoiceChallenge model.
 */
module.exports = class ChoiceChallengeController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Create a choice challenge.
   *
   * @param {ChoiceChallenge} choiceChallenge Object to create.
   * @returns Promise containing the newly created object.
   * @rejects If the server returned an error.
   */
  createChoiceChallenge(choiceChallenge) {
    // Validate required domain model fields.
    if (!choiceChallenge.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this.connection.settings.apiUrl + '/organisations/' +
      choiceChallenge.organisationId + '/challenges/choice';
    const fd = new FormData();
    if (choiceChallenge.id !== undefined &&
      choiceChallenge.id !== null) {
      fd.append('id', choiceChallenge.id);
    }
    fd.append('question', choiceChallenge.question);
    choiceChallenge.choices.forEach(choice => {
      fd.append('choices', choice);
    });
    return this.connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        choiceChallenge.id = data.id;
        choiceChallenge.created = new Date(data.created);
        choiceChallenge.updated = new Date(data.updated);
        choiceChallenge.status = data.status;
        choiceChallenge.choices = [];
        data.choices.forEach(pair => {
          choiceChallenge.choices.push(pair.choice);
        });
        return choiceChallenge;
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
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice/' + challengeId;
    return connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new ChoiceChallenge(organisationId, data.id,
          data.question, data.choices);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        challenge.status = data.status;
        challenge.choices = [];
        data.choices.forEach(pair => {
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
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice';
    return connection._secureAjaxGet(url)
      .then(data => {
        const challenges = [];
        data.forEach(datum => {
          const challenge = new ChoiceChallenge(
            organisationId, datum.id, datum.question, datum.choices);
          challenge.created = new Date(datum.created);
          challenge.updated = new Date(datum.updated);
          challenge.status = datum.status;
          challenge.choices = [];
          datum.choices.forEach(pair => {
            challenge.choices.push(pair.choice);
          });
          challenges.push(challenge);
        });
        return challenges;
      });
  }
};

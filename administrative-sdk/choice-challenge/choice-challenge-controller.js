import ChoiceChallenge from './choice-challenge';

/**
 * Controller class for the {@link ChoiceChallenge} model.
 */
export default class ChoiceChallengeController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    /**
     * Object to use for making a connection to the REST API and Websocket server.
     * @type {Connection}
     */
    this._connection = connection;
  }

  /**
   * Create a choice challenge.
   * It is necessary for a choice challenge to exist for a recording to be valid.
   *
   * @param {ChoiceChallenge} choiceChallenge - Object to create.
   * @returns {Promise} Containing the newly created object.
   * @throws {Promise} {@link ChoiceChallenge#organisationId} field is required.
   * @throws {Promise} If the server returned an error.
   */
  createChoiceChallenge(choiceChallenge) {
    // Validate required domain model fields.
    if (!choiceChallenge.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection.settings.apiUrl + '/challenges/choice';
    const fd = new FormData();
    if (choiceChallenge.id !== undefined &&
      choiceChallenge.id !== null) {
      fd.append('id', choiceChallenge.id);
    }
    fd.append('question', choiceChallenge.question);
    choiceChallenge.choices.forEach(choice => {
      fd.append('choices', choice);
    });
    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new ChoiceChallenge(choiceChallenge.organisationId, data.id, data.question, data.choices);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        result.status = data.status;
        data.choices.forEach(pair => {
          result.choices.push(pair.choice);
        });
        return result;
      });
  }

  /**
   * Get a choice challenge. A choice challenge is identified by its identifier and its {@link Organisation}'s
   * identifier.
   *
   * @param {Organisation#id} organisationId - Specify an organisation identifier.
   * @param {ChoiceChallenge#id} challengeId - Specify a choice challenge identifier.
   * @returns {Promise} Containing a ChoiceChallenge.
   * @throws {Promise} {@link ChoiceChallenge#id} field is required.
   * @throws {Promise} {@link Organisation#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  getChoiceChallenge(organisationId, challengeId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection.settings.apiUrl + '/challenges/choice/' + challengeId;
    return this._connection._secureAjaxGet(url)
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
   * List all choice challenges in the {@link Organisation}.
   *
   * @param {Organisation#id} organisationId - Specify an {@link Organisation} identifier.
   * @returns {Promise} Containing an array of ChoiceChallenges.
   * @throws {Promise} {@link Organisation#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  listChoiceChallenges(organisationId) {
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection.settings.apiUrl + '/challenges/choice';
    return this._connection._secureAjaxGet(url)
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
}

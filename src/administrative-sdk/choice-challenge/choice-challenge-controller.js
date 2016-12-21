import ChoiceChallenge from './choice-challenge';

/**
 * Controller class for the {@link ChoiceChallenge} model.
 * @private
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
   * Create a choice challenge. The choice challenge will be created in the current active {@link Organisation} derived
   * from the OAuth2 scope.
   * It is necessary for a choice challenge to exist for a recording to be valid.
   *
   * @param {ChoiceChallenge} choiceChallenge - Object to create.
   * @returns {Promise.<ChoiceChallenge>} Containing the newly created ChoiceChallenge.
   * @throws {Promise} If the server returned an error.
   */
  createChoiceChallenge(choiceChallenge) {
    const url = this._connection._settings.apiUrl + '/challenges/choice';
    const fd = JSON.stringify(choiceChallenge);
    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new ChoiceChallenge(data.id, data.question, data.choices);
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
   * Get a choice challenge. A choice challenge is identified by its identifier and the current active
   * {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {ChoiceChallenge#id} challengeId - Specify a choice challenge identifier.
   * @returns {Promise.<ChoiceChallenge>} Containing a ChoiceChallenge.
   * @throws {Promise} {@link ChoiceChallenge#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  getChoiceChallenge(challengeId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/choice/' + challengeId;
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new ChoiceChallenge(data.id, data.question, data.choices);
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
   * List all choice challenges in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<ChoiceChallenge[]>} Containing an array of ChoiceChallenges.
   * @throws {Promise} If no result could not be found.
   */
  listChoiceChallenges() {
    const url = this._connection._settings.apiUrl + '/challenges/choice';
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenges = [];
        data.forEach(datum => {
          const challenge = new ChoiceChallenge(datum.id, datum.question, datum.choices);
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

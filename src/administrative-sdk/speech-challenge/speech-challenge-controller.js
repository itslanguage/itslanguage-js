import SpeechChallenge from './speech-challenge';

/**
 * Controller class for the SpeechChallenge model.
 */
export default class SpeechChallengeController {
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
   * Create a speech challenge.
   *
   * @param {SpeechChallenge} speechChallenge - Object to create.
   * @returns {Promise} Promise containing the newly created object.
   * @throws {Promise} {@link SpeechChallenge#organisationId} field is required
   * @throws {Promise} If the server returned an error.
   */
  createSpeechChallenge(speechChallenge) {
    if (!speechChallenge.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const fd = new FormData();
    if (typeof speechChallenge.id !== 'undefined' &&
      speechChallenge.id !== null) {
      fd.append('id', speechChallenge.id);
    }
    fd.append('topic', speechChallenge.topic);
    if (speechChallenge.referenceAudio) {
      fd.append('referenceAudio', speechChallenge.referenceAudio);
    }
    const url = this._connection._settings.apiUrl + '/challenges/speech';

    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new SpeechChallenge(speechChallenge.organisationId, data.id, data.topic);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        result.referenceAudio = speechChallenge.referenceAudio;
        result.referenceAudioUrl = data.referenceAudioUrl || null;
        return result;
      });
  }

  /**
   * Get a speech challenge.
   *
   * @param {Organisation#id} organisationId - Specify an organisation identifier.
   * @param {SpeechChallenge#id} challengeId - Specify a speech challenge identifier.
   * @returns {Promise} Promise containing a SpeechChallenge.
   * @throws {Promise} {@link SpeechChallenge#id} field is required.
   * @throws {Promise} {@link Organisation#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  getSpeechChallenge(organisationId, challengeId) {
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/speech/' + challengeId;

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new SpeechChallenge(organisationId, data.id, data.topic);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        return challenge;
      });
  }

  /**
   * List all speech challenges in the organisation.
   *
   * @param {Organisation#id} organisationId - Specify an organisation identifier.
   * @returns {Promise} Promise containing a list of SpeechChallenges.
   * @throws {Promise} {@link Organisation#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  listSpeechChallenges(organisationId) {
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/speech';

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenges = [];
        data.forEach(datum => {
          const challenge = new SpeechChallenge(organisationId, datum.id,
            datum.topic);
          challenge.created = new Date(datum.created);
          challenge.updated = new Date(datum.updated);
          challenges.push(challenge);
        });
        return challenges;
      });
  }
}

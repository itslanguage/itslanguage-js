import SpeechChallenge from './speech-challenge';

/**
 * Controller class for the SpeechChallenge model.
 * @private
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
   * Create a speech challenge in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {SpeechChallenge} speechChallenge - Object to create.
   * @param {?Blob} audioBlob - Audio fragment to link to the challenge.
   * @returns {Promise.<PronunciationChallenge>} Promise containing the newly created SpeechChallenge.
   * @throws {Promise} If the server returned an error.
   */
  createSpeechChallenge(speechChallenge, audioBlob) {
    speechChallenge.referenceAudio = audioBlob;
    const fd = JSON.stringify(speechChallenge);
    const url = this._connection._settings.apiUrl + '/challenges/speech';

    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new SpeechChallenge(data.id, data.topic, data.referenceAudioUrl);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get a speech challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {SpeechChallenge#id} challengeId - Specify a speech challenge identifier.
   * @returns {Promise.<PronunciationChallenge>} Promise containing a SpeechChallenge.
   * @throws {Promise} {@link SpeechChallenge#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  getSpeechChallenge(challengeId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/speech/' + challengeId;

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new SpeechChallenge(data.id, data.topic, data.referenceAudioUrl);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        return challenge;
      });
  }

  /**
   * List all speech challenges in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<SpeechChallenge[]>} Promise containing an array of SpeechChallenges.
   * @throws {Promise} If no result could not be found.
   */
  listSpeechChallenges() {
    const url = this._connection._settings.apiUrl + '/challenges/speech';

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenges = [];
        data.forEach(datum => {
          const challenge = new SpeechChallenge(datum.id,
            datum.topic, datum.referenceAudioUrl);
          challenge.created = new Date(datum.created);
          challenge.updated = new Date(datum.updated);
          challenges.push(challenge);
        });
        return challenges;
      });
  }
}

import PronunciationChallenge from './pronunciation-challenge';

/**
 * Controller class for the PronunciationChallenge model.
 * @private
 */
export default class PronunciationChallengeController {
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
   * Create a pronunciation challenge. The created challenge will be part of the current active {@link Organisation}
   * derived from the OAuth2 scope.
   *
   * @param {PronunciationChallenge} challenge - Object to create..
   * @returns {Promise} Promise containing the newly created object.
   * @throws {Promise} {@link PronunciationChallenge#referenceAudio} of type "Blob" is required.
   * @throws {Promise} If the server returned an error.
   */
  createPronunciationChallenge(challenge) {
    if (typeof challenge.referenceAudio !== 'object' || !challenge.referenceAudio) {
      return Promise.reject(new Error(
        'referenceAudio parameter of type "Blob" is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation';
    const fd = new FormData();
    if (typeof challenge.id !== 'undefined' &&
      challenge.id !== null) {
      fd.append('id', challenge.id);
    }
    fd.append('transcription', challenge.transcription);
    fd.append('referenceAudio', challenge.referenceAudio);

    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new PronunciationChallenge(data.id, data.transcription,
          data.referenceAudio);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        result.referenceAudio = challenge.referenceAudio;
        result.referenceAudioUrl = data.referenceAudioUrl;
        result.status = data.status;
        return result;
      });
  }

  /**
   * Get a pronunciation challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {PronunciationChallenge#id} challengeId - Specify a pronunciation challenge identifier.
   * @returns {Promise} Promise containing a PronunciationChallenge.
   * @throws {Promise} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  getPronunciationChallenge(challengeId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation/' + challengeId;
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new PronunciationChallenge(data.id, data.transcription, data.referenceAudio);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        challenge.referenceAudioUrl = data.referenceAudioUrl;
        challenge.status = data.status;
        return challenge;
      });
  }

  /**
   * List all pronunciation challenges in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise} Promise containing a list of PronunciationChallenges.
   * @throws {Promise} If no result could not be found.
   */
  listPronunciationChallenges() {
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation';
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenges = [];
        data.forEach(datum => {
          const challenge = new PronunciationChallenge(datum.id, datum.transcription, datum.referenceAudio);
          challenge.created = new Date(datum.created);
          challenge.updated = new Date(datum.updated);
          challenge.referenceAudioUrl = datum.referenceAudioUrl;
          challenge.status = datum.status;
          challenges.push(challenge);
        });
        return challenges;
      });
  }

  /**
   * Delete a pronunciation challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {PronunciationChallenge#id} challengeId - A pronunciation challenge identifier.
   * @returns {Promise} Promise containing this.
   * @throws {Promise} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise} If the server returned an error.
   */
  deletePronunciationChallenge(challengeId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation/' +
      challengeId;
    return this._connection._secureAjaxDelete(url)
      .then(() => challengeId);
  }
}

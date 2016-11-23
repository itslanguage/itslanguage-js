const SpeechChallenge = require('./speech-challenge');

/**
 * Controller class for the SpeechChallenge model.
 */
module.exports = class SpeechChallengeController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this._connection = connection;
  }

  /**
   * Create a speech challenge.
   *
   * @param {SpeechChallenge} speechChallenge Object to create.
   * @returns Promise containing the newly created object.
   * @rejects If the server returned an error.
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
    const url = this._connection.settings.apiUrl + '/organisations/' +
      speechChallenge.organisationId + '/challenges/speech';

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
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a speech challenge identifier.
   * @returns Promise containing a SpeechChallenge.
   * @rejects If no result could not be found.
   */
  getSpeechChallenge(organisationId, challengeId) {
    const url = this._connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech/' + challengeId;

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
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise containing a list of SpeechChallenges.
   * @rejects If no result could not be found.
   */
  listSpeechChallenges(organisationId) {
    const url = this._connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech';

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
};

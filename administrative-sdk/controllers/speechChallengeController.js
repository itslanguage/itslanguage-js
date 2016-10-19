const SpeechChallenge = require('../models/speechChallenge');

/**
 * Controller class for the SpeechChallenge model.
 */
module.exports = class SpeechChallengeController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this.connection = connection;
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
    const url = this.connection.settings.apiUrl + '/organisations/' +
      speechChallenge.organisationId + '/challenges/speech';

    return this.connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        speechChallenge.id = data.id;
        speechChallenge.created = new Date(data.created);
        speechChallenge.updated = new Date(data.updated);
        speechChallenge.referenceAudioUrl = data.referenceAudioUrl || null;
        return speechChallenge;
      });
  }

  /**
   * Get a speech challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a speech challenge identifier.
   * @returns Promise containing a SpeechChallenge.
   * @rejects If no result could not be found.
   */
  static getSpeechChallenge(connection, organisationId, challengeId) {
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech/' + challengeId;

    return connection._secureAjaxGet(url)
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
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise containing a list of SpeechChallenges.
   * @rejects If no result could not be found.
   */
  static listSpeechChallenges(connection, organisationId) {
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech';

    return connection._secureAjaxGet(url)
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

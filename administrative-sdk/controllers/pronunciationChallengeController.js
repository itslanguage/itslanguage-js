const PronunciationChallenge = require('../models/pronunciationChallenge').PronunciationChallenge;

/**
 * Controller class for the PronunciationChallenge model.
 */
class PronunciationChallengeController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Create a pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge Object to create..
   * @returns Promise containing the newly created object.
   * @rejects If the server returned an error.
   */
  createPronunciationChallenge(challenge) {
    if (!challenge.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    if (typeof challenge.referenceAudio !== 'object' || !challenge.referenceAudio) {
      return Promise.reject(new Error(
        'referenceAudio parameter of type "Blob" is required'));
    }
    const url = this.connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation';
    const fd = new FormData();
    if (typeof challenge.id !== 'undefined' &&
      challenge.id !== null) {
      fd.append('id', challenge.id);
    }
    fd.append('transcription', challenge.transcription);
    fd.append('referenceAudio', challenge.referenceAudio);

    return this.connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        challenge.id = data.id;
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        challenge.referenceAudioUrl = data.referenceAudioUrl;
        challenge.status = data.status;
        return challenge;
      });
  }

  /**
   * Get a pronunciation challenge.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a pronunciation challenge identifier.
   * @returns Promise containing a PronunciationChallenge.
   * @rejects If no result could not be found.
   */
  static getPronunciationChallenge(connection, organisationId, challengeId) {
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation/' + challengeId;
    return connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new PronunciationChallenge(organisationId, data.id,
          data.transcription);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        challenge.referenceAudioUrl = data.referenceAudioUrl;
        challenge.status = data.status;
        return challenge;
      });
  }

  /**
   * List all pronunciation challenges in the organisation.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise containing a list of PronunciationChallenges.
   * @rejects If no result could not be found.
   */
  static listPronunciationChallenges(connection, organisationId) {
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation';
    return connection._secureAjaxGet(url)
      .then(data => {
        const challenges = [];
        data.forEach(datum => {
          const challenge = new PronunciationChallenge(
            organisationId, datum.id, datum.transcription);
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
   * Delete a pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge A pronunciation challenge object.
   * @returns Promise containing this.
   * @rejects If the server returned an error.
   */
  deletePronunciationChallenge(challenge) {
    if (!challenge.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    if (!challenge.id) {
      return Promise.reject(new Error('id field is required'));
    }
    const url = this.connection.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id;
    return this.connection._secureAjaxDelete(url)
      .then(() => challenge);
  }
}

module.exports = {
  PronunciationChallengeController
};

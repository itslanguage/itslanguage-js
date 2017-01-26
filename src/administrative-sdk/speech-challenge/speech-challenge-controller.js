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
   * The created speech challenge will not contain the submitted audio file, but instead a property
   * `referenceAudioUrl` which is the URL to download the submitted audio file.
   * Additional information like .srt files or images can also be added in HTML5 Blob format.
   * The returned SpeechChallenge will contain links to download the given files.
   *
   * @param {SpeechChallenge} speechChallenge - Object to create.
   * @param {?Blob} audioBlob - Audio fragment to link to the challenge.
   * @param {?Blob} srtFile - SRT file in HTML5 Blob format to accompany the challenge.
   * @param {?Blob} image - Image file in HTML5 Blob format to accompany the challenge.
   * @returns {Promise.<PronunciationChallenge>} Promise containing the newly created SpeechChallenge.
   * @throws {Promise.<Error>} speechChallenge field of type "SpeechChallenge" is required
   * @throws {Promise.<Error>} audioBlob parameter of type "Blob" is required.
   * @throws {Promise.<Error>} srtFile parameter of type "Blob" is required.
   * @throws {Promise.<Error>} image parameter of type "Blob" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createSpeechChallenge(speechChallenge, audioBlob = null, srtFile = null, image = null) {
    if (!(speechChallenge instanceof SpeechChallenge)) {
      return Promise.reject(new Error('speechChallenge field of type "SpeechChallenge" is required'));
    }
    if (audioBlob !== null && !(audioBlob instanceof Blob)) {
      return Promise.reject(new Error('audioBlob parameter of type "Blob|null" is required'));
    }
    if (srtFile !== null && !(srtFile instanceof Blob)) {
      return Promise.reject(new Error('srtFile parameter of type "Blob|null" is required'));
    }
    if (image !== null && !(image instanceof Blob)) {
      return Promise.reject(new Error('image parameter of type "Blob|null" is required'));
    }
    speechChallenge.referenceAudio = audioBlob;
    speechChallenge.srt = srtFile;
    speechChallenge.image = image;
    const fd = JSON.stringify(speechChallenge);
    const url = this._connection._settings.apiUrl + '/challenges/speech';

    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new SpeechChallenge(data.id, data.topic, data.referenceAudioUrl, data.srtUrl, data.imageUrl);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get a speech challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   * The returned speech challenge will not contain an audio file, but instead a property
   * `referenceAudioUrl` which is the URL to download the submitted audio file.
   *
   * @param {string} challengeId - Specify a speech challenge identifier.
   * @returns {Promise.<PronunciationChallenge>} Promise containing a SpeechChallenge.
   * @throws {Promise.<Error>} {@link SpeechChallenge#id} field of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getSpeechChallenge(challengeId) {
    if (typeof challengeId !== 'string') {
      return Promise.reject(new Error('challengeId field of type "string" is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/speech/' + challengeId;

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new SpeechChallenge(data.id, data.topic, data.referenceAudioUrl, data.srtUrl, data.imageUrl);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        return challenge;
      });
  }

  /**
   * Get and return all speech challenges in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<SpeechChallenge[]>} Promise containing an array of SpeechChallenges.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getSpeechChallenges() {
    const url = this._connection._settings.apiUrl + '/challenges/speech';

    return this._connection._secureAjaxGet(url)
      .then(data => data.map(datum => {
        const challenge = new SpeechChallenge(datum.id,
          datum.topic, datum.referenceAudioUrl, data.srtUrl, data.imageUrl);
        challenge.created = new Date(datum.created);
        challenge.updated = new Date(datum.updated);
        return challenge;
      }));
  }
}

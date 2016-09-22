/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */

/**
 * @title ITSLanguage Javascript SDK
 * @overview This is the ITSLanguage Javascript SDK to perform administrative functions.
 * @copyright (c) 2014 ITSLanguage
 * @license MIT
 * @author d-centralize
 */

const autobahn = require('autobahn');
var when = require('autobahn').when;
var Q = require('q');
/**
 @module its
 ITSLanguage SDK module.
 */

class Tenant {
  /**
   * Tenant domain model.
   *
   * @constructor
   * @param {string} [id] The tenant identifier. If none is given, one is generated.
   * @param {string} name name of the tenant.
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}


class BasicAuth {
  /**
   * BasicAuth domain model.
   *
   * @constructor
   * @param {string} tenantId The tenant identifier to create this BasicAuth for.
   * @param {string} [principal] The principal. If none is given, one is generated.
   * @param {string} [credentials] The credentials. If none is given, one is generated.
   */
  constructor(tenantId, principal, credentials) {
    if (typeof tenantId !== 'string') {
      throw new Error(
        'tenantId parameter of type "string" is required');
    }
    this.tenantId = tenantId;
    if (typeof principal !== 'string' &&
      principal !== null &&
      principal !== undefined) {
      throw new Error(
        'principal parameter of type "string|null|undefined" is required');
    }
    this.principal = principal;
    if (typeof credentials !== 'string' &&
      credentials !== null &&
      credentials !== undefined) {
      throw new Error(
        'credentials parameter of type "string|null|undefined" is required');
    }
    this.credentials = credentials;
  }
}


class Organisation {
  /**
   * Organisation domain model.
   *
   * @constructor
   * @param {string} [id] The organisation identifier. If none is given, one is generated.
   * @param {string} [name] name of the organisation.
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

/**
 * @class Student
 *
 * @member {string} organisationId The organisation identifier this student is a member of.
 * @member {string} [id] The student identifier. If none is given, one is generated.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {string} [firstName] First name of the student.
 * @member {string} [lastName] Last name of the student.
 * @member {string} [gender] Gender of the student (either `male` or `female`).
 * @member {number} [birthYear] Birth year of the student.
 */
class Student {
  /**
   * Create a speech challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this student is a member of.
   * @param {string} [id] The student identifier. If none is given, one is generated.
   * @param {string} [firstName] First name of the student.
   * @param {string} [lastName] Last name of the student.
   * @param {string} [gender] Gender of the student (either `male` or `female`).
   * @param {number} [birthYear] Birth year of the student.
   */
  constructor(organisationId, id, firstName, lastName, gender, birthYear) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    this.id = id;
    if (organisationId && typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string|null" is required');
    }
    this.organisationId = organisationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.birthYear = birthYear;
  }
}

/**
 * @class SpeechChallenge
 *
 * @member {string} organisationId The organisation identifier this challenge is an entry in.
 * @member {string} [id] The speech challenge identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {string} [topic] A question or topic serving as guidance.
 * @member {Blob} [referenceAudio] The reference audio fragment.
 * @member {string} [referenceAudioUrl] The reference audio fragment as streaming audio link.
 */
class SpeechChallenge {
  /**
   * Create a speech challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this challenge is an entry in.
   * @param {string} [id] The speech challenge identifier. If none is given, one is generated.
   * @param {string} [topic] A question or topic serving as guidance.
   * @param {Blob} [referenceAudio] The reference audio fragment.
   * @return {its.SpeechChallenge}
   */
  constructor(organisationId, id, topic, referenceAudio) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    this.id = id;
    if (organisationId && typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string|null" is required');
    }
    this.organisationId = organisationId;
    if (topic && typeof topic !== 'string') {
      throw new Error(
        'topic parameter of type "string" is required');
    }
    this.topic = topic;
    // Field is optional, but if given, then it's validated.
    if (typeof referenceAudio !== 'object' && referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }
    this.referenceAudio = referenceAudio || null;
    this.referenceAudioUrl = null;
  }
}

/**
 * @class SpeechRecording
 *
 * @member {its.SpeechChallenge} challenge The SpeechChallenge instance this speech is recorded for.
 * @member {its.Student} student The student instance on whose behalve this audio is recorded.
 * @member {string} [id] The speech recording identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {Blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 */
class SpeechRecording {
  /**
   * Create a speech recording domain model.
   *
   * @constructor
   * @param {its.SpeechChallenge} challenge The SpeechChallenge instance this speech is recorded for.
   * @param {its.Student} student The Student instance on whose behalve this audio is recorded.
   * @param {string} [id] The speech recording identifier. If none is given, one is generated.
   * @param {Blob} audio The recorded audio fragment.
   */
  constructor(challenge, student, id, audio) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    this.id = id;
    if (typeof challenge !== 'object' || !challenge) {
      throw new Error(
        'challenge parameter of type "SpeechChallenge" is required');
    }
    this.challenge = challenge;
    if (typeof student !== 'object' || !student) {
      throw new Error(
        'student parameter of type "Student" is required');
    }
    this.student = student;

    if (!(audio instanceof Blob || audio === null || audio === undefined)) {
      throw new Error(
        'audio parameter of type "Blob|null" is required');
    }
    this.audio = audio;
  }
}

/**
 * @class PronunciationChallenge
 *
 * @member {string} organisationId The organisation identifier this challenge is an entry in.
 * @member {string} [id] The pronunciation challenge identifier.
 * @member {date} [created] The creation date of the challenge entity.
 * @member {date} [updated] The most recent update date of the challenge entity.
 * @member {string} transcription The spoken word or sentence as plain text.
 * @member {Blob} [referenceAudio] The reference audio fragment.
 * @member {string} [referenceAudioUrl] The reference audio fragment as streaming audio link.
 * @member {string} [status] The status of the challenge's preparation. Either 'unprepared', 'preparing' or 'prepared'.
 */
class PronunciationChallenge {
  /**
   * Create a pronunciation challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this challenge is an entry in.
   * @param {string} [id] The pronunciation challenge identifier. If none is given, one is generated.
   * @param {string} transcription The spoken word or sentence as plain text.
   * @param {Blob} referenceAudio The reference audio fragment.
   * @return {PronunciationChallenge}
   */
  constructor(organisationId, id, transcription, referenceAudio) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    this.id = id;
    if (organisationId && typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string|null" is required');
    }
    this.organisationId = organisationId;
    if (typeof transcription !== 'string') {
      throw new Error(
        'transcription parameter of type "string" is required');
    }
    this.transcription = transcription;
    if (typeof referenceAudio !== 'object' && referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }
    this.referenceAudio = referenceAudio;
  }
}

/**
 * @class Phoneme
 *
 * @member {string} ipa The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
 * @member {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad, 1 the perfect score.
 * @member {string} bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6. good when the score is 0.6 or above.
 */
class Phoneme {
  /**
   * Create a phoneme domain model.
   *
   * @constructor
   * @param {string} ipa The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
   * @param {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad, 1 the perfect score.
   * @param {float} confidenceScore This value provides a reliable prediction that the pronounced phoneme is actually the phoneme that is supposed to be pronounced. There is no absolute scale defined yet.
   * @param {string} verdict bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6. good when the score is 0.6 or above.
   * @return {Phoneme}
   */
  constructor(ipa, score, confidenceScore, verdict) {
    this.ipa = ipa;
    this.score = score;
    this.confidenceScore = confidenceScore;
    this.verdict = verdict;
  }
}

/**
 * @class WordChunk
 *
 * @member {string} graphemes The graphemes this chunk consists of.
 * @member {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad, 1 the perfect score.
 * @member {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6. `good` when the score is 0.6 or above.
 * @member {its.Phoneme[]} phonemes The phonemes this chunk consists of.
 */
class WordChunk {
  /**
   * Create a word chunk domain model.
   *
   * @constructor
   * @param {string} graphemes The graphemes this chunk consists of.
   * @param {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad, 1 the perfect score.
   * @param {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6. `good` when the score is 0.6 or above.
   * @param {its.Phoneme[]} phonemes The phonemes this chunk consists of.
   * @return {WordChunk}
   */
  constructor(graphemes, score, verdict, phonemes) {
    this.graphemes = graphemes;
    this.score = score;
    this.verdict = verdict;
    this.phonemes = phonemes || [];
  }
}

/**
 * @class Word
 *
 * @member {its.WordChunk[]} chunks The spoken sentence, split in graphemes per word.
 */
class Word {
  /**
   * Create a word domain model.
   *
   * @constructor
   * @param {its.WordChunk[][]} chunks The spoken sentence, split in graphemes per word.
   * @return {Word}
   */
  constructor(chunks) {
    this.chunks = chunks;
  }
}

/**
 * @class PronunciationAnalysis
 *
 * @member {PronunciationChallenge} challenge The challenge identifier.
 * @member {Student} student The student identifier on whose behalve this audio is uploaded.
 * @member {string} id The pronunciation analysis identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {Blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 * @member {number} score The average score of all phonemes grading the entire attempt.
 * @member {float} confidenceScore This value provides a reliable prediction that the pronounced phonemes are actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
 * @member {its.Word[][]} words The spoken sentence, split in graphemes per word.
 */
class PronunciationAnalysis {
  /**
   * Create a pronunciation analysis domain model.
   *
   * @constructor
   * @param {PronunciationChallenge} challenge The challenge identifier.
   * @param {Student} student The student identifier on whose behalve this audio is uploaded.
   * @param {string} id The pronunciation analysis identifier.
   * @param {date} created The creation date of the entity.
   * @param {date} updated The most recent update date of the entity.
   * @param {string} audioUrl The audio fragment as streaming audio link.
   */
  constructor(challenge, student, id, created, updated, audioUrl) {
    this.id = id;
    this.challenge = challenge;
    this.student = student;
    this.created = created;
    this.updated = updated;
    this.audioUrl = audioUrl;
  }
}

/**
 * @class ChoiceChallenge
 *
 * @member {string} organisationId The organisation identifier this challenge is an entry in.
 * @member {string} [id] The choice challenge identifier.
 * @member {date} created The creation date of the challenge entity.
 * @member {date} updated The most recent update date of the challenge entity.
 * @member {string} [question] A hint or question related to the choices.
 * @member {string} [status] The status of the challenge's preparation. Either 'unprepared', 'preparing' or 'prepared'.
 * @member {string[]} choices The sentences of which at most one may be recognised.
 */
class ChoiceChallenge {
  /**
   * Create a choice challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this challenge is an entry in.
   * @param {string} [id] The pronunciation challenge identifier. If none is given, one is generated.
   * @param {string} [question] A hint or question related to the choices.
   * @param {string[]} choices The sentences of which at most one may be recognised.
   * @return {ChoiceChallenge}
   */
  constructor(organisationId, id, question, choices) {
    if (typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string" is required');
    }
    this.organisationId = organisationId;
    if (typeof id !== 'string' && id !== null && id !== undefined) {
      throw new Error(
        'id parameter of type "string|null|undefined" is required');
    }
    if (typeof id === 'string' && id.length === 0) {
      throw new Error(
        'id parameter should not be an empty string');
    }
    this.id = id;
    if (typeof question !== 'string' &&
      question !== null &&
      question !== undefined) {
      throw new Error(
        'question parameter of type "string|null|undefined" is required');
    }
    this.question = question;
    if (typeof choices !== 'object') {
      throw new Error(
        'choices parameter of type "Array" is required');
    }
    this.choices = choices;
  }
}

/**
 * @class ChoiceRecognition
 *
 * @member {ChoiceChallenge} challenge The challenge identifier.
 * @member {Student} student The student identifier on whose behalve this audio is uploaded.
 * @member {string} id The choice recognition identifier.
 * @member {Date} created The creation date of the entity.
 * @member {Date} updated The most recent update date of the entity.
 * @member {Blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 * @member {string} recognised The recognised sentence.
 */
class ChoiceRecognition {
  /**
   * Create a choice recognition domain model.
   *
   * @constructor
   * @param {PronunciationChallenge} challenge The challenge identifier.
   * @param {Student} student The student identifier on whose behalve this audio is uploaded.
   * @param {string} id The choice recognition identifier.
   * @param {Date} created The creation date of the entity.
   * @param {Date} updated The most recent update date of the entity.
   * @param {string} audioUrl The audio fragment as streaming audio link.
   * @param {string} recognised The recognised sentence.
   */
  constructor(challenge, student, id, created, updated, audioUrl, recognised) {
    this.id = id;
    this.challenge = challenge;
    this.student = student;
    this.created = created;
    this.updated = updated;
    this.audioUrl = audioUrl;
    this.recognised = recognised;
  }
}

class Sdk {
  /**
   * ITSLanguage SDK module.
   *
   * @constructor
   * @param {object} [options] Override any of the default settings.
   *
   */
  constructor(options) {
    this.settings = Object.assign({
      // ITSL connection parameters.
      apiUrl: 'https://api.itslanguage.nl',
      authPrincipal: null,
      authCredentials: null,
      wsUrl: null,
      wsToken: null
    }, options);
    Sdk._sdkCompatibility();
    this._analysisId = null;
    this._recordingId = null;
    this._recognitionId = null;

    // The addEventListener interface exists on object.Element DOM elements.
    // However, this is just a simple class without any relation to the DOM.
    // Therefore we have to implement a pub/sub mechanism ourselves.
    // See:
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
    // http://stackoverflow.com/questions/10978311/implementing-events-in-my-own-object
    this.events = {};
    var self = this;
    this.addEventListener = function(name, handler) {

      if (self.events.hasOwnProperty(name)) {
        self.events[name].push(handler);
      } else {
        self.events[name] = [handler];
      }
    };

    this.removeEventListener = function(name, handler) {
      /* This is a bit tricky, because how would you identify functions?
       This simple solution should work if you pass THE SAME handler. */
      if (!self.events.hasOwnProperty(name)) {
        return;
      }

      var index = self.events[name].indexOf(handler);
      if (index !== -1) {
        self.events[name].splice(index, 1);
      }
    };

    this.fireEvent = function(name, args) {
      if (!self.events.hasOwnProperty(name)) {
        return;
      }
      if (!args || !args.length) {
        args = [];
      }

      var evs = self.events[name];
      evs.forEach(function(ev) {
        ev.apply(null, args);
      });
    };

    if (this.settings.wsToken) {
      this._webSocketConnect(this.settings);
    }
  }


  /**
   * Logs browser compatibility for required and optional SDK capabilities.
   * In case of compatibility issues, an error is thrown.
   */
  static _sdkCompatibility() {
    // WebSocket
    // http://caniuse.com/#feat=websockets
    var canCreateWebSocket = 'WebSocket' in window;
    console.log('Native WebSocket capability: ' +
      canCreateWebSocket);

    if (!canCreateWebSocket) {
      throw new Error('No WebSocket capabilities');
    }
  }

  /**
   * Create a connection to the websocket server.
   *
   */
  _webSocketConnect(data) {
    var authUrl = data.wsUrl + '?access_token=' +
      this.settings.wsToken;
    var connection = null;
    // Open a websocket connection for streaming audio
    try {
      // Set up WAMP connection to router
      connection = new autobahn.Connection({
        url: authUrl,
        realm: 'default'
      });
    } catch (e) {
      console.log('WebSocket creation error: ' + e);
      return;
    }
    var self = this;
    connection.onerror = function(e) {
      console.log('WebSocket error: ' + e);
      self.fireEvent('websocketError', [e]);
    };
    connection.onopen = function(session) {
      console.log('WebSocket connection opened');
      self._session = session;
      var _call = self._session.call;
      self._session.call = function(url) {
        console.debug('Calling RPC: ' + url);
        return _call.apply(this, arguments);
      };
      self.fireEvent('websocketOpened');
    };
    connection.onclose = function() {
      console.log('WebSocket disconnected');
      self._session = null;
      self.fireEvent('websocketClosed');
    };
    connection.open();
  }

  /**
   * Parse JSON response from API response.
   *
   * @param {string} responseText The response body as text.
   * @return {object} Parsed JSON object.
   */
  static _parseResponse(responseText) {
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Response: ' + responseText);
      console.error('Unhandled exception: ' + error);
      throw error;
    }
  }

  makeOrganisation(data) {
    return new Promise(function(resolve) {
      resolve(data);
    });
  }

  /**
   * Perform a HTTP DELETE to the API.
   *
   * @param {string} url to submit to.
   * @param {string} [auth] The authorization header value to pass along with the request.
   */
  _ajaxDelete(url, auth) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      var response = null;
      request.open('DELETE', url);
      request.onload = function() {
        if (request.status >= 100 && request.status < 300) {
          // A delete call usually has no body to parse.
          resolve();
        } else {
          // Some error occured.
          try {
            response = Sdk._parseResponse(request.responseText);
            reject(
              {
                errors: response.errors,
                status: request.status
              }
            );
          } catch (e) {
            reject(response || e);
          }
        }

      };
      if (typeof auth !== 'undefined') {
        request.setRequestHeader('Authorization', auth);
      }
      request.send();
    });
  }

  /**
   * Assemble a HTTP Authentication header.
   */
  _getAuthHeaders() {
    if (!this.settings.authPrincipal && !this.settings.authCredentials) {
      throw new Error('Please set authPrincipal and authCredentials');
    }
    var combo = this.settings.authPrincipal + ':' + this.settings.authCredentials;
    return 'Basic ' + btoa(unescape(encodeURIComponent(combo)));
  }

  /**
   * Perform a HTTP GET to the API using authentication.
   *
   * @param {string} url to retrieve.
   */
  secureAjaxGet(url) {
    return this._secureAjaxGet(url, this._getAuthHeaders());
  }

  /**
   * Perform a HTTP GET to the API using authentication.
   *
   * @param {string} url to retrieve.
   * @param authHeaders form headers.
   */
  _secureAjaxGet(url, authHeaders) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      var response = null;
      request.open('GET', url);
      if (typeof authHeaders !== 'undefined') {
        request.setRequestHeader('Authorization', authHeaders);
      }
      request.onload = function() {
        response = Sdk._parseResponse(request.responseText);
        if (request.status >= 200 && request.status < 300) {
          resolve(response);
        } else {
          reject({
            status: request.status,
            errors: response
          });
        }
      };

      request.onerror = function() {
        reject({
          status: request.status,
          errors: response
        });
      };
      request.send();
    });
  }

  /**
   * Perform a HTTP POST to the API using authentication.
   *
   * @param {string} url to submit to.
   * @param formData to POST.
   * @returns {Promise} A promise to return the response.
   */
  secureAjaxPost(url, formData) {
    return this._secureAjaxPost(url, formData, this._getAuthHeaders());
  }

  /**
   * Perform a HTTP POST to the API using authentication.
   *
   * @param {string} url to submit to.
   * @param {FormData} formdata The form to POST.
   * @param authHeaders form headers.
   * @returns {Promise} A promise to return the response.
   */
  _secureAjaxPost(url, formdata, authHeaders) {
    var request = new XMLHttpRequest({mozSystem: true});
    var response = null;
    //var authHeaders = this._getAuthHeaders();
    return new Promise(function(resolve, reject) {

      request.open('POST', url);
      if (typeof authHeaders !== 'undefined') {
        request.setRequestHeader('Authorization', authHeaders);
      }
      request.onload = function() {
        response = Sdk._parseResponse(request.responseText);
        if (request.status >= 100 && request.status < 300) {
          resolve(response);
        } else {
          reject(
            {
              status: request.status,
              errors: response
            }
          );
        }
      };

      request.onerror = function() {
        reject(
          {
            status: request.status,
            errors: response
          }
        );
      };
      if (typeof formdata === 'string') {
        // Send JSON by default
        request.setRequestHeader('Content-Type',
          'application/json; charset=utf-8');
      }

      request.send(formdata);
    });
  }

  /**
   * Perform a HTTP DELETE to the API using authentication.
   *
   * @param {string} url to submit to.
   */
  _secureAjaxDelete(url) {
    return this._ajaxDelete(url, this._getAuthHeaders());
  }

  /**
   * Add an access token to the given URL.
   *
   * @param {string} url The URL to add an access token to.
   */
  addAccessToken(url) {
    if (!this.settings.authPrincipal && !this.settings.authCredentials) {
      throw new Error('Please set authPrincipal and authCredentials');
    }
    var combo = this.settings.authPrincipal + ':' + this.settings.authCredentials;
    var accessToken = btoa(unescape(encodeURIComponent(combo)));
    var secureUrl = url + (url.match(/\?/) ? '&' : '?') + 'access_token=' +
      encodeURIComponent(accessToken);
    return secureUrl;
  }

  /**
   * Log a RPC error to the console.
   *
   * @param {object} result Autobahn error object.
   */
  static logRPCError(result) {
    console.error('RPC error returned:', result.error);
  }

  /**
   * Create a tenant.
   *
   * @param {its.Tenant} tenant A tenant domain model instance.
   * @returns {Promise} A promise to return the tenant
   * @throws Any errors and the tenant object.
   */
  createTenant(tenant) {
    var url = this.settings.apiUrl + '/tenants';
    var fd = JSON.stringify(tenant);

    return new Promise(function(resolve, reject) {
      self.secureAjaxPost(url, fd)
        .catch(function(error) {

          reject(error);

        })
        .then(function(data) {

          // Update the id in case domain model didn't contain one.
          tenant.id = data.id;
          tenant.created = new Date(data.created);
          tenant.updated = new Date(data.updated);
          resolve(tenant);

        });
    });
  }

  /**
   * Create a basic auth.
   *
   * @param {BasicAuth} basicauth A basic auth domain model instance.
   */
  createBasicAuth(basicauth) {
    var self = this;
    var url = this.settings.apiUrl + '/basicauths';
    var formData = JSON.stringify(basicauth);
    return new Promise(function(resolve, reject) {
      self.secureAjaxPost(url, formData)
        .catch(function(error) {

          reject(error);

        })
        .then(function(data) {

          basicauth.principal = data.principal;
          basicauth.created = new Date(data.created);
          basicauth.updated = new Date(data.updated);
          // Credentials are only supplied when generated by the backend.
          if (data.credentials) {
            basicauth.credentials = data.credentials;
          }
          resolve(basicauth);

        });
    });
  }

  /**
   * Create an organisation.
   *
   * @param {its.Organisation} organisation An organisation domain model instance.
   * @returns {Promise} A promise to return the created organisation.
   */
  createOrganisation(organisation) {
    var url = this.settings.apiUrl + '/organisations';
    var fd = JSON.stringify(organisation);
    var self = this;

    return new Promise(function(resolve, reject) {
      self.secureAjaxPost(url, fd)
        .catch(function(error) {

          reject(error);

        }).then(function(data) {

        organisation.id = data.id;
        organisation.created = new Date(data.created);
        organisation.updated = new Date(data.updated);
        resolve(organisation);

      });
    });
  }

  /**
   * Get an organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   */
  getOrganisation(organisationId) {
    var url = this.settings.apiUrl + '/organisations/' + organisationId;
    var self = this;

    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        })
        .then(function(data) {

          var organisation = new Organisation(data.id, data.name);
          organisation.created = new Date(data.created);
          organisation.updated = new Date(data.updated);
          resolve(organisation);

        });
    });
  }

  /**
   * List all organisations in the organisation.
   *
   * @returns {Promise} A promise to return a list of all organisations in the organisation.
   */
  listOrganisations() {
    var url = this.settings.apiUrl + '/organisations';
    var self = this;

    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url).catch(function(error) {

        reject(new Error(error));

      }).then(function(data) {

        var organisations = [];
        data.forEach(function(datum) {
          var organisation = new Organisation(datum.id, datum.name);
          organisation.created = new Date(datum.created);
          organisation.updated = new Date(datum.updated);
          organisations.push(organisation);
        });
        resolve(organisations);

      });
    });
  }

  /**
   * Create a student.
   *
   * @param {its.Student} student A student domain model instance.
   * @returns {Promise} A promise to return the created student;
   */
  createStudent(student) {
    if (!student.organisationId) {
      throw new Error('organisationId field is required');
    }
    var url = this.settings.apiUrl + '/organisations/' +
      student.organisationId + '/students';
    var fd = JSON.stringify(student);
    var self = this;

    return new Promise(function(resolve, reject) {
      self.secureAjaxPost(url, fd)
        .then(function(data) {

          // Update the id in case domain model didn't contain one.
          student.id = data.id;
          student.created = new Date(data.created);
          student.updated = new Date(data.updated);
          resolve(student);

        }).catch(function(error) {

        reject(error);

      });
    });
  };

  /**
   * Get a student.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} studentId Specify a student identifier.
   * @returns {Promise} A promise to return the created student;
   */
  getStudent(organisationId, studentId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/students/' + studentId;
    var self = this;
    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        })
        .then(function(data) {

          var student = new Student(organisationId, data.id, data.firstName,
            data.lastName, data.gender, data.birthYear);
          student.created = new Date(data.created);
          student.updated = new Date(data.updated);
          resolve(student);

        });
    });
  }

  /**
   * List all students in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @returns {Promise} A promise to return a list of all students in the organisation.
   */
  listStudents(organisationId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/students';
    var self = this;
    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        })
        .then(function(data) {

          var students = [];
          data.forEach(function(datum) {
            var student = new Student(organisationId, datum.id,
              datum.firstName, datum.lastName, datum.gender, datum.birthYear);
            student.created = new Date(datum.created);
            student.updated = new Date(datum.updated);
            students.push(student);
          });
          resolve(students);

        });
    });
  }

  /**
   * Create a speech challenge.
   *
   * @param {its.SpeechChallenge} challenge A speech challenge object.
   * @returns {Promise} A promise to return the created speech challenge.
   */
  createSpeechChallenge(challenge) {

    var self = this;

    return new Promise(function(resolve, reject) {

      if (!challenge.organisationId) {
        reject(new Error('organisationId field is required'));
      }

      var fd = new FormData();
      if (typeof challenge.id !== 'undefined' &&
        challenge.id !== null) {
        fd.append('id', challenge.id);
      }
      fd.append('topic', challenge.topic);
      if (challenge.referenceAudio) {
        fd.append('referenceAudio', challenge.referenceAudio);
      }
      var url = self.settings.apiUrl + '/organisations/' +
        challenge.organisationId + '/challenges/speech';

      self.secureAjaxPost(url, fd)
        .catch(function(error) {

          reject(error);

        })
        .then(function(data) {

          // Update the id in case domain model didn't contain one.
          challenge.id = data.id;
          challenge.created = new Date(data.created);
          challenge.updated = new Date(data.updated);
          challenge.referenceAudioUrl = data.referenceAudioUrl || null;
          resolve(challenge);

        });
    });
  }

  /**
   * Get a speech challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a speech challenge identifier.
   * @returns {Promise} A promise to get the speech challenge.
   */
  getSpeechChallenge(organisationId, challengeId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech/' + challengeId;
    var self = this;

    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        }).then(function(data) {

        var challenge = new SpeechChallenge(organisationId, data.id, data.topic);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        resolve(challenge);

      });
    })
  }

  /**
   * List all speech challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @returns {Promise} A promise to return an array of all speech challenges in the organisation.
   */
  listSpeechChallenges(organisationId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech';
    var self = this;

    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url)
        .catch(function(error) {
          reject(new Error(error));
        })
        .then(function(data) {

          var challenges = [];
          data.forEach(function(datum) {
            var challenge = new SpeechChallenge(organisationId, datum.id,
              datum.topic);
            challenge.created = new Date(datum.created);
            challenge.updated = new Date(datum.updated);
            challenges.push(challenge);
          });
          resolve(challenges);

        });
    });
  }

  /**
   * Initialise the speech recording challenge through RPCs.
   *
   */
  speechRecordingInitChallenge(challenge) {
    var self = this;

    return this._session.call('nl.itslanguage.recording.init_challenge',
      [self._recordingId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function(recordingId) {
        console.log('Challenge initialised for recordingId: ' + self._recordingId);
      },
      // RPC error callback
      function(res) {
        Sdk.logRPCError(res);
      }
    );
  }

  /**
   * Initialise the speech recording audio specs through RPCs.
   *
   */
  speechRecordingInitAudio(recorder, dataavailableCb) {
    var self = this;
    console.log('InitAudio');
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the recording when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    this._session.call('nl.itslanguage.recording.init_audio',
      [self._recordingId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function(recordingId) {
        console.log('Accepted audio parameters for recordingId after init_audio: ' + self._recordingId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function(res) {
        Sdk.logRPCError(res);
      }
    );
  }

  /**
   * Start a speech recording from streaming audio.
   *
   * @param {its.SpeechChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @returns Promise containing an object
   *
   * {
   *  dataId,
   *  recordingId
   *  created,
   *  updated,
   *  audioUrl,
   *  challenge:
   *    {
   *    id,
   *    organisationId,
   *    topic,
   *    referenceAudio,
   *    referenceAudioUrl
   *    },
   *  student:
   *    {
   *    organisationId
   *    }
   * }
   *
   * @rejects Error if there is no challenge parameter.
   * @rejects Error if there is no challenge id.
   * @rejects Error if there is no challenge organisationId.
   * @rejects Error if there is no session configured.
   * @rejects Error if the given recorder is recording.
   * @rejects Error if there is still a session in progress.
   * @rejects if an error occurred during the streaming of data, in which case basic metadata is returned.
   */
  startStreamingSpeechRecording(challenge, recorder) {
    console.log('Start streaming speech recording');
    var self = this;
    return new Promise(function(resolve, reject) {
        // Validate required domain model.
        // Validate environment prerequisites.
        if (typeof challenge !== 'object' || !challenge) {
          reject(new Error('"challenge" parameter is required or invalid'));
        }
        if (!challenge.id) {
          reject(new Error('challenge.id field is required'));
        }
        if (!challenge.organisationId) {
          reject(new Error('challenge.organisationId field is required'));
        }
        if (!self._session) {
          reject(new Error('WebSocket connection was not open.'));
        }
        if (recorder.isRecording()) {
          reject(new Error('Recorder should not yet be recording.'));
        }
        if (self._recordingId !== null) {
          reject(new Error('Session with recordingId ' + self._recordingId + ' still in progress.'));
        }
        self._recordingId = null;

        var recordedCb = function(activeRecordingId, audioBlob, forcedStop) {
          self._session.call('nl.itslanguage.recording.close',
            [self._recordingId]).then(
            // RPC success callback
            function(res) {
              // Pass along details to the success callback
              _cb(res, forcedStop);
            },
            // RPC error callback
            function(res) {
              Sdk.logRPCError(res);
              errorEncountered(res);
            }
          );
          recorder.removeEventListener('recorded', recordedCb);
          recorder.removeEventListener('dataavailable', startStreaming);
          self._recordingId = null;
        };

        var _cb = function(data) {
          var student = new Student(challenge.organisationId, data.studentId);
          var recording = new SpeechRecording(
            challenge, student, data.id);
          recording.created = new Date(data.created);
          recording.updated = new Date(data.updated);
          recording.audioUrl = self.addAccessToken(data.audioUrl);
          recording.recordingId = self._recordingId;
          resolve(recording);
        };

        var errorEncountered = function(errors, recording) {
          // Either there was an unexpected error, or the audio failed to
          // align, in which case no recording is provided, but just the
          // basic metadata.
          reject(errors);
        };

        // Start streaming the binary audio when the user instructs
        // the audio recorder to start recording.
        function startStreaming(chunk) {
          var encoded = Sdk._arrayBufferToBase64(chunk);
          console.log('Sending audio chunk to websocket for recordingId: ' +
            self._recordingId);
          self._session.call('nl.itslanguage.recording.write',
            [self._recordingId, encoded, 'base64']).then(
            // RPC success callback
            function(res) {
              // Wrote data.
              console.log('Wrote data');
            },
            // RPC error callback
            function(res) {
              console.log('Caught in startStreaming ' + res);
              Sdk.logRPCError(res);
              errorEncountered(res);
            }
          );
        }

        function startRecording(recordingId) {
          self._recordingId = recordingId;
          console.log('Got recordingId after initialisation: ' + self._recordingId);
          self.speechRecordingInitChallenge(challenge)
            .then(function(result) {

              var p = new Promise(function(resolve, reject) {

                if (recorder.hasUserMediaApproval()) {
                  resolve();
                } else {
                  recorder.addEventListener('ready', resolve);
                }

              });
              p.then(self.speechRecordingInitAudio(recorder, startStreaming));
            });
        }

        recorder.addEventListener('recorded', recordedCb);
        self._session.call('nl.itslanguage.recording.init_recording', [])
          .then(startRecording,
            function(res) {
              Sdk.logRPCError(res);
              errorEncountered(res);
            }
          );
      }
    );
  }

  /**
   * Cancel any current streaming audio recording.
   *
   * @param {its.AudioRecorder} recorder The audio recorder currently recording.
   */
  cancelStreaming(recorder) {
    var self = this;
    if (this._recordingId === null && this._analysisId === null && this._recognitionId === null) {
      console.info('No session in progress, nothing to cancel.');
      return;
    }
    recorder.removeEventListener('ready');
    recorder.removeEventListener('recorded');
    recorder.removeEventListener('dataavailable');
    if (recorder.isRecording()) {
      recorder.stop();
    }
    // This session is over.
    self._recordingId = null;
    self._analysisId = null;
    self._recognitionId = null;
  }

  /**
   * Get a speech recording in a speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge.
   * @param {string} recordingId Specify a speech recording identifier.
   * @returns Promise to get the wanted speech recording in a speech challenge.
   */
  getSpeechRecording(challenge, recordingId) {
    var self = this;
    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }
    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings/' + recordingId;

    return new Promise(function(resolve, reject) {
      self._secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        })
        .then(function(data) {

          var student = new Student(challenge.organisationId, data.studentId);
          var recording = new SpeechRecording(challenge, student, data.id);
          recording.audio = null;
          recording.audioUrl = self.addAccessToken(data.audioUrl);
          recording.created = new Date(data.created);
          recording.updated = new Date(data.updated);
          resolve(recording);

        });
    });
  }

  /**
   * List all speech recordings in a specific speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge to list speech recordings for.
   * @returns Promise to get a list of all speech recordings for a specific speech challenge.
   */
  listSpeechRecordings(challenge) {

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }
    var self = this;
    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings';

    return new Promise(function(resolve, reject) {
      self._secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        })
        .then(function(data) {

          var recordings = [];
          data.forEach(function(datum) {
            var student = new Student(challenge.organisationId, datum.studentId);
            var recording = new SpeechRecording(challenge, student, datum.id);
            recording.audio = null;
            recording.audioUrl = self.addAccessToken(datum.audioUrl);
            recording.created = new Date(datum.created);
            recording.updated = new Date(datum.updated);
            recordings.push(recording);
          });
          resolve(recordings);

        });
    });
  }

  /**
   * Create a pronunciation challenge.
   *
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @returns {Promise} A promise to return the created pronunciation challenge.
   */
  createPronunciationChallenge(challenge) {
    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation';
    var self = this;

    return new Promise(function(resolve, reject) {

      // Validate required domain model fields.
      if (!challenge.organisationId) {
        reject(new Error('organisationId field is required'));
      }

      if (typeof challenge.referenceAudio !== 'object' || !challenge.referenceAudio) {
        reject(new Error(
          'referenceAudio parameter of type "Blob" is required'));
      }

      var fd = new FormData();
      if (typeof challenge.id !== 'undefined' &&
        challenge.id !== null) {
        fd.append('id', challenge.id);
      }

      fd.append('transcription', challenge.transcription);
      fd.append('referenceAudio', challenge.referenceAudio);
      self.secureAjaxPost(url, fd)
        .then(function(data) {
          // Update the id in case domain model didn't contain one.
          challenge.id = data.id;
          challenge.created = new Date(data.created);
          challenge.updated = new Date(data.updated);
          challenge.referenceAudioUrl = data.referenceAudioUrl;
          challenge.status = data.status;
          resolve(challenge);

        }).catch(function(error) {
        reject(error);
      });
    });
  }

  /**
   * Get a pronunciation challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a pronunciation challenge identifier.
   * @returns Promise to return the needed pronunciation challenge.
   * @Throws Error if nothing can be found.
   */
  getPronunciationChallenge(organisationId, challengeId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation/' + challengeId;
    var self = this;
    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        })
        .then(function(data) {

          var challenge = new PronunciationChallenge(organisationId, data.id,
            data.transcription);
          challenge.created = new Date(data.created);
          challenge.updated = new Date(data.updated);
          challenge.referenceAudioUrl = data.referenceAudioUrl;
          challenge.status = data.status;
          resolve(challenge);

        });
    });
  }

  /**
   * List all pronunciation challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise to return an array pronunciation challenges.
   * @Throws Error if nothing can be found.
   */
  listPronunciationChallenges(organisationId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation';
    var self = this;
    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url)
        .catch(function(error) {

          reject(new Error(error));

        })
        .then(function(data) {

          var challenges = [];
          data.forEach(function(datum) {
            var challenge = new PronunciationChallenge(
              organisationId, datum.id, datum.transcription);
            challenge.created = new Date(datum.created);
            challenge.updated = new Date(datum.updated);
            challenge.referenceAudioUrl = datum.referenceAudioUrl;
            challenge.status = datum.status;
            challenges.push(challenge);
          });
          resolve(challenges);

        });
    });
  }

  /**
   * Delete a pronunciation challenge.
   *
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @returns Promise to return the pronunciation challenge.
   * @rejects if the challenge can't be found.
   */
  deletePronunciationChallenge(challenge) {
    var self = this;

    return new Promise(function(resolve, reject) {
      // Validate required domain model fields.
      if (!challenge.organisationId) {
        reject(new Error('organisationId field is required'));
      }

      if (!challenge.id) {
        reject(new Error('id field is required'));
      }
      var url = self.settings.apiUrl + '/organisations/' +
        challenge.organisationId + '/challenges/pronunciation/' +
        challenge.id;

      self._secureAjaxDelete(url)
        .then(function() {

          resolve(challenge);

        }).catch(function(error) {

        reject(error);

      });
    });
  }

  /**
   * Create a `its.Word` domain model from JSON data.
   *
   * @returns Array of the `its.Word` domain models.
   * @param inWords
   */
  _wordsToModels(inWords) {
    var words = [];
    inWords.forEach(function(word) {
      var chunks = [];
      word.chunks.forEach(function(chunk) {
        var phonemes = [];
        // Phonemes are only provided on detailed analysis.
        chunk.phonemes = chunk.phonemes || [];
        chunk.phonemes.forEach(function(phoneme) {
          var newPhoneme = new Phoneme(
            phoneme.ipa, phoneme.score, phoneme.confidenceScore,
            phoneme.verdict);
          // Copy all properties as API docs indicate there may be a
          // variable amount of phoneme properties.
          Object.assign(newPhoneme, phoneme);
          phonemes.push(newPhoneme);
        });
        var wordChunk = new WordChunk(chunk.graphemes, chunk.score,
          chunk.verdict, phonemes);
        chunks.push(wordChunk);
      });
      var newWord = new Word(chunks);
      words.push(newWord);
    });
    return words;
  }

  /**
   * Initialise the pronunciation analysis challenge through RPCs.
   *
   */
  pronunciationAnalysisInitChallenge(challenge) {
    var self = this;

    return self._session.call('nl.itslanguage.pronunciation.init_challenge',
      [self._analysisId, challenge.organisationId, challenge.id])
      .catch(function(res) {
        Sdk.logRPCError(res);
      })
      .then(function(analysisId) {
        console.log('Challenge initialised for analysisId: ' + self._analysisId);
      })
      .then(self._session.call('nl.itslanguage.pronunciation.alignment',
        [self._analysisId]))
      .catch(function(res) {
        Sdk.logRPCError(res);
      })
      .then(function(alignment) {
        self.referenceAlignment = alignment;
        console.log('Reference alignment retrieved');
      });
  }

  /**
   * Initialise the pronunciation analysis audio specs through RPCs.
   *
   */
  pronunciationAnalysisInitAudio(recorder, dataavailableCb) {
    var self = this;
    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the analysis when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    self._session.call('nl.itslanguage.pronunciation.init_audio',
      [self._analysisId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function(analysisId) {
        console.log('Accepted audio parameters for analysisId after init_audio: ' + self._analysisId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function(res) {
        Sdk.logRPCError(res);
      }
    );
  }

  /**
   * Start a pronunciation analysis from streaming audio.
   *
   * @param {its.PronunciationChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   */
  startStreamingPronunciationAnalysis(challenge, recorder, trim) {
    //return Q.Promise(function(resolve, reject, notify){});
    var self = this;
    return new when.promise(function(resolve, reject, notify) {

      // Validate required domain model.
      if (typeof challenge !== 'object' || !challenge) {
        reject(new Error(
          '"challenge" parameter is required or invalid'));
      }
      if (!challenge.id) {
        reject(new Error('challenge.id field is required'));
      }
      if (!challenge.organisationId) {
        reject(new Error('challenge.organisationId field is required'));
      }
      // Validate environment prerequisites.
      if (!self._session) {
        reject(new Error('WebSocket connection was not open.'));
      }
      if (recorder.isRecording()) {
        reject(new Error('Recorder should not yet be recording.'));
      }

      if (self._analysisId !== null) {
        reject(new Error('Session with analysisId ' + self._analysisId + ' still in progress.'));
      }

      self._analyisId = null;
      var trimAudioStart = 0.15;
      var trimAudioEnd = 0.0;
      if (trim === false) {
        trimAudioStart = 0.0;
      }

      var reportDone = function(data) {
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          null, null,
          self.addAccessToken(data.audioUrl));
        analysis.score = data.score;
        analysis.confidenceScore = data.confidenceScore;
        analysis.words = self._wordsToModels(data.words);
        resolve({analysisId: self._analysisId, analysis: analysis});
      };

      var reportProgress = function(progress) {
        notify(progress, self.referenceAlignment);
      };

      var reportError = function(data) {
        // Either there was an unexpected error, or the audio failed to
        // align, in which case no analysis is provided, but just the
        // basic metadata.
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          self.addAccessToken(data.audioUrl));
        reject({analysis: analysis, message: data.message});
      };

      // Start streaming the binary audio when the user instructs
      // the audio recorder to start recording.
      var startStreaming = function(chunk) {
        var encoded = Sdk._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for analysisId: ' +
          self._analysisId);
        self._session.call('nl.itslanguage.pronunciation.write',
          [self._analysisId, encoded, 'base64'])
          .catch(function(res) {
            Sdk.logRPCError(res);
            reportError(res);
          })
          .then(function(res) {
            console.debug('Delivered audio successfully');
          });
      };

      var initAnalysis = function(analysisId) {
        self._analysisId = analysisId;
        console.log('Got analysisId after initialisation: ' + self._analysisId);
        self.pronunciationAnalysisInitChallenge(challenge)
          .then(function() {
            var p = new Promise(function(resolve) {

              if (recorder.hasUserMediaApproval()) {
                resolve();
              } else {
                recorder.addEventListener('ready', resolve);
              }
            });

            p.then(function() {
              recorder.removeEventListener('ready', resolve);
              self.pronunciationAnalysisInitAudio(recorder, startStreaming);
            });
          });
      };

      // Stop listening when the audio recorder stopped.
      var stopListening = function(id) {
        recorder.removeEventListener('recorded', stopListening);
        recorder.removeEventListener('dataavailable', startStreaming);

        // This session is over.
        self._analysisId = null;

        // When done, submit any plain text (non-JSON) to start analysing.
        self._session.call('nl.itslanguage.pronunciation.analyse',
          [self._analysisId], {}, {receive_progress: true})
          .then(reportDone)
          .catch(function(res) {
            if (res.error === 'nl.itslanguage.ref_alignment_failed') {
              res.kwargs.analysis.message = 'Reference alignment failed';
            } else if (res.error === 'nl.itslanguage.alignment_failed') {
              res.kwargs.analysis.message = 'Alignment failed';
            } else if (res.error === 'nl.itslanguage.analysis_failed') {
              res.kwargs.analysis.message = 'Analysis failed';
            } else {
              res.kwargs.analysis.message = 'Unhandled error';
              Sdk.logRPCError(res);
            }
            reportError(res.kwargs.analysis);
          })
          .tap(function(progress){
            reportProgress(progress);
          });
      };

      //BEGIN POINT
      recorder.addEventListener('recorded', stopListening);
      self._session.call('nl.itslanguage.pronunciation.init_analysis', [],
        {
          trimStart: trimAudioStart,
          trimEnd: trimAudioEnd
        })
        .then(initAnalysis)
        .catch(Sdk.logRPCError);
    });
  }

  static
  _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }


  /**
   * Callback used by getPronunciationAnalysis.
   *
   * @callback Sdk~getPronunciationAnalysisCallback
   * @param {its.PronunciationAnalysis} analysis Retrieved pronunciation analysis domain model instance.
   */
  getPronunciationAnalysisCallback(analysis) {
  }

  /**
   * Error callback used by getPronunciationAnalysis.
   *
   * @callback Sdk~getPronunciationAnalysisErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getPronunciationAnalysisErrorCallback(errors) {
  }

  /**
   * Get a pronunciation analysis in a pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge.
   * @param {string} analysisId Specify a pronunciation analysis identifier.
   * @param {Sdk~getPronunciationAnalysisCallback} [cb] The callback that handles the response.
   * @param {Sdk~getPronunciationAnalysisErrorCallback} [ecb] The callback that handles the error response.
   */
  getPronunciationAnalysis(challenge, analysisId, cb, ecb) {
    var _cb = function(datum) {
      var student = new Student(challenge.organisationId, datum.studentId);
      var analysis = new PronunciationAnalysis(challenge, student,
        datum.id, new Date(datum.created), new Date(datum.updated),
        datum.audioUrl);
      // Alignment may not be successful, in which case the analysis
      // is not available, but it's still an attempt that is available,
      // albeit without extended attributes like score and phonemes.
      if (datum.score) {
        analysis.score = datum.score;
        analysis.words = this._wordsToModels(datum.words);
      }
      if (cb) {
        cb(analysis);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses/' + analysisId;
    secureAjaxGet(url, _cb, ecb);
  }

  /**
   * List all pronunciation analyses in a specific pronunciation challenge.
   *
   * @param {PronunciationChallenge} challenge Specify a pronunciation challenge to list speech recordings for.
   * @param {Boolean} detailed Returns extra analysis metadata when true. false by default.
   * @param {Sdk~listPronunciationAnalysesCallback} cb The callback that handles the response.
   * @param {Sdk~listPronunciationAnalysesErrorCallback} [ecb] The callback that handles the error response.
   */
  listPronunciationAnalyses(challenge, detailed, cb, ecb) {
    var self = this;
    var _cb = function(data) {
      var analyses = [];
      data.forEach(function(datum) {
        var student = new Student(challenge.organisationId, datum.studentId);
        var analysis = new PronunciationAnalysis(challenge, student,
          datum.id, new Date(datum.created), new Date(datum.updated),
          datum.audioUrl);
        // Alignment may not be successful, in which case the analysis
        // is not available, but it's still an attempt that is available,
        // albeit without extended attributes like score and phonemes.
        if (datum.score) {
          analysis.score = datum.score;
          analysis.words = self._wordsToModels(datum.words);
        }
        analyses.push(analysis);
      });
      if (cb) {
        cb(analyses);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id + '/analyses';
    if (detailed) {
      url += '?detailed=true';
    }
    secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Create a choice challenge.
   *
   * @param {its.ChoiceChallenge} challenge A choice challenge object.
   * @returns {Promise} A promise to return the created choice challenge.
   */
  createChoiceChallenge(challenge) {
    // Validate required domain model fields.

    var self = this;

    return new Promise(function(resolve, reject) {

      if (!challenge.organisationId) {
        reject(new Error('organisationId field is required'));
      }

      var url = self.settings.apiUrl + '/organisations/' +
        challenge.organisationId + '/challenges/choice';

      var fd = new FormData();
      if (challenge.id !== undefined &&
        challenge.id !== null) {
        fd.append('id', challenge.id);
      }
      fd.append('question', challenge.question);
      challenge.choices.forEach(function(choice) {
        fd.append('choices', choice);
      });

      self.secureAjaxPost(url, fd)
        .then(function(data) {

          // Update the id in case domain model didn't contain one.
          challenge.id = data.id;
          challenge.created = new Date(data.created);
          challenge.updated = new Date(data.updated);
          challenge.status = data.status;
          challenge.choices = [];
          data.choices.forEach(function(pair) {
            challenge.choices.push(pair.choice);
          });
          resolve(challenge);

        })
        .catch(function(errors) {

          reject(errors);

        });
    });
  }

  /**
   * Get a choice challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a choice challenge identifier.
   */
  getChoiceChallenge(organisationId, challengeId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice/' + challengeId;
    var self = this;
    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url).catch(function(error) {
        reject(error);
      })
        .then(function(data) {
          var challenge = new ChoiceChallenge(organisationId, data.id,
            data.question, data.choices);
          challenge.created = new Date(data.created);
          challenge.updated = new Date(data.updated);
          challenge.status = data.status;
          challenge.choices = [];
          data.choices.forEach(function(pair) {
            challenge.choices.push(pair.choice);
          });
          resolve(challenge);
        })
      ;
    });
  }

  /**
   * List all choice challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   */
  listChoiceChallenges(organisationId) {
    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice';
    var self = this;
    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url).catch(function(error) {
        reject(error);
      }).then(function(data) {
        var challenges = [];
        data.forEach(function(datum) {
          var challenge = new ChoiceChallenge(
            organisationId, datum.id, datum.question, datum.choices);
          challenge.created = new Date(datum.created);
          challenge.updated = new Date(datum.updated);
          challenge.status = datum.status;
          challenge.choices = [];
          datum.choices.forEach(function(pair) {
            challenge.choices.push(pair.choice);
          });
          challenges.push(challenge);
        });
        resolve(challenges);
      });
    });
  }


  /**
   * Initialise the choice recognition challenge through RPCs.
   *
   */
  choiceRecognitionInitChallenge(challenge) {
    var self = this;

    return this._session.call('nl.itslanguage.choice.init_challenge',
      [self._recognitionId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function(recognitionId) {
        console.log('Challenge initialised for recognitionId: ' + self._recognitionId);
      },
      // RPC error callback
      function(res) {
        console.error('RPC error returned:', res.error);
      }
    );
  }

  /**
   * Initialise the pronunciation analysis audio specs through RPCs.
   *
   */
  choiceRecognitionInitAudio(recorder, dataavailableCb) {
    var self = this;

    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the analysis when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    this._session.call('nl.itslanguage.choice.init_audio',
      [self._recognitionId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function(recognitionId) {
        console.log('Accepted audio parameters for recognitionId after init_audio: ' + self._recognitionId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function(res) {
        console.error('RPC error returned:', res.error);
      }
    );
  }

  /**
   * Start a choice recognition from streaming audio.
   *
   * @param {its.ChoiceChallenge} challenge The choice challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   */
  startStreamingChoiceRecognition(challenge, recorder, trim) {
    var self = this;

    return new Promise(function(resolve, reject) {

      var _cb = function(data) {
        var recognition = new ChoiceRecognition(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          self.addAccessToken(data.audioUrl), data.recognised);
        resolve(recognition);
      };

      var _ecb = function(data) {
        // There was an unexpected error.
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          self.addAccessToken(data.audioUrl));
        reject(
          {
            analysis: analysis,
            message: data.message
          }
        );
      };

      // Validate required domain model.
      if (typeof challenge !== 'object' || !challenge) {
        reject(new Error(
          '"challenge" parameter is required or invalid'));
      }
      if (!challenge.id) {
        reject(new Error('challenge.id field is required'));
      }
      if (!challenge.organisationId) {
        reject(new Error('challenge.organisationId field is required'));
      }

      // Validate environment prerequisites.
      if (!self._session) {
        reject(new Error('WebSocket connection was not open.'));
      }

      if (recorder.isRecording()) {
        reject(new Error('Recorder should not yet be recording.'));
      }

      if (self._recognitionId !== null) {
        reject(new Error('Session with recognitionId ' + self._recognitionId + ' still in progress.'));
      }
      self._recognitionId = null;

      // Start streaming the binary audio when the user instructs
      // the audio recorder to start recording.
      var dataavailableCb = function(chunk) {
        var encoded = Sdk._arrayBufferToBase64(chunk);
        console.log('Sending audio chunk to websocket for recognitionId: ' +
          self._recognitionId);
        self._session.call('nl.itslanguage.choice.write',
          [self._recognitionId, encoded, 'base64']).then(
          // RPC success callback
          function(res) {
            console.debug('Delivered audio successfully');
          },
          // RPC error callback
          function(res) {
            console.error('RPC error returned:', res.error);
            _ecb(res);
          }
        );
      };

      var recognitionInitCb = function(recognitionId) {
        self._recognitionId = recognitionId;
        console.log('Got recognitionId after initialisation: ' + self._recognitionId);
        self.choiceRecognitionInitChallenge(challenge)
          .then(function() {

            var p = new Promise(function(resolve, reject) {

              if (recorder.hasUserMediaApproval()) {
                resolve();
              } else {
                recorder.addEventListener('ready', resolve);
              }
            });
            p.then(function(result) {
              recorder.removeEventListener('ready', resolve);
              self.choiceRecognitionInitAudio(recorder, dataavailableCb);
            });

          });
      };

      var trimAudioStart = 0.15;
      var trimAudioEnd = 0.0;
      if (trim === false) {
        trimAudioStart = 0.0;
      }
      self._session.call('nl.itslanguage.choice.init_recognition', [],
        {
          trimStart: trimAudioStart,
          trimEnd: trimAudioEnd
        })
        .then(recognitionInitCb)
        .catch(function(res) {
          console.error('RPC error returned:', res.error);
        });

      // Stop listening when the audio recorder stopped.
      var recordedCb = function(id) {
        // When done, submit any plain text (non-JSON) to start analysing.
        self._session.call('nl.itslanguage.choice.recognise',
          [self._recognitionId]).then(
          // RPC success callback
          function(res) {
            // Wait for analysis results to come back.
            _cb(res);
          },
          // RPC error callback
          function(res) {
            console.error('RPC error returned:', res.error);
            if (res.error === 'nl.itslanguage.recognition_failed') {
              res.kwargs.recognition.message = 'Recognition failed';
            } else {
              res.kwargs.recognition.message = 'Unhandled error';
            }
            _ecb(res.kwargs.analysis);
          }
        );

        recorder.removeEventListener('recorded', recordedCb);
        recorder.removeEventListener('dataavailable', dataavailableCb);
        // This session is over.
        self._recognitionId = null;
      };
      recorder.addEventListener('recorded', recordedCb);
    });
  }

  /**
   * Callback used by getChoiceRecognition.
   *
   * @callback Sdk~getChoiceRecognitionCallback
   * @param {its.ChoiceRecognition} recognition Retrieved choice recognition domain model instance.
   */
  getChoiceRecognitionCallback(recognition) {
  }

  /**
   * Error callback used by getChoiceRecognition.
   *
   * @callback Sdk~getChoiceRecognitionErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getChoiceRecognitionErrorCallback(errors) {
  }

  /**
   * Get a choice recognition in a choice challenge.
   *
   * @param {ChoiceChallenge} challenge Specify a choice challenge.
   * @param {string} recognitionId Specify a choice recognition identifier.
   * @param {Sdk~getChoiceRecognitionCallback} [cb] The callback that handles the response.
   * @param {Sdk~getChoiceRecognitionErrorCallback} [ecb] The callback that handles the error response.
   */
  getChoiceRecognition(challenge, recognitionId) {

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions/' + recognitionId;
    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }
    var self = this;
    return new Promise(function(resolve, reject) {
      self.secureAjaxGet(url).catch(function(error) {
        reject(error);
      }).then(function(datum) {
        var student = new Student(challenge.organisationId, datum.studentId);
        var recognition = new ChoiceRecognition(challenge, student,
          datum.id, new Date(datum.created), new Date(datum.updated),
          datum.audioUrl);
        // Alignment may not be successful, in which case the recognition
        // is not available, but it's still an attempt that is available,
        // albeit without extended attributes like score and phonemes.
        if (datum.recognised) {
          recognition.recognised = datum.recognised;
        }
        resolve(recognition);
      });
    });
  }

  /**
   * List all choice recognitions in a specific choice challenge.
   *
   * @param {ChoiceChallenge} challenge Specify a choice challenge to list speech recognitions for.
   */
  listChoiceRecognitions(challenge) {
    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions';
    var self = this;
    return new Promise(function(resolve, reject) {

      if (!challenge || !challenge.id) {
        reject(new Error('challenge.id field is required'));
      }
      if (!challenge.organisationId) {
        reject(new Error('challenge.organisationId field is required'));
      }
      self.secureAjaxGet(url)
        .then(function(data) {

          var recognitions = [];
          data.forEach(function(datum) {
            var student = new Student(challenge.organisationId, datum.studentId);
            var recognition = new ChoiceRecognition(challenge, student,
              datum.id, new Date(datum.created), new Date(datum.updated),
              datum.audioUrl);
            // Recognition may not be successful, in which case the recognition
            // is not available, but it's still an attempt that is available,
            // albeit without extended attributes like recognised.
            if (datum.recognised) {
              recognition.recognised = datum.recognised;
            }
            recognitions.push(recognition);
          });
          resolve(recognitions);

        })
        .catch(reject);
    });
  }
}


module
  .exports = {
  BasicAuth: BasicAuth,
  ChoiceChallenge: ChoiceChallenge,
  ChoiceRecognition: ChoiceRecognition,
  Organisation: Organisation,
  Phoneme: Phoneme,
  PronunciationAnalysis: PronunciationAnalysis,
  PronunciationChallenge: PronunciationChallenge,
  Sdk: Sdk,
  SpeechChallenge: SpeechChallenge,
  SpeechRecording: SpeechRecording,
  Student: Student,
  Tenant: Tenant,
  Word: Word,
  WordChunk: WordChunk
};

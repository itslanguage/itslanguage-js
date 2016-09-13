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
 * @member {blob} [referenceAudio] The reference audio fragment.
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
   * @param {blob} [referenceAudio] The reference audio fragment.
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
 * @member {blob} audio The recorded audio fragment.
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
   * @param {blob} audio The recorded audio fragment.
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
 * @member {blob} [referenceAudio] The reference audio fragment.
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
   * @param {blob} referenceAudio The reference audio fragment.
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
 * @member {blob} audio The recorded audio fragment.
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
 * @member {blob} audio The recorded audio fragment.
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

    this._sdkCompatibility();
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
    this.addEventListener = function (name, handler) {

      if (self.events.hasOwnProperty(name)) {
        self.events[name].push(handler);
      } else {
        self.events[name] = [handler];
      }
    };

    this.removeEventListener = function (name, handler) {
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

    this.fireEvent = function (name, args) {
      if (!self.events.hasOwnProperty(name)) {
        return;
      }
      if (!args || !args.length) {
        args = [];
      }

      var evs = self.events[name];
      evs.forEach(function (ev) {
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
  _sdkCompatibility() {
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
    connection.onerror = function (e) {
      console.log('WebSocket error: ' + e);
      self.fireEvent('websocketError', [e]);
    };
    connection.onopen = function (session) {
      console.log('WebSocket connection opened');
      self._session = session;
      var _call = self._session.call;
      self._session.call = function (url) {
        console.debug('Calling RPC: ' + url);
        return _call.apply(this, arguments);
      };
      self.fireEvent('websocketOpened');
    };
    connection.onclose = function (e) {
      console.log('WebSocket disconnected');
      self._session = null;
      self.fireEvent('websocketClosed');
    };
    connection.open();
  }

  /**
   * Parse JSON reponse from API response.
   *
   * @param {string} responseText The response body as text.
   * @return {object} Parsed JSON object.
   */
  _parseResponse(responseText) {
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Response: ' + responseText);
      console.error('Unhandled exception: ' + error);
      throw error;
    }
  }

  /**
   * Perform a HTTP GET to the API.
   *
   * @param {string} url URL to retrieve.
   * @param {callback} [cb] The callback that handles the response.
   * @param {callback} [ecb] The callback that handles the error response.
   * @param {string} [auth] The authorization header value to pass along with the request.
   */
  _ajaxGet(url, cb, ecb, auth) {
    var self = this;
    var request = new XMLHttpRequest();
    var response = null;
    request.open('GET', url);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status >= 100 && request.status < 300) {
          // Perfect!
          response = self._parseResponse(request.responseText);
          if (cb) {
            return cb(response);
          }
        } else if (ecb) {
          // Some error occured.
          response = self._parseResponse(request.responseText);
          ecb(response.errors || {
              status: request.status
            }, response);
        }
      }
    };
    if (typeof auth !== 'undefined') {
      request.setRequestHeader('Authorization', auth);
    }
    request.send();
  }

  /**
   * Perform a HTTP POST to the API.
   *
   * @param {string} url to submit to.
   * @param {FormData|string} formdata FormData or stringified JSON to POST.
   * @param {callback} [cb] The callback that handles the response.
   * @param {callback} [ecb] The callback that handles the error response.
   * @param {string} [auth] The authorization header value to pass along with the request.
   */
  _ajaxPost(url, formdata, cb, ecb, auth) {
    var self = this;
    var request = new XMLHttpRequest();
    var response = null;
    request.open('POST', url);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        // The response is received
        if (request.status >= 100 && request.status < 300) {
          // Perfect!
          response = self._parseResponse(request.responseText);
          if (cb) {
            return cb(response);
          }
        } else if (ecb) {
          // Some error occured.
          try {
            response = self._parseResponse(request.responseText);
            ecb(response.errors || {
                status: request.status
              }, response);
          } catch (e) {
            ecb(response || e);
          }
        }
      }
    };
    if (typeof auth !== 'undefined') {
      request.setRequestHeader('Authorization', auth);
    }
    if (typeof formdata === 'object') {
      // The only way to send blob data is using FormData, which is
      // supported everywhere except for IE <10.
      request.send(formdata);
    } else if (typeof formdata === 'string') {
      // Send JSON by default
      request.setRequestHeader('Content-Type',
        'application/json; charset=utf-8');
      request.send(formdata);
    }
  }

  /**
   * Perform a HTTP DELETE to the API.
   *
   * @param {string} URL to submit to.
   * @param {callback} [cb] The callback that handles the response.
   * @param {callback} [ecb] The callback that handles the error response.
   * @param {string} [auth] The authorization header value to pass along with the request.
   */
  _ajaxDelete(url, cb, ecb, auth) {
    var self = this;
    var request = new XMLHttpRequest();
    var response = null;
    request.open('DELETE', url);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        // The response is received
        if (request.status >= 100 && request.status < 300) {
          // A delete call usually has no body to parse.
          if (cb) {
            cb();
          }
        } else if (ecb) {
          // Some error occured.
          try {
            response = self._parseResponse(request.responseText);
            ecb(response.errors || {
                status: request.status
              }, response);
          } catch (e) {
            ecb(response || e);
          }
        }
      }
    };
    if (typeof auth !== 'undefined') {
      request.setRequestHeader('Authorization', auth);
    }
    request.send();
  }

  /**
   * Assemble a HTTP Authentication header.
   */
  _getAuthHeaders() {
    if (!this.settings.authPrincipal && !this.settings.authCredentials) {
      throw new Error('Please set authPrincipal and authCredentials');
    }
    var combo = this.settings.authPrincipal + ':' + this.settings.authCredentials;
    var authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(combo)));
    return authHeader;
  }

  /**
   * Perform a HTTP GET to the API using authentication.
   *
   * @param {string} URL to retrieve.
   * @param {callback} [cb] The callback that handles the response.
   * @param {callback} [ecb] The callback that handles the error response.
   */
  _secureAjaxGet(url, cb, ecb) {
    return this._ajaxGet(url, cb, ecb, this._getAuthHeaders());
  }

  /**
   * Perform a HTTP POST to the API using authentication.
   *
   * @param {string} URL to submit to.
   * @param {FormData} formdata The form to POST.
   * @param {callback} [cb] The callback that handles the response.
   * @param {callback} [ecb] The callback that handles the error response.
   */
  _secureAjaxPost(url, formdata, cb, ecb) {
    return this._ajaxPost(url, formdata, cb, ecb, this._getAuthHeaders());
  }

  /**
   * Perform a HTTP DELETE to the API using authentication.
   *
   * @param {string} URL to submit to.
   * @param {callback} [cb] The callback that handles the response.
   * @param {callback} [ecb] The callback that handles the error response.
   */
  _secureAjaxDelete(url, cb, ecb) {
    return this._ajaxDelete(url, cb, ecb, this._getAuthHeaders());
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
  logRPCError(result) {
    console.error('RPC error returned:', result.error);
  }

  /**
   * Callback used by createTenant.
   *
   * @callback Sdk~tenantCreatedCallback
   * @param {its.Tenant} tenant Updated tenant domain model instance.
   */
  tenantCreatedCallback(tenant) {
  }

  /**
   * Error callback used by createTenant.
   *
   * @callback Sdk~tenantCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.Tenant} tenant Tenant domain model instance with unapplied changes.
   */
  tenantCreatedErrorCallback(errors, tenant) {
  }

  /**
   * Create a tenant.
   *
   * @param {its.Tenant} tenant A tenant domain model instance.
   * @param {Sdk~tenantCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~tenantCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createTenant(tenant, cb, ecb) {
    var _cb = function (data) {
      // Update the id in case domain model didn't contain one.
      tenant.id = data.id;
      tenant.created = new Date(data.created);
      tenant.updated = new Date(data.updated);
      if (cb) {
        cb(tenant);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, tenant);
      }
    };

    var url = this.settings.apiUrl + '/tenants';
    var fd = JSON.stringify(tenant);
    this._secureAjaxPost(url, fd, _cb, _ecb);
  }


  /**
   * Callback used by createBasicAuth.
   *
   * @callback Sdk~basicAuthCreatedCallback
   * @param {its.BasicAuth} basicAuth Updated basicAuth domain model instance.
   */
  basicAuthCreatedCallback(basicAuth) {
  }

  /**
   * Error callback used by createBasicAuth.
   *
   * @callback Sdk~basicAuthCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.BasicAuth} basicAuth BasicAuth domain model instance with unapplied changes.
   */
  basicAuthCreatedErrorCallback(errors, basicAuth) {
  }

  /**
   * Create a basic auth.
   *
   * @param {its.BasicAuth} basicAuth A basic auth domain model instance.
   * @param {Sdk~basicAuthCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~basicAuthCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createBasicAuth(basicauth, cb, ecb) {
    var _cb = function (data) {
      basicauth.principal = data.principal;
      basicauth.created = new Date(data.created);
      basicauth.updated = new Date(data.updated);
      // Credentials are only supplied when generated by the backend.
      if (data.credentials) {
        basicauth.credentials = data.credentials;
      }
      if (cb) {
        cb(basicauth);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, basicauth);
      }
    };

    var url = this.settings.apiUrl + '/basicauths';
    var fd = JSON.stringify(basicauth);
    this._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by createOrganisation.
   *
   * @callback Sdk~organisationCreatedCallback
   * @param {its.Organisation} organisation Updated organisation domain model instance.
   */
  organisationCreatedCallback(organisation) {
  }

  /**
   * Error callback used by createOrganisation.
   *
   * @callback Sdk~organisationCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.Organisation} organisation Organisation domain model instance with unapplied changes.
   */
  organisationCreatedErrorCallback(errors, organisation) {
  }

  /**
   * Create an organisation.
   *
   * @param {its.Organisation} organisation An organisation domain model instance.
   * @param {Sdk~organisationCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~organisationCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createOrganisation(organisation, cb, ecb) {
    var _cb = function (data) {
      // Update the id in case domain model didn't contain one.
      organisation.id = data.id;
      organisation.created = new Date(data.created);
      organisation.updated = new Date(data.updated);
      if (cb) {
        cb(organisation);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, organisation);
      }
    };

    var url = this.settings.apiUrl + '/organisations';
    var fd = JSON.stringify(organisation);
    this._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getOrganisation.
   *
   * @callback Sdk~organisationGetCallback
   * @param {its.Organisation} organisation Retrieved organisation domain model instance.
   */
  organisationGetCallback(organisation) {
  }

  /**
   * Error callback used by getOrganisation.
   *
   * @callback Sdk~organisationGetErrorCallback
   * @param {object[]} errors Array of errors.
   */
  organisationGetErrorCallback(errors) {
  }

  /**
   * Get an organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~getCallback} [cb] The callback that handles the response.
   * @param {Sdk~getErrorCallback} [ecb] The callback that handles the error response.
   */
  getOrganisation(organisationId, cb, ecb) {
    var _cb = function (data) {
      var organisation = new Organisation(data.id, data.name);
      organisation.created = new Date(data.created);
      organisation.updated = new Date(data.updated);
      if (cb) {
        cb(organisation);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' + organisationId;
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listOrganisations.
   *
   * @callback Sdk~listCallback
   * @param {its.Organisation[]} organisation Retrieved organisation domain model instances.
   */
  organisationListCallback(organisation) {
  }

  /**
   * Error callback used by listOrganisations.
   *
   * @callback Sdk~listErrorCallback
   * @param {object[]} errors Array of errors.
   */
  organisationListErrorCallback(errors) {
  }

  /**
   * List all organisations in the organisation.
   *
   * @param {Sdk~listCallback} cb The callback that handles the response.
   * @param {Sdk~listErrorCallback} [ecb] The callback that handles the error response.
   */
  listOrganisations(cb, ecb) {
    var _cb = function (data) {
      var organisations = [];
      data.forEach(function (datum) {
        var organisation = new Organisation(datum.id, datum.name);
        organisation.created = new Date(datum.created);
        organisation.updated = new Date(datum.updated);
        organisations.push(organisation);
      });
      if (cb) {
        cb(organisations);
      }
    };

    var url = this.settings.apiUrl + '/organisations';
    this._secureAjaxGet(url, _cb, ecb);
  }


  /**
   * Callback used by createStudent.
   *
   * @callback Sdk~studentCreatedCallback
   * @param {its.Student} student Updated student domain model instance.
   */
  studentCreatedCallback(student) {
  }

  /**
   * Error callback used by createStudent.
   *
   * @callback Sdk~studentCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.Student} student Student domain model instance with unapplied changes.
   */
  studentCreatedErrorCallback(errors, student) {
  }

  /**
   * Create a student.
   *
   * @param {its.Student} student A student domain model instance.
   * @param {Sdk~studentCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~studentCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createStudent(student, cb, ecb) {
    var _cb = function (data) {
      // Update the id in case domain model didn't contain one.
      student.id = data.id;
      student.created = new Date(data.created);
      student.updated = new Date(data.updated);
      if (cb) {
        cb(student);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, student);
      }
    };

    if (!student.organisationId) {
      throw new Error('organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      student.organisationId + '/students';
    var fd = JSON.stringify(student);
    this._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getStudent.
   *
   * @callback Sdk~studentGetCallback
   * @param {its.Student} student Retrieved student domain model instance.
   */
  studentGetCallback(student) {
  }

  /**
   * Error callback used by getStudent.
   *
   * @callback Sdk~studentGetErrorCallback
   * @param {object[]} errors Array of errors.
   */
  studentGetErrorCallback(errors) {
  }

  /**
   * Get a student.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} studentId Specify a student identifier.
   * @param {Sdk~getCallback} [cb] The callback that handles the response.
   * @param {Sdk~getErrorCallback} [ecb] The callback that handles the error response.
   */
  getStudent(organisationId, studentId, cb, ecb) {
    var _cb = function (data) {
      var student = new Student(organisationId, data.id, data.firstName,
        data.lastName, data.gender, data.birthYear);
      student.created = new Date(data.created);
      student.updated = new Date(data.updated);
      if (cb) {
        cb(student);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/students/' + studentId;
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listStudents.
   *
   * @callback Sdk~listCallback
   * @param {its.Student[]} student Retrieved student domain model instances.
   */
  studentListCallback(student) {
  }

  /**
   * Error callback used by listStudents.
   *
   * @callback Sdk~listErrorCallback
   * @param {object[]} errors Array of errors.
   */
  studentListErrorCallback(errors) {
  }

  /**
   * List all students in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listCallback} cb The callback that handles the response.
   * @param {Sdk~listErrorCallback} [ecb] The callback that handles the error response.
   */
  listStudents(organisationId, cb, ecb) {
    var _cb = function (data) {
      var students = [];
      data.forEach(function (datum) {
        var student = new Student(organisationId, datum.id,
          datum.firstName, datum.lastName, datum.gender, datum.birthYear);
        student.created = new Date(datum.created);
        student.updated = new Date(datum.updated);
        students.push(student);
      });
      if (cb) {
        cb(students);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/students';
    this._secureAjaxGet(url, _cb, ecb);
  }


  /**
   * Callback used by createSpeechChallenge.
   *
   * @callback Sdk~speechChallengeCreatedCallback
   * @param {its.SpeechChallenge} challenge Updated speech challenge domain model instance.
   */
  speechChallengeCreatedCallback(challenge) {
  }

  /**
   * Error callback used by createSpeechChallenge.
   *
   * @callback Sdk~speechChallengeCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechChallenge} challenge Speech challenge domain model instance with unapplied changes.
   */
  speechChallengeCreatedErrorCallback(errors, challenge) {
  }

  /**
   * Create a speech challenge.
   *
   * @param {its.SpeechChallenge} challenge A speech challenge object.
   * @param {Sdk~speechChallengeCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~speechChallengeCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createSpeechChallenge(challenge, cb, ecb) {
    var _cb = function (data) {
      // Update the id in case domain model didn't contain one.
      challenge.id = data.id;
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      challenge.referenceAudioUrl = data.referenceAudioUrl || null;
      if (cb) {
        cb(challenge);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, challenge);
      }
    };

    if (!challenge.organisationId) {
      throw new Error('organisationId field is required');
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

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech';
    this._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getSpeechChallenge.
   *
   * @callback Sdk~getSpeechChallengeCallback
   * @param {its.SpeechChallenge} challenge Retrieved speech challenge domain model instance.
   */
  getSpeechChallengeCallback(challenge) {
  }

  /**
   * Error callback used by getSpeechChallenge.
   *
   * @callback Sdk~getSpeechChallengeErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getSpeechChallengeErrorCallback(errors) {
  }

  /**
   * Get a speech challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a speech challenge identifier.
   * @param {Sdk~getSpeechChallengeCallback} [cb] The callback that handles the response.
   * @param {Sdk~getSpeechChallengeErrorCallback} [ecb] The callback that handles the error response.
   */
  getSpeechChallenge(organisationId, challengeId, cb, ecb) {
    var _cb = function (data) {
      var challenge = new SpeechChallenge(organisationId, data.id, data.topic);
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      if (cb) {
        cb(challenge);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech/' + challengeId;
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listSpeechChallenges.
   *
   * @callback Sdk~listSpeechChallegesCallback
   * @param {its.SpeechChallenge[]} challenges Retrieved speech challenge domain model instances.
   */
  listSpeechChallengeCallback(challenges) {
  }

  /**
   * Error callback used by listSpeechChallenges.
   *
   * @callback Sdk~listSpeechChallengesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listSpeechChallengeErrorCallback(errors) {
  }

  /**
   * List all speech challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listSpeechChallengesCallback} cb The callback that handles the response.
   * @param {Sdk~listSpeechChallengesErrorCallback} [ecb] The callback that handles the error response.
   */
  listSpeechChallenges(organisationId, cb, ecb) {
    var _cb = function (data) {
      var challenges = [];
      data.forEach(function (datum) {
        var challenge = new SpeechChallenge(organisationId, datum.id,
          datum.topic);
        challenge.created = new Date(datum.created);
        challenge.updated = new Date(datum.updated);
        challenges.push(challenge);
      });
      if (cb) {
        cb(challenges);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/speech';
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by createSpeechRecording.
   *
   * @callback Sdk~speechRecordingCreatedCallback
   * @param {its.SpeechRecording} recording Updated speech recording domain model instance.
   */
  speechRecordingCreatedCallback(recording) {
  }

  /**
   * Error callback used by createSpeechRecording.
   *
   * @callback Sdk~speechRecordingCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechRecording} recording Speech recording domain model instance with unapplied changes.
   */
  speechRecordingCreatedErrorCallback(errors, recording) {
  }

  /**
   * Initialise the speech recording challenge through RPCs.
   *
   */
  speechRecordingInitChallenge(challenge) {
    var self = this;

    this._session.call('nl.itslanguage.recording.init_challenge',
      [self._recordingId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function (recordingId) {
        console.log('Challenge initialised for recordingId: ' + self._recordingId);
      },
      // RPC error callback
      function (res) {
        self.logRPCError(res);
      }
    );
  }

  /**
   * Initialise the speech recording audio specs through RPCs.
   *
   */
  speechRecordingInitAudio(recorder, dataavailableCb) {
    var self = this;

    // Indicate to the socket server that we're about to start recording a
    // challenge. This allows the socket server some time to fetch the metadata
    // and reference audio to start the recording when audio is actually submitted.
    var specs = recorder.getAudioSpecs();
    this._session.call('nl.itslanguage.recording.init_audio',
      [self._recordingId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function (recordingId) {
        console.log('Accepted audio parameters for recordingId after init_audio: ' + self._recordingId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function (res) {
        self.logRPCError(res);
      }
    );
  }

  /**
   * Start a speech recording from streaming audio.
   *
   * @param {its.SpeechChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Sdk~speechRecordingPreparedCallback} [preparedCb] The callback that signals server is prepared for receiving data.
   * @param {Sdk~speechRecordingCreatedCallback} [cb] The callback that handles the response. The success outcome is returned as first parameter, whether the recording was forcedStopped due to timer timeout is returned as second parameter.
   * @param {Sdk~speechRecordingCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  startStreamingSpeechRecording(challenge, recorder, preparedCb, cb, ecb) {
    var self = this;
    var _cb = function (data) {
      var student = new Student(challenge.organisationId, data.studentId);
      var recording = new SpeechRecording(
        challenge, student, data.id);
      recording.created = new Date(data.created);
      recording.updated = new Date(data.updated);
      recording.audioUrl = self.addAccessToken(data.audioUrl);
      if (cb) {
        cb(recording);
      }
    };

    var _ecb = function (errors, recording) {
      // Either there was an unexpected error, or the audio failed to
      // align, in which case no recording is provided, but just the
      // basic metadata.
      if (ecb) {
        ecb(errors, null);
      }
    };

    // Validate required domain model.
    if (typeof challenge !== 'object' || !challenge) {
      throw new Error(
        '"challenge" parameter is required or invalid');
    }
    if (!challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    // Validate environment prerequisites.
    if (!this._session) {
      throw new Error('WebSocket connection was not open.');
    }

    if (recorder.isRecording()) {
      throw new Error('Recorder should not yet be recording.');
    }

    if (this._recordingId !== null) {
      console.error('Session with recordingId ' + this._recordingId + ' still in progress.');
      return;
    }
    this._recordingId = null;

    // Start streaming the binary audio when the user instructs
    // the audio recorder to start recording.
    function dataavailableCb(chunk) {
      var encoded = self._arrayBufferToBase64(chunk);
      console.log('Sending audio chunk to websocket for recordingId: ' +
        self._recordingId);
      self._session.call('nl.itslanguage.recording.write',
        [self._recordingId, encoded, 'base64']).then(
        // RPC success callback
        function (res) {
          // Wrote data.
        },
        // RPC error callback
        function (res) {
          self.logRPCError(res);
          _ecb(res);
        }
      );
    }

    function recordingCb(recordingId) {
      self._recordingId = recordingId;
      console.log('Got recordingId after initialisation: ' + self._recordingId);
      self.speechRecordingInitChallenge(challenge);
      preparedCb(self._recordingId);

      if (recorder.hasUserMediaApproval()) {
        self.speechRecordingInitAudio(recorder, dataavailableCb);
      } else {
        var userMediaCb = function (chunk) {
          self.speechRecordingInitAudio(recorder, dataavailableCb);
          recorder.removeEventListener('ready', recordingCb);
        };
        recorder.addEventListener('ready', userMediaCb);
      }
    }

    this._session.call('nl.itslanguage.recording.init_recording', []).then(
      // RPC success callback
      recordingCb,
      // RPC error callback
      function (res) {
        self.logRPCError(res);
        _ecb(res);
      }
    );

    // Stop listening when the audio recorder stopped.
    var recordedCb = function (activeRecordingId, audioBlob, forcedStop) {
      self._session.call('nl.itslanguage.recording.close',
        [self._recordingId]).then(
        // RPC success callback
        function (res) {
          console.log(res);
          // Pass along details to the success callback
          _cb(res, forcedStop);
        },
        // RPC error callback
        function (res) {
          self.logRPCError(res);
          _ecb(res);
        }
      );

      recorder.removeEventListener('recorded', recordedCb);
      recorder.removeEventListener('dataavailable', dataavailableCb);
      // This session is over.
      self._recordingId = null;
    };
    recorder.addEventListener('recorded', recordedCb);
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
   * Callback used by getSpeechRecording.
   *
   * @callback Sdk~getSpeechRecordingCallback
   * @param {its.SpeechRecording} recording Retrieved speech recording domain model instance.
   */
  getSpeechRecordingCallback(recording) {
  }

  /**
   * Error callback used by getSpeechRecording.
   *
   * @callback Sdk~getSpeechRecordingErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getSpeechRecordingErrorCallback(errors) {
  }

  /**
   * Get a speech recording in a speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge.
   * @param {string} recordingId Specify a speech recording identifier.
   * @param {Sdk~getSpeechRecordingCallback} [cb] The callback that handles the response.
   * @param {Sdk~getSpeechRecordingErrorCallback} [ecb] The callback that handles the error response.
   */
  getSpeechRecording(challenge, recordingId, cb, ecb) {
    var self = this;
    var _cb = function (data) {
      var student = new Student(challenge.organisationId, data.studentId);
      var recording = new SpeechRecording(challenge, student, data.id);
      recording.audio = null;
      recording.audioUrl = self.addAccessToken(data.audioUrl);
      recording.created = new Date(data.created);
      recording.updated = new Date(data.updated);
      if (cb) {
        cb(recording);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings/' + recordingId;
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listSpeechRecordings.
   *
   * @callback Sdk~listSpeechChallegesCallback
   * @param {its.SpeechRecording[]} recordings Retrieved speech recording domain model instances.
   */
  listSpeechRecordingCallback(recordings) {
  }

  /**
   * Error callback used by listSpeechRecordings.
   *
   * @callback Sdk~listSpeechRecordingsErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listSpeechRecordingErrorCallback(errors) {
  }

  /**
   * List all speech recordings in a specific speech challenge.
   *
   * @param {SpeechChallenge} challenge Specify a speech challenge to list speech recordings for.
   * @param {Sdk~listSpeechRecordingsCallback} cb The callback that handles the response.
   * @param {Sdk~listSpeechRecordingsErrorCallback} [ecb] The callback that handles the error response.
   */
  listSpeechRecordings(challenge, cb, ecb) {
    var self = this;
    var _cb = function (data) {
      var recordings = [];
      data.forEach(function (datum) {
        var student = new Student(challenge.organisationId, datum.studentId);
        var recording = new SpeechRecording(challenge, student, datum.id);
        recording.audio = null;
        recording.audioUrl = self.addAccessToken(datum.audioUrl);
        recording.created = new Date(datum.created);
        recording.updated = new Date(datum.updated);
        recordings.push(recording);
      });
      if (cb) {
        cb(recordings);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/speech/' +
      challenge.id + '/recordings';
    this._secureAjaxGet(url, _cb, ecb);
  }


  /**
   * Callback used by createPronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeCreatedCallback
   * @param {its.PronunciationChallenge} challenge Updated speech challenge domain model instance.
   */
  pronunciationChallengeCreatedCallback(challenge) {
  }

  /**
   * Error callback used by createPronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.PronunciationChallenge} challenge Pronunciation challenge domain model instance with unapplied changes.
   */
  pronunciationChallengeCreatedErrorCallback(errors, challenge) {
  }

  /**
   * Create a pronunciation challenge.
   *
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @param {Sdk~pronunciationChallengeCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~pronunciationChallengeCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createPronunciationChallenge(challenge, cb, ecb) {
    var _cb = function (data) {
      // Update the id in case domain model didn't contain one.
      challenge.id = data.id;
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      challenge.referenceAudioUrl = data.referenceAudioUrl;
      challenge.status = data.status;
      if (cb) {
        cb(challenge);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, challenge);
      }
    };

    // Validate required domain model fields.
    if (!challenge.organisationId) {
      throw new Error('organisationId field is required');
    }

    if (typeof challenge.referenceAudio !== 'object' || !challenge.referenceAudio) {
      throw new Error(
        'referenceAudio parameter of type "Blob" is required');
    }

    var fd = new FormData();
    if (typeof challenge.id !== 'undefined' &&
      challenge.id !== null) {
      fd.append('id', challenge.id);
    }
    fd.append('transcription', challenge.transcription);
    fd.append('referenceAudio', challenge.referenceAudio);

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation';
    this._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getPronunciationChallenge.
   *
   * @callback Sdk~getPronunciationChallengeCallback
   * @param {its.PronunciationChallenge} challenge Retrieved pronunciation challenge domain model instance.
   */
  getPronunciationChallengeCallback(challenge) {
  }

  /**
   * Error callback used by getPronunciationChallenge.
   *
   * @callback Sdk~getPronunciationChallengeErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getPronunciationChallengeErrorCallback(errors) {
  }

  /**
   * Get a pronunciation challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a pronunciation challenge identifier.
   * @param {Sdk~getPronunciationChallengeCallback} [cb] The callback that handles the response.
   * @param {Sdk~getPronunciationChallengeErrorCallback} [ecb] The callback that handles the error response.
   */
  getPronunciationChallenge(organisationId, challengeId, cb, ecb) {
    var _cb = function (data) {
      var challenge = new PronunciationChallenge(organisationId, data.id,
        data.transcription);
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      challenge.referenceAudioUrl = data.referenceAudioUrl;
      challenge.status = data.status;
      if (cb) {
        cb(challenge);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation/' + challengeId;
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listPronunciationChallenges.
   *
   * @callback Sdk~listPronunciationChallengesCallback
   * @param {its.PronunciationChallenge[]} challenges Retrieved pronunciation challenge domain model instances.
   */
  listPronunciationChallengesCallback(challenges) {
  }

  /**
   * Error callback used by listPronunciationChallenges.
   *
   * @callback Sdk~listPronunciationChallengesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listPronunciationChallengesErrorCallback(errors) {
  }

  /**
   * List all pronunciation challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listPronunciationChallengesCallback} cb The callback that handles the response.
   * @param {Sdk~listPronunciationChallengesErrorCallback} [ecb] The callback that handles the error response.
   */
  listPronunciationChallenges(organisationId, cb, ecb) {
    var _cb = function (data) {
      var challenges = [];
      data.forEach(function (datum) {
        var challenge = new PronunciationChallenge(
          organisationId, datum.id, datum.transcription);
        challenge.created = new Date(datum.created);
        challenge.updated = new Date(datum.updated);
        challenge.referenceAudioUrl = datum.referenceAudioUrl;
        challenge.status = datum.status;
        challenges.push(challenge);
      });
      if (cb) {
        cb(challenges);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/pronunciation';
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by deletePronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeDeletedCallback
   */
  pronunciationChallengeDeletedCallback(challenge) {
  }

  /**
   * Error callback used by deletePronunciationChallenge.
   *
   * @callback Sdk~pronunciationChallengeDeletedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.PronunciationChallenge} challenge Pronunciation challenge domain model instance with unapplied changes.
   */
  pronunciationChallengeDeletedErrorCallback(errors, challenge) {
  }

  /**
   * Delete a pronunciation challenge.
   *
   * @param {its.PronunciationChallenge} challenge A pronunciation challenge object.
   * @param {Sdk~pronunciationChallengeDeletedCallback} [cb] The callback that handles the response.
   * @param {Sdk~pronunciationChallengeDeletedErrorCallback} [ecb] The callback that handles the error response.
   */
  deletePronunciationChallenge(challenge, cb, ecb) {
    var _cb = function (response) {
      if (cb) {
        cb(challenge);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, challenge);
      }
    };

    // Validate required domain model fields.
    if (!challenge.organisationId) {
      throw new Error('organisationId field is required');
    }

    if (!challenge.id) {
      throw new Error('id field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/pronunciation/' +
      challenge.id;
    this._secureAjaxDelete(url, _cb, _ecb);
  }

  /**
   * Callback used by createPronunciationAnalysis.
   *
   * @callback Sdk~Sdk~pronunciationAnalysisCreatedCallback
   * @param {its.PronunciationAnalysis} analysis New pronunciation analysis domain model instance containing the performed analysis.
   */
  pronunciationAnalysisCreatedCallback(analysis) {
  }

  /**
   * Error callback used by createPronunciationAnalysis.
   *
   * @callback Sdk~pronunciationAnalysisCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechRecording} recording Speech recording domain model instance with unapplied changes.
   */
  pronunciationAnalysisCreatedErrorCallback(errors, recording) {
  }

  /**
   * Create a `its.Word` domain model from JSON data.
   *
   * @param {object[]} The words array from the PronunciationAnalysis API.
   * @returns an array of the `its.Word` domain models.
   */
  _wordsToModels(inWords) {
    var words = [];
    inWords.forEach(function (word) {
      var chunks = [];
      word.chunks.forEach(function (chunk) {
        var phonemes = [];
        // Phonemes are only provided on detailed analysis.
        chunk.phonemes = chunk.phonemes || [];
        chunk.phonemes.forEach(function (phoneme) {
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

    this._session.call('nl.itslanguage.pronunciation.init_challenge',
      [self._analysisId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function (analysisId) {
        console.log('Challenge initialised for analysisId: ' + self._analysisId);
      },
      // RPC error callback
      function (res) {
        self.logRPCError(res);
      }
    );

    this._session.call('nl.itslanguage.pronunciation.alignment',
      [self._analysisId]).then(
      // RPC success callback
      function (alignment) {
        self.referenceAlignment = alignment;
        console.log('Reference alignment retrieved');
      },
      // RPC error callback
      function (res) {
        self.logRPCError(res);
      }
    );
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
    this._session.call('nl.itslanguage.pronunciation.init_audio',
      [self._analysisId, specs.audioFormat], specs.audioParameters).then(
      // RPC success callback
      function (analysisId) {
        console.log('Accepted audio parameters for analysisId after init_audio: ' + self._analysisId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function (res) {
        self.logRPCError(res);
      }
    );
  }

  /**
   * Start a pronunciation analysis from streaming audio.
   *
   * @param {its.PronunciationChallenge} challenge The pronunciation challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Sdk~pronunciationAnalysisPreparedCallback} [preparedCb] The callback that signals server is prepared for receiving data.
   * @param {Sdk~pronunciationAnalysisCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~pronunciationAnalysisCreatedErrorCallback} [ecb] The callback that handles the error response.
   * @param {Sdk~pronunciationAnalysisProgressCallback} [progressCb] The callback that handles the intermediate results.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   */
  startStreamingPronunciationAnalysis(challenge, recorder, preparedCb, cb, ecb, progressCb, trim) {
    var self = this;
    var _cb = function (data) {
      var analysis = new PronunciationAnalysis(
        challenge.id, data.studentId, data.id,
        null, null,
        self.addAccessToken(data.audioUrl));
      analysis.score = data.score;
      analysis.confidenceScore = data.confidenceScore;
      analysis.words = self._wordsToModels(data.words);
      if (cb) {
        cb(analysis);
      }
    };

    var _progressCb = function (progress) {
      if (progressCb) {
        progressCb(progress, self.referenceAlignment);
      }
    };

    var _ecb = function (data) {
      // Either there was an unexpected error, or the audio failed to
      // align, in which case no analysis is provided, but just the
      // basic metadata.
      if (ecb) {
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          self.addAccessToken(data.audioUrl));
        ecb(analysis, data.message);
      }
    };

    // Validate required domain model.
    if (typeof challenge !== 'object' || !challenge) {
      throw new Error(
        '"challenge" parameter is required or invalid');
    }
    if (!challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    // Validate environment prerequisites.
    if (!this._session) {
      throw new Error('WebSocket connection was not open.');
    }

    if (recorder.isRecording()) {
      throw new Error('Recorder should not yet be recording.');
    }

    if (this._analysisId !== null) {
      console.error('Session with analysisId ' + this._analysisId + ' still in progress.');
      return;
    }
    this._analyisId = null;

    // Start streaming the binary audio when the user instructs
    // the audio recorder to start recording.
    var dataavailableCb = function (chunk) {
      var encoded = self._arrayBufferToBase64(chunk);
      console.log('Sending audio chunk to websocket for analysisId: ' +
        self._analysisId);
      self._session.call('nl.itslanguage.pronunciation.write',
        [self._analysisId, encoded, 'base64']).then(
        // RPC success callback
        function (res) {
          console.debug('Delivered audio successfully');
        },
        // RPC error callback
        function (res) {
          self.logRPCError(res);
          _ecb(res);
        }
      );
    };

    var analysisInitCb = function (analysisId) {
      self._analysisId = analysisId;
      console.log('Got analysisId after initialisation: ' + self._analysisId);
      self.pronunciationAnalysisInitChallenge(challenge);
      preparedCb(self._analysisId);

      if (recorder.hasUserMediaApproval()) {
        self.pronunciationAnalysisInitAudio(recorder, dataavailableCb);
      } else {
        var userMediaCb = function (chunk) {
          self.pronunciationAnalysisInitAudio(recorder, dataavailableCb);
          recorder.removeEventListener('ready', userMediaCb);
        };
        recorder.addEventListener('ready', userMediaCb);
      }
    };

    var trimAudioStart = 0.15;
    var trimAudioEnd = 0.0;
    if (trim === false) {
      trimAudioStart = 0.0;
    }
    this._session.call('nl.itslanguage.pronunciation.init_analysis', [],
      {
        trimStart: trimAudioStart,
        trimEnd: trimAudioEnd
      }).then(
      // RPC success callback
      analysisInitCb,
      // RPC error callback
      function (res) {
        self.logRPCError(res);
      }
    );

    // Stop listening when the audio recorder stopped.
    var recordedCb = function (id) {
      // When done, submit any plain text (non-JSON) to start analysing.

      self._session.call('nl.itslanguage.pronunciation.analyse',
        [self._analysisId], {}, {receive_progress: true}).then(
        // RPC success callback
        function (res) {
          // Wait for analysis results to come back.
          _cb(res);
        },
        // RPC error callback
        function (res) {
          if (res.error === 'nl.itslanguage.ref_alignment_failed') {
            res.kwargs.analysis.message = 'Reference alignment failed';
          } else if (res.error === 'nl.itslanguage.alignment_failed') {
            res.kwargs.analysis.message = 'Alignment failed';
          } else if (res.error === 'nl.itslanguage.analysis_failed') {
            res.kwargs.analysis.message = 'Analysis failed';
          } else {
            res.kwargs.analysis.message = 'Unhandled error';
            self.logRPCError(res);
          }
          _ecb(res.kwargs.analysis);
        },
        _progressCb
      );

      recorder.removeEventListener('recorded', recordedCb);
      recorder.removeEventListener('dataavailable', dataavailableCb);
      // This session is over.
      self._analysisId = null;
    };
    recorder.addEventListener('recorded', recordedCb);
  }

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
    var _cb = function (datum) {
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
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listPronunciationAnalyses.
   *
   * @callback Sdk~listPronunciationAnalysesCallback
   * @param {its.PronunciationAnalysis[]} analyses Retrieved pronunciation analysis domain model instances.
   */
  listPronunciationAnalysisCallback(analyses) {
  }

  /**
   * Error callback used by listPronunciationAnalyses.
   *
   * @callback Sdk~listPronunciationAnalysesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listPronunciationAnalysisErrorCallback(errors) {
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
    var _cb = function (data) {
      var analyses = [];
      data.forEach(function (datum) {
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
    this._secureAjaxGet(url, _cb, ecb);
  }


  /**
   * Callback used by createChoiceChallenge.
   *
   * @callback Sdk~choiceChallengeCreatedCallback
   * @param {its.ChoiceChallenge} challenge Updated choice challenge domain model instance.
   */
  choiceChallengeCreatedCallback(challenge) {
  }

  /**
   * Error callback used by createChoiceChallenge.
   *
   * @callback Sdk~choiceChallengeCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.ChoiceChallenge} challenge Choice challenge domain model instance with unapplied changes.
   */
  choiceChallengeCreatedErrorCallback(errors, challenge) {
  }

  /**
   * Create a choice challenge.
   *
   * @param {its.ChoiceChallenge} challenge A choice challenge object.
   * @param {Sdk~choiceChallengeCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~choiceChallengeCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createChoiceChallenge(challenge, cb, ecb) {
    var _cb = function (data) {
      // Update the id in case domain model didn't contain one.
      challenge.id = data.id;
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      challenge.status = data.status;
      challenge.choices = [];
      data.choices.forEach(function (pair) {
        challenge.choices.push(pair.choice);
      });
      if (cb) {
        cb(challenge);
      }
    };

    var _ecb = function (errors) {
      if (ecb) {
        ecb(errors, challenge);
      }
    };

    // Validate required domain model fields.
    if (!challenge.organisationId) {
      throw new Error('organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice';

    var fd = new FormData();
    if (challenge.id !== undefined &&
      challenge.id !== null) {
      fd.append('id', challenge.id);
    }
    fd.append('question', challenge.question);
    challenge.choices.forEach(function (choice) {
      fd.append('choices', choice);
    });
    this._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getChoiceChallenge.
   *
   * @callback Sdk~getChoiceChallengeCallback
   * @param {its.ChoiceChallenge} challenge Retrieved choice challenge domain model instance.
   */
  getChoiceChallengeCallback(challenge) {
  }

  /**
   * Error callback used by getChoiceChallenge.
   *
   * @callback Sdk~getChoiceChallengeErrorCallback
   * @param {object[]} errors Array of errors.
   */
  getChoiceChallengeErrorCallback(errors) {
  }

  /**
   * Get a choice challenge.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} challengeId Specify a choice challenge identifier.
   * @param {Sdk~getChoiceChallengeCallback} [cb] The callback that handles the response.
   * @param {Sdk~getChoiceChallengeErrorCallback} [ecb] The callback that handles the error response.
   */
  getChoiceChallenge(organisationId, challengeId, cb, ecb) {
    var _cb = function (data) {
      var challenge = new ChoiceChallenge(organisationId, data.id,
        data.question, data.choices);
      challenge.created = new Date(data.created);
      challenge.updated = new Date(data.updated);
      challenge.status = data.status;
      challenge.choices = [];
      data.choices.forEach(function (pair) {
        challenge.choices.push(pair.choice);
      });
      if (cb) {
        cb(challenge);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice/' + challengeId;
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listChoiceChallenges.
   *
   * @callback Sdk~listChoiceChallengesCallback
   * @param {its.ChoiceChallenge[]} challenges Retrieved choice challenge domain model instances.
   */
  listChoiceChallengesCallback(challenges) {
  }

  /**
   * Error callback used by listSpeechChallenges.
   *
   * @callback Sdk~listChoiceChallengesErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listChoiceChallengesErrorCallback(errors) {
  }

  /**
   * List all choice challenges in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listChoiceChallengesCallback} cb The callback that handles the response.
   * @param {Sdk~listChoiceChallengesErrorCallback} [ecb] The callback that handles the error response.
   */
  listChoiceChallenges(organisationId, cb, ecb) {
    var _cb = function (data) {
      var challenges = [];
      data.forEach(function (datum) {
        var challenge = new ChoiceChallenge(
          organisationId, datum.id, datum.question, datum.choices);
        challenge.created = new Date(datum.created);
        challenge.updated = new Date(datum.updated);
        challenge.status = datum.status;
        challenge.choices = [];
        datum.choices.forEach(function (pair) {
          challenge.choices.push(pair.choice);
        });
        challenges.push(challenge);
      });
      if (cb) {
        cb(challenges);
      }
    };

    var url = this.settings.apiUrl + '/organisations/' +
      organisationId + '/challenges/choice';
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by createChoiceRecognition.
   *
   * @callback Sdk~Sdk~choiceRecognitionCreatedCallback
   * @param {its.ChoiceRecognition} recognition New choice recognition domain model instance containing the performed recognition.
   */
  choiceRecognitionCreatedCallback(recognition) {
  }

  /**
   * Error callback used by createChoiceRecognition.
   *
   * @callback Sdk~choiceRecognitionCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.SpeechRecording} recording Speech recording domain model instance with unapplied changes.
   */
  choiceRecognitionCreatedErrorCallback(errors, recording) {
  }

  /**
   * Initialise the choice recognition challenge through RPCs.
   *
   */
  choiceRecognitionInitChallenge(challenge) {
    var self = this;

    this._session.call('nl.itslanguage.choice.init_challenge',
      [self._recognitionId, challenge.organisationId, challenge.id]).then(
      // RPC success callback
      function (recognitionId) {
        console.log('Challenge initialised for recognitionId: ' + self._recognitionId);
      },
      // RPC error callback
      function (res) {
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
      function (recognitionId) {
        console.log('Accepted audio parameters for recognitionId after init_audio: ' + self._recognitionId);
        // Start listening for streaming data.
        recorder.addEventListener('dataavailable', dataavailableCb);
      },
      // RPC error callback
      function (res) {
        console.error('RPC error returned:', res.error);
      }
    );
  }

  /**
   * Start a choice recognition from streaming audio.
   *
   * @param {its.ChoiceChallenge} challenge The choice challenge to perform.
   * @param {its.AudioRecorder} recorder The audio recorder to extract audio from.
   * @param {Sdk~choiceRecognitionPreparedCallback} [preparedCb] The callback that signals server is prepared for receiving data.
   * @param {Sdk~choiceRecognitionCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~choiceRecognitionCreatedErrorCallback} [ecb] The callback that handles the error response.
   * @param {Boolean} [trim] Whether to trim the start and end of recorded audio (default: true).
   */
  startStreamingChoiceRecognition(challenge, recorder, preparedCb, cb, ecb, trim) {
    var self = this;
    var _cb = function (data) {
      var recognition = new ChoiceRecognition(
        challenge.id, data.studentId, data.id,
        new Date(data.created), new Date(data.updated),
        self.addAccessToken(data.audioUrl), data.recognised);
      if (cb) {
        cb(recognition);
      }
    };

    var _ecb = function (data) {
      // There was an unexpected error.
      if (ecb) {
        var analysis = new PronunciationAnalysis(
          challenge.id, data.studentId, data.id,
          new Date(data.created), new Date(data.updated),
          self.addAccessToken(data.audioUrl));
        ecb(analysis, data.message);
      }
    };

    // Validate required domain model.
    if (typeof challenge !== 'object' || !challenge) {
      throw new Error(
        '"challenge" parameter is required or invalid');
    }
    if (!challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    // Validate environment prerequisites.
    if (!this._session) {
      throw new Error('WebSocket connection was not open.');
    }

    if (recorder.isRecording()) {
      throw new Error('Recorder should not yet be recording.');
    }

    if (this._recognitionId !== null) {
      console.error('Session with recognitionId ' + this._recognitionId + ' still in progress.');
      return;
    }
    this._recognitionId = null;

    // Start streaming the binary audio when the user instructs
    // the audio recorder to start recording.
    var dataavailableCb = function (chunk) {
      var encoded = self._arrayBufferToBase64(chunk);
      console.log('Sending audio chunk to websocket for recognitionId: ' +
        self._recognitionId);
      self._session.call('nl.itslanguage.choice.write',
        [self._recognitionId, encoded, 'base64']).then(
        // RPC success callback
        function (res) {
          console.debug('Delivered audio successfully');
        },
        // RPC error callback
        function (res) {
          console.error('RPC error returned:', res.error);
          _ecb(res);
        }
      );
    };

    var recognitionInitCb = function (recognitionId) {
      self._recognitionId = recognitionId;
      console.log('Got recognitionId after initialisation: ' + self._recognitionId);
      self.choiceRecognitionInitChallenge(challenge);
      preparedCb(self._recognitionId);

      if (recorder.hasUserMediaApproval()) {
        self.choiceRecognitionInitAudio(recorder, dataavailableCb);
      } else {
        var userMediaCb = function (chunk) {
          self.choiceRecognitionInitAudio(recorder, dataavailableCb);
          recorder.removeEventListener('ready', userMediaCb);
        };
        recorder.addEventListener('ready', userMediaCb);
      }
    };

    var trimAudioStart = 0.15;
    var trimAudioEnd = 0.0;
    if (trim === false) {
      trimAudioStart = 0.0;
    }
    this._session.call('nl.itslanguage.choice.init_recognition', [],
      {
        trimStart: trimAudioStart,
        trimEnd: trimAudioEnd
      }).then(
      // RPC success callback
      recognitionInitCb,
      // RPC error callback
      function (res) {
        console.error('RPC error returned:', res.error);
      }
    );

    // Stop listening when the audio recorder stopped.
    var recordedCb = function (id) {
      // When done, submit any plain text (non-JSON) to start analysing.
      self._session.call('nl.itslanguage.choice.recognise',
        [self._recognitionId]).then(
        // RPC success callback
        function (res) {
          console.log(res);
          // Wait for analysis results to come back.
          _cb(res);
        },
        // RPC error callback
        function (res) {
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
  getChoiceRecognition(challenge, recognitionId, cb, ecb) {
    var _cb = function (datum) {
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
      if (cb) {
        cb(recognition);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions/' + recognitionId;
    this._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listChoiceRecognitions.
   *
   * @callback Sdk~listChoiceRecognitionsCallback
   * @param {its.ChoiceRecognition[]} recognitions Retrieved choice recognition domain model instances.
   */
  listChoiceRecognitionCallback(recognitions) {
  }

  /**
   * Error callback used by listChoiceRecognitions.
   *
   * @callback Sdk~listChoiceRecognitionsErrorCallback
   * @param {object[]} errors Array of errors.
   */
  listChoiceRecognitionErrorCallback(errors) {
  }

  /**
   * List all choice recognitions in a specific choice challenge.
   *
   * @param {ChoiceChallenge} challenge Specify a choice challenge to list speech recognitions for.
   * @param {Sdk~listChoiceRecognitionsCallback} cb The callback that handles the response.
   * @param {Sdk~listChoiceRecognitionsErrorCallback} [ecb] The callback that handles the error response.
   */
  listChoiceRecognitions(challenge, cb, ecb) {
    var _cb = function (data) {
      var recognitions = [];
      data.forEach(function (datum) {
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
      if (cb) {
        cb(recognitions);
      }
    };

    if (!challenge || !challenge.id) {
      throw new Error('challenge.id field is required');
    }
    if (!challenge.organisationId) {
      throw new Error('challenge.organisationId field is required');
    }

    var url = this.settings.apiUrl + '/organisations/' +
      challenge.organisationId + '/challenges/choice/' +
      challenge.id + '/recognitions';
    this._secureAjaxGet(url, _cb, ecb);
  }
}


module.exports = {
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

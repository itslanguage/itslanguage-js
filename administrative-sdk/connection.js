/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
const autobahn = require('autobahn');
class Connection {

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
   * Create a connection to the websocket server.
   *
   */
  webSocketConnect(accessToken) {
    /**
     * This callback is fired during Ticket-based authentication
     *
     */
    function onOAuth2Challenge(session, method, extra) {
      if (method === 'ticket') {
        return accessToken;
      }
      throw new Error(`don't know how to authenticate using '${method}'`);
    }

    var authUrl = this.settings.wsUrl;
    var connection = null;
    // Open a websocket connection for streaming audio
    try {
      // Set up WAMP connection to router
      connection = new autobahn.Connection({
        url: authUrl,
        realm: 'default',
        // the following attributes must be set for Ticket-based authentication
        authmethods: ['ticket'],
        authid: 'oauth2',
        onchallenge: onOAuth2Challenge
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
    connection.onclose = function(e) {
      console.log('WebSocket disconnected');
      self._session = null;
      self.fireEvent('websocketClosed');
    };
    connection.open();
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
    request.onreadystatechange = function() {
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
   * @param {string} URL to submit to.
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
    request.onreadystatechange = function() {
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
    request.onreadystatechange = function() {
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
   * Log a RPC error to the console.
   *
   * @param {object} result Autobahn error object.
   */
  static logRPCError(result) {
    console.error('RPC error returned:', result.error);
  }
}

module.exports = {
  Connection: Connection
};

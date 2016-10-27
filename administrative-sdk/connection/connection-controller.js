/* eslint-disable
camelcase
 */

const autobahn = require('autobahn');

/**
 * Controller class for managing connection interaction.
 */
module.exports = class Connection {

  constructor(options) {
    this.settings = Object.assign({
      // ITSL connection parameters.
      apiUrl: 'https://api.itslanguage.nl',
      authPrincipal: null,
      authCredentials: null,
      wsUrl: null,
      wsToken: null
    }, options);
    Connection._sdkCompatibility();
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

    const self = this;
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

      const index = self.events[name].indexOf(handler);
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

      const evs = self.events[name];
      evs.forEach(ev => {
        ev(...args);
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
    const combo = this.settings.authPrincipal + ':' + this.settings.authCredentials;
    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(combo)));
    return authHeader;
  }

  /**
   * Create a connection to the websocket server.
   *
   */
  webSocketConnect(accessToken) {
    this._webSocketConnect(accessToken, autobahn);
  }

  /**
   * Create a connection to the websocket server.
   *
   */
  _webSocketConnect(accessToken, autobahnSource) {
    /**
     * This callback is fired during Ticket-based authentication
     *
     */
    function onOAuth2Challenge(session, method) {
      if (method === 'ticket') {
        return accessToken;
      }
      throw new Error(`don't know how to authenticate using '${method}'`);
    }

    const authUrl = this.settings.wsUrl;
    let connection = null;
    // Open a websocket connection for streaming audio
    try {
      // Set up WAMP connection to router
      connection = new autobahnSource.Connection({
        url: authUrl,
        realm: 'default',
        // the following attributes must be set for Ticket-based authentication
        authmethods: ['ticket'],
        authid: 'oauth2',
        details: {
          ticket: accessToken
        },
        onchallenge: onOAuth2Challenge
      });
    } catch (e) {
      console.log('WebSocket creation error: ' + e);
      return;
    }
    const self = this;
    connection.onerror = function(e) {
      console.log('WebSocket error: ' + e);
      self.fireEvent('websocketError', [e]);
    };
    connection.onopen = function(session) {
      console.log('WebSocket connection opened');
      self._session = session;
      const _call = self._session.call;
      self._session.call = function(url, ...args) {
        console.debug('Calling RPC: ' + url);
        return _call.call(this, url, ...args);
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
   * Perform a HTTP GET to the API using authentication.
   *
   * @param {string} URL to retrieve.
   * @returns Promise containing a result.
   */
  _secureAjaxGet(url) {
    return this._ajaxGet(url, this._getAuthHeaders());
  }

  /**
   * Perform a HTTP POST to the API using authentication.
   *
   * @param {string} URL to submit to.
   * @param {FormData} formdata The form to POST.
   * @returns Promise containing a result.
   */
  _secureAjaxPost(url, formdata) {
    return this._ajaxPost(url, formdata, this._getAuthHeaders());
  }

  /**
   * Perform a HTTP DELETE to the API using authentication.
   *
   * @param {string} URL to submit to.
   * @returns Promise containing a result.
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
    const combo = this.settings.authPrincipal + ':' + this.settings.authCredentials;
    const accessToken = btoa(unescape(encodeURIComponent(combo)));
    const secureUrl = url + (url.match(/\?/) ? '&' : '?') + 'access_token=' +
      encodeURIComponent(accessToken);
    return secureUrl;
  }

  /**
   * Perform a HTTP GET to the API.
   *
   * @param {string} url URL to retrieve.
   * @param {string} [auth] The authorization header value to pass along with the request.
   * @returns Promise containing a result.
   * @throws If the server returned an error.
   */
  _ajaxGet(url, auth) {
    const headers = new Headers();
    if (typeof auth !== 'undefined') {
      headers.append('Authorization', auth);
    }
    const options = {
      method: 'GET',
      headers
    };
    return fetch(url, options)
      .then(response =>
        response.json()
            .then(data => {
              if (response.ok) {
                return data;
              }
              throw data;
            })
        );
  }

  /**
   * Perform a HTTP POST to the API.
   *
   * @param {string} URL to submit to.
   * @param {FormData|string} formdata FormData or stringified JSON to POST.
   * @param {string} [auth] The authorization header value to pass along with the request.
   * @returns Promise containing a result.
   * @throws If the server returned an error.
   */
  _ajaxPost(url, formdata, auth) {
    const headers = new Headers();
    if (typeof auth !== 'undefined') {
      headers.append('Authorization', auth);
    }
    if (typeof formdata === 'string') {
      headers.append('Content-Type',
        'application/json; charset=utf-8');
    }
    const options = {
      method: 'POST',
      headers,
      body: formdata
    };
    return fetch(url, options)
      .then(response =>
        response.json()
            .then(data => {
              if (response.ok) {
                return data;
              }
              throw data;
            })
        );
  }

  /**
   * Perform a HTTP DELETE to the API.
   *
   * @param {string} URL to submit to.
   * @param {string} [auth] The authorization header value to pass along with the request.
   * @returns Promise containing a result.
   * @throws If the server returned an error.
   */
  _ajaxDelete(url, auth) {
    const headers = new Headers();
    if (typeof auth !== 'undefined') {
      headers.append('Authorization', auth);
    }
    const options = {
      method: 'DELETE',
      headers
    };
    return fetch(url, options)
      .then(response =>
        response.json()
            .then(data => {
              if (response.ok) {
                return data;
              }
              throw data;
            })
        );
  }

  /**
   * Logs browser compatibility for required and optional SDK capabilities.
   * In case of compatibility issues, an error is thrown.
   */
  static _sdkCompatibility() {
    // WebSocket
    // http://caniuse.com/#feat=websockets
    const canCreateWebSocket = 'WebSocket' in window;
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
    const self = this;

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

  /**
   * Ask the server for an OAuth2 token.
   * @param {BasicAuth} basicAuth Basic Auth to obtain credentials from.
   * @returns {Promise} Promise containing a access_token, token_type and scope.
   * @rejects If the server returned an error.
   */
  getOauth2Token(basicAuth) {
    const url = this.settings.apiUrl + '/tokens';
    const scopes = 'tenant/' + basicAuth.tenantId +
      '/student/' + basicAuth.principal;
    const headers = new Headers();
    headers.append('Authorization', this._getAuthHeaders());
    headers.append('Content-Type',
      'application/x-www-form-urlencoded; charset=utf8');
    const formData = 'grant_type=password&scope=' + scopes + '&username=' + basicAuth.principal +
      '&password=' + basicAuth.credentials;
    const options = {
      method: 'POST',
      headers,
      body: formData
    };
    return fetch(url, options)
      .then(response =>
        response.json()
          .then(data => {
            if (response.ok) {
              return data;
            }
            throw data;
          })
      );
  }
};

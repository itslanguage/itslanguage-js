/* eslint-disable
camelcase
 */

import autobahn from 'autobahn';
import ee from 'event-emitter';
/**
 * Controller class for managing connection interaction.
 */
export default class Connection {

  /**
   *
   * @param {Object} options - Options to configure the connection with.
   * Valid options include:
   * * apiUrl - The URL of the REST api.
   * * wsUrl - The URL of the Websocket server.
   * * oAuth2Token - An OAuth2 token string.
   * * adminPrincipal - The username of the admin account.
   * * adminPassword - The password of the admin account.
   */
  constructor(options) {
    /**
     * @type {Object}
     */
    this._settings = Object.assign({
      // ITSL connection parameters.
      apiUrl: 'https://api.itslanguage.nl',
      oAuth2Token: null,
      wsUrl: null,
      wsToken: null
    }, options);
    Connection._sdkCompatibility();
    this._analysisId = null;
    this._recordingId = null;
    this._recognitionId = null;
    this._emitter = ee({});
    this._connection = null;
  }

  /**
   * Add an event listener. Listens to events emitted from the websocket server connection.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to add.
   */
  addEventListener(name, handler) {
    this._emitter.on(name, handler);
  }

  /**
   * Remove an event listener of the websocket connection.
   *
   * @param {string} name - Name of the event.
   * @param {Function} handler - Handler function to remove.
   */
  removeEventListener(name, handler) {
    this._emitter.off(name, handler);
  }

  /**
   * Fire an event.
   *
   * @param {string} name - Name of the event.
   * @param {[]} args - Arguments.
   * @private
   */
  fireEvent(name, args = []) {
    this._emitter.emit(name, ...args);
  }

  /**
   * Assemble a HTTP Authentication header.
   *
   * @returns {Promise.<string>} Promise containing an authorization header string.
   * @throws {Promise.<Error>} If the oAuth2Token in {@link Connection#settings} is not set.
   */
  _getAuthHeaders() {
    if (!this._settings.oAuth2Token) {
      return Promise.reject('Please set oAuth2Token');
    }
    const authHeader = 'Bearer ' + this._settings.oAuth2Token;
    return Promise.resolve(authHeader);
  }

  /**
   * Create a connection to the websocket server.
   *
   */
  webSocketConnect() {
    const self = this;
    /**
     * This callback is fired during Ticket-based authentication.
     *
     * @param {Session} session - Session.
     * @param {string} method - Authentication method.
     */
    function onOAuth2Challenge(session, method) {
      if (method === 'ticket') {
        return self._settings.oAuth2Token;
      }
      throw new Error(`don't know how to authenticate using '${method}'`);
    }

    const authUrl = this._settings.wsUrl;
    let connection = null;
    // Open a websocket connection for streaming audio
    try {
      // Set up WAMP connection to router
      connection = new autobahn.Connection({
        url: authUrl,
        realm: 'default',
        // the following attributes must be set for Ticket-based authentication
        authmethods: ['ticket'],
        authid: 'oauth2',
        details: {
          ticket: this._settings.oAuth2Token
        },
        onchallenge: onOAuth2Challenge
      });
    } catch (e) {
      console.log('WebSocket creation error: ' + e);
      return;
    }
    connection.onerror = function(e) {
      console.log('WebSocket error: ' + e);
      self.fireEvent('websocketError', [e]);
    };
    connection.onopen = function(session) {
      console.log('WebSocket connection opened');
      self._session = session;
      self.fireEvent('websocketOpened');
    };
    connection.onclose = function() {
      console.log('WebSocket disconnected');
      self._session = null;
      self.fireEvent('websocketClosed');
    };
    this._connection = connection;
    this._connection.open();
  }

  /**
   * Make an RPC to active current session.
   *
   * @param {string} rpc - The RPC to call. It will be prefixed with `'nl.itslanguage.'`.
   * @param {...any} args - Any arguments to pass to the RPC.
   * @return {Promise} The result of the call.
   */
  call(rpc, ...args) {
    const url = 'nl.itslanguage.' + rpc;
    console.debug('Calling RPC:', url);
    return this._session.call(url, ...args);
  }

  webSocketDisconnect() {
    this._connection.close(null, 'Requested formal disconnect');
  }

  /**
   * Perform a HTTP GET to the API using authentication.
   *
   * @param {string} url - Url to retrieve.
   * @returns {Promise} Promise containing a result.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  _secureAjaxGet(url) {
    return this._getAuthHeaders()
      .then(auth => {
        const headers = new Headers();
        headers.append('Authorization', auth);
        const options = {
          method: 'GET',
          headers
        };
        return fetch(url, options)
          .then(this.handleResponse);
      });
  }

  /**
   * Perform a HTTP POST to the API using authentication.
   *
   * @param {string} url - Url to submit to.
   * @param {FormData} formdata - The form to POST.
   * @returns {Promise} Promise containing a result.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  _secureAjaxPost(url, formdata) {
    return this._getAuthHeaders()
      .then(auth => {
        const headers = new Headers();
        headers.append('Authorization', auth);
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
          .then(this.handleResponse);
      });
  }

  /**
   * Perform a HTTP DELETE to the API using authentication.
   *
   * @param {string} url - Url to submit to.
   * @returns {Promise} Promise containing a result.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  _secureAjaxDelete(url) {
    return this._getAuthHeaders()
      .then(auth => {
        const headers = new Headers();
        headers.append('Authorization', auth);
        const options = {
          method: 'DELETE',
          headers
        };
        return fetch(url, options)
          .then(this.handleResponse);
      });
  }

  handleResponse(response) {
    return response.text()
      .then(textResponse => {
        if (response.headers.get('Content-type').includes('application/json')) {
          const result = JSON.parse(textResponse);
          if (response.ok) {
            return result;
          }
          return Promise.reject(result);
        } else if (!response.ok) {
          return Promise.reject(response.status + ': ' + response.statusText);
        }
      });
  }

  /**
   * Add an access token to the given URL.
   *
   * @param {string} url - The URL to add an access token to.
   * @returns {string} An url with the access token appended.
   */
  addAccessToken(url) {
    if (!this._settings.oAuth2Token) {
      throw new Error('Please set oAuth2Token');
    }
    const secureUrl = url + (url.match(/\?/) ? '&' : '?') + 'access_token=' +
      encodeURIComponent(this._settings.oAuth2Token);
    return secureUrl;
  }

  /**
   * Logs browser compatibility for required and optional SDK capabilities.
   *
   * @throws {Error} In case of compatibility issues.
   */
  static _sdkCompatibility() {
    // WebSocket
    // http://caniuse.com/#feat=websockets
    if (!('WebSocket' in window)) {
      throw new Error('No WebSocket capabilities');
    }
  }

  /**
   * Cancel any current streaming audio recording.
   *
   * @param {AudioRecorder} recorder - The audio recorder currently recording.
   */
  cancelStreaming(recorder) {
    const self = this;

    if (this._recordingId === null && this._analysisId === null && this._recognitionId === null) {
      console.info('No session in progress, nothing to cancel.');
      return;
    }

    recorder.removeAllEventListeners();
    if (recorder.isRecording()) {
      recorder.stop();
    }

    // This session is over.
    self._recordingId = null;
    self._analysisId = null;
    self._recognitionId = null;
  }

  /**
   * Log an error caught from an RPC call.
   *
   * @param {Object} result - Error object.
   */
  static logRPCError(result) {
    console.error('RPC error returned:', result.error);
  }

  /**
   * Ask the server for an OAuth2 token.
   *
   * @param {BasicAuth} basicAuth - Basic Auth to obtain credentials from.
   * @param {string} [scopes] - The scopes which should be availible for the requested token.
   * @returns {Promise} Promise containing a access_token, token_type and scope.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  getOauth2Token(basicAuth, scopes) {
    const url = this._settings.apiUrl + '/tokens';

    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf8');

    let formData = 'grant_type=password' +
      '&username=' + basicAuth.principal +
      '&password=' + basicAuth.credentials;

    if (scopes) {
      formData += '&scope=' + scopes;
    }

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
              this._settings.oAuth2Token = data.access_token;
              return data;
            }
            throw data;
          })
      );
  }

  /**
   * Request authentication for a {@link User}. The basicAuth now contains the user's username and password.
   *
   * This method also generates the appropriate scope for the given params.
   *
   * @param {BasicAuth} basicAuth - Basic Auth to obtain credentials from.
   * @param {string} organisationId - Id of the organisation this user is part of.
   */
  getUserAuth(basicAuth, organisationId) {
    let scopes = 'tenant/' + basicAuth.tenantId;
    if (organisationId) {
      scopes += '/organisation/' + organisationId;
      if (basicAuth.principal) {
        scopes += '/user/' + basicAuth.principal;
      }
    }

    return this.getOauth2Token(basicAuth, scopes);
  }
}

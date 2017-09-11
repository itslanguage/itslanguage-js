/* eslint-disable
camelcase
 */

import {authorisedRequest, request, updateSettings} from '../../api/communication';

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
  constructor(options = {}) {
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

    // Use the new connection file for future requests.
    updateSettings(Object.assign({}, options, {authorizationToken: options.oAuth2Token}));
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
    return authorisedRequest('GET', url);
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
    return authorisedRequest('POST', url, formdata);
  }

  /**
   * Perform a HTTP DELETE to the API using authentication.
   *
   * @param {string} url - Url to submit to.
   * @returns {Promise} Promise containing a result.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  _secureAjaxDelete(url) {
    return authorisedRequest('DELETE', url);
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
   * @param {string} [scope] - The scope which should be availible for the requested token.
   * @returns {Promise} Promise containing a access_token, token_type and scope.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  getOauth2Token(basicAuth, scope) {
    const body = new URLSearchParams();
    body.append('grant_type', 'password');
    body.append('username', basicAuth.principal);
    body.append('password', basicAuth.credentials);

    if (scope) {
      body.append('scope', scope);
    }

    return request('POST', '/tokens', body).then(response => {
      this._settings.oAuth2Token = response.access_token;
      updateSettings({authorizationToken: response.access_token});
    });
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

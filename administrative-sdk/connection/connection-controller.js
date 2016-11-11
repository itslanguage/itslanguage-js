/* eslint-disable
camelcase
 */

const autobahn = require('autobahn');
const ee = require('event-emitter');
/**
 * Controller class for managing connection interaction.
 */
module.exports = class Connection {

  constructor(options) {
    this.settings = Object.assign({
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
    this.emitter = ee({});
  }

  addEventListener(name, handler) {
    this.emitter.on(name, handler);
  }

  removeEventListener(name, handler) {
    this.emitter.off(name, handler);
  }

  fireEvent(name, args = []) {
    this.emitter.emit(name, ...args);
  }

  /**
   * Assemble a HTTP Authentication header.
   */
  _getAuthHeaders() {
    if (!this.settings.oAuth2Token) {
      return Promise.reject('Please set oAuth2Token');
    }
    const authHeader = 'Bearer ' + this.settings.oAuth2Token;
    return Promise.resolve(authHeader);
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
    return this._getAuthHeaders()
      .then(auth => {
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
      });
  }

  /**
   * Perform a HTTP POST to the API using authentication.
   *
   * @param {string} URL to submit to.
   * @param {FormData} formdata The form to POST.
   * @returns Promise containing a result.
   */
  _secureAjaxPost(url, formdata) {
    return this._getAuthHeaders()
      .then(auth => {
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
      });
  }

  /**
   * Perform a HTTP DELETE to the API using authentication.
   *
   * @param {string} URL to submit to.
   * @returns Promise containing a result.
   */
  _secureAjaxDelete(url) {
    return this._getAuthHeaders()
      .then(auth => {
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
      });
  }

  /**
   * Add an access token to the given URL.
   *
   * @param {string} url The URL to add an access token to.
   */
  addAccessToken(url) {
    if (!this.settings.oAuth2Token) {
      throw new Error('Please set oAuth2Token');
    }
    const secureUrl = url + (url.match(/\?/) ? '&' : '?') + 'access_token=' +
      encodeURIComponent(this.settings.oAuth2Token);
    return secureUrl;
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
   * @param organisationId Id of the organisation to request a token for.
   * @param studentId Id of the student to request a token for.
   * @returns {Promise} Promise containing a access_token, token_type and scope.
   * @rejects If the server returned an error.
   */
  getOauth2Token(basicAuth, organisationId, studentId) {
    const url = this.settings.apiUrl + '/tokens';
    let scopes = 'tenant/' + basicAuth.tenantId;
    if (organisationId) {
      scopes += '/organisation/' + organisationId;
    }
    if (organisationId && studentId) {
      scopes += '/student/' + studentId;
    }
    const headers = new Headers();
    headers.append('Content-Type',
      'application/x-www-form-urlencoded; charset=utf8');
    const formData = 'grant_type=password&scope=' + scopes +
      '&username=' + basicAuth.principal +
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

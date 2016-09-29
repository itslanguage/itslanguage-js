/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */

class Connection{

  constructor(options){
    this.settings = Object.assign({
      // ITSL connection parameters.
      apiUrl: 'https://api.itslanguage.nl',
      authPrincipal: null,
      authCredentials: null,
      wsUrl: null,
      wsToken: null
    }, options);
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
    console.log('In secure post');
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
            console.log('RESPONSE IS ' + JSON.stringify(response));
            ecb(response.errors || {
                status: request.status
              }, response);
          } catch (e) {
            console.log("Caught");
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

}

module.exports = {
  Connection: Connection
};

/**
 * This file contains ITSLanguage API communication related functions.
 */

import autobahn from 'autobahn';


// Headers
const CONTENT_TYPE = 'Content-Type';
const AUTHORIZATION = 'Authorization';

// Content-Types
const APPLICATION_JSON = 'application/json';

/**
 * The settings to use for the communication with the ITSLanguage API.
 */
const settings = {
  apiURL: 'https://api.itslanguage.nl',
  wsURL: null,
  authorizationToken: null
};

/**
 * Keep hold of the currently open autobahn connection.
 *
 * @type {Promise.<autobahn.Connection>}
 */
let bundesautobahn;


/**
 * Update the settings with the `newSettings`.
 *
 * @param {Object} newSettings - The settings to inject/update.
 *
 * @throws {Error} - When the given `newSettings` is something other than a
 *                   object.
 */
export function updateSettings(newSettings) {
  if (!newSettings || !(newSettings instanceof Object)) {
    throw new Error('Please, only provide objects as settings.');
  }

  Object.assign(settings, newSettings);
}


/**
 * Allow the `autobahn.Connection` to challenge the provided authentication.
 *
 * @param {autobahn.Session} session - The session of the current
 *                                     {@link autobahn.Connection}.
 * @param {string} method - The authentication method it tries to use.
 *
 * @throws {Error} - When the given `method` is unknown to the SDK.
 */
function handleWebsocketAuthorisationChallenge(session, method) {
  switch (method) {
    case 'ticket':
      return settings.authorizationToken;
    default:
      throw new Error('The websocket server tried to use the unknown ' +
                      `authentication challenge: "${method}"`);
  }
}


/**
 * Set {@link bundesautobahn} to a new Promise which resolves into a
 * `autobahn.Connection` object when a connection was successfully established.
 *
 * @returns {Promise.<autobahn.Connection>} - A promise which resolves when the
 *                                            connection was successfully
 *                                            created and opened.
 */
function establishNewBundesbahn() {
  bundesautobahn = new Promise((resolve, reject) => {
    const bahn = new autobahn.Connection({
      url: settings.WS_URL,
      realm: 'default',
      // Of course we want to use es6 promises if they are availbile.
      use_es6_promises: true, // eslint-disable-line camelcase
      // The following options are required in order to authorise the
      // connection.
      authmethods: ['ticket'],
      authid: 'oauth2',
      details: {
        ticket: settings.authorizationToken
      },
      onchallenge: handleWebsocketAuthorisationChallenge
    });

    // `autobahn.Connection` calls its `onclose` method, if it exists, when it
    // was not able to open a connection.
    bahn.onclose = (/* reason, details */) => {
      // When the connection faild to open a reason is given with some details.
      // Sadly these are very undescriptive. Therefore hint/warn the developer
      // about potential erroneous settings or to contact us.
      const message = 'The connection is erroneous; check if all required ' +
                      'settings have been injected using the ' +
                      '`updateSettings()` function. If the problem persists ' +
                      'please post a issue on our GitHub repository.';
      reject(message);
    };

    // Connection got established; lets us it.
    bahn.onopen = () => {
      // Remove the `onclose` handler as it is no longer of interest to us.
      delete bahn.onclose;
      resolve(bahn);
    };

    bahn.open();
  });

  // Return the promise to make it this function chainable. In case the
  // `bundesautobahn` is rejected; remove the reference so we can use simple
  // falsy checks to detemine if there is a connection.
  return bundesautobahn.catch(reason => {
    bundesautobahn = null;
    return Promise.reject(reason);
  });
}


/**
 * Open a new websocket connection.
 *
 * There there currently is a open connection, close it and open a new
 * connection.
 *
 * @returns {Promise.<string>} - A resolved promise which resolves when the
 *                               connection was successfully created and opened.
 */
export function openWebsocketConnection() {
  return closeWebsocketConnection()
    .then(() => establishNewBundesbahn())
    // `bundesautobahn` actually resolved with the `autobahn.Connection`
    // object. This is only meant for internal usage and therefore should not
    // be exposed to the users of the SDK.
    .then(() => 'Successfully established a websocket connection.');
}


/**
 * Get the current websocket connection, or open a new one.
 *
 * If there is no current connection, open one and return that in stead.
 *
 * @returns {Promise.<autobahn.Connection>} - The current websocket connection.
 */
function getWebsocketConnection() {
  if (!bundesautobahn) {
    return establishNewBundesbahn();
  }

  return bundesautobahn;
}


/**
 * Close the current websocket connection.
 *
 * @returns {Promise.<string>} - A promise which will resolve as soon as the
 *                               connection was successfully closed.
 */
export function closeWebsocketConnection() {
  if (!bundesautobahn) {
    return Promise.resolve('There is no websocket connection to close.');
  }

  return bundesautobahn
    .then(bahn => {
      try {
        bahn.close();
        bundesautobahn = null;
        return 'The websocket connection has been closed successfully.';
      } catch (reason) {
        // `autobahn.Connection.close()` throws a string when the connection is
        // already closed. The connection is not exposed and therefore cannot be
        // closed by anyone using the SDK. Regardless, when it happens just
        // return a resolved promise.
        bundesautobahn = null;
        return 'The websocket connection has already been closed.';
      }
    });
}


/**
 * Make a (raw) call to the its-ws server.
 *
 * This method will try to establish a websocket connection if there isn't one
 * already.
 *
 * @param {string} rpc - The RPC to make. This be prepended by `nl.itslanguage`
 *                       as the websocket server only handles websocket calls
 *                       when the RPC starts with that prefix.
 * @param {Array} [args] - The positional arguments to pass to the RPC.
 * @param {Object} [kwargs] - The key word mapped arguments to pass to the RPC.
 * @param {Object} [options] - The options to pass to the RPC.
 *
 * @returns {Promise.<*>} - The response of the websocket call.
 */
export function makeWebsocketCall(rpc, args, kwargs, options) {
  return getWebsocketConnection()
    .then(connection => connection.session.call(`nl.itslanguage.${rpc}`, args, kwargs, options));
}


/**
 * Parse the response of a fetch request.
 *
 * Try to parse the given response body as JSON, if it isn't Leave the
 * response as is.
 *
 * @param {Response} response - The response to parse.
 *
 * @throws {Promise.<String>} - When the requets was not okay and the contents
 *                              of the response isn't json.
 * @throws {Promise.<Object>} - When the requets was not okay and the contents
 *                              of the response is json.
 *
 * @returns {Promise.<Object>} - The contents of a JSON response or the
 *                               response itself if the body is something other
 *                               than JSON.
 */
function handleResponse(response) {
  const responseContentType = response.headers.get(CONTENT_TYPE);

  // The ITSLanguage API should return JSON. If t
  if (responseContentType && responseContentType.includes(APPLICATION_JSON)) {
    return response.json().then(json => {
      if (response.ok) {
        return json;
      }

      return Promise.reject(json);
    });
  }

  if (!response.ok) {
    return Promise.reject(`${response.status}: ${response.statusText}`);
  }

  return response;
}


/**
 * Perform an HTTP request for the given method, url, body, and headers.
 *
 * In case the given url is a partial url, meaning it starts with a `/`, the
 * base URL to the ITSLanguage API is prepended.
 *
 * When a Object instance is provided as body, it'll be transformed into JSON.
 * Unless it is either a `URLSearchParams` or a `FormData` object. Anything
 * else is sent as plain text.
 *
 * @param {string} method - The request METHOD ('GET', 'POST', 'PUT', 'DELETE').
 * @param {string} url - The location to send the request to.
 * @param {*} [body] - Anything which needs to be sent somewhere.
 * @param {Headers} [headers] - Extra headers to send with the request.
 *
 * @returns {Promise.<Object>} The response of the made request.
 */
export function request(method, url, body, headers) {
  const requestHeaders = headers || new Headers();

  let requestBody = body;
  if (!(body instanceof URLSearchParams || body instanceof FormData) && body instanceof Object) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  let requestURL = url;
  // XXX remove the URL truthy check when all tests are properly written. Now
  // it happens way to often that the URL is omitted without any good reason.
  if (url && url.startsWith('/')) {
    requestURL = `${settings.apiURL}${url}`;
  }

  const requestOptions = {
    method,
    headers: requestHeaders,
    body: requestBody
  };

  return fetch(requestURL, requestOptions).then(handleResponse);
}


/**
 * Build a bearer token from the `authorizationToken` in the settings object.
 *
 * @throws {Error} When no authorizationToken is set.
 *
 * @returns {string} The generated bearer token.
 */
function getBearerToken() {
  if (!settings.authorizationToken) {
    throw new Error('Please authenticate first.');
  }

  return `Bearer ${settings.authorizationToken}`;
}


/**
 * Perform an HTTP request with the desired method, body, and headers to the
 * given partial ITSLanguage API URL.
 *
 * This request will add the ``Authorization`` header to the request.
 *
 * This function only allows to make calls to the ITSLanguage API using
 * partial URLs.
 *
 * @param {string} method - The request METHOD ('GET', 'POST', 'PUT', 'DELETE').
 * @param {string} url - The location to send the request to.
 * @param {*} [body] - Anything which needs to be sent somewhere.
 * @param {Headers} [headers] - Extra headers to send with the request.
 *
 * @throws {Promise.<string>} - When the given `url` param is not a partial
 *                              URL, or when there is no authorisation token
 *                              availible.
 *
 * @returns {Promise.<Object>} - The response from the ITSLanguage API.
 */
export function authorisedRequest(method, url, body, headers) {
  // XXX remove the URL truthy check when all parts of the SDK no longer build
  // a complete url by themselves using the "private" settings object of their
  // connection reference.
  if (url && !url.startsWith('/')) {
    console.warn('Complete URLs will soon be disallowed in authorised requests.');
    // return Promise.reject('Only relative ITSLanguage API URLs are allowed.');
  }

  try {
    const requestHeaders = headers || new Headers();
    requestHeaders.set(AUTHORIZATION, getBearerToken());

    return request(method, url, body, requestHeaders);
  } catch (unauthorised) {
    return Promise.reject(unauthorised.message);
  }
}

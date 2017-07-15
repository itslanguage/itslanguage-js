/**
 *
 */

import autobahn from 'autobahn';
import {settings} from './index';


/**
 * Keep hold of the currently open autobahn connection.
 *
 * @type {Promise.<autobahn.Connection>}
 */
let bundesautobahn;


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

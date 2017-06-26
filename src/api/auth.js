/**
 * This file contains a set of functions which makes authentication easier.
 */

import {request, updateSettings} from './communication';


/**
 * Assemble the scope form the given individual pieces.
 *
 * The scope is used to identify what the authenticated is allowed to do. It
 * can also be used by admin users to impersonate as an organisation or user.
 *
 * Keep in mind that in order to specify the user, the scope also needs to be
 * specified.
 *
 * @param {string} tenant - The ID of the tenant which is requesting this scope.
 * @param {string} [organisation] - The ID of the organisation which is
 *                                  requesting this scope.
 * @param {string} [user] - The ID of the user which is requesting this scope.
 *
 * @throws {Error} - When the required tenant is not set.
 *
 * @returns {string} - The assembled scope.
 */
export function assembleScope(tenant, organisation, user) {
  if (!tenant) {
    throw new Error('A tenant is always required.');
  }

  let scope = `tenant/${tenant}`;

  if (organisation) {
    scope += `/organisation/${organisation}`;

    if (user) {
      scope += `/user/${user}`;
    }
  }

  return scope;
}


/**
 * Authenticate for the given credentials with the given scope.
 *
 * On a successful authentication, the settings are updated so every
 * follow-up API requests is authorized by the currently authenticated user.
 *
 * @param {string} username - The username to authenticate with.
 * @param {string} password - The password to authenticate with.
 * @param {string} [scope] - The scope of the authentication. Omitting this
 *                           value will cause the API to infer the scope.
 *
 * @returns {Promise} - A promise which will resolve if the authentication
 *                      concluded successfully, it'll reject in any other case.
 *                      It resolves with the response body of the token
 *                      request.
 */
export function authenticate(username, password, scope) {
  const body = new URLSearchParams();

  body.set('grant_type', 'password');
  body.set('username', username);
  body.set('password', password);

  if (scope) {
    body.set('scope', scope);
  }

  return request('POST', '/tokens', body)
    .then(result => {
      updateSettings({authorizationToken: result.access_token});
      return result;
    });
}

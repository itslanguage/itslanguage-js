/**
 * This file contains a set of functions which makes authentication easier.
 *
 * @module api/authentication
 */

import {authorisedRequest, request, updateSettings} from './communication';


/**
 * Assemble the scope form the given individual pieces.
 *
 * The scope is used to identify what the authenticated is allowed to do. It can slo be used by
 * admin and tenant users to impersonate as a tenant, organisation or user.
 *
 * Keep in mind that in order to specify the user, the scope also needs to be specified.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/oauth2/index.html#impersonation}
 *
 * @param {string} [tenant] - The ID of the tenant which is requesting this scope.
 * @param {string} [organisation] - The ID of the organisation which is requesting this scope.
 * @param {string} [user] - The ID of the user which is requesting this scope.
 *
 * @throws {Error} - When no arguments are provided.
 *
 * @returns {string} - The assembled scope.
 */
export function assembleScope(tenant, organisation, user) {
  if (!tenant && !organisation && !user) {
    throw new Error('Arguments are required to assemble scope.');
  }

  let scope = `tenant/${tenant}`;

  if (organisation) {
    scope += `/organisation/${organisation}`;

    if (user) {
      scope += `/user/${user}`;
    }
  }

  // The special admin user, no tenant and organisation provided
  if (!tenant && !organisation && user) {
    scope = `user/${user}`;
  }

  // The TENANT user, has no organisation
  if (tenant && !organisation && user) {
    scope += `/user/${user}`;
  }

  return scope;
}

/**
 * Impersonate some other tenant, user or organisation. The impersonation will be done by using
 * the authorisation token for the current user.
 *
 * On a successful impersonation, the settings are updated so every follow-up API requests is
 * authorized by the access_token required with this impersonation.
 *
 * As an admin or tenant user it is possible to do impersonation. This goes from top to down. So, a
 * tenant user can impersonate an organisation, or an user in an organisation. But an user can't
 * impersonate.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/oauth2/index.html#impersonation}
 *
 * @param {string} [scope] - The scope of the impersonation. Omitting this value will cause the API
 * to return a token for the current user.
 *
 * @returns {Promise} - A promise which will resolve if the authentication concluded successfully,
 * it'll reject in any other case. It resolves with the response body of the token request.
 */
export function impersonate(scope) {
  const body = new URLSearchParams();

  body.set('grant_type', 'client_credentials');

  if (scope) {
    body.set('scope', scope);
  }

  return authorisedRequest('POST', '/tokens', body)
    .then(result => {
      updateSettings({authorizationToken: result.access_token});
      return result;
    });
}

/**
 * Authenticate for the given credentials with the given scope.
 *
 * On a successful authentication, the settings are updated so every follow-up API requests is
 * authorized by the currently authenticated user.
 *
 * @param {string} username - The username to authenticate with.
 * @param {string} password - The password to authenticate with.
 * @param {string} [scope] - The scope of the authentication. Omitting this
 * value will cause the API to infer the scope.
 *
 * @returns {Promise} - A promise which will resolve if the authentication concluded successfully,
 * it'll reject in any other case. It resolves with the response body of the token request.
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

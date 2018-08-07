/**
 * This file contains the readily available functions which interact with the ITSLanguage user API.
 * Users can have username/password based credentials (basicauth). These credentials can be managed
 * using the REST API. Only users with administrative powers can perform these calls.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/basicauths/index.html}
 */

import {authorisedRequest} from './communication';

/**
 * The URL for the basicAuth handler.
 * @type {string}
 */
const url = '/user/basicauths';

/**
 * Create a basicAuth for the current user.
 * To create a basicAuth for another user, impersonate the user first.
 * A username must be unique in an organisation, but not across them.
 *
 * @param {string} basicAuth - The Id of the user to create or overwrite a profile for.
 * @param {string} [basicAuth.username] - The profile containing information about the user.
 * @param {string} [basicAuth.password ] - The groups this user is part of.
 *
 * @returns {Promise} - The basicauth creation promise.
 */
export function create(basicAuth) {
  return authorisedRequest('POST', url, basicAuth);
}

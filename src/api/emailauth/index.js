/**
 * This file contains the readily available functions which interact with the ITSLanguage user API.
 * Users can have email based credentials. These credentials can be managed using the REST API.
 * Only users with administrative powers can perform these calls.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/emailauth/index.html}
 */

import { authorisedRequest } from '../communication';

/**
 * The URL for the emailAuth handler.
 * According to the docs the following URL's are valid to be used for emailauth interaction.
 *
 * - POST `/users/emailauth`.
 * - POST `/users/:userId/emailauth`.
 *
 * @param {string} [userId] - The id of the user to interact with emailauth API.
 * @returns {string} - A composed URL to use for requests.
 */
const url = userId => `/user${userId ? `/${userId}` : ''}/emailauths`;

/**
 * Create an emailAuth for either the current user or a user provided with an userId.
 * To create an email auth for another user you could pass the userId but depending on permissions
 * it could also be possible to use impersonation for this.
 *
 * @param {string} emailAuth - The Id of the user to create or overwrite a profile for.
 * @param {string} emailAuth.email - A unique email address.
 * @param {string} [emailAuth.password] - A secure password, if none is given, one will be generated.
 * @param {string} [userId=null] - The Id of the user to create an emailAuth for.
 *
 * @returns {Promise} - The emailAuth creation promise.
 */
export function create(emailAuth, userId = null) {
  return authorisedRequest('POST', url(userId), emailAuth);
}

/**
 * This file contains the readily available functions which interact with the ITSLanguage user API.
 * Profiles contain information about a User. A User does not need a Profile.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/profiles/index.html}
 */

import { authorisedRequest } from '../communication';

/**
 * The URL for the profile handler(s).
 * According to the docs the following URL's are valid to be used for profile interaction.
 *
 * - POST/GET `/users/:userId/profile`.
 * - GET `/user/profile`.
 *
 * @param {string} [userId] - The id of the user to interact with profile API.
 * @returns {string} - A composed URL to use for requests.
 */
const url = userId => `/user${userId ? `s/${userId}` : ''}/profile`;


/**
 * Link a profile to a user. If a user already has a profile, it will be overwritten.
 *
 * @param {string} userId - The Id of the user to create or overwrite a profile for.
 * @param {Object} profile - The profile containing information about the user.
 * @param {string} [profile.firstName] - The profile containing information about the user.
 * @param {string} [profile.lastName ] - The groups this user is part of.
 * @param {string} [profile.infix] - The names of roles to grant the user.
 * @param {string} [profile.gender] - The gender of the user.
 * @param {string} [profile.birthDate] - The birthDate of the user. In the proper ISO 8601 format.
 *
 * @returns {Promise} - The user creation promise.
 */
export function create(userId, profile) {
  return authorisedRequest('POST', url(userId), profile);
}


/**
 * Get profile for the current user.
 *
 * @returns {Promise} - The current user.
 */
export function getCurrent() {
  return authorisedRequest('GET', url());
}

/**
 * Get a profile for a user by its Id.
 *
 * @param {string} id - The Id of the desired user.
 *
 * @returns {Promise} - The promise for the profile of the requested user.
 */
export function getById(id) {
  return authorisedRequest('GET', url(id));
}

/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage user API.
 */

import {authorisedRequest} from './communication';

// The URL for the user handler(s).
const url = '/users';


/**
 * Create a new user.
 *
 * @param {Object} user - The user to create.
 *
 * @returns {Promise} - The user creation promise.
 */
export function createUser(user) {
  return authorisedRequest('POST', url, user);
}


/**
 * Get a single user by its ID.
 *
 * @param {string} id - The ID of the desired user.
 *
 * @returns {Promise} - The promise for the user.
 */
export function getUserByID(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all users.
 *
 * By default all users are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the users.
 */
export function getAllUsers(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}

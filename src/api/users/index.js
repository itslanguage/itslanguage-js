/**
 * This file contains the readily available functions which interact with the ITSLanguage user API.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/users/index.html}
 */

import { authorisedRequest } from '../communication';

/**
 * The URL for the user handler(s).
 * @type {string}
 */
const url = '/users';

/**
 * The URL for a single user handler.
 * @type {string}
 */
const singleUserUrl = '/user';


/**
 * Create a new user.
 *
 * @param {Object} user - The user to create.
 * @param {string} [user.id] - A unique identifier. If none is given, one is generated.
 * @param {string} user.firstName - The first name of the user.
 * @param {string} user.infix - The infix of the user.
 * @param {string} user.lastName - The last name of the user.
 * @param {Array} [user.groups] - Groups the user resides in.
 * @param {Array} user.roles - The names of roles to grant the user.
 *
 * @returns {Promise} - The user creation promise.
 */
export function create(user) {
  return authorisedRequest('POST', url, user);
}


/**
 * Get the current user.
 *
 * @returns {Promise} - The current user.
 */
export function getCurrent() {
  return authorisedRequest('GET', singleUserUrl);
}

/**
 * Get a single user by its ID.
 *
 * @param {string} id - The ID of the desired user.
 *
 * @returns {Promise} - The promise for the user.
 */
export function getById(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all users.
 *
 * By default all users are fetched though it is allowed to pass filters as a `URLSearchParams`
 * object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category list.
 *
 * @throws {Promise<string>} - If the given optional filters are not an instance of
 * `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the users.
 */
export function getAll(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject(new Error('The filters should be a `URLSearchParams` object.'));
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}

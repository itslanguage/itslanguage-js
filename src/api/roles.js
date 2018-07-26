/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage role API.
 */

import {authorisedRequest} from './communication';

// The URL for the role handler(s).
const url = '/roles';


/**
 * Get a single role by its ID.
 *
 * @param {string} id - The ID of the desired role.
 *
 * @returns {Promise} - The promise for the role.
 */
export function getById(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all roles.
 *
 * By default all roles are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the roles.
 */
export function getAll(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}

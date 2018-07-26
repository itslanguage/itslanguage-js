/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage group API.
 *
 * Users can be part of zero or multiple groups.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/groups/index.html
 */

import {authorisedRequest} from './communication';

// The URL for the group handler(s).
const url = '/groups';


/**
 * Create a new group.
 *
 * @param {Object} group - The group to create.
 * @param {string} [group.id] - A unique identifier. If none is given, one is generated.
 * @param {Array} group.name - The name of the group.
 *
 * @returns {Promise} - The group creation promise.
 */
export function create(group) {
  return authorisedRequest('POST', url, group);
}


/**
 * Get a single group by its ID.
 *
 * @param {string} id - The ID of the desired group.
 *
 * @returns {Promise} - The promise for the group.
 */
export function getById(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all groups.
 *
 * By default all groups are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the groups.
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

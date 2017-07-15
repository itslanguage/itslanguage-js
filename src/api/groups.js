/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage group API.
 */

import {authorisedRequest} from './communication';

// The URL for the group handler(s).
const url = '/groups';


/**
 * Create a new group.
 *
 * @param {Object} group - The group to create.
 *
 * @returns {Promise} - The group creation promise.
 */
export function createGroup(group) {
  return authorisedRequest('POST', url, group);
}


/**
 * Get a single group by its ID.
 *
 * @param {string} id - The ID of the desired group.
 *
 * @returns {Promise} - The promise for the group.
 */
export function getGroupByID(id) {
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
export function getAllGroups(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}

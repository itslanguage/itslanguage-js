/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage organisation API.
 */

import {authorisedRequest} from './communication';

// The URL for the organisation handler(s).
const url = '/organisations';


/**
 * Create a new organisation.
 *
 * @param {Object} organisation - The organisation to create.
 *
 * @returns {Promise} - The organisation creation promise.
 */
export function createOrganisation(organisation) {
  return authorisedRequest('POST', url, organisation);
}


/**
 * Get a single organisation by its ID.
 *
 * @param {string} id - The ID of the desired organisation.
 *
 * @returns {Promise} - The promise for the organisation.
 */
export function getOrganisationByID(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all organisations.
 *
 * By default all organisations are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the organisations.
 */
export function getAllOrganisations(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}

/**
 * This file contains the readily available functions which interact with the
 * ITSLanguage speech challenge API.
 *
 * @module sdk/lib/api/challenges/speech
 */

import { authorisedRequest } from '../../communication';

/**
 * The URL for the speech challenge handler(s).
 * @type {string}
 */
const url = '/challenges/speech';


/**
 * Create a new speech challenge.
 *
 * @param {Object} challenge - The challenge to create.
 *
 * @returns {Promise} - The challenge creation promise.
 */
export function create(challenge) {
  return authorisedRequest('POST', url, challenge);
}


/**
 * Get a single speech challenge by its ID.
 *
 * @param {string} id - The ID of the desired speech challenge.
 *
 * @returns {Promise} - The promise for the speech challenge.
 */
export function getById(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all speech challenges.
 *
 * By default all speech challenges are fetched though it is allowed to pass filters as a
 * `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category list.
 *
 * @throws {Promise<string>} - If the given optional filters are not an instance of
 * `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the speech challenges.
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

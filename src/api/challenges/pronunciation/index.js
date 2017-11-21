/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage pronunciation challenge API.
 */

import {authorisedRequest} from '../../communication';

// The URL for the pronunciation challenge handler(s).
const url = '/challenges/pronunciation';


/**
 * Create a new pronunciation challenge.
 *
 * @param {Object} challenge - The pronunciation challenge to create.
 *
 * @returns {Promise} - The pronunciation challenge creation promise.
 */
export function createPronunciationChallenge(challenge) {
  return authorisedRequest('POST', url, challenge);
}


/**
 * Get a single pronunciation challenge by its ID.
 *
 * @param {string} id - The ID of the desired pronunciation challenge.
 *
 * @returns {Promise} - The promise for the pronunciation challenge.
 */
export function getPronunciationChallengeByID(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all pronunciation challenges.
 *
 * By default all pronunciation challenges are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the pronunciation challenges.
 */
export function getAllPronunciationChallenges(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}


/**
 * Delete the pronunciation challenge with the given ID.
 *
 * @param {string} id - The ID of the pronunciation challeng to delete.
 *
 * @returns {Promise} - The pronunciation delete promise.
 */
export function deletePronunciationChallenge(id) {
  return authorisedRequest('DELETE', `${url}/${id}`);
}

/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage categories API.
 */

import {authorisedRequest} from './communication';

// The URL for the category handler(s).
const url = '/categories';


/**
 * Create a new category.
 *
 * @param {Object} category - The category to create.
 *
 * @returns {Promise} - The category creation promise.
 */
export function createCategory(category) {
  return authorisedRequest('POST', url, category);
}


/**
 * Get a single category by its ID.
 *
 * @param {string} id - The ID of the desired category.
 *
 * @returns {Promise} - The promise for the category.
 */
export function getCategoryByID(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all categories.
 *
 * By default all categories are fetched though it is allowed to pass filters.
 * as a `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the categories.
 */
export function getAllCategories(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}

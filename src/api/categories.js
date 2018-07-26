/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage categories API.
 *
 * Categorize Speech Challenges or categories.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/categories/index.html
 */

import {authorisedRequest} from './communication';

// The URL for the category handler(s).
const url = '/categories';


/**
 * Create a new category.
 *
 * The most convenient way to pas a category to this create function is to make use of the FormData object.
 *
 * @param {Object} category - The category to create.
 * @param {string} [category.id] - The category identifier. If none is given, one is generated.
 * @param {string} [category.parent] - Identifier of the parent category.
 * @param {string} [category.name] - A name for the category.
 * @param {string} [category.description] - A possible more verbose description about the category.
 * @param {string} [category.color] - A color, preferably in RGB format.
 * @param {blob} [category.image] - An image to show with the category.
 * @param {blob} [category.icon] - An icon to show with the category.
 * @param {string} [category.speechChallenges] - Speech Challenge identifiers categorized in the category.
 *
 * @returns {Promise} - The category creation promise.
 */
export function create(category) {
  return authorisedRequest('POST', url, category);
}


/**
 * Get a single category by its ID.
 *
 * @param {string} id - The ID of the desired category.
 *
 * @returns {Promise} - The promise for the category.
 */
export function getById(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all top level categories.
 * Top level categories are categories without a parent category.
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

/**
 * Get all categories that share the same parent.
 *
 * @param {string} id - The category identifier.
 *
 * @returns {Promise} - A promise and when fulfilled the requested categories.
 */
export function getAllWithParentId(id) {
  return authorisedRequest('GET', `${url}/${id}/categories`);
}

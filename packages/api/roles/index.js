/**
 * This file contains the readily available functions which interact with the ITSLanguage role API.
 *
 * Roles are named groups of permissions. A role is typically assigned to a user to grant a user
 * permissions.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/roles/index.html}
 *
 * @module api/roles
 */

import { authorisedRequest } from '../communication';

/**
 * The URL for the role handler(s).
 * @type {string}
 */
const url = '/roles';

/**
 * Create a new role.
 *
 * @param {Object} role - The role to create.
 * @param {string} [role.id] - The category identifier. If none is given, one is generated.
 * @param {Array} role.permissions - Array of permissions this role is authorized for.
 *
 * @returns {Promise} - The user creation promise.
 */
export function create(role) {
  return authorisedRequest('POST', url, role);
}

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
 * By default all roles are fetched though it is allowed to pass filters as a `URLSearchParams`
 * object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category list.
 *
 * @throws {Promise<string>} - If the given optional filters are not an instance of
 * `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the roles.
 */
export function getAll(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject(
        new Error('The filters should be a `URLSearchParams` object.'),
      );
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}

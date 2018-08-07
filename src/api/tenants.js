/**
 * This file contains the readily available functions which interact with the ITSLanguage role API.
 *
 * Tenants can be managed using the REST API. Only users with administrative powers can perform these calls.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/tenants/index.html}
 */

import {authorisedRequest} from './communication';

/**
 * The URL for the tenant handler(s).
 * @type {string}
 */
const url = '/tenants';

/**
 * Create a new tenant.
 *
 * @param {Object} tenant - The tenant to create.
 * @param {string} [tenant.id] - A unique identifier. If none is given, one is generated.
 * @param {Array} tenant.name - The name of the tenant.
 *
 * @returns {Promise} - The user creation promise.
 */
export function create(tenant) {
  return authorisedRequest('POST', url, tenant);
}

/**
 * Get a tenant by its ID.
 *
 * @param {string} id - The Id of the desired tenant.
 *
 * @returns {Promise} - The promise for the tenant.
 */
export function getById(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get all tenants.
 *
 * @returns {Promise} - The promise for the tenants.
 */
export function getAll() {
  return authorisedRequest('GET', url);
}

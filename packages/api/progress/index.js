/**
 * The progress of a category (or actually, challenges in a category) can be requested by a user.
 *
 * @see {@link https://itslanguage.github.io/itslanguage-docs/api/progress/index.html}
 *
 * @module api/progress
 */

import { authorisedRequest } from '../communication';

/**
 * The URL for the category handler(s) to query for progress.
 * @type {string}
 */
const url = '/categories';

/**
 * Get progress by its category id.
 * The progress is returned for the current user if only the id is passed. If groups and or a role
 * is passed it will return progress for all users from that group.
 *
 * @param {string} id - The category id.
 * @param {Array|string} [groups=[]] - The id's or id  of the groups to get
 * progress on.
 * @param {string} [role=''] - The id of the role that a user should be in.
 *
 * @returns {Promise} - The promise for the organisation.
 */
// eslint-disable-next-line import/prefer-default-export
export function getById(id, groups = [], role = '') {
  let filters = '';
  const searchParams = new URLSearchParams();
  let groupIds = [];

  if (typeof groups === 'string') {
    groupIds = groups.split(); // convert 'STRING' to ['STRING'];
  } else if (Array.isArray(groups)) {
    groupIds = groups;
  }

  if (groupIds.length > 0) {
    // If we have groups, add them to the searchParams!
    groupIds.forEach(group => {
      searchParams.append('group', group);
    });
  }

  if (role !== '') {
    // Do we role with a role? Add it to the searchParams!
    searchParams.append('role', role);
  }

  if (groupIds.length > 0 || role) {
    // If we had groups or roles, construct a querystring based on searchParams.
    filters = `?${searchParams.toString()}`;
  }

  return authorisedRequest('GET', `${url}/${id}/progress${filters}`);
}

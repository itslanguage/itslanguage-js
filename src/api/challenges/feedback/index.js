/**
 * This file contains the functions that are needed to interact with
 * the ITSLanguage Feedback API.
 */

import { authorisedRequest } from '../../communication';

// The URL for the feedback challenge handler(s).
const url = '/feedback';

/**
 * Create new feedback.
 *
 * @param {Object} feedback - The feedback to create.
 *
 * @returns {Promise} - The feedback creation promise.
 */
export function createFeedback(feedback) {
  return authorisedRequest('POST', url, feedback);
}

/**
 * Get a single feedback challenge by its ID.
 * Feedback can only be get by the owning user or by a user with the TEACHER role.
 *
 * @see https://itslanguage.github.io/itslanguage-docs/api/feedback/index.html#get-feedback-by-id
 *
 * @param {string} id - The ID of the desired feedback challenge to get.
 *
 * @returns {Promise} - The promise for the feedback challenge.
 */
export function getFeedbackById(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}

/**
 * Get all feedback. It will only return feedback that the user may see.
 * Feedback can only be get by the owning user or by a user with the TEACHER role.
 *
 * @returns {Promise} - The promise for the feedback challenges.
 */
export function getAllFeedback() {
  return authorisedRequest('GET', url);
}

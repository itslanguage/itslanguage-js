/**
 * @class User domain model
 */
export default class User {
  /**
   * Create a User domain model.
   *
   * @param {string} organisationId - The organisation identifier this user is a member of.
   * @param {?string} id - The user identifier. If none is given, one is generated.
   * @param {?string} firstName - First name of the user.
   * @param {?string} lastName - Last name of the user.
   * @param {?string} gender - Gender of the user (either `male` or `female`).
   * @param {?number} birthYear - Birth year of the user.
   */
  constructor(organisationId, id, firstName, lastName, gender, birthYear) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    /**
     * The user identifier.
     * @type {string}
     */
    this.id = id;
    if (!organisationId || typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string" is required');
    }
    /**
     * The organisation identifier this user is a member of.
     * @type {string}
     */
    this.organisationId = organisationId;

    /**
     * First name of the user.
     * @type {string}
     */
    this.firstName = firstName;

    /**
     * Last name of the user.
     * @type {string}
     */
    this.lastName = lastName;

    /**
     Gender of the user (either `male` or `female`).
     * @type {string}
     */
    this.gender = gender;
    if (birthYear && typeof birthYear !== 'number') {
      throw new Error(
        'birthYear parameter of type "number|null" is required');
    }

    /**
     * Birth year of the user.
     * @type {number}
     */
    this.birthYear = birthYear;

    /**
     * The creation date of the entity.
     * @type {Date}
     */
    this.created = null;

    /**
     * The most recent update date of the entity.
     * @type {Date}
     */
    this.updated = null;
  }
}

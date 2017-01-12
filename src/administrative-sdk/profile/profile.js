/**
 * Profile domain model. A profile is part of a {@link User} and stores general information about the user.
 */
export default class Profile {
  /**
   * Create a Profile.
   *
   * @param {string} firstName - The first name of the {@link User}.
   * @param {string} lastName - The last name of the {@link User}.
   * @param {?string} [infix] - The infix of the {@link User}'s name.
   * @param {string} gender - The gender of the {@link User}.
   * @param {Date} birthDate - The birth date of the {@link User}.
   * @throws {Error} firstName parameter of type "string" is required.
   * @throws {Error} lastName parameter of type "string" is required.
   * @throws {Error} gender parameter of type "string" is required.
   * @throws {Error} birthDate parameter of type "Date" is required.
   */
  constructor(firstName, lastName, infix = null, gender, birthDate) {
    if (typeof firstName !== 'string') {
      throw new Error('firstName parameter of type "string" is required');
    }

    if (typeof lastName !== 'string') {
      throw new Error('lastName parameter of type "string" is required');
    }

    if (infix !== null && typeof infix !== 'string') {
      throw new Error('infix parameter of type "string|null" is required');
    }

    if (typeof gender !== 'string') {
      throw new Error('gender parameter of type "string" is required');
    }

    if (!(birthDate instanceof Date)) {
      throw new Error('birthDate parameter of type "Date" is required');
    }

    /**
     * The first name of the {@link User}.
     * @type {string}
     */
    this.firstName = firstName;

    /**
     * The last name of the {@link User}.
     * @type {string}
     */
    this.lastName = lastName;

    /**
     * @type {string} The infix of the {@link User}'s name.
     */
    this.infix = infix;

    /**
     * The gender of the {@link User}.
     * @type {string}
     */
    this.gender = gender;

    /**
     * The birth date of the {@link User}.
     * @type {Date}
     */
    this.birthDate = birthDate;
  }
}

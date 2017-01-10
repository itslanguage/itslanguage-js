/**
 * Users can have email based credentials.
 * These credentials can be managed using the REST API. Only users with administrative powers can perform these calls.
 */
export default class EmailCredentials {
  /**
   * Create an EmailCredentials object.
   *
   * @param {string} email - A unique email address.
   * @param {?string} password - A secure password, if none is given, one will be generated.
   * @throws {Error} email parameter of type "string" is required.
   * @throws {Error} password parameter of type "string|null" is required
   */
  constructor(email, password = null) {
    if (typeof email !== 'string') {
      throw new Error('email parameter of type "string" is required');
    }

    if (password !== null && typeof password !== 'string') {
      throw new Error('password parameter of type "string|null" is required');
    }

    /**
     * @type {string} A unique email address.
     */
    this.email = email;

    /**
     * @type {string} A secure password, if none is given, one will be generated.
     */
    this.password = password;
  }
}

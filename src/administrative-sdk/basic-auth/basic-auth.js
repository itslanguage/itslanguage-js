/**
 * BasicAuth domain model.
 */
export default class BasicAuth {
  /**
   * @param {string} tenantId - The Tenant identifier - to create this BasicAuth for.
   * @param {?string} principal - The principal. If none is given, one is generated.
   * @param {?string} credentials - The credentials. If none is given, one is generated.
   * @throws {Error} tenantId parameter of type "string" is required.
   * @throws {Error} principal parameter of type "string|null" is required.
   * @throws {Error} credentials parameter of type "string|null" is required.
   */
  constructor(tenantId, principal, credentials) {
    if (typeof tenantId !== 'string') {
      throw new Error(
        'tenantId parameter of type "string" is required');
    }

    if (principal !== null && typeof principal !== 'string') {
      throw new Error(
        'principal parameter of type "string|null" is required');
    }

    if (credentials !== null && typeof credentials !== 'string') {
      throw new Error(
        'credentials parameter of type "string|null" is required');
    }

    /**
     * @type {string}
     */
    this.tenantId = tenantId;

    /**
     * @type {string}
     */
    this.principal = principal;

    /**
     * @type {string}
     */
    this.credentials = credentials;
  }
}

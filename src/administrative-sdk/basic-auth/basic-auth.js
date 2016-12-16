/**
 * BasicAuth domain model.
 */
export default class BasicAuth {
  /**
   * @param {string} tenantId - The Tenant identifier - to create this BasicAuth for.
   * @param {?string} principal - The principal. If none is given, one is generated.
   * @param {?string} credentials - The credentials. If none is given, one is generated.
   * @throws {Error} tenantId parameter of type "string" is required.
   * @throws {Error} principal parameter of type "string|null|undefined" is required.
   * @throws {Error} credentials parameter of type "string|null|undefined" is required.
   */
  constructor(tenantId, principal, credentials) {
    if (typeof tenantId !== 'string') {
      throw new Error(
        'tenantId parameter of type "string" is required');
    }

    /**
     * @type {string}
     */
    this.tenantId = tenantId;
    if (typeof principal !== 'string' &&
      principal !== null &&
      principal !== undefined) {
      throw new Error(
        'principal parameter of type "string|null|undefined" is required');
    }

    /**
     * @type {string}
     */
    this.principal = principal;
    if (typeof credentials !== 'string' &&
      credentials !== null &&
      credentials !== undefined) {
      throw new Error(
        'credentials parameter of type "string|null|undefined" is required');
    }

    /**
     * @type {string}
     */
    this.credentials = credentials;
  }
}

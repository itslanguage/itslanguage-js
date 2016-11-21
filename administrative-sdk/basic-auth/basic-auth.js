export default class BasicAuth {
  /**
   * BasicAuth domain model.
   *
   * @constructor
   * @param {string} tenantId The tenant identifier to create this BasicAuth for.
   * @param {string} [principal] The principal. If none is given, one is generated.
   * @param {string} [credentials] The credentials. If none is given, one is generated.
   */
  constructor(tenantId, principal, credentials) {
    if (typeof tenantId !== 'string') {
      throw new Error(
        'tenantId parameter of type "string" is required');
    }
    this.tenantId = tenantId;
    if (typeof principal !== 'string' &&
      principal !== null &&
      principal !== undefined) {
      throw new Error(
        'principal parameter of type "string|null|undefined" is required');
    }
    this.principal = principal;
    if (typeof credentials !== 'string' &&
      credentials !== null &&
      credentials !== undefined) {
      throw new Error(
        'credentials parameter of type "string|null|undefined" is required');
    }
    this.credentials = credentials;
  }
}

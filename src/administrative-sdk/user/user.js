import Profile from '../profile/profile';

/**
 * @class User domain model
 */
export default class User {
  /**
   * Create a User domain model.
   *
   * @param {?string} id - The user identifier. If none is given, one is generated.
   * @param {Array<.string>} roles - Names of the {@link Role}s this user can take on.
   * @param {?Profile} profile - Profile of the User.
   * @param {?Array.<Group>} groups - Groups this User is part of.
   * @throws {Error} id parameter of type "string|null" is required.
   * @throws {Error} profile parameter of type "Profile|null" is required.
   * @throws {Error} groups parameter of type "Array.<Groups>|null" is required.
   * @throws {Error} non-empty roles parameter of type "Array.<String>" is required.
   */
  constructor(id, roles, profile = null, groups = null) {
    if (id !== null && typeof id !== 'string') {
      throw new Error('id parameter of type "string|null" is required');
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error('non-empty roles parameter of type "Array.<string>" is required');
    }

    if (profile !== null && !(profile instanceof Profile)) {
      throw new Error('profile parameter of type "Profile|null" is required');
    }

    if (groups !== null && !Array.isArray(groups)) {
      throw new Error('groups parameter of type "Array.<Groups>|null" is required');
    }

    /**
     * The user identifier. If none is given, one is generated.
     * @type {string}
     */
    this.id = id;

    /**
     * Names of the {@link Role}s this user can take on.
     * @type {Array.<.Role>}
     */
    this.roles = roles;

    /**
     * Profile of the User.
     * @type {Profile}
     */
    this.profile = profile;

    /**
     * Groups this User is part of.
     * @type {Array.<Group>}
     */
    this.groups = groups;

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

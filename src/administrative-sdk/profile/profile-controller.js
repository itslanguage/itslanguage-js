import Profile from './profile';

/**
 * Controller class for the Profile model.
 * @private
 */
export default class ProfileController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    /**
     * Object to use for making a connection to the REST API and Websocket server.
     * @type {Connection}
     */
    this._connection = connection;
  }

  /**
   * Get the profile of the given user active in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} userId - Specify a User identifier.
   * @returns {Promise.<Profile>} Promise containing a Profile.
   * @throws {Promise.<Error>} userId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getProfile(userId) {
    if (typeof userId !== 'string') {
      return Promise.reject(new Error('userId parameter of type "string" is required'));
    }
    const url = this._connection._settings.apiUrl + '/profiles/' + userId;

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const profile = new Profile(data.firstName, data.lastName, data.infix, data.gender, new Date(data.birthDate));
        profile.created = new Date(data.created);
        profile.updated = new Date(data.updated);
        return profile;
      });
  }

  /**
   * Get and return all profiles of all users in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<Profile[]>} Array of Profiles.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  getProfiles() {
    const url = this._connection._settings.apiUrl + '/profiles';
    return this._connection._secureAjaxGet(url)
      .then(data => data.map(datum => {
        const profile = new Profile(datum.firstName, datum.lastName, datum.infix, datum.gender,
          new Date(datum.birthDate));
        profile.created = new Date(datum.created);
        profile.updated = new Date(datum.updated);
        return profile;
      }));
  }
}

import Group from './group';

/**
 * Controller class for the Group model.
 * @private
 */
export default class GroupController {
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
   * Create a group. The group will be part of the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {Organisation} group - Object to create.
   * @returns {Promise.<Group>} Promise containing the newly created Group.
   * @throws {Promise.<Error>} organisation parameter of type "Group" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createGroup(group) {
    if (!(group instanceof Group)) {
      return Promise.reject(new Error('group parameter of type "Group" is required'));
    }
    const url = this._connection._settings.apiUrl + '/groups';
    const fd = JSON.stringify(group);

    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new Group(data.id, data.name);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get a group which is part of the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} groupId - Specify a group identifier.
   * @returns {Promise.<Group>} Promise containing an Group.
   * @throws {Promise.<Error>} groupId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getGroup(groupId) {
    if (typeof groupId !== 'string') {
      return Promise.reject(new Error('groupId parameter of type "string" is required'));
    }
    const url = this._connection._settings.apiUrl + '/groups/' + groupId;

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const organisation = new Group(data.id, data.name);
        organisation.created = new Date(data.created);
        organisation.updated = new Date(data.updated);
        return organisation;
      });
  }

  /**
   * Get and return all groups in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<Group[]>} Promise containing an array of Groups.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getGroups() {
    const url = this._connection._settings.apiUrl + '/groups';

    return this._connection._secureAjaxGet(url)
      .then(data => {
        const groups = [];
        data.forEach(datum => {
          const group = new Group(datum.id, datum.name);
          group.created = new Date(datum.created);
          group.updated = new Date(datum.updated);
          groups.push(group);
        });
        return groups;
      });
  }
}

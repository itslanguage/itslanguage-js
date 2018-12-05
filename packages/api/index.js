/**
 * @module sdk
 */

import * as authentication from './api/auth';
import * as basicauth from './api/basicauth';
import broadcaster from './api/broadcaster';
import * as categories from './api/categories';
import * as challenges from './api/challenges';
import * as communication from './api/communication';
import * as emailauth from './api/emailauth';
import * as groups from './api/groups';
import * as organisations from './api/organisations';
import * as profile from './api/profile';
import * as progress from './api/progress';
import * as roles from './api/roles';
import * as tenants from './api/tenants';
import * as users from './api/users';

/**
 * Document the version number of the ITSLanguage SDK.
 * @type {string}
 */
const VERSION = '4.0.0-beta-12';


/**
 * Represents the ITSLanguage SDK.
 * It allows the user to make every call to the API with a single function.
 * @see https://itslanguage.github.io/itslanguage-docs
 */
export class Itslanguage {
  /**
   * Create ITSLanguage SDK.
   *
   * @param {Object} options - An object containing options for communication.
   * @param {string} options.apiUrl - The URL of the REST api.
   * @param {string} options.wsUrl - The URL of the WebSocket server.
   * @param {string} options.authorizationToken - An OAuth2 token string.
   */
  constructor(options) {
    /**
     * Expose the ITSLanguage SDK version.
     * @type {string}
     */
    this.version = VERSION;

    /**
     * @type module:sdk/lib/api/authentication
     */
    this.authentication = authentication;

    /**
     * @type module:sdk/lib/api/basicauth
     */
    this.basicauth = basicauth;

    /**
     * @type module:sdk/lib/api/broadcaster
     */
    this.broadcaster = broadcaster;

    /**
     * @type module:sdk/lib/api/categories
     */
    this.categories = categories;

    /**
     * @type module:sdk/lib/api/challenges
     */
    this.challenges = challenges;

    /**
     * @type module:sdk/lib/api/communication
     */
    this.communication = communication;

    /**
     * @type module:sdk/lib/api/emailauth
     */
    this.emailauth = emailauth;

    /**
     * @type module:sdk/lib/api/groups
     */
    this.groups = groups;

    /**
     * @type module:sdk/lib/api/organisations
     */
    this.organisations = organisations;

    /**
     * @type module:sdk/lib/api/profile
     */
    this.profile = profile;

    /**
     * @type module:sdk/lib/api/progress
     */
    this.progress = progress;

    /**
     * @type module:sdk/lib/api/roles
     */
    this.roles = roles;

    /**
     * @type module:sdk/lib/api/tenants
     */
    this.tenants = tenants;

    /**
     * @type module:sdk/lib/api/users
     */
    this.users = users;

    this.communication.updateSettings(options);
  }
}

/**
 * Create the ITSLanguage SDK object to interact with the API.
 *
 * @param {Object} options - An object containing options for communication.
 * @param {string} options.apiUrl - The URL of the REST api.
 * @param {string} options.wsUrl - The URL of the Websocket server.
 * @param {string} options.authorizationToken - An OAuth2 token string.
 *
 * @return {Itslanguage} - The SDK.
 */
export function createItslSdk(options) {
  return new Itslanguage(options);
}

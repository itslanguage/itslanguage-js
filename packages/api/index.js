/**
 * @module api
 */

import * as authentication from './auth';
import * as basicauth from './basicauth';
import broadcaster from './broadcaster';
import * as categories from './categories';
import * as challenges from './challenges';
import * as communication from './communication';
import * as emailauth from './emailauth';
import * as groups from './groups';
import * as organisations from './organisations';
import * as profile from './profile';
import * as progress from './progress';
import * as roles from './roles';
import * as tenants from './tenants';
import * as users from './users';

/**
 * Document the version number of the ITSLanguage API package.
 * @type {string}
 */
const VERSION = '4.0.0-beta-13';


/**
 * Represents the ITSLanguage API package.
 * It allows the user to make every call to the API with a single function.
 * @see https://itslanguage.github.io/itslanguage-docs
 */
export class Itslanguage {
  /**
   * Create ITSLanguage API.
   *
   * @param {Object} options - An object containing options for communication.
   * @param {string} options.apiUrl - The URL of the REST api.
   * @param {string} options.wsUrl - The URL of the WebSocket server.
   * @param {string} options.authorizationToken - An OAuth2 token string.
   */
  constructor(options) {
    /**
     * Expose the ITSLanguage API package version.
     * @type {string}
     */
    this.version = VERSION;

    /**
     * @type module:api/authentication
     */
    this.authentication = authentication;

    /**
     * @type module:api/basicauth
     */
    this.basicauth = basicauth;

    /**
     * @type module:api/broadcaster
     */
    this.broadcaster = broadcaster;

    /**
     * @type module:api/categories
     */
    this.categories = categories;

    /**
     * @type module:api/challenges
     */
    this.challenges = challenges;

    /**
     * @type module:api/communication
     */
    this.communication = communication;

    /**
     * @type module:api/emailauth
     */
    this.emailauth = emailauth;

    /**
     * @type module:api/groups
     */
    this.groups = groups;

    /**
     * @type module:api/organisations
     */
    this.organisations = organisations;

    /**
     * @type module:api/profile
     */
    this.profile = profile;

    /**
     * @type module:api/progress
     */
    this.progress = progress;

    /**
     * @type module:api/roles
     */
    this.roles = roles;

    /**
     * @type module:api/tenants
     */
    this.tenants = tenants;

    /**
     * @type module:api/users
     */
    this.users = users;

    this.communication.updateSettings(options);
  }
}

/**
 * Create the ITSLanguage API object to interact with the API backend.
 *
 * @param {Object} options - An object containing options for communication.
 * @param {string} options.apiUrl - The URL of the REST api.
 * @param {string} options.wsUrl - The URL of the Websocket server.
 * @param {string} options.authorizationToken - An OAuth2 token string.
 *
 * @return {Itslanguage} - The API.
 */
export function createItslApi(options) {
  return new Itslanguage(options);
}

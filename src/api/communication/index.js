/**
 * This file contains the settings and the communication mechanism for the ITSLanguage REST API.
 */

/**
 * Content-Type HTTP Header key.
 * @type {string}
 */
const CONTENT_TYPE = 'Content-Type';

/**
 * Authorization HTTP Header key.
 * @type {string}
 */
const AUTHORIZATION = 'Authorization';

/**
 * Content-Type HTTP Header value.
 * @type {string}
 */
const APPLICATION_JSON = 'application/json';


/**
 * The settings to use for the communication with the ITSLanguage API.
 */
export const settings = {
  apiUrl: 'https://api.itslanguage.nl',
  wsUrl: null,
  authorizationToken: null,
};


/**
 * Update the settings with the `newSettings`.
 *
 * @param {Object} newSettings - The settings to inject/update.
 *
 * @throws {Error} - When the given `newSettings` is something other than a object.
 */
export function updateSettings(newSettings) {
  if (!newSettings || !(newSettings instanceof Object)) {
    throw new Error('Please, only provide objects as settings.');
  }

  Object.assign(settings, newSettings);
}


/**
 * Parse the response of a fetch request.
 *
 * Try to parse the given response body as JSON, if it isn't Leave the response as is.
 *
 * @param {Response} response - The response to parse.
 *
 * @throws {Promise<string>} - When the request wasn't okay and the contents of the response isn't
 * json.
 * @throws {Promise<Error>} - When the request wasn't okay and the contents of the response is json.
 *
 * @returns {Promise|Response} - The contents of a JSON response or the response itself if the body
 * is something other than JSON.
 */
function handleResponse(response) {
  const responseContentType = response.headers.get(CONTENT_TYPE);

  // The ITSLanguage API should return JSON. If t
  if (responseContentType && responseContentType.includes(APPLICATION_JSON)) {
    return response.json().then((json) => {
      if (response.ok) {
        return json;
      }

      return Promise.reject(json);
    });
  }

  if (!response.ok) {
    return Promise.reject(new Error(`${response.status}: ${response.statusText}`));
  }

  return response;
}


/**
 * Perform an HTTP request for the given method, url, body, and headers.
 *
 * In case the given url is a partial url, meaning it starts with a `/`, the base URL to the
 * ITSLanguage API is prepended.
 *
 * When a Object instance is provided as body, it'll be transformed into JSON. Unless it is either a
 * `URLSearchParams` or a `FormData` object. Anything else is sent as plain text.
 *
 * @param {string} method - The request METHOD ('GET', 'POST', 'PUT', 'DELETE').
 * @param {string} url - The location to send the request to.
 * @param {*} [body] - Anything which needs to be sent somewhere.
 * @param {Headers} [headers] - Extra headers to send with the request.
 *
 * @returns {Promise<Object>} The response of the made request.
 */
export function request(method, url, body, headers) {
  const requestHeaders = headers || new Headers();

  let requestBody = body;
  if (!(body instanceof URLSearchParams || body instanceof FormData) && body instanceof Object) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  let requestURL = url;
  // XXX remove the URL truthy check when all tests are properly written. Now
  // it happens way to often that the URL is omitted without any good reason.
  if (url && url.startsWith('/')) {
    requestURL = `${settings.apiUrl}${url}`;
  }

  const requestOptions = {
    method,
    headers: requestHeaders,
    body: requestBody,
  };

  return fetch(requestURL, requestOptions).then(handleResponse);
}


/**
 * Build a bearer token from the `authorizationToken` in the settings object.
 *
 * @throws {Error} When no authorizationToken is set.
 *
 * @returns {string} The generated bearer token.
 */
function getBearerToken() {
  if (!settings.authorizationToken) {
    throw new Error('Please authenticate first.');
  }

  return `Bearer ${settings.authorizationToken}`;
}


/**
 * Perform an HTTP request with the desired method, body, and headers to the given partial
 * ITSLanguage API URL.
 *
 * This request will add the ``Authorization`` header to the request.
 *
 * This function only allows to make calls to the ITSLanguage API.
 *
 * @param {string} method - The request METHOD ('GET', 'POST', 'PUT', 'DELETE').
 * @param {string} url - The location to send the request to.
 * @param {*} [body] - Anything which needs to be sent somewhere.
 * @param {Headers} [headers] - Extra headers to send with the request.
 *
 * @throws {Promise<string>} - When the given `url` param is not a partial URL, or when there is no
 * authorisation token available.
 *
 * @returns {Promise<Object>} - The response from the ITSLanguage API.
 */
export function authorisedRequest(method, url, body, headers) {
  // XXX remove the URL truthy check when all parts of the SDK no longer build
  // a complete url by themselves using the "private" settings object of their
  // connection reference.
  if (url && (!url.startsWith('/') && !url.startsWith(settings.apiUrl))) {
    return Promise.reject(new Error('Only relative ITSLanguage API URLs are allowed.'));
  }

  try {
    const requestHeaders = headers || new Headers();
    requestHeaders.set(AUTHORIZATION, getBearerToken());

    return request(method, url, body, requestHeaders);
  } catch (unauthorised) {
    return Promise.reject(new Error(unauthorised.message));
  }
}

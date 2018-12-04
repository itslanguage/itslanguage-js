import { addAccessToken } from '@itslanguage/api/api/communication';

/**
 * Factory function to create a HTMLAudioElement.
 * If requested, it is capable of adding "access_token" to the audioUrl. For some audio an user
 * needs to be authenticated to be able to playback some audio.
 *
 * Keep in mind you need a (valid) token to be able to add it!
 *
 * @param {string} [audioUrl=false] - Provide URL to load.
 * @param {boolean} [secureLoad] - If true, add `access_token` to the url. But only if audioUrl was
 * also passed and you have a valid token to communicate with the backend.
 * @throws {Error} If window.Audio does not exist.
 * @returns {HTMLAudioElement}
 */
// eslint-disable-next-line import/prefer-default-export
export function createPlayer(audioUrl = null, secureLoad = false) {
  if (!Audio) {
    throw new Error('Your browser is not capable of playing audio.');
  }

  const audio = new Audio();
  audio.crossOrigin = 'use-credentials';

  if (audioUrl) {
    audio.src = secureLoad
      ? addAccessToken(audioUrl)
      : audioUrl;
  }

  return audio;
}

/**
 * Load a (new) url to an instance of a HTMLAudioElement. Main purpose of this function is to
 * support a way to add a new url with an "access_token". But it also works for url's in general.
 *
 * Note that this function does not follow functional programming guidelines: it will adjust a
 * property of a given param directly (aka param reassign). Unfortunately this is currently the
 * only way to (re)set an url on a given element.
 *
 * There are some alternatives that opt for not using this function:
 * 1. If you want to set an url on an already defined audio player, and you do not care or want to
 * set the 'access_token', it is better to set the url directly to the audioElm.src property
 * yourself.
 * 2. You can also use the @itslanguage/api method 'addAccessToken` to add an access token to any
 * url. That is in fact what this function uses.
 *
 * So, why we still provide this function? Only for convenience!
 *
 * @param {HTMLAudioElement} player - Instance of an Audio object to set a new url on.
 * @param {string} audioUrl - The url to set.
 * @param {boolean} [secureLoad] - If true, add `access_token` to the url.
 * @returns {boolean|string} - It will return false if it could not set an url or it will return the
 * url that has been set.
 */
export function loadAudioUrl(player, audioUrl, secureLoad = false) {
  if (!(player instanceof HTMLAudioElement) || !audioUrl) {
    return false; // nothing to do here!
  }

  // The HTMLAudioElement, or any element this object extends on, does
  // not have a proper setter for the src property. So we need to re-assign
  // it here.

  // eslint-disable-next-line no-param-reassign
  player.src = secureLoad
    ? addAccessToken(audioUrl)
    : audioUrl;

  return player.src;
}

/**
 * This module exposes the single event emitter. All events are sent through
 * this emitter. For usage; see the documentation of
 * [event-emitter][GitHub event-emitter].
 *
 * [GitHub event-emitter]: https://github.com/medikoo/event-emitter
 *
 * @module api/broadcaster
 */

import ee from 'event-emitter';

/**
 * The single event channel used throughout the ITSLanguage API.
 *
 * @type {event-emitter.EventEmitter}
 */
const broadcaster = ee();

export default broadcaster;

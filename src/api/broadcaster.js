/**
 * This module exposes the single event emitter. All events are sent through
 * this emitter. For usage; see the docuemntation of
 * [event-emitter][GitHub event-emitter].
 *
 * [GitHub event-emitter]: https://github.com/medikoo/event-emitter
 */

import ee from 'event-emitter';


/**
 * The single event channel used throughout the ITSLanguage SDK.
 *
 * @type {event-emitter.EventEmitter}
 */
const broadcaster = ee();


export default broadcaster;

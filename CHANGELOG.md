# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com)
and this project adheres to [Semantic Versioning](http://semver.org).

## [Unreleased]

## [v8.0.6] - 2022-10-07

## Added

- `websocket`
  - Added possibility to override recorder

## [v8.0.5] - 2022-03-15

### Fixed

- `websocket`
  - Fixed crash when calling cleanup with an undefined socket

## [v8.0.4] - 2022-02-09

### Added

- `websocket`
  - Optional text index start parameter for prompts

## [v8.0.3] - 2021-10-13

### Fixed

- `websocket`
  - Cleanup now removes listeners
- `recorder`
  - Trying to initialize twice will no longer throw an error

## [v8.0.2] - 2021-08-26

### Fixed

- `websocket`
  - Don't reconnect on connect failure

## [v8.0.1] - 2021-05-13

### Fixed

- `recorder`
  - Firefox and Safari browser will now record with the correct channel count

## [v8.0.0] - 2021-04-23

### Changed

- `recorder`
  - Changed the recorder from audio-recorder-polyfill which uses only
    ScriptProcessorNode to extended-media-recorder which can use AudioWorkers.
- `websocket`
  - Depracted `cleanup`
  - `start` now return a promise which is fulfilled when the backend actually is
    able to receive audio.

## [v7.0.0] - 2021-03-04

### Changed

- `websocket`
  - its-api websocket recording endpoint

## [v6.0.0] - 2021-01-11

### Added

- `websocket`
  - its-api websocket helper functions.

### Removed

- `api`
  - Removed its-gae API

## [v5.7.0] - 2020-10-12

### Changed

- `sdk`
  - Switch from travis-ci to github actions.

### Fixed

- `api`
  - Make sure a `link` header will be passed down the line.

## [v5.6.1] - 2020-07-06

### Changed

- `api`
  - Improved the connection and more specifically the disconnection. It will
    show an error if it was not closed normally. Previously the reason for
    closure was swallowed and not visible for the user.

## [v5.6.0] - 2020-04-24

### Changed

- `recorder`
  - Add constraints to the call of `createMediaStream`. This way we can be sure
    a recording session will be done with the minimum recording quality
    (sampleRate) that the ITSLanguage backend needs to perform analysis on.

## [v5.5.1] - 2020-02-28

### Fixed

- `api`
  - Version number in the main index.js file updated.
  - Exposed websocket connection which apparently was hidden.

## [v5.5.0] - 2020-02-28

### Fixed

- `api`
  - When stopping the recorder if no audio was send, make sure to clean up and
    close the websocket connection.

### Changed

- `api`
  - Do not auto reconnect the websocket connection by default.
  - Add closing of the WebSocket connection to the finally handler
    in stead of doing it in both the then and catch.
  - Check the size of the audio blob to send. If it seems to only have a header
    it wont sent it (true for wave). Any other mimeType will check for size > 0.

## [v5.4.1] - 2020-02-11

### Changed

- `api`
  - Close the WebSocket connection after using it with feedback.

## [v5.4.0] - 2020-02-04

### Changed

- `api`, `sdk`
  - Update the travis configuration.
  - Make sure to allow overriding the dataEvent to listen on a recorder.

## [v5.3.0] - 2020-01-10

### Fixed

- `api`
  - Only unregister an autobahn registration if there is actually an
    registration registered.
  - Reset the `lastChunk` after it is used.
  - Really cleanup some event listeners on the recorder after they have been
    used for streaming audio to the backend.
  - TypeError raised by makeWebsocketCall.
  - Allow to pass groups as a string (next to an array) and disallow other
    types. This is for the getById function of the Progress API.

### Changed

- `api`, `recorder`, `player`, `examples`, `sdk`
  - Bumped used package versions.
  - Upgraded yarn.lock file.

## [v5.2.0] - 2019-12-19

### Added

- `recorder`
  - Added a new plugin: BufferPlugin. This plugin buffers the microphone input
    for a given number of seconds. It also exposes an api to get (part of) the
    buffer.
- `examples`
  - Added the `react-recorder-buffer` example. This example shows an example of
    the recorder with buffer plugin enabled.

### Changed

- `recorder`

  - Updated the recorder readme file to be more accurate.

### Fixed

- `api`
  - Fix the stability of the test by taking the asynchronous approach that was
    used into account.

## [v5.1.0] - 2019-09-27

### Added

- `api`
  - Better inform the user when the recorder is prepared and ready to process
    audio. We now send out an `recorderready` event if ready.
- `examples`
  - Added the `react-speechchallenge` example. This example shows a speech
    challenge example and uses the recorder to record audio for it. It is also
    possible to listen back to the recorded audio.

### Changed

- `api`
  - The `dataavailable` and `stop` event that will be used by the sdk to send
    data to the backend will now remove the event handlers upon adding them.
    Just the handlers that it would add. This to make sure the recorder can be
    reused in stead of just once.
  - Before registering an RPC to the autobahn session, all the current
    registered functions will be unregistered, if there are any. This to make
    sure only one registration is active at the time.
  - The broadcaster event `websocketserverreadyforaudio` is a bit confusing.
    Sending it through the event emitter is deprecated and will be removed in a
    future version.
- `sdk`
  - Updated .gitignore file with more common patterns.

## [v5.0.1] - 2019-08-29

### Fixed

- `player`
  - Bumped the peer dependency of player to the correct `api` version.

## [v5.0.0] - 2019-08-29

### Changed

- `api`, `recorder`, `player`, `examples`, `sdk`
  - Bumped used package versions.
  - Upgraded yarn.lock file.
  - Set core-js@3 as peerDependency.
- `recorder`
  - Allow the default browser media types for recording, not just `audio/wav`.
    This can be done through the `mimeType` param on the `createRecorder`
    function.

### Fixed

- `recorder`
  - Failing test after bumping versions. Fixed by using non hardcoded value for
    the recorder getSpecs call.

### Added

- `examples`
  - Added the `react-recorder` example. This example shows how the recorder can
    be used.

### Removed

- `recorder`
  - The `addAsGlobal` function is removed.
  - The signature for `createRecorder` is changed. The params `setToWindow` and
    `asObject` are removed.
  - Several exported defaults are removed.

## [v4.2.2] - 2019-08-13

### Fixed

- `recorder`
  - The `recorder.getAudioSpecs()` was returning some hard-coded values that
    where not true on some devices. If the recorded and processed audio sounded
    like it was speedup: this was why.

## [v4.2.1] - 2019-06-21

### Changed

- `api`
  - Allow multiple writes for speech recordings by using the `timeslice` feature
    of the recorder.

## [v4.2.0] - 2019-04-17

### Added

- `api`, `recorder`, `player`, `examples`, `sdk`
  - Added prettier to the project.
- `recorder`
  - Made it possible to load plugins.
  - Added the Amplitude plugin.
- `examples`
  - Add an example project to demonstrate the `AmplitudePlugin`.

### Changed

- `api`, `recorder`, `player`
  - Bump dependencies to the latest available versions.
  - Update babel config to make use of the latest babel features.
  - Updated all changelog files to point at this specific file. This way all changes can be logged
    and be visible at one location.

## [v4.1.0] - 2019-03-27

### Added

- `api`
  - Added support for creating speech recordings via the SDK.

## [v4.0.2] - 2019-02-11

### Fixed

- `api`
  - Removed adding of the Content-Type header when not needed to add it.

## [v4.0.1] - 2018-12-17

### Packages release

### Added

- `api`
  - Function to take Choice Recognition without streaming.

## [v4.0.0] - 2018-12-12

### Changed

- `api`, `recorder`, `player`
  - Documentation is now build with JSDoc in stead of esdoc.
  - SDK package will not be published anymore.

### Removed

- `api`, `recorder`, `player`
  - SDK as single package
  - Stopwatch
  - VolumeMeter

### Fixed

- `api`, `recorder`, `player`
  - call to this.createAudioContext on AudioContext class needed to call a static member
  - WebAudio recorder can be stopped from paused state.

### Added

- `api`, `recorder`, `player`
  - api package: available through `@itslanguage/api`.
  - player package: available through `@itslanguage/player`.
  - recorder package: available through `@itslanguage/recorder`.
  - Packages are published as UMD build to unpkg.com.
  - Feedback API, streaming audio.

## [v3.1.2]

### Changed

- Version bumps for some used packages
- Update license file with the correct date

## [v3.1.1]

### Added

- Delay for the recorder, start recording after 100ms.

## [v3.1.0]

### Added

- New functions to do proper impersonation, does not require credentials.

### Fixed

- Run travis tests with sudo enabled.

### Changed

- Run travis tests on headless chrome.
- Slack notifications on travis builds.
- Improve README.md documentation.
- Changed the getUserAuth and getOAuth2Token to use the new API auth functions.

[unreleased]: https://github.com/itslanguage/itslanguage-js/compare/v8.0.5...HEAD
[v8.0.5]: https://github.com/itslanguage/itslanguage-js/compare/v8.0.4...v8.0.5
[v8.0.4]: https://github.com/itslanguage/itslanguage-js/compare/v8.0.3...v8.0.4
[v8.0.3]: https://github.com/itslanguage/itslanguage-js/compare/v8.0.2...v8.0.3
[v8.0.2]: https://github.com/itslanguage/itslanguage-js/compare/v8.0.1...v8.0.2
[v8.0.1]: https://github.com/itslanguage/itslanguage-js/compare/v8.0.0...v8.0.1
[v8.0.0]: https://github.com/itslanguage/itslanguage-js/compare/v7.0.0...v8.0.0
[v7.0.0]: https://github.com/itslanguage/itslanguage-js/compare/v6.0.0...v7.0.0
[v6.0.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.7.0...v6.0.0
[v5.7.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.6.1...v5.7.0
[v5.6.1]: https://github.com/itslanguage/itslanguage-js/compare/v5.6.0...v5.6.1
[v5.6.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.5.1...v5.6.0
[v5.5.1]: https://github.com/itslanguage/itslanguage-js/compare/v5.5.0...v5.5.1
[v5.5.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.4.1...v5.5.0
[v5.4.1]: https://github.com/itslanguage/itslanguage-js/compare/v5.4.0...v5.4.1
[v5.4.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.3.0...v5.4.0
[v5.3.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.2.0...v5.3.0
[v5.2.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.1.0...v5.2.0
[v5.1.0]: https://github.com/itslanguage/itslanguage-js/compare/v5.0.1...v5.1.0
[v5.0.1]: https://github.com/itslanguage/itslanguage-js/compare/v5.0.0...v5.0.1
[v5.0.0]: https://github.com/itslanguage/itslanguage-js/compare/v4.2.2...v5.0.0
[v4.2.2]: https://github.com/itslanguage/itslanguage-js/compare/v4.2.1...v4.2.2
[v4.2.1]: https://github.com/itslanguage/itslanguage-js/compare/v4.2.0...v4.2.1
[v4.2.0]: https://github.com/itslanguage/itslanguage-js/compare/v4.1.0...v4.2.0
[v4.1.0]: https://github.com/itslanguage/itslanguage-js/compare/v4.0.2...v4.1.0
[v4.0.2]: https://github.com/itslanguage/itslanguage-js/compare/v4.0.1...v4.0.2
[v4.0.1]: https://github.com/itslanguage/itslanguage-js/compare/v4.0.0...v4.0.1
[v4.0.0]: https://github.com/itslanguage/itslanguage-js/compare/v3.1.2...v4.0.0
[v3.1.2]: https://github.com/itslanguage/itslanguage-js/compare/v3.1.1...v3.1.2
[v3.1.1]: https://github.com/itslanguage/itslanguage-js/compare/v3.1.0...v3.1.1
[v3.1.0]: https://github.com/itslanguage/itslanguage-js/compare/v3.0.1...v3.1.0

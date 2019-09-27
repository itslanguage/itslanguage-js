# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com)
and this project adheres to [Semantic Versioning](http://semver.org).

## [Unreleased]

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

[unreleased]: https://github.com/itslanguage/itslanguage-js/compare/v5.0.1...HEAD
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

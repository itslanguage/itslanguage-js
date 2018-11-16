# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com)
and this project adheres to [Semantic Versioning](http://semver.org).

## [Unreleased]

### Added

- Feedback API.
- WebAudio Player supports pause now.
- WebAudio Player supports volume now.
- Recorder resend header at resume.
- General cleanup in the project.
- Removed some obsolete dependencies.
- Build script that outputs to build directory
  - Prepare and copy the package.json file
    - Remove not needed entries
    - Extend and update the files array
    - Add publishConfig key
  - Copy readme.md and license file
  - Run babel on all the source files and output that to the build directory
  - Run webpack on those sources to create a production and development UMD package

### Fixed

- WebAudio recorder can be stopped from paused state.

## [3.1.2]

### Changed

- Version bumps for some used packages
- Update license file with the correct date

## [3.1.1]

### Added

- Delay for the recorder, start recording after 100ms.

## [3.1.0]

### Added

- New functions to do proper impersonation, does not require credentials.

### Fixed

- Run travis tests with sudo enabled.

### Changed

- Run travis tests on headless chrome.
- Slack notifications on travis builds.
- Improve README.md documentation.
- Changed the getUserAuth and getOAuth2Token to use the new API auth functions.


[Unreleased]: https://github.com/itslanguage/itslanguage-js/compare/v3.1.2...next
[3.1.2]: https://github.com/itslanguage/itslanguage-js/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/itslanguage/itslanguage-js/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/itslanguage/itslanguage-js/compare/v3.0.1...v3.1.0

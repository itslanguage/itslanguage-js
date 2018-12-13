# ITSLanguage JavaScript SDK

Speech technology for language education. 📣

[![Build Status](https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=master)](https://travis-ci.org/itslanguage/itslanguage-js)

The ITSLanguage JavaScript SDK aims to help in building applications for the [ITSLanguage] platform.
It provides easy interfaces to communicate with our [REST and WebSocket API]. We serve several
packages through the [npmjs.com] ecosystem that can be used together. See the table below for all
the packages we deliver.

| Package name | Description |
| :----------- | :---------- |
| [api](packages/api/README.md) | Implements the interface to the ITSLanguage backend as described in our [API docs] |
| [player](packages/player/README.md) | ITSLanguage compatible HTMLAudioElement |
| [recorder](packages/recorder/README.md) | ITSLanguage compatible MediaRecorder |

Besides npm an umd build of each package is also available on unpkg.com.

| Package name | npm | unpkg |
| :----------- | :-- | :---- |
| [api](packages/api/README.md) | [@itslanguage/api] | [unpkg.com/@itslanguage/api/dist/] |
| [player](packages/player/README.md) | [@itslanguage/player] | [unpkg.com/@itslanguage/player/dist/] |
| [recorder](packages/recorder/README.md) | [@itslanguage/recorder] | [unpkg.com/@itslanguage/recorder/dist/] |

## Installation

All the available packages of the SDK will be distributed as npm packages. Package managers that can
can work with the [npmjs.com] registry, like [npm] and [yarn] do, can be used to add SDK packages to
your project. For simplicity this readme assumes [npm] as package manager.
 
Adding ITSLanguage packages into your project is as easy as instructing [npm] to do so. In the case
of npm this will automatically add an entry in your package.json file. If that does not happen, you
are probably using an older [npm] version (< 5.x). Consider upgrading to at least > 5.x.. Note that
ITSLanguage publishes its packages scoped, which means that all packages should be prefixed with
`@itslanguage/PACKAGE_NAME`. 

```bash
# Example installation of the api package
npm install @itslanguage/api
```

**note**: While we describe usage like installing packages through [npm], the ITSLanguage SDK itself
has been build as a so called monorepository managed by [yarn workspaces]. For using the SDK in your
project [yarn] is not a requirement! You can use the package manager which is most comfortable for
you and your project.

**note**: As shown in the table above, all the packages are also published as an UMD bundle via
[unpkg.com]. This makes it possible to install or download the packages _without_ [npm]. All needed
dependencies will also be bundled for convenience. See the example below to get an idea on how to
use it.  
We do recommend usage with a package manager like [npm] or [yarn] though.

```html
<!doctype html>
<html>
  <head>
    <title>Some page title</title>
    <script src="https://unpkg.com/@itslanguage/api@v4.0.0/dist/api.min.js"></script>
    <script>
      // The api is now available through global `itslApi`.
      itslApi.createItslApi();
    </script>
  </head>
  <body>
    Hello, world!
  </body>
</html>

```

## Package usage

Consult the readme files of the packages for more information and documentation. See the table above
for links to the proper readme files.

## Contribute

Want to contribute? Nice! Good to hear, we would love to get help!  
Make sure you read the [code of conduct](CODE_OF_CONDUCT.md) and the
[contribution guidelines](CONTRIBUTING.md).

## Support

To get support on the SDK you can either create a [new] [issue], or e-mail your question to
[support](mailto:support@itslanguage.nl)

[ITSLanguage]: https://www.itslanguage.nl
[npmjs.com]: https://www.npmjs.com
[unpkg.com]: https://unpkg.com
[npm]: https://docs.npmjs.com/cli-documentation
[yarn]: https://yarnpkg.com/en/docs/cli
[yarn workspaces]: https://yarnpkg.com/blog/2017/08/02/introducing-workspaces
[@itslanguage/api]: https://npmjs.com/@itslanguage/api
[@itslanguage/player]: https://npmjs.com/@itslanguage/player
[@itslanguage/recorder]: https://npmjs.com/@itslanguage/recorder
[unpkg.com/@itslanguage/api/dist/]: https://unpkg.com/@itslanguage/api/dist/
[unpkg.com/@itslanguage/player/dist/]: https://unpkg.com/@itslanguage/recorder/dist/
[unpkg.com/@itslanguage/recorder/dist/]: https://unpkg.com/@itslanguage/recorder/dist/
[API docs]: https://itslanguage.github.io/itslanguage-docs
[REST and WebSocket API]: https://itslanguage.github.io/itslanguage-docs
[new]: https://github.com/itslanguage/itslanguage-js/issues/new
[issue]: https://github.com/itslanguage/itslanguage-js/issues

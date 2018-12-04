# ITSLanguage JavaScript SDK

Speech technology for language education.

[![Build Status][build logo]][travis]

The ITSLanguage JavaScript SDK aims to help in building applications for the [ITSLanguage] platform.
It provides easy interfaces to communicate with our [REST and WebSocket API]. We serve several
packages through the [npm] ecosystem that can be used together. Se the table below for all the
packages we deliver.

| Package name | unpkg.com link | Description |
| :----------- | :------------- | :---------- |
| [api]        | [unpkg/@itslanguage/api]      | Implements the interface to the ITSLanguage backend as described in our [API docs] |
| [recorder]   | [unpkg/@itslanguage/recorder] | ITSLanguage compatible MediaRecorder |

## Installation

All the available packages of the SDK will be distributed as npm packages. Package managers that can
can work with the npmjs registry, like [npm] and [yarn], can be used to add SDK packages to your
project. For simplicity this readme assumes [npm] as package manager.
 
Adding ITSLanguage into your project is as easy as instructing [npm] to do so. This will
automatically add an entry in your package.json file. If not, you are probably using an older [npm]
version (< 5.x). Consider upgrading to at least > 5.x.. Note that ITSLanguage publishes its packages
scope, which means that all packages should be prefixed with `@itslanguage/PACKAGE_NAME`. 

```shell
npm install @itslanguage/api
```

**note**: While we describe SDK usage through [npm], the ITSLanguage SDK itself is build with usage
of [yarn] in favor of [npm]. For using the SDK in your project [yarn] is not an requirement. You can
use the package manager which is most comfortable for you and your project.

**note**: As shown in the table above, all the packages are also published via [unpkg.com]. This 
makes it possible to install or download the packages also without npm. All dependencies are also
bundled for convenience. See the example below to get an idea on how to use it. We do recommend
usage through package installation though.

```html
<!doctype html>
<html>
  <head>
    <title>Some page title</title>
    <script src="https://unpkg.com/@itslanguage/api@next/dist/api.min.js"></script>
    <script>
      // The api is now availble through global `itsl.api`.
      itsl.api.createItslSdk();
    </script>
  </head>
  <body>
    Hello, world!
  </body>
</html>

```

## Usage

Consult the package you want to use for more information and documentation.

## Support

To get support on the SDK you can either create a #new issue, or e-mail your question to
[support](mailto:support@itslangauge.nl)

- [api readme](packages/api/README.md)
- [recorder readme](packages/recorder/README.md)

[build logo]: https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=next
[travis]: https://travis-ci.org/itslanguage/itslanguage-js
[ITSLanguage]: https://www.itslanguage.nl
[npm]: https://www.npmjs.com
[yarn]: https://yarnpkg.com
[unpkg.com]: https://unpkg.com
[api]: https://npmjs.com/package/@itslanguage/api 
[recorder]: https://npmjs.com/package/@itslanguage/recorder
[unpkg/@itslanguage/api]: https://unpkg.com/@itslanguage/api@next/dist/api.min.js 
[unpkg/@itslanguage/recorder]: https://unpkg.com/@itslanguage/recorder@next/dist/recorder.min.js 
[API docs]: https://itslanguage.github.io/itslanguage-docs
[REST and WebSocket API]: https://itslanguage.github.io/itslanguage-docs

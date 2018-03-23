# ITSLanguage JavaScript SDK

> Build JavaScript applications for the ITSLanguage platform.

| branch | build status |
| ------ | ------------ |
| master | [![Build Status][master build logo]][travis] |
| next   | [![Build Status][next build logo]][travis] |

## Getting started

Adding ITSLanguage into your JavaScript project is as easy as:

```shell
npm install --save @itslanguage/sdk
```

This will install the latest stable version of the SDK to your project. If you want to live on the
edge you can also try and install our `@next` version. It's just as easy as installing the stable
release, just add the `@next` tag to the install option:

```shell
npm install --save @itslanguage/sdk@next
```

**note**: for existing users, the v3.0.0 release was a scoped release. This means that you can only
install this version by also updating all references to ITSLangauge SDK. An `import { Player } from
'itslanguage';` should be refactored to `import { Player } from '@itslanguage/sdk';`.
The reason for this change is fairly simple: we want our users to be sure they install our software
and using scopes gives us the opportunity to say so. Only we can push new versions to this scope.

**note**: if you're using npm >= 5 in your project you can omit the `--save` flag. That is assumed
by default.

**note**: the ITSLanguage SDK is build with using [yarn] in favor of NPM. For using the SDK in your
own project this is not an requirement.

**Warning**: this will install the ITSLanguage Javascript SDK as a beta package to your project.
Things might not work as expected. For instance the SDK might require a specific backend version
to be able to function with this version to work on. So make sure you now what you're doing when
installing the next branch to your project. Breaking changes will occur.

### Usage

The API docs are released with every version from v3.0.0 and onwards. On our GitHub pages we also
host the latest version available (current master status). For more information on how to use the
SDK the docs are the best place to look. It is an esdoc generated website, which also shows how
one can import that is needed. To import the default audio player you can just do this in your
project:

```js

import { Player } from '@itslanguage/sdk';

```

So, for more usage and examples read our documentation on our github pages.
For the master version look at [the master GitHub pages website]. For our `@next` branch look at
the documentation that is included in the packages (the docs folder).

### Dependencies

This SDK was build with the browser in mind. However any JavaScript project can use this SDK to
build applications for the ITSLanguage platform. There are, however, a few things to keep in mind;
mostly the dependencies. Our development on the SDK is based on browser usage. We don't extensively
test on other platforms. Do let us know if something is not working. And of course, we accept pull
requests!

ITSLanguage JavaScript SDK uses:

1. [The `fetch` API][MDN fetch]
1. [URLSearchParams][MDN URLSearchParams]
1. [FormData][MDN FormData]
1. [WebSocket][MDN WebSocket]

It is expected that these are accessible through their `global` accessors (i.e.
by simply calling `new FormData()`, `fetch(...)`, etc.).

Modern browsers support these (at least to the capacity we use it). Older
browsers as well as `Node` don't necessarily support these because the are, as
of writing this, still seen as experimental (browser) features. They are living
standards and therefore expected to be implemented in the future.

In the mean time; you might want to look at a few libraries which will add
these APIs to your environment. Here are a few we found useful.

#### Browsers

1. [whatwg-fetch][NPM whatwg-fetch]
1. [url-search-params-polyfill][NPM url-search-params-polyfill]

#### Node

1. [node-fetch][NPM node-fetch]
1. [url-search-params][NPM url-search-params]
1. [form-data][NPM form-data]

#### Both

1. [isomorphic-fetch][NPM isomorphic-fetch]

We appreciate any contribution to extend/update these lists. Feel free to contact us on our GitHub
page or drop us a line at support@itslanguage.nl

## The Next Branch

Our `next` branch can be used to try out new features that are coming out in the near future.
Important to keep in mind is that this version possibly does not work on your ITSLanguage
backend environment due to breaking changes. If not sure, drop us a line to find out.

### Current status of next branch

These are the items currently we are currently developing on for the `@next` dist-tag which is
available on npm.

- Add support for streaming audio
- Improve our CI/CD flow for better releases
- Improve communication/authentication mechanism
- Improve websocket communication mechanism
- Improve safari support (macOS and iOS)

[master build logo]: https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=master
[next build logo]: https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=next
[travis]: https://travis-ci.org/itslanguage/itslanguage-js

[the master GitHub pages website]: https://itslanguage.github.io/itslanguage-js/master

[yarn]: https://yarnpkg.com

[MDN fetch]: https://developer.mozilla.org/en/docs/Web/API/Fetch_API
[MDN URLSearchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[MDN FormData]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[MDN WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

[NPM isomorphic-fetch]: https://www.npmjs.com/package/isomorphic-fetch
[NPM form-data]: https://www.npmjs.com/package/form-data
[NPM node-fetch]: https://www.npmjs.com/package/node-fetch
[NPM url-search-params]: https://www.npmjs.com/package/url-search-params
[NPM whatwg-fetch]: https://www.npmjs.com/package/whatwg-fetch
[NPM url-search-params-polyfill]: https://www.npmjs.com/package/url-search-params-polyfill

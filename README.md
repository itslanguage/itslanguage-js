# ITSLanguage JavaScript SDK

> Build JavaScript applications for the ITSLanguage platform.

| branch | build status |
| ------ | ------------ |
| master | [![Build Status][master build logo]][travis] |
| next   | [![Build Status][next build logo]][travis] |

## Getting started

Adding ITSLanguage into your JavaScript project is as easy as:

```shell
npm install --save itslanguage
```

This will install the latest stable version of the sdk to your project. If you want to live on the
edge you can also try and install our `@next` version. It's just as easy as installing the stable
release, just add the `@next` tag to the install option:


```shell
npm install --save itslanguage@next
```

**note**: if you're using npm >= 5 in your project you can ommit the `--save` flag. That is assumed
by default.

**note**: the ITSLanguage SDK is build with using [yarn] in favor of NPM. For using the SDK in your
own project this is not an requirement.

**Warning**: this will install the ITSLanguage Javascript SDK as a beta package to your project.
Things might not work as expected. For instance the sdk might require a specific backend version 
to be able to function with this version to work on. So make sure you now what you're doing when
installing the next branch to your project. Breaking changes will occur.

### Usage

Simply import `itslanguage` in your project. For example:

```js

import { Connection } from 'itslanguage';

```

For more usage and examples read our documentation on [the GitHub pages website].

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

We appreciate any contribution to extend/update these lists. Feel free to contact us on our github
page or drop us a line at support@itslanguage.nl

## The Next Branch

Our `next` branch can be used to try out new features that are coming out in the near future.
Important to keep in mind is that this version possibly does not work on your ITSLanguage
backend environment due to breaking changes. If not sure, drop us a line to find out.  

### Current status of next branch

These are the items currently we are currently developing on for the `@next` dist-tag which is
available on npm.
- Improve our CI/CD flow for better releases
- Improve communication/authentication mechanism
- Improve websocket communication mechanism
- Add safari support (macOS and iOS)

[master build logo]: https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=master
[next build logo]: https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=next
[travis]: https://travis-ci.org/itslanguage/itslanguage-js

[the GitHub pages website]: https://itslanguage.github.io/itslanguage-js/

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

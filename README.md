# ITSLanguage JavaScript SDK

> Build JavaScript applications for the ITSLanguage platform.

[![Build Status](https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=next)](https://travis-ci.org/itslanguage/itslanguage-js)

## Getting started

Adding ITSLanguage into your JavaScript project is as easy as:

```shell
$ npm install --save itslanguage
```

### Dependencies

Any JavaScript project can use this SDK to build applications for the
ITSLanguage platform. There are, however, a few things to keep in mind; mostly
the dependencies. ITSLanguage JavaScript SDK uses:

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

> We appreciate any contribution to extend/update these lists.

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

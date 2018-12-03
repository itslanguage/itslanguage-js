# ITSLanguage JavaScript SDK

Speech technology for language education.

[![Build Status][build logo]][travis]

This JavaScript SDK aims to help our customers to build applications for the [ITSLanguage] platform.
It provides an easy interface to communicate with our [REST and WebSocket API]. For that purpose we
made use of many ES2015 features. Also Promises notation is used a lot to help dealing with
asynchronous code.

## Requirements

The JavaScript SDK was build with the browser in mind. However any JavaScript project can use this
SDK to build applications for the ITSLanguage platform. There are of course a few things to keep in
mind when not developing for the browser. Our own development on the SDK is based on browser usage.
We don't extensively test on other platforms. Do let us know if something is not working by using
the issue tracker here. And of course, we accept pull requests!

ITSLanguage JavaScript SDK uses:

1. [The `fetch` API][MDN fetch]
1. [URLSearchParams][MDN URLSearchParams]
1. [FormData][MDN FormData]
1. [WebSocket][MDN WebSocket]

It is expected that these are accessible through their `global` accessors (i.e. by simply calling
`new FormData()`, `fetch(...)`, etc.).

Modern browsers support these (at least to the capacity we use it). Older browsers as well as `Node`
don't necessarily support these because the are, as of writing this, still seen as experimental 
(browser) features. They are living standards and therefore expected to be implemented in the 
future.

In the mean time; you might want to look at a few libraries which will add these APIs to your
environment. Here are a few we found useful.

### Browser

- [whatwg-fetch][NPM whatwg-fetch]
- [url-search-params-polyfill][NPM url-search-params-polyfill]

### Node.js

- [node-fetch][NPM node-fetch]
- [url-search-params][NPM url-search-params]
- [form-data][NPM form-data]

#### Both

- [isomorphic-fetch][NPM isomorphic-fetch]

## Installation

The ITSLanguage Javascript SDK will be distributed as a [npm package]. Package managers that can
read this registry (like [npm] and [yarn]) can be used to add the SDK to your project's package.json
file. For simplicity this readme assumes [npm] as package manager.
 
Adding ITSLanguage into your project is as easy as instructing [npm] to do so. This will
automatically add an entry in your package.json file. If not, you are probably using an older [npm]
version (< 5.x). Consider upgrading to at least > 5.x. 

```shell
npm install @itslanguage/sdk
```

**note**: While we describe SDK usage through [npm], the ITSLanguage SDK itself is build with usage
of [yarn] in favor of [npm]. For using the SDK in your project [yarn] is not an requirement. You can
use the package manager which is most comfortable for you and your project.

## Usage

At its highest level one can import a factory method to instantiate the SDK. The object created can
then be used to access all other SDK functions. For us this has been found the most common use case.
It is possible of course to import specific features at your own need.

So the next code snippet will demonstrate all you need to import to get started.

```js
// Import the SDK
import { createItslSdk } from '@itslanguage/sdk';

// Instantiate the SDK object
const itslSdk = createItslSdk();
```

### Pre-requirements

To be able to communicate with our backend servers it is (obviously) required to know the url's to
connect to. As part of a user registration we will provide you with the details to get started with.
For demonstration purposes we use the following details:

Connection details
- REST API url: https://api.itslanguage.io (not real)
- WebSocket API url: wss://ws.itslanguage.io (not real)

Authentication details
- Tenant: `demo-tenant`
- Organisation: `demo-school`
- Student user: `student`
- Student password: `student`

### Example: authenticate as a student

Authentication to our backend means you need to get an access token. This token can then be used to
perform certain actions, based on the permission a certain role has. Each user has one or more
roles.

For more information about [roles], [permissions] and or [access tokens] consult our API docs.

You can use the SDK to obtain the access token, or you can pass the access token yourself to the
factory function. In the next example we will instruct the SDK to get the token for us. The SDK will
then store the token so next requests will automatically use the previously obtained token. 

```js

import { createItslSdk } from '@itslanguage/sdk';

// Prepare the options
const options = {
  apiUrl: 'https://api.itslanguage.io',
  wsUrl: 'wss://ws.itslanguage.io',
};

// Instantiate the SDK object
const itslSdk = createItslSdk(options);

// Prepare a user scope
const scope = itslSdk.authentication.assembleScope('demo-tenant', 'demo-school', 'student');

// Authenticate to our backend, returns a promise
const auth = itslSdk.authentication.authenticate('student', 'student-password', scope);

auth.then((authResult) => {
  console.log(authResult); // Will output the token, user and scope for the user obtained.
});

```

### Example: get current user details

As said in the previous example, it is also possible to pass a previously obtained token to the SDK.
Lets get the current user details from the server.

For more information about the [current user] consult our API docs. 

The following example presumes the token to use is `wubbaLubbaDubDub-token`. This token is already
valid for a user with a valid scope. 

```js

import { createItslSdk } from '@itslanguage/sdk';

// Prepare the options
const options = {
  apiUrl: 'https://api.itslanguage.io',
  wsUrl: 'wss://ws.itslanguage.io',
  authorizationToken: 'wubbaLubbaDubDub-token',
};

// Instantiate the SDK object
const itslSdk = createItslSdk(options);

itslSdk.users.getCurrent().then((currentUser) => {
  console.log(currentUser); // Will output the details of the current user.
});

```

[build logo]: https://travis-ci.org/itslanguage/itslanguage-js.svg?branch=master
[travis]: https://travis-ci.org/itslanguage/itslanguage-js
[ITSLanguage]: https://www.itslanguage.nl
[REST and WebSocket API]: https://itslanguage.github.io/itslanguage-docs
[npm]: https://www.npmjs.com/get-npm
[yarn]: https://yarnpkg.com
[npm package]: https://npmjs.org/package/@itslanguage/sdk
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
[roles]: https://itslanguage.github.io/itslanguage-docs/api/roles/index.html
[permissions]: https://itslanguage.github.io/itslanguage-docs/api/permissions/index.html
[access tokens]: https://itslanguage.github.io/itslanguage-docs/api/oauth2/index.html
[current user]: https://itslanguage.github.io/itslanguage-docs/api/users/index.html#get-current-user

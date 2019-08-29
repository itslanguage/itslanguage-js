# ITSLanguage API Package

Speech technology for language education. 📣

The JavaScript API package aims to help our customers to build applications for the [ITSLanguage]
platform. It provides an easy interface to communicate with our [REST and WebSocket API]. For that
purpose we made use of many ES2015 features. Also Promises notation is used a lot to help dealing
with asynchronous code.

## Requirements

The JavaScript API package was build with the browser in mind. However any JavaScript project can
use this package to build applications for the ITSLanguage platform. There are of course a few
things to keep in mind when not developing for the browser. Our own development on this package is
based on browser usage. We don't extensively test on other platforms. Do let us know if something is
not working by using the [issue tracker]. And of course, we accept pull requests!

ITSLanguage JavaScript API package uses:

1. [The `fetch` API][mdn fetch]
1. [URLSearchParams][mdn urlsearchparams]
1. [FormData][mdn formdata]
1. [WebSocket][mdn websocket]

It is expected that these are accessible through their `global` accessors (i.e. by simply calling
`new FormData()`, `fetch(...)`, etc.).

Modern browsers support these (at least to the capacity we use it). Older browsers as well as `Node`
don't necessarily support these because the are, as of writing this, still seen as experimental
(browser) features. They are living standards and therefore expected to be implemented in the
future.

In the mean time; you might want to look at a few libraries which will add these APIs to your
environment. Here are a few we found useful.

### Browser

- [whatwg-fetch][npm whatwg-fetch]
- [url-search-params-polyfill][npm url-search-params-polyfill]

### Node.js

- [node-fetch][npm node-fetch]
- [url-search-params][npm url-search-params]
- [form-data][npm form-data]

#### Both

- [isomorphic-fetch][npm isomorphic-fetch]

## Installation

The ITSLanguage Javascript API pacakge will be distributed as a [npm package]. Package managers that
can read this registry (like [npm] and [yarn]) can be used to add the api to your project's
package.json file. For simplicity this readme assumes [npm] as package manager.

Adding the api package into your project is as easy as instructing [npm] to do so. This will
automatically add an entry in your package.json file. If not, you are probably using an older [npm]
version (< 5.x). Consider upgrading to at least > 5.x.

```shell
npm install @itslanguage/api
```

**note**: While we describe usage like installing packages through [npm], the ITSLanguage SDK itself
has been build as a so called monorepository managed by [yarn workspaces]. The api package is a
package inside the ITSLanguage SDK. For using the api package in your project [yarn] is not a
requirement! You can use the package manager which is most comfortable for you and your project.

**note**: The API packages is also published as an UMD bundle via [unpkg.com]. This makes it
possible to install or download the packages _without_ [npm]. All needed dependencies will also be
bundled for convenience. See the example below to get an idea on how to use it.  
We do recommend usage with a package manager like [npm] or [yarn] though. The examples that follow
asume you've installed the api package with [npm]

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Some page title</title>
    <script src="https://unpkg.com/@itslanguage/api@v5.0.0/dist/api.min.js"></script>
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

## Usage

At its highest level one can import a factory method to instantiate the api. The object created can
then be used to access all other api package functions. For us this has been found the most common
use case. It is possible of course to import specific features at your own need.

So the next code snippet will demonstrate all you need to import to get started.

```js
// Import the api package
import { createItslApi } from '@itslanguage/api';

// Instantiate the api object
const itslApi = createItslApi();
```

### Pre-requirements

To be able to communicate with our backend servers it is (obviously) required to know the url's to
connect to. As part of a user registration we will provide you with the details to get started with.
For demonstration purposes we use the following details:

Connection details

- REST API url: https://api.itslanguage.io (url does not exist, just here for demo purposes!)
- WebSocket API url: wss://ws.itslanguage.io (url does not exist, just here for demo purposes!)

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

You can use the api to obtain the access token, or you can pass the access token yourself to the
factory function. In the next example we will instruct the api to get the token for us. The api will
then store the token so next requests will automatically use the previously obtained token.

```js
import { createItslApi } from '@itslanguage/api';

// Prepare the options
const options = {
  apiUrl: 'https://api.itslanguage.io',
  wsUrl: 'wss://ws.itslanguage.io',
};

// Instantiate the api object
const itslApi = createItslApi(options);

// Prepare a user scope
const scope = itslApi.authentication.assembleScope(
  'demo-tenant',
  'demo-school',
  'student',
);

// Authenticate to our backend, returns a promise
const auth = itslApi.authentication.authenticate(
  'student',
  'student-password',
  scope,
);

auth.then(authResult => {
  console.log(authResult); // Will output the token, user and scope for the user obtained.
});
```

### Example: get current user details

As said in the previous example, it is also possible to pass a previously obtained token to the api.
Lets get the current user details from the server.

For more information about the [current user] consult our API docs.

The following example presumes the token to use is `wubbaLubbaDubDub-token`. This token is already
valid for a user with a valid scope.

```js
import { createItslApi } from '@itslanguage/api';

// Prepare the options
const options = {
  apiUrl: 'https://api.itslanguage.io',
  wsUrl: 'wss://ws.itslanguage.io',
  authorizationToken: 'wubbaLubbaDubDub-token',
};

// Instantiate the api object
const itslApi = createItslApi(options);

itslApi.users.getCurrent().then(currentUser => {
  console.log(currentUser); // Will output the details of the current user.
});
```

[itslanguage]: https://www.itslanguage.nl
[rest and websocket api]: https://itslanguage.github.io/itslanguage-docs
[issue tracker]: https://github.com/itslanguage/itslanguage-js/issues
[unpkg.com]: https://unpkg.com
[npm]: https://www.npmjs.com/get-npm
[yarn]: https://yarnpkg.com
[yarn workspaces]: https://yarnpkg.com/blog/2017/08/02/introducing-workspaces
[npm package]: https://npmjs.org/package/@itslanguage/api
[mdn fetch]: https://developer.mozilla.org/en/docs/Web/API/Fetch_API
[mdn urlsearchparams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[mdn formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[mdn websocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
[npm isomorphic-fetch]: https://www.npmjs.com/package/isomorphic-fetch
[npm form-data]: https://www.npmjs.com/package/form-data
[npm node-fetch]: https://www.npmjs.com/package/node-fetch
[npm url-search-params]: https://www.npmjs.com/package/url-search-params
[npm whatwg-fetch]: https://www.npmjs.com/package/whatwg-fetch
[npm url-search-params-polyfill]: https://www.npmjs.com/package/url-search-params-polyfill
[roles]: https://itslanguage.github.io/itslanguage-docs/api/roles/index.html
[permissions]: https://itslanguage.github.io/itslanguage-docs/api/permissions/index.html
[access tokens]: https://itslanguage.github.io/itslanguage-docs/api/oauth2/index.html
[current user]: https://itslanguage.github.io/itslanguage-docs/api/users/index.html#get-current-user

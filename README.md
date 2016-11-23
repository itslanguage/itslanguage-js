# ITSLanguage JavaScript SDK

## Installing

To add the ITSLanguage SDK to your project:

```js
npm install itslanguage --save
```


## Usage

Simply require `itslanguage` in your project.

```js
const itslanguage = require('itslanguage');
```

The ITSLanguage SDK will be included in your build. For example using [browserify](http://browserify.org/)

Every component of the SDK can be accessed either directly as a property of the `itslanguage` module or directly using `require`.

```js
const audioSdk = require('itslanguage/audio-sdk');
console.log(itslanguage.audioSdk === audioSdk);
```

For more usage examples, see the
[ITSLanguage JavaScript SDK Examples](https://github.com/itslanguage/itslanguage-js-examples).

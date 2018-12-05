# ITSLanguage Player Package

Speech technology for language education. 📣

This project exposes a small wrapper around the HTMLAudioElement that is available in almost all of
the browsers nowadays.

If you are known and comfortable with the `<audio>` element in de browser, or `Audio` in JavaScript
you will be just fine. These two are just an implementation of the HTMLAudioElement.

We can use this element to be able to playback audio in the browser. Audio that is related to the
so called "reference audio", or audio that you have recorded with our recorder.

## Getting started

The package is available on npm. This is the preferred way of usage. Installing the package is as
easy as running `npm install` in the project root where you want to use it. 

```sh
npm install @itslanguage/player
``` 

An example usage, in code:

```js
import createPlayer from '@itslanguage/player';

// Choose an URL to play.
const audioUrl = 'https://ia801605.us.archive.org/5/items/rainbowgold_1705_librivox/rainbowgold_10_various_128kb.mp3';

// Create a HTMLAudioElement instance.
const player = createPlayer(audioUrl);

// At this point our player is ready to rock and roll.
// To start playback, you only need to do this, but mind the note below!
player.play();
```

A special note has to be made about the `player.play()` method as shown above. Calling it as shown
above would be seen, from the browsers point of view, as autoplay. And autoplay is not available
by default. The reason why this is autoplay: the user does has not interacted with some element
to trigger playback.

In a more realistic use case, one would let a user click a button (like a play button) to playback
some audio.

Autoplay _is_ allowed when the audio track is muted. This makes sense for video of course, but for
audio this will not help. 

More information here: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio#attr-autoplay

### Unpkg.com

Note that it is also possible to use an UMD version that has been made available through unpkg.com.
You can do so by placing a script tag inside your HTML and your're good to go. The features that
this library exposes will be set to the global `itsl.player` object. A simplistic example, which
does not follow any best practices (i.e. use at your own risk):

```html
<!doctype html>
<html>
  <head>
    <title>Some page title</title>
    <script src="https://unpkg.com/@itslanguage/api@next/dist/player.min.js"></script>
    <script>
      // The api is now available through global `itsl.player`.
      const audioUrl = 'https://ia801605.us.archive.org/5/items/rainbowgold_1705_librivox/rainbowgold_10_various_128kb.mp3';
      const player = itsl.player.createItslSdk(audioUrl);
      
      // We will use this function as the event handler for the button on the page
      function playAudio() {
        player.play();
      }
    </script>
  </head>
  <body>
    <button onClick="playAudio">Play</button>
  </body>
</html>

```

## API

### createPlayer

```js
createPlayer([audioUrl=null], [secureLoad=false])
```

Create a new instance of a HTMLAudioElement (i.e. `new Audio()` or `<audio></audio>`).

#### Arguments

- ```[audioUrl = null: string]```: optionally, pass an URL to load. 
- ```[secureLoad = false: boolean]```: optionally, add an authorization to the request to download
the audio fragment. This is needed to load audio from the ITSLanguage backend where you need to be
authorised to listen to. Note that if you don't pass an audioUrl, it will skip this flag.

### loadAudioUrl

```js
loadAudioUrl(player, audioUrl, [secureLoad=false])
```

Load a (new) url to an instance of a HTMLAudioElement. Main purpose of this function is to support
a way to add a new url with an "access_token". But it also works for url's in general.

#### Arguments

- ```player: HTMLAudioElement```: the element to change src on. Element is expected to be an
instance of HTMLAudioElement 
- ```audioUrl: string```: pass the url to set as src. 
- ```[secureLoad = false: boolean]```: optionally, add an authorization to the request to download
the audio fragment. This is needed to load audio from the ITSLanguage backend where you need to be
authorised to listen to. Note that if you don't pass an audioUrl, it will skip this flag.


## Read more

To read more on the HTMLAudioElement and learn what you can do with, visit MDN:
https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement

More on the `<audio>` element (which implements the HTMLAudioElement):
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio

The audio player that this little library exposes is perfectly capable in what it should do:
playback audio in a sophisticated way with a rich interface, thanks to the way HTMLAudioElement is
defined (HTMLAudioElement -> HTMLMediaElement -> HTMLElement -> Element -> Node -> EventTarget).

If you find yourself in a situation you want _more_ out of your audio player, don't hesitate to
contact us but also make sure to read up on the Web Audio API in general on MDN:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

[unpkg.com]: https://www.unpkg.com

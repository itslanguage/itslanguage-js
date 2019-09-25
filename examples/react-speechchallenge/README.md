# Speech Recording example

Example project to show how to create a speech recording that will be stored
in the ITSLanguage backend. It makes use of the `@itslanguage/api` and
`@itslanguage/recorder` package.

It will use the default MediaRecorder format.

## Getting started, TL;DR

1. Clone the [itslanguage sdk](https://github.com/itslanguage/itslanguage-js.git) repository;
1. Navigate to the specific example in the examples directory;
1. Run `npm install` or `yarn install`;
1. Run `npm run start` or `yarn run start`;

The example should now be available via [http://localhost:3000](http://localhost:3000).

### Additionally for mobile

If it is required or wanted to access the example from safari on iOS use the
`start:https` command in stead of the `start` command.

1. Run `npm run start:https` or `yarn run start:https`;

The example should now be available via
[https://localhost:3000](https://localhost:3000). Change `localhost` to the
ip-address if requested from mobile.

## Development notes

This example project has been build by using create-react-app. In order to
import from the packages folder the `NODE_PATH` environment has been set which
makes it possible to do absolute imports like
`import { createItslSdk } from 'packages/api`. This is more convenient then
importing with `../../../../packages/api`.

Also the `SKIP_PREFLIGHT_CHECK` variable has been set to be able to boot up the
application.

## Usage notes

To be able to actually test creating a speech recorder, make sure to meet the
following requirements:

- Knowledge of an ITSLangauge API backend to use;
- Knowledge of an ITSLangauge Websocket backend to use;
- Authentication of a user;
- A SpeechChallenge available for this user;

## Getting Started

First make sure the following environment variables are defined: `API_HOST` and `ACCESS_TOKEN`.
It is recommended to make a .env file to define these. The variables in the .env file will be
made available to the application when it is started. Set `API_HOST` to the url of the
itslanguage API and set `ACCESS_TOKEN` to the OAuth client credentials token. To make an OAuth
token see https://api.itslanguage.nl/ui. Here is an example of a `.env` file:

```bash
API_HOST=https://api.itslanguage.nl
ACCESS_TOKEN=IRaFqpwe03UF4EhVJwg0MJZwzt6F1AjwU4e7UuRuuz
```

To use the example you will need to have a prompt. A prompt consists of a text and a language.
Please refer to https://api.itslanguage.nl/ui/#/Prompt/itsapi.api.prompt.post on how to make
a prompt.

Then install the dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install
yarn dev
```

Visit `localhost:3000` in your browser to see the webpage. Click on load prompt. If the prompt
does not load please make sure the API_HOST and ACCESS_TOKEN variables are correct. The prompt
should be loaded and the text of the prompt will appear. When you click start the browser will
attempt to use your microphone to make a realtime analysis. (Results are send after every
sentence or '\_eos'). The results of the analysis are printed in the console (Note: you can
view the console by pressing the F12 key). Press stop when you are done. The recording will
be available as a media element.

This example makes use of nextjs API routes to securely access the itslanguage API. When
implementing the itslanguage API please make sure that the `ACCESS_TOKEN` is not made public.
Everyone that has the access token is able to read, make and delete all recordings and prompts
that you have made.

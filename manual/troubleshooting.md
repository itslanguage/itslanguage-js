# Troubleshooting

## Webpack Error: Module not found

The `ws` module needs to be ignored. In your Webpack configuration, make sure the following is included:

```js
const webpack = require('webpack');


module.exports = {
  plugins: [
    webpack.IgnorePlugin(/^ws$/)
    ...
  ],
  ...
};
```


## Websocket calls are not responding

The project must be served over SSL.

When using `webpack-dev-server`, make sure to add the `--https` flag.

The browser might show a warning that the website is insecure. Just ignore this warning and continue.

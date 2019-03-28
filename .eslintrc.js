const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8'),
);

module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: ['plugin:jasmine/recommended', 'airbnb-base', 'prettier'],
  plugins: ['jasmine', 'prettier'],
  env: {
    jasmine: true,
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    expectAsync: true,
  },
  rules: {
    'prettier/prettier': ['error', prettierOptions],
    'no-console': 0, // This project purposely uses console.
    'jasmine/no-spec-dupes': [1, 'branch'],
  },
};

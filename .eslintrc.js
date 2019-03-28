module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: [
    'airbnb-base',
    'plugin:jasmine/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['jasmine'],
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
    'no-console': 0, // This project purposely uses console.
    'jasmine/no-spec-dupes': [1, 'branch'],
  },
};

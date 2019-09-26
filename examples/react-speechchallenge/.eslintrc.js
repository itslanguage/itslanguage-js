module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'plugin:prettier/recommended', 'prettier/react'],
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  env: {
    jest: true,
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    'import/no-extraneous-dependencies': 0,
    'react/jsx-filename-extension': 0,
    'react/prefer-stateless-function': 0,
  },
};

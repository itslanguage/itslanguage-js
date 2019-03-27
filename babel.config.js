module.exports = (api) => {
  const env = api.env();
  const test = env === 'test';

  const presets = [
    [
      '@babel/preset-env',
      {
        spec: false,
        loose: true,
        useBuiltIns: 'usage',
        corejs: 3,
        targets: {
          esmodules: true,
        },
        modules: false,
      },
    ],
  ];

  const plugins = [
    ['@babel/plugin-proposal-class-properties', {
      loose: true,
    }],
    ['@babel/plugin-proposal-object-rest-spread', {
      loose: true,
      useBuiltIns: true,
    }],
    test && [
      'babel-plugin-istanbul', {
        exclude: [
          '**/*.spec.js',
        ],
      },
    ],
  ];

  return {
    presets,
    plugins: plugins.filter(Boolean),
  };
};

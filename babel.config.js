module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          esmodules: true,
        },
        modules: false,
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', {
      loose: true,
    }],
    ['@babel/plugin-proposal-object-rest-spread', {
      loose: true,
      useBuiltIns: true,
    }],
  ],
  env: {
    test: {
      presets: [
        '@babel/preset-env',
      ],
      plugins: [
        [
          'istanbul', {
            exclude: [
              'test/**',
              '**/*.spec.js',
            ],
          },
        ],
      ],
    },
  },
};

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
    '@babel/plugin-proposal-class-properties',
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

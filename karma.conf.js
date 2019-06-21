module.exports = config => {
  const configuration = {
    frameworks: ['browserify', 'jasmine'],
    files: ['packages/**/*.spec.js'],
    browsers: ['CustomChromeHeadLess'],
    customLaunchers: {
      CustomChromeHeadLess: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--use-fake-device-for-media-stream',
          '--use-fake-ui-for-media-stream',
        ],
      },
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      check: {
        each: {
          statements: 100,
          branches: 80,
          functions: 100,
          lines: 100,
        },
        global: {
          statements: 100,
          branches: 80,
          functions: 100,
          lines: 100,
        },
      },
      reporters: [
        {
          type: 'html',
          dir: 'coverage/',
          subdir: 'report-html',
        },
        {
          type: 'text',
        },
        {
          type: 'json',
        },
      ],
      instrumenterOptions: {
        istanbul: {
          noCompact: true,
        },
      },
    },
    preprocessors: {
      'packages/**/*.spec.js': ['browserify'],
    },
    browserify: {
      debug: true,
      transform: [['babelify', { configFile: './babel.config.js' }]],
    },
  };

  config.set(configuration);
};

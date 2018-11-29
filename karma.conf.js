module.exports = (config) => {
  const configuration = {
    frameworks: [
      'browserify',
      'jasmine',
    ],
    files: [
      'packages/**/*.spec.js',
      'test/**/*.js',
      'src/**/*.spec.js',
    ],
    browsers: [
      'ChromeHeadless',
    ],
    transports: ['polling'],
    customLaunchers: {
      ChromeTravisCi: {
        base: 'ChromeHeadless',
        flags: ['--headless --disable-gpu'],
      },
    },
    reporters: [
      'progress',
      'coverage',
    ],
    coverageReporter: {
      check: {
        each: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
        global: {
          statements: 50,
          branches: 50,
          functions: 50,
          lines: 50,
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
      'test/**/*.js': ['browserify'],
      'src/**/*.spec.js': ['browserify'],
    },
    browserify: {
      entries: 'src/index.js',
      debug: true,
      transform: [
        'babelify',
      ],
    },
  };

  if (process.env.TRAVIS) {
    configuration.browsers = [
      'ChromeTravisCi',
    ];
  }

  config.set(configuration);
};

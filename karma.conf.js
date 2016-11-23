const istanbul = require('browserify-istanbul');


module.exports = config => {
  const configuration = {
    frameworks: [
      'browserify',
      'jasmine'
    ],
    files: [
      'test/**/*.js'
    ],
    browsers: [
      'Chrome'
    ],
    customLaunchers: {
      ChromeTravisCi: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    reporters: [
      'progress',
      'coverage'
    ],
    coverageReporter: {
      check: {
        each: {
          statements: 5,
          branches: 5,
          functions: 5,
          lines: 5
        },
        global: {
          statements: 40,
          branches: 30,
          functions: 20,
          lines: 30
        }
      },
      reporters: [
        {
          type: 'html',
          dir: 'coverage/',
          subdir: 'report-html'
        },
        {
          type: 'text'
        },
        {
          type: 'json'
        }
      ]
    },
    preprocessors: {
      'test/**/*.js': ['browserify']
    },
    browserify: {
      entries: './index.js',
      debug: true,
      transform: [
        istanbul({instrumenter: require('isparta')}),
        'babelify'
      ]
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = [
      'ChromeTravisCi'
    ];
  }

  config.set(configuration);
};

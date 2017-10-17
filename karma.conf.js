const istanbul = require('browserify-istanbul');


module.exports = config => {
  const configuration = {
    frameworks: [
      'browserify',
      'jasmine'
    ],
    files: [
      'node_modules/babel-polyfill/dist/polyfill.min.js',
      'test/**/*.js',
      'src/**/*.spec.js'
    ],
    browsers: [
      'Chrome'
    ],
    transports: ['polling'],
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
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
        },
        global: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
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
      'test/**/*.js': ['browserify'],
      'src/**/*.spec.js': ['browserify']
    },
    browserify: {
      entries: 'src/index.js',
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

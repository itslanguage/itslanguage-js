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
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100
        },
        global: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100
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

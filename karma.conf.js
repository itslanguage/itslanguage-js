const istanbul = require('browserify-istanbul');


module.exports = config => {
  config.set({
    frameworks: [
      'browserify',
      'jasmine'
    ],
    files: [
      'test/**/*.js'
    ],
    browsers: [
      'PhantomJS'
    ],
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
        'babelify',
        istanbul()
      ]
    }
  });
};

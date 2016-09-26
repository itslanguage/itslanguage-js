module.exports = config => {
  config.set({
    frameworks: [
      'browserify',
      'jasmine'
    ],
    files: [
      'node_modules/jasmine-promises/dist/jasmine-promises.js',
      'test/*.js'
      // 'src/*.js'
      // 'test/pronunciationAnalysisSpec.js',
      // 'test/speechRecordingSpec.js'
    ],
    browsers: [
      'PhantomJS'
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'test/*.js': ['browserify'],
      '**/*.js': ['coverage']
    },

    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },
    browserify: {
      entries: './index.js',
      debug: true,
      transform: ['babelify']
    }
  });
};

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
    preprocessors: {
      'test/**/*.js': ['browserify']
    },
    browserify: {
      entries: './index.js',
      debug: true,
      transform: ['babelify']
    }
  });
};

/**
 *
 * This is the ITSLanguage Javascript SDK build script! It constructs a directory which can be
 * deployed to npm registry. It will produce a package with some "regular" meta data (pacakge.json,
 * README.md and a license file) but it will also generate an es6 build (copy) and UMD build.
 * The later will be generated with rollup.
 *
 * To get into some details, the following files are copied to build/: src/*.js, package.json,
 * README.md and LICENSE.
 *
 * The package.json gets some special attention. Some information that is not needed in the
 * final npm package is being removed (like scripts, devDepenncies, the private flag, etc). Also
 * the paths to the modules (=mjs folder) and the UMD build are being set here.
 *
 * The files under src/ will also get a special treatment. At first, all files as is will be copied
 * to build/src folder. No adjustments to the content wil be made. Since these file are essentially
 * michael jackson files (okay okay, lets call them javascript modules) they are also all renamed to
 * the .esm.js extension.
 */

const fs = require('fs-extra'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path');
const babel = require('@babel/core'); // eslint-disable-line import/no-extraneous-dependencies
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const pkg = require('../package.json');


// Set the output path
const OUTPUT_DIR = path.resolve('build');
const SRC_DIR = path.resolve('src');
const OUTPUT_SRC_DIR = path.resolve(path.join(OUTPUT_DIR, 'lib'));
const OUTPUT_DIST_DIR = path.resolve(path.join(OUTPUT_DIR, 'dist'));


// Start the async chain!
let promise = Promise.resolve();


// Cleanup everything first!
promise = promise.then(() => fs.emptyDirSync(OUTPUT_DIR));


// Prepare some directory sturctures
promise = promise.then(() => fs.ensureDirSync(OUTPUT_SRC_DIR));
promise = promise.then(() => fs.ensureDirSync(OUTPUT_DIST_DIR));


// Prepare and write package.json
promise = promise.then(() => {
  // Delete some keys we don't need
  delete pkg.private;
  delete pkg.scripts;
  delete pkg['lint-staged'];
  delete pkg['pre-commit'];
  delete pkg.devDependencies;

  // Set some keys for access
  pkg.publishConfig = {
    access: 'public',
    tag: 'next',
  };

  // Set the path to the correct src
  pkg.main = 'lib/index.js';
  pkg.modules = 'lib/index.js';

  // Remove ./src from the files array
  pkg.files = pkg.files.filter(file => file !== 'src/');

  // Add dist to the file array, because it wil exist after this script ends.
  pkg.files.push('lib/');
  pkg.files.push('docs/');
  pkg.files.push('dist/');

  // Write the file to its desired output location
  fs.writeFileSync(path.join(OUTPUT_DIR, 'package.json'), JSON.stringify(pkg, null, '  '));
});


// Copy LICENSE and README.md
promise = promise.then(() => {
  fs.writeFileSync(path.join(OUTPUT_DIR, 'LICENSE'), fs.readFileSync('LICENSE'));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), fs.readFileSync('README.md'));
});


/**
 * Generate a list of files that live inside a given directory. If the given directory has any
 * sub-folders this function will traverse them and add the files to the list.
 *
 * This function filters out *.spec.js files (these are test files).
 *
 * @param {string} dir - The directory to create the list for.
 * @param {Array} files - Filelist with the files in the directory. Used for recursion.
 * @returns {Array} - List with files in the directory.
 */
function getFileList(dir, files = []) {
  let fileList = [...files];

  fs.readdirSync(dir).forEach((file) => {
    if (fs.statSync(`${dir}/${file}`).isDirectory()) {
      fileList = getFileList(`${dir}/${file}`, fileList);
    } else if (!file.includes('.spec.js')) {
      fileList.push(path.join(dir, file));
    }
  });

  return fileList;
}

// Get all files, make sure they exist, copy the content to it!
promise = promise.then(() => {
  getFileList(SRC_DIR).forEach((file) => {
    let inputFile = fs.readFileSync(file);
    const output = file
      .replace(SRC_DIR, OUTPUT_SRC_DIR);

    // Make sure the file to output to exists!
    fs.ensureFileSync(output);

    // Transpile it
    inputFile = babel.transformSync(inputFile, { filename: file, babelrc: true }).code;

    // Write it!
    fs.writeFileSync(output, inputFile);
  });
});

// Build the UMD assets with webpack!
['development', 'production'].forEach((mode) => {
  promise = promise.then(() => new Promise((resolve, reject) => {
    webpack({
      mode,
      entry: `${OUTPUT_SRC_DIR}/index.js`,
      output: {
        path: OUTPUT_DIST_DIR,
        filename: `sdk.bundle.${mode === 'development' ? '' : 'min.'}js`,
        library: 'itslSdk',
        libraryTarget: 'umd',
      },
    }, (err, stats) => {
      if (err) {
        reject(err);
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        reject(info.errors);
      }

      if (stats.hasWarnings()) {
        resolve();
      }

      console.log(stats.toString({
        chunks: false,
      }));

      resolve();
    });
  }));
});

// Uh oh, errors!
promise.catch((err) => {
  console.error(err.stack);
  process.exit(1);
});

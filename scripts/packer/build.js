const path = require('path');
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const bundles = require('./bundles');
const {
  asyncForEach,
  asyncRimRaf,
  asyncExecuteCommand,
  asyncCopyTo,
} = require('./utils');

/**
 * A bundle is allowed to specify files to be copied to the destination folder
 *
 * @param {Array} files - Files to copy.
 * @param {string} from - Path where to copy the files from.
 * @param {string} to - Path where to copy the files to.
 * @returns {Promise<void>}
 */
async function copyBundleFiles(files, from, to) {
  try {
    await asyncForEach(files, async (file) => {
      try {
        await asyncCopyTo(`${from}/${file}`, `${to}/${file}`);
      } catch (error) {
        console.warn('copying the file went wrong');
        console.warn(error);
      }
    });
  } catch (error) {
    console.warn('something went wrong with the bundle.files list');
    console.warn(error);
  }
}

/**
 * Use babel-cli to transpile the code.
 *
 * @param {string} entry - Name of the package.
 * @param {string} from - Diractory to transpile code for.
 * @param {string} to - Location where to put the transpiled files.
 * @returns {Promise<void>}
 */
async function transpileCode(entry, from, to) {
  try {
    await asyncExecuteCommand((
      `babel ${from} --out-dir ${to} --ignore "${from}/**/*.spec.js"`
    ));
    console.log('babel done!');
  } catch (error) {
    console.error(`something went wrong while trying to transpile some code for ${entry}`);
    console.error(error);
  }
}

/**
 * Run JSDOC on the packages sources and put them into a folder called 'jsdoc' (in the
 * buid/package folder). The README.md file from the package is also used in the output.
 *
 * @param {string} srcPath - Path to use the generate the jsdoc sources from.
 * @param {string} destPath - Path where to put the docs. Will always be appended with 'jsdoc'.
 * @returns {Promise}
 */
async function runJsdoc(srcPath, destPath) {
  const jsdocConfig = path.resolve('jsdoc.json');
  try {
    await asyncExecuteCommand((
      `jsdoc ${srcPath} -c ${jsdocConfig} -d ${destPath}/jsdoc -R ${srcPath}/README.md`
    ));
    console.log('jsdoc done!');
  } catch (error) {
    console.error(`something went wrong while trying to run jsdoc for ${srcPath}`);
    console.error(error);
  }
}

/**
 * Use webpack to create an UMD bundle of the packages. This is convenient, since the packages that
 * need to be deployed to NPM will also allow to include a single file through unpkg.com.
 *
 * @param {string} sourcePath - Path to start packing.
 * @param {string} entry - Name of the pacakge.
 * @param {string} library - Name of the library to create.
 * @param {string} mode - In which mode to run webpack. Take a look at {@see https://webpack.js.org/concepts/mode/}
 * for more information.
 * @returns {Promise}
 */
function pack(sourcePath, entry, library, mode = 'production') {
  return new Promise((resolve, reject) => {
    // Generate an externals object from the bundle information
    const externals = bundles.reduce((acc, bundle) => {
      acc[`@itslanguage/${bundle.entry}`] = {
        commonjs: bundle.entry,
        commonjs2: bundle.entry,
        amd: bundle.entry,
        root: bundle.entry,
      };
      return acc;
    }, {});

    // Create the bundle!
    webpack({
      mode,
      entry: `${sourcePath}/index.js`,
      output: {
        path: `${sourcePath}/dist`,
        filename: `${entry}.${mode === 'development' ? '' : 'min.'}js`,
        library,
        libraryTarget: 'umd',
      },
      externals,
    }, (err, stats) => {
      if (err) {
        reject(err);
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        reject(info.errors);
      }

      if (stats.hasWarnings()) {
        console.log('Packing is done!');
        resolve();
      }

      console.log(stats.toString({
        chunks: false,
      }));

      console.log('Packing is done!');
      resolve();
    });
  });
}

/**
 * Do-all-the-things function. Will kick of all the steps that require a valid @itslanguage package
 * build.
 *
 * @param {Object} bundle - Specfied bundle from bundle.js.
 * @returns {Promise}
 */
async function createBundle(bundle) {
  console.log(`Processing ${bundle.entry}`);
  const SRC_DIR = path.resolve(`packages/${bundle.entry}`);
  const DEST_DIR = path.resolve(`build/${bundle.entry}`);

  // 1. Use babel to transform AND copy shizzle!
  await transpileCode(bundle.entry, SRC_DIR, DEST_DIR);

  // 2. Copy some files
  await copyBundleFiles(bundle.files, SRC_DIR, DEST_DIR);

  // 3. Create module bundle
  await pack(DEST_DIR, bundle.entry, bundle.library);
  await pack(DEST_DIR, bundle.entry, bundle.library, 'development');

  // 4. Run jsdoc
  await runJsdoc(SRC_DIR, DEST_DIR);
}

/**
 * Init function where it all starts. Some housekeeping first of course.
 *
 * @returns {Promise}
 */
async function buildAll() {
  // Clean any previous build
  try {
    await asyncRimRaf('build');
  } catch (error) {
    console.error('cleanup the build directory failed');
    console.error(error);
  }

  try {
    // Loop over the bundles to create a.. bundle!
    await asyncForEach(bundles, async (bundle) => {
      try {
        await createBundle(bundle);
      } catch (error) {
        console.warn(`createBundle for ${bundle.entry} failed`);
        console.warn(error);
      }
    });
  } catch (error) {
    console.warn('something went wrong with the bundle list');
    console.warn(error);
  }
}

buildAll();

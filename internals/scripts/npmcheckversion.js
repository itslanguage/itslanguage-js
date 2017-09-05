/**
 *
 * Script to check node and npm version.
 * Set MINIMAL_NODE and MINIMAL_NPM to your needs.
 *
 * Note: package.json also provides a way zo set minimal node and npm version
 *       through the `engines` key. Note that these will be used when your
 *       package is required in another package. That is not the same as the
 *       version check this script does.
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const PACKAGE_NAME = 'ITSLanguage SDK';
const MINIMAL_NODE = 8.0;
const MINIMAL_NPM = 5.0;

/**
 * Send all logged errors to the console and exit.
 *
 * @param {Error,Array} errors - Error or array with Error's to display.
 */
function logErrors(errors) {
  [].concat(errors).forEach(error => {
    console.error(error);
    console.log('\n');
  });
  process.exit(1); // eslint-disable-line no-process-exit
}

/**
 * Given a program, ask for its version, and return that.
 *
 * @param {string} program - Program to get version for.
 * @returns {Promise.<*>} - Version of the program you asked for.
 */
async function checkVersionFor(program = null) {
  if (!program) {
    logErrors(new Error('You need to specify a program to check the version for'));
  }

  const {err, stdout} = await exec(`${program} --version`);

  if (err) {
    logErrors(err);
  }
  return stdout;
}

/**
 * Async function to check a couple of application versions.
 */
async function checkVersions() {
  try {
    const [npmVersion, nodeVersion] = await Promise.all([checkVersionFor('npm'), checkVersionFor('node')]);

    const errors = [];

    if (parseFloat(nodeVersion.split('.')[0].replace('v', '')) < MINIMAL_NODE) {
      errors.push(new Error(`${PACKAGE_NAME} relies on node version @>=${MINIMAL_NODE}`));
    }

    if (parseFloat(npmVersion.split('.')[0]) < MINIMAL_NPM) {
      errors.push(new Error(`${PACKAGE_NAME} relies on node version @>=${MINIMAL_NPM}`));
    }

    if (errors.length > 0) {
      logErrors(errors);
    }
  } catch (error) {
    logErrors(error);
  }
}

/**
 * Hello, world!
 * Start all the action.
 */
checkVersions();

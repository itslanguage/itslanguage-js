const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra'); // eslint-disable-line import/no-extraneous-dependencies
const ncp = require('ncp'); // eslint-disable-line import/no-extraneous-dependencies
const rimraf = require('rimraf'); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Asynchronously run a system command.
 * Inspired by the React rollup/utils.js file.
 *
 * @param command
 * @returns {Promise}
 */
function asyncExecuteCommand(command) {
  return new Promise((resolve, reject) =>
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    }),
  );
}

/**
 * Asynchronously empty a folder.
 * Inspired by the React rollup/utils.js file.
 *
 * @param filepath
 * @returns {Promise}
 */
function asyncRimRaf(filepath) {
  return new Promise((resolve, reject) =>
    rimraf(filepath, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    }),
  );
}

/**
 * Copy files async, use ncp for the actual copy.
 * Inspired by the React rollup/utils.js file.
 *
 * @param {string} from - Path (directory or path to file) to copy.
 * @param {string} to - Location (path or file path) to copy to.
 * @returns {Promise}
 */
function asyncCopyTo(from, to) {
  return fs.ensureDir(path.dirname(to)).then(
    () =>
      new Promise((resolve, reject) => {
        ncp(from, to, error => {
          if (error) {
            // Wrap to have a useful stack trace.
            reject(new Error(error));
            return;
          }
          resolve();
        });
      }),
  );
}

/**
 * A custom forEach implementation to enforce. Because of its callback nature, forEach and
 * async/await don't play nice together, or at least, don't work as expected. In order to really
 * wait for a forEach to finish, you can either use a Promise.all([].map), or this custom forEach
 * function. Downside of the Promise.map is that inside of the map, order will be random.
 *
 * For more information on this subject, go and read!
 * @see https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
 *
 * @param {Array} array - Array to loop over.
 * @param {Function} callback - Callback to run at each item.
 * @returns {Promise<void>} - a Promise.
 */
async function asyncForEach(array, callback) {
  let index = 0;
  const total = array.length;
  for (index; index < total; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}

module.exports = {
  asyncExecuteCommand,
  asyncRimRaf,
  asyncCopyTo,
  asyncForEach,
};

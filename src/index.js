'use strict';

var Promise = require('bluebird');

var browserManager = require('./browser.js');

/**
 * Takes a screenshot
 * @param {Object} options The first number.
 * @returns {Promise} Resolves to image object
 */
module.exports = function (options) {
  return new Promise(function (resolve, reject) {
    browserManager
    .getBrowser()
    .then(function (browser) {
      browser
      .screenshot(options)
      .then(resolve)
      .catch(reject);
    })
    .catch(reject);
  });
};

/**
 * Close the browser
 * @returns {void}
 */
module.exports.close = function () {
  browserManager.close();
};

// Ensure that the Browser instance will be closed on exit
process.on('exit', module.exports.close);

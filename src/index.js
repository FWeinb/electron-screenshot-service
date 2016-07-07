'use strict';

var browser = require('./browser.js');

/**
 * Takes a screenshot
 * @param {Object} options The first number.
 * @returns {Promise} Resolves to image object
 */
module.exports = browser.screenshot.bind(browser);

/**
 * Scale the avaiable browser instance to i browser
 * @param {Number} i The number of browser to use.
 */
module.exports.scale = function (scale) {
	var browserChange = scale - browser.count;
	if (browserChange < 0) {
		for (var i = 0; i < -browserChange; i++) {
			browser.close();
		}
	} else {
		for (var b = 0; b < browserChange; b++) {
			browser.createBrowser();
		}
	}
};

/**
 * Close one browser
 * @returns {void}
 */
module.exports.close = function () {
	browser.closeAll();
};

// Ensure that the Browser instance will be closed on exit
process.on('exit', module.exports.close);

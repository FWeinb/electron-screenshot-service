'use strict';

var path = require('path');
var axon = require('axon');
var spawn = require('cross-spawn-async');

var electronpath = require('electron-prebuilt');
var app = path.join(__dirname, '../', 'electron-service');
var sock = axon.socket('req');

var startElectron = function () {
	spawn(electronpath, ['.'], {
		cwd: app
	});
};

var bindSocketPromise;
var bindSocket = function () {
	if (bindSocketPromise) {
		return bindSocketPromise;
	}

	bindSocketPromise = new Promise(function (resolve) {
		sock.bind(undefined, 'localhost', function () {
			process.env.ELECTRON_SCREENSHOT_PORT = sock.server.address().port;
			resolve();
		});
	});

	return bindSocketPromise;
};

var screenshot = function (options) {
	return new Promise(function (resolve, reject) {
		options.delay = options.delay || 0;

		if (!options.width || !options.height) {
			reject(new Error('At least `height` and `width` must be set'));
			return;
		}

		if (options.crop) {
			if (!options.crop.x) {
				options.crop.x = 0;
			}
			if (!options.crop.y) {
				options.crop.y = 0;
			}
			if (!options.crop.width || !options.crop.height) {
				reject(new Error('In crop, at least `height` and `width` must be set'));
				return;
			}
		}

		sock.send('take-screenshot', options, function (error, img) {
			if (error) {
				reject(new Error(error));
				return;
			}
			// Make axon data a real buffer again
			img.data = new Buffer(img.data.data);
			resolve(img);
		});
	});
};

module.exports = {

	count: 0,

	screenshot: function (options) {
		if (this.count === 0) {
			return this.createBrowser()
			.then(screenshot.bind(null, options));
		}

		return screenshot(options);
	},

	createBrowser: function () {
		this.count++;
		return bindSocket()
		.then(function () {
			startElectron();
		});
	},

	close: function () {
		if (this.count > 0) {
			sock.send('close');
		}
	},

	closeAll: function () {
		for (var i = 0; i < this.count; i++) {
			sock.send('close');
		}
		sock.close();
		bindSocketPromise = undefined;
		this.browserCount = 0;
	}
};

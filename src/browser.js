'use strict';

var path = require('path');
var axon = require('axon');
var spawn = require('cross-spawn');

var electronpath = require('electron-prebuilt');
var app = path.join(__dirname, '../', 'electron-service');
var sock = axon.socket('req');

var async = require('async');

var bindSocketPromise;
var bindSocket = function () {
	if (bindSocketPromise) {
		return bindSocketPromise;
	}

	bindSocketPromise = new Promise(function (resolve) {
		sock.bind(0, 'localhost', function () {
			process.env.ELECTRON_SCREENSHOT_PORT = sock.server.address().port;
			resolve();
		});
	});

	return bindSocketPromise;
};

sock.on('close', function() {
	console.log('sock closed');
});
sock.on('error', function(err) {
	console.log('sock error' + err);
});
sock.on('connect', function() {
	console.log('sock connect');
});
sock.on('disconnect', function() {
	console.log('sock disconnect');
});

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

		console.log('Taking screenshot');
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
		console.log(this.count);
		if (this.count === 0) {
			console.log('Creating new browser.');
			return this.createBrowser()
			.then(screenshot.bind(null, options));
		}

		return screenshot(options);
	},

	createBrowser: function () {
		var self = this;
		this.count++;
		return bindSocket()
		.then(function () {
			spawn(electronpath, ['.'], {
				cwd: app
			})
			.once('close', function () {
			});
		});
	},

	close: function () {
		if (this.count > 0) {
			console.log('Closing browser.');
			sock.send('close', {}, function(msg) {
				console.log('Closed browser.');
				done();
			});
		}
	},

	closeAll: function (callback) {
		var browsers = [];
		var self = this;

		console.log('Closing ' + this.count + ' browsers.');

		for (var i = 0; i < this.count; i++) {
			browsers.push(i);
		}

		async.eachSeries(browsers, function (item, done) {
			console.log('Closing browser.');
			sock.send('close', {}, function(msg) {
				console.log('Closed browser.');
				done();
			});
		}, function() {
			console.log('All browsers closed. Return.');
			sock.close();
			bindSocketPromise = undefined;
			self.count = 0;
			callback();
		});
	}
};

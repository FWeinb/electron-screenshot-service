'use strict';

var path = require('path');

var axon = require('axon');
var spawn = require('win-spawn');
var Promise = require('bluebird');

var electronpath = require('electron-prebuilt');
var app = path.join(__dirname, '../', 'electron-service');

var Browser = function (sock) {
  this.sock = sock;
};

Browser.prototype.screenshot = function (options) {
  var deferred = Promise.pending();

  options.delay = options.delay || 0;

  if (!options.width || !options.height) {
    deferred.reject(new Error('At least `height` and `width` must be set'));
    return deferred.promise;
  }

  if (options.crop) {
    if (!options.crop.x) { options.crop.x = 0; }
    if (!options.crop.y) { options.crop.y = 0; }
    if (!options.crop.width || !options.crop.height) {
      deferred.reject(new Error('In crop, at least `height` and `width` must be set'));
      return deferred.promise;
    }
  }

  this.sock.send('take-screenshot', options, function (error, img) {
    if (error) { deferred.reject(error); return; }

    // Make axon data a real buffer again
    img.data = new Buffer(img.data.data);

    deferred.resolve(img);
  });

  return deferred.promise;
};

var isStarted;
var sock;
var child;

var createBrowser = function () {
  sock = axon.socket('req');

  isStarted = new Promise(function (resolve, reject) {

    sock.on('connect', function () {
      resolve(new Browser(sock));
    });

    sock.on('error', function (error) {
      reject({type: 'socket', error: error});
    });

    // Start the server on a free port
    sock.bind(undefined, 'localhost', function () {
      process.env.PORT = sock.server.address().port;
      child = spawn(electronpath, [
        '.'
      ],
      {
        cwd: app,
        stdio: 'ignore'
      });

      child.on('exit', function (error) {
        reject({type: 'electron', path: electronpath, error: error});
      });
    });

  });

  return isStarted;
};

module.exports = {

  getBrowser: function () {
    return isStarted || createBrowser();
  },

  close: function () {
    isStarted = undefined;
    if (sock) {
      try {
        sock.close();
        child.kill();
      } catch(e) {
        (function noop() {})();
      }
    }
  }
};

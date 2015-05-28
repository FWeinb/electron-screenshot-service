'use strict';

var path = require('path');

var axon = require('axon');
var spawn = require('win-spawn');
var Promise = require('bluebird');

var electronpath = require('../paths');
var app =  path.join(__dirname, '../', 'electron-screenshot');

var Browser = function( sock ) {
  this.sock = sock;
};

Browser.prototype.screenshot = function( options ) {
  var deferred = Promise.pending();

  options.delay = options.delay || 0;

  if ( !options.width || !options.height) {
    deferred.reject(new Error('At least `height` and `width` must be set'));
    return deferred.promise;
  }

  if (options.crop) {
    if (!options.crop.x) { options.crop.x = 0; }
    if (!options.crop.y) { options.crop.y = 0; }
    if (!options.crop.width || !options.crop.height) {
     deferred.reject(new Error('In crop, at least `height` and `width` must be set'));
     return deferred.promise;
    }
  }

  this.sock.send('take-screenshot', options, function(error, img){
    if (error) { deferred.reject(error); return; }

    // Create a real buffer from data
    img.data = new Buffer(img.data.data);

    deferred.resolve(img);
  });

  return deferred.promise;
};

var _isStarted;
var sock;

var createBrowser = function() {
  sock = axon.socket('req');

  _isStarted = new Promise(function( resolve, reject ) {
    sock.on('connect', function() {
      resolve( new Browser(sock) );
    });

    sock.on('error', function( error ) {
      reject(error);
    });
  });

  // Start the server on a free port
  sock.bind(undefined, 'localhost', function() {
    process.env.PORT = sock.server.address().port;
    var child = spawn(electronpath, [
      '.'
    ],{
      cwd: app,
      detached: true,
      stdio: 'ignore'
    });

    child.unref();
  });

  return _isStarted;
};

module.exports = {

  getBrowser : function() {
    return _isStarted || createBrowser();
  },

  close : function() {
    _isStarted = undefined;
    if (sock) {
      try{
        sock.close();
      }catch(e){}
    }
  }
};

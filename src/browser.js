'use strict';

var path = require('path');
var http = require('http');

var spawn = require('win-spawn');
var Promise = require('bluebird');
var socketio = require('socket.io');

var atompath = require('./findpath');
var app =  path.join(__dirname, '../', 'atom-screenshot');

var requestId = 0; // Global request id

var Browser = function(socket) {
  this.promises = {};
  this.socket = socket;

  this.socket.on('screenshot', function( data ) {
    var promise = this.promises[''+data.id];

    // This should never happen.
    if (promise === undefined) { return; };

    if (data.error) {
      promise.reject(new Error(data.error));
    } else {
      promise.resolve(data.data);
    }

    // Remove this reject/resolved promise
    delete this.promises[''+data.id];
  }.bind(this));

};


Browser.prototype.screenshot = function( options ) {
  var deferred = Promise.pending();
  var promise  = deferred.promise;

  options.id = requestId++;

  options.delay = options.delay || 0;

  if ( !options.width || !options.height) {
    deferred.reject(new Error('At least `height` and `width` must be set'));
    return promise;
  }

  if (options.crop) {
    if (!options.crop.x) { options.crop.x = 0; }
    if (!options.crop.y) { options.crop.y = 0; }
    if (!options.crop.width || !options.crop.height) {
     deferred.reject(new Error('In crop, at least `height` and `width` must be set'));
     return promise;
    }
  }


  this.promises[''+options.id] = deferred;

  console.log('Take a screenshot ', options);
  this.socket.emit('take-screenshot', options);

  return deferred.promise;
};


var _isStarted;
var connection;
var server;

var createBrowser = function() {
  server = http.createServer();

  var io = socketio.listen(server);

  _isStarted = new Promise(function( resolve, reject ) {

    io.on('connection', function( socket ) {
      if (!connection) {
        resolve( new Browser(socket) );
        connection = socket;
      }
    });

    io.on('error', function( error ) {
      reject(error);
    });

  });

  server.on('listening', function() {
    // Start atom-shell with correct port
    process.env.PORT = server.address().port;
    console.log('Found atom-shell at: ', atompath);
    spawn(atompath, [
      '.'
    ],{
      cwd: app,
      env: process.env
    });
  });

  // Start the server on a free port
  server.listen(0, '127.0.0.1');

  return _isStarted;
};

module.exports = {

  getBrowser : function() {
    return _isStarted || createBrowser();
  },

  close : function() {
    _isStarted = undefined;

    if ( connection ) {
      connection.emit('close');
    }

    try {
      server.close();
    } catch(e) { }
  }
};

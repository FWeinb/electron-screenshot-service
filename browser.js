'use strict';

var path = require('path');

var spawn = require('win-spawn');
var Promise = require('bluebird');
var server = require('http').createServer();
var io = require('socket.io').listen(server);

var app =  path.join(__dirname, 'atom-screenshot');
var atompath = require('./findpath');

var requestId = 0;

var Browser = function(socket){
  this.promises = {};
  this.socket = socket;

  this.socket.on('screenshot', function(data){
    var screenshotId = data.id;
    this.promises[''+screenshotId].resolve(data.data);
  }.bind(this));
};


Browser.prototype.screenshot = function(options){
  var deferred = Promise.pending();
  var promise  = deferred.promise;

  options.id = requestId++;

  if ( !options.width || !options.height){
    deferred.reject(new Error('At least `height` and `width` must be set'));
    return promise;
  }

  if (options.crop){
    if (!options.crop.x) { options.crop.x = 0; }
    if (!options.crop.y) { options.crop.y = 0; }
    if (!options.crop.width || !options.crop.height) {
     deferred.reject(new Error('In crop, at least `height` and `width` must be set'));
     return promise;
    }
  }


  this.socket.emit('take-screenshot', options);
  this.promises[''+options.id] = deferred;

  return deferred.promise;
};


var _isStarted;
var connection;
var createBrowser = function(){
  _isStarted = new Promise(function(resolve, reject){

    io.on('connection', function(socket){
      if (!connection) {
        resolve( new Browser(socket) );
        connection = socket;
      }
    });

    io.on('error', function(error){
      reject(error);
    });

  });

  server.listen(3000);

  spawn(atompath, [
    '.'
  ],{
    cwd: app,
    env: process.env,
    stdio : 'inherit'
  });

  return _isStarted;
};

module.exports = {

  getBrowser : function(){
    return _isStarted || createBrowser();
  },

  close : function(){
    _isStarted = undefined;
    if ( connection ){
      connection.emit('close');
    }
    server.close();
  }
};

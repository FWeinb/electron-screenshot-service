/* globals  assert, describe, it */
'use strict';

var http = require('http');

var assert = require('assert');
var imageSize = require('image-size');
var isPng = require('is-png');

var screenshot = require('./../src');

var timeout = 30000;

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(9090, '127.0.0.1');

describe('screenshot', function(){

  it('should produce pngs', function(done){
    this.timeout(timeout);

    screenshot({url : 'http://127.0.0.1:9090', width : 500, height : 500}).then(function(data) {
      assert.ok(isPng(data));
      done();
    });

  });


  it('should have a `delay` option', function(done) {
    this.timeout(timeout);
    var now = new Date();
    screenshot({url : 'http://127.0.0.1:9090', delay : 2, width : 500, height : 500})
    .then(function(){
      assert((new Date()) - now > 2000);
      done();
    });
  });


  it('should create a screenshot with 500x500 pixels', function(done){
    this.timeout(timeout);
    screenshot({url : 'http://127.0.0.1:9090', width : 500, height : 500}).then(function(data){
      var size = imageSize(data);
      assert.equal(size.width, 500);
      assert.equal(size.height, 500);
      done();
    });
  });


  it('should warn about missing `height`', function(done) {
    this.timeout(timeout);

    screenshot({url : 'http://127.0.0.1:9090', width : 500})
    .catch(function(err){
      assert.equal(err.message, 'At least `height` and `width` must be set');
      done();
    });

  });

  after(function(){
    screenshot.close();
  });

});

/* globals  assert, describe, it */
'use strict';

var assert = require('assert');
var imageSize = require('image-size');
var isPng = require('is-png');

var screenshot = require('./../src');

var timeout = 30000;

describe('screenshot', function(){

  it('should produce pngs', function(done){
    this.timeout(timeout);

    screenshot({url : 'about:blank', width : 500, height : 500}).then(function(data) {
      assert.ok(isPng(data));
      done();
    });

  });


  it('should have a `delay` option', function(done) {
    this.timeout(timeout);
    var now = new Date();
    screenshot({url : 'about:blank', delay : 2, width : 500, height : 500})
    .then(function(){
      assert((new Date()) - now > 2000);
      done();
    });
  });


  it('should create a screenshot with 500x500 pixels', function(done){
    this.timeout(timeout);
    screenshot({url : 'about:blank', width : 500, height : 500}).then(function(data){
      var size = imageSize(data);
      assert.equal(size.width, 500);
      assert.equal(size.height, 500);
      done();
    });
  });


  it('should warn about missing `height`', function(done) {
    this.timeout(timeout);

    screenshot({url : 'about:blank', width : 500})
    .catch(function(err){
      assert.equal(err.message, 'At least `height` and `width` must be set');
      done();
    });

  });

  after(function(){
    screenshot.close();
  });

});

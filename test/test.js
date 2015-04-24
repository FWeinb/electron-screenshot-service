/* globals  assert, describe, it */
'use strict';

var http = require('http');

var assert = require('assert');
var isPng = require('is-png');

var screenshot = require('./../src');

describe('screenshot', function(){
  this.timeout(30000);

  it('should produce pngs', function(done){

    screenshot({url : 'about:blank', width : 500, height : 500}).then(function(img) {
      assert.ok(isPng(img.data));
      done();
    });

  });


  it('should have a `delay` option', function(done) {
    var now = new Date();
    screenshot({url : 'about:blank', delay : 2, width : 500, height : 500})
    .then(function(){
      assert((new Date()) - now > 2000);
      done();
    });
  });


  it('should create a screenshot with 500x500 pixels', function(done){
    screenshot({url : 'about:blank', width : 500, height : 500}).then(function(img){
      assert.equal(img.size.width, 500);
      assert.equal(img.size.height, 500);
      done();
    });
  });


  it('should warn about missing `height`', function(done) {
    screenshot({url : 'about:blank', width : 500})
    .catch(function(err){
      assert.equal(err.message, 'At least `height` and `width` must be set');
      done();
    });

  });

  afterEach(function(){
    screenshot.close();
  });

});

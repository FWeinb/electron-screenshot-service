'use strict';

var assert = require('assert');
var isPng = require('is-png');

var screenshot = require('./../src');

describe('screenshot', function () {
  this.timeout(30000);

  it('should produce pngs', function (done) {
    screenshot({url: 'about:blank', width: 500, height: 500})
    .then(function (img) {
      assert.ok(isPng(img.data));
      done();
    });
  });

  it('should warn about missing `height`', function (done) {
    screenshot({url: 'about:blank', width: 500})
    .catch(function (err) {
      assert.equal(err.message, 'At least `height` and `width` must be set');
      done();
    });
  });

  it('should warn about missing `width`', function (done) {
    screenshot({url: 'about:blank'})
    .catch(function (err) {
      assert.equal(err.message, 'At least `height` and `width` must be set');
      done();
    });
  });

});

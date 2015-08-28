'use strict';

var assert = require('assert');
var isPng = require('is-png');
var pngparse = require('pngparse');

var screenshot = require('./../src');

describe('screenshot', function () {
  this.timeout(30000);

  it('should produce pngs', function (done) {
    screenshot({url: 'about:blank', width: 500, height: 500})
    .then(function (img) {
      assert.ok(isPng(img.data));
      done();
    })
    .catch(function (err) {
      console.error(err);
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

  it('should make transparent screenshots', function (done) {
    screenshot({
      url: 'about:blank',
      transparent: true,
      css: 'html,body { background: rgba(255,0,0,0.5); }',
      height: 100,
      width: 100
    })
    .then(function (img) {
      pngparse.parse(img.data, function (err, pixels) {
        assert.equal(err, undefined);

        // Should be transparent
        assert.equal(pixels.channels, 4);
        assert.equal(pixels.width, 100 * img.size.devicePixelRatio);
        assert.equal(pixels.height, 100 * img.size.devicePixelRatio);

        // Should be red + half transparent
        assert.equal(pixels.data[0], 255);
        assert.equal(pixels.data[1], 0);
        assert.equal(pixels.data[2], 0);
        assert.equal(pixels.data[3], 127);

        done();
      });
    });
  });

});

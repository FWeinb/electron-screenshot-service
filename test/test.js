'use strict';
/* globals describe, it */
var assert = require('assert');
var isPng = require('is-png');
var pngparse = require('pngparse');

var screenshot = require('./../src');

describe('screenshot', function () {
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

	it('should work with a function as string', function (done) {
		screenshot({
			url: 'about:blank',
			width: 10,
			height: 10,
			js: '(t) => { document.body.style.background = "#F00"; t(); }'
		})
		.then(function (img) {
			pngparse.parse(img.data, function (err, pixels) {
				assert.equal(err, undefined);
				assert.equal(pixels.data[0], 255);
				assert.equal(pixels.data[1], 0);
				assert.equal(pixels.data[2], 0);
				done();
			});
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

	it('should throw if page isn\'t found', function (done) {
		screenshot({url: 'http://thiswillnotbefound.nonono', width: 500, height: 500})
		.catch(function (err) {
			assert.equal(err.message, '[-105] ERR_NAME_NOT_RESOLVED');
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

'use strict';
var fs = require('fs');

var Promise = require('bluebird');
var screenshot = require('../');

// Create 4 electron sub-processes
screenshot.scale(4);

Promise.all(['http://sassdoc.com', 'https://css-tricks.com', 'https://google.de', 'http://codepen.io'].map(function (url) {
	console.log('Screenshot, ', url);
	return screenshot({
		url: url,
		width: 1024,
		height: 768,
		// hide scrollbars
		transparent: true,
		page: true,
		css: 'body{ background:transparent !important;}\n::-webkit-scrollbar{opacity:0 !important;display: none !important;}'
	});
}))
.then(function (arr) {
	arr.forEach(function (img, i) {
		fs.writeFileSync('./out' + i + '.png', img.data);
	});
	screenshot.close();
})
.catch(function (err) {
	console.log(err);
});

'use strict';
var fs = require('fs');

var Promise = require('bluebird');
var screenshot = require('../');


Promise.all(['http://codepen.io', 'http://google.de', 'http://sassdoc.com/develop'].map(function(url){
  console.log('Screenshot, ', url);
  return screenshot({
      url: url,
      width: 1024,
      height: 768,
      // hide scrollbars
      css: '::-webkit-scrollbar{display: none !important;}'
    });
}))
.then(function(arr){
  arr.forEach(function(buffer, i){
    fs.writeFileSync('./out'+i+'.png', buffer);
  });
  screenshot.close();
});

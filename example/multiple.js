'use strict';
var fs = require('fs');

var Promise = require('bluebird');
var screenshot = require('../');


Promise.all(['http://www.sassdoc.com/'].map(function(url){
  console.log('Screenshot, ', url);
  return screenshot({
      url: url,
      width: 1024,
      height: 768,
      page: true,
      // hide scrollbars
      css: '::-webkit-scrollbar{opacity:0 !important;display: none !important;}'
    });
}))
.then(function(arr){
  arr.forEach(function(img, i){
    fs.writeFileSync('./out'+i+'.png', img.data);
  });
  screenshot.close();
})
.catch(function(err){
  console.log(err);
});

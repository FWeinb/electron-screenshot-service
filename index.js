'use strict';

var browserManager = require('./browser.js');
var Promise = require('bluebird');


process.on('exit', function() {
 browserManager.close();
});

/**
 * Takes an options object liek
 * { url : '', delay : [seconds], width : [size], heihgt :  [size], format : 'png|jpeg' default png };
 * returns a stream
 */
module.exports = function(options){
  return new Promise(function(resolve, reject) {
    browserManager
    .getBrowser()
    .then(function(browser){
      browser
      .screenshot(options)
      .then(resolve)
      .catch(reject);
    });
  });
};
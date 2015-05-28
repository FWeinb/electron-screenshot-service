'use strict';

var Promise = require('bluebird');

var browserManager = require('./browser.js');


/**
 * Takes an options object liek
 * { url : '', delay : [seconds], width : [size], heihgt :  [size], css : '[custom css]', format : 'png|jpeg' default png };
 * returns a promise
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
    })
    .catch(reject);
  });
};

module.exports.close = function(){
  browserManager.close();
};

// Ensure that the Browser instance will be closed on exit
process.on('exit', module.exports.close);

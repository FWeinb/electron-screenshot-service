'use strict';
var fs = require('fs');
var downloadatomshell = require('gulp-download-atom-shell');

downloadatomshell({
  version: '0.15.8',
  outputDir: 'atom'
}, function(){

  if (process.platform === 'linux'){
    var atompath = require('./findpath');
    fs.chmodSync(atompath, '0777');
  }

});
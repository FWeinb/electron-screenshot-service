'use strict';
var fs = require('fs');
var downloadatomshell = require('gulp-download-atom-shell');

downloadatomshell({
  version: '0.14.3',
  outputDir: 'atom'
}, function(){

  if (process.platform === 'linux'){
    var atompath = require('./findpath');
    fs.chmodSync(atompath, '0777');
  }

});
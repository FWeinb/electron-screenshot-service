'use strict';

var version = '0.27.1';

var path = require('path');
var extract = require('extract-zip');
var download = require('electron-download');

function onerror (err) {
  throw err;
}

// downloads if not cached
download({version: version}, extractFile);

// unzips and makes path.txt point at the correct executable
function extractFile (err, zipPath) {
  if (err) { return onerror(err); }
  extract(zipPath, {dir: path.join(__dirname, 'dist')}, function (err) {
    if (err) { return onerror(err); }
  });
}
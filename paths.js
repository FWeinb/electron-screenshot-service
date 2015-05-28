var os = require('os');
var path = require('path');

var paths = {
  darwin: path.join(__dirname, './dist/Electron.app/Contents/MacOS/Electron'),
  linux: path.join(__dirname, './dist/electron'),
  win32: path.join(__dirname, './dist/electron.exe')
};

var platform = os.platform();

if (!paths[platform]) {
  throw new Error('Unknown platform: ' + platform);
}

module.exports = paths[platform];
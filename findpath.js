var fs = require('fs');
var path = require('path');
var bin = path.resolve(__dirname, 'atom');

if (process.platform === 'darwin') {
  if (fs.existsSync(path.join(bin, 'Atom.app'))) {
    bin = path.join(bin, 'Atom.app', 'Contents', 'MacOS', 'Atom');
  }
} else if (process.platform === 'win32') {
  bin = path.join(bin, 'atom.exe');
} else {
  bin = path.join(bin, 'atom');
}

module.exports = bin;
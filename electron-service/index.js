'use strict';

var app = require('app');

var screenshot = require('electron-screenshot-app');
var sock = require('axon').socket('rep');

sock.connect(parseInt(process.env.PORT, 10));

app.on('window-all-closed', function () {});

app.on('ready', function () {

  if (process.platform === 'darwin' && app.dock.hide !== undefined) {
    app.dock.hide();
  }

  sock.on('message', function (task, options, reply) {
    switch (task) {
      case 'take-screenshot' :
        screenshot(
          options,
          function (err, data, cleanup) {
            if (err !== undefined) {
              return reply(err, null, cleanup);
            }
            reply(null, data, cleanup);
          }
        );
        break;
    }
  });

  sock.on('close', function () {
    app.terminate();
    app.quit();
  });

});

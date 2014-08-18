'use strict';

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var socket = require('socket.io-client')('ws://localhost:3000', { transports : ['websocket']});


var show = process.env.NODESCREENSHOT_SHOW === '1' ? true : false;

app.on('ready', function() {


  if ( process.platform === 'darwin' && app.dock.hide !== undefined ) {
    app.dock.hide();
  }


  socket.on('connect', function() {

    var emitSuccess = function( options, data ) {
      socket.emit('screenshot', {
        id : options.id,
        data : data
      });
    };

    socket.on('take-screenshot', function(options) {
      takeScreenshot(options, emitSuccess.bind(null, options));
    });

    socket.on('close', function(){
      app.terminate();
    });

  });
});


function takeScreenshot(options, callback) {

  var popupWindow = new BrowserWindow({
    width: options.width,
    height: options.height,
    show : show,
    'enable-larger-than-screen' : true,
    'skip-taskbar' : true,
    'use-content-size' : true
  });


  var cleanup = function(){
    popupWindow.destroy();
    popupWindow = null;
  };

  popupWindow.loadUrl(options.url);

  popupWindow.webContents.on('did-finish-load', function() {

      setTimeout(function(){
        if (typeof options.crop === 'object') {
          popupWindow.capturePage(options.crop, callback);
        }else{
          popupWindow.capturePage(callback);
        }

        setTimeout(cleanup, 500);
      }, (options.delay * 1000) + 100);

  });
}

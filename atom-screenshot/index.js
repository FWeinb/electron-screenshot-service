'use strict';

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var socket = require('socket.io-client')('ws://localhost:' + process.env.PORT, { transports : ['websocket']});
var ipc = require('ipc');

var show = process.env.NODESCREENSHOT_SHOW === '1' ? true : false;

app.on('ready', function() {


  if ( process.platform === 'darwin' && app.dock.hide !== undefined ) {
    app.dock.hide();
  }


  socket.on('connect', function() {

    var emitSuccess = function( options, data, cleanup ) {
      socket.emit('screenshot', {
        id : options.id,
        data : data
      }, cleanup);
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
    width: 0,
    height: 0,
    show : show,
    frame: true,
    transparent: true,
    'enable-larger-than-screen' : true,
    'skip-taskbar' : true,
    'use-content-size' : true
  });


  var cleanup = function(){
    popupWindow.close();
    popupWindow = null;
  };

  popupWindow.loadUrl(options.url);

  popupWindow.webContents.on('did-finish-load', function() {
    // requestAnimationFrame will call the function before the next repaint.
    // Doing it twice will call the load() function after the first paint.
    // This way it is ensured that at least on paint has happend.
    popupWindow.webContents.executeJavaScript("var ra=window.requestAnimationFrame;function load(){require('ipc').send('Loaded');}window.onresize = function(){ra(function(){ra(load);});};");

    if (options.css !== undefined) {
      popupWindow.webContents.insertCSS(options.css);
    }

    ipc.on('Loaded', function(){
      process.nextTick(function(){
        setTimeout(function(){
          var cb = function(buffer){
            callback(buffer, cleanup);
          };
          if (typeof options.crop === 'object') {
            popupWindow.capturePage(options.crop, cb);
          }else{
            popupWindow.capturePage(cb);
          }
        }, options.delay * 1000);
      });
    });

    popupWindow.setContentSize(options.width, options.height);
  });
}

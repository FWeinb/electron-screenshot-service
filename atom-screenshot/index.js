'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');

var socket = require('socket.io-client')('ws://localhost:' + process.env.PORT, { transports: ['websocket']});

var show = process.env.NODESCREENSHOT_SHOW === '1' ? true: false;

app.on('ready', function() {

  if ( process.platform === 'darwin' && app.dock.hide !== undefined ) {
    app.dock.hide();
  }

  socket.on('connect', function() {

    var emitSuccess = function( options, cleanup, data ) {
      socket.emit('screenshot', {
        id: options.id,
        data: data
      }, cleanup);
    };

    var emitError = function( options, error ) {
      socket.emit('screenshot', {
        id: options.id,
        error: error.message
      });
    };

    socket.on('take-screenshot', function(options) {
      takeScreenshot(
        options,
        emitSuccess.bind(null, options),
        emitError.bind(null, options)
      );
    });

    socket.on('close', function(){
      app.terminate();
      process.exit();
    });

  });
});


function takeScreenshot(options, sCall, eCall) {

  var popupWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: show,
    frame: false,
    preload: __dirname + '/preload.js',
    transparent: options.transparent || false,
    'enable-larger-than-screen': true,
    'skip-taskbar': true
  });

  var cleanup = function(){
    popupWindow.close();
    popupWindow = null;
  };

  var loadTimeout;
  var resetTimeout = function(func){
    clearTimeout(loadTimeout);
    loadTimeout = setTimeout(func, options.timeout || 2000);
  };

  var makeScreenshot = function(){

    // Remove any laodTimeout
    clearTimeout(loadTimeout);

    var loadEvent = 'Loaded-' + options.id;

    // requestAnimationFrame will call the function before the next repaint.
    // Doing it twice will call the load() function after the first paint.
    // This way it is ensured that at least on paint has happend.
    popupWindow.webContents.executeJavaScript('var ra=window.requestAnimationFrame;function load(){require("ipc").send("'+loadEvent+'");};window["__node_atom_shell_loaded__"] = function(){ra(function(){ra(load);});}');

    // Inject custom CSS if necessary
    if (options.css !== undefined) {
      popupWindow.webContents.insertCSS(options.css);
    }

    // Register the IPC load event once
    ipc.once(loadEvent, function(){
      // Delay the screenshot
      setTimeout(function(){
        var cb = sCall.bind(null, cleanup);

        if (typeof options.crop === 'object') {
          popupWindow.capturePage(options.crop, cb);
        }else{
          popupWindow.capturePage(cb);
        }

      }, options.delay * 1000);
    });

    // Resize to the correct size
    // This is needed to trigger the actual screenshot function
    // and ensures that all styles are up to date
    popupWindow.setSize(options.width, options.height);

    popupWindow.webContents.executeJavaScript('window["__node_atom_shell_loaded__"]()');
  };

  popupWindow.webContents.on('did-fail-load', function(errorCode, errorDescription) {
    eCall(new Error(errorDescription));
    cleanup();
  });

  popupWindow.webContents.on('crashed', function() {
    eCall(new Error('Render process crashed'));
    cleanup();
  });

  var asked = false;
  popupWindow.webContents.on('did-stop-loading', function(){
    resetTimeout(makeScreenshot);

    // Shortcut for pages without any iframes
    if (!asked) {
      ipc.once('frame-count', function(e, count){
        // Call it directly
        if (count === 0) {
          makeScreenshot();
        }
      });
      popupWindow.webContents.executeJavaScript('require("ipc").send("frame-count", window.frames.length)');
      asked = true;
    }

  });

  // Start loading the URL
  popupWindow.loadUrl(options.url);
}

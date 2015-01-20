'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var sock = require('axon').socket('rep');

var show = process.env.NODESCREENSHOT_SHOW === '1' ? true: false;

sock.connect(parseInt(process.env.PORT, 10));

app.on('ready', function() {

  if ( process.platform === 'darwin' && app.dock.hide !== undefined ) {
    app.dock.hide();
  }

  var emitSuccess = function( reply, cleanup, data ) {
    reply(null, data, cleanup);
  };

  var emitError = function( reply, error ) {
    reply(error, null);
  };

  sock.on('message', function(task, options, reply){
    switch (task) {
      case 'take-screenshot' :
        takeScreenshot(
          options,
          emitSuccess.bind(null, reply),
          emitError.bind(null, reply)
        );
        break;
    }
  });

  sock.on('close', function(){
    app.terminate();
    process.exit();
  });
});


function takeScreenshot(options, sCall, eCall) {

  var popupWindow = new BrowserWindow({
    x:0,
    y:0,
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
    setTimeout(function(){
      popupWindow.close();
      popupWindow = null;
    }, 1000);
  };

  var loadTimeout;
  var resetTimeout = function(func){
    clearTimeout(loadTimeout);
    loadTimeout = setTimeout(func, options.timeout || 2000);
  };

  var makeScreenshot = function(){
    // Remove any loadTimeout
    clearTimeout(loadTimeout);

    var loadEvent = 'Loaded-' + options.id;
    var sizeEvent = 'Size-' + options.id;

    // requestAnimationFrame will call the function before the next repaint.
    // This way it is ensured that at least on paint has happend.
    popupWindow.webContents.executeJavaScript(
      'var __atom__ra = window.requestAnimationFrame;' +
      'var __atom__ipc = require("ipc");' +
      'function __atom__load(){__atom__ipc.sendSync("'+loadEvent+'");};' +
      'function __atom__size(){__atom__ipc.sendSync("'+sizeEvent+'",{width: document.body.clientWidth, height: document.body.clientHeight});};' +
      'window["__atom__loaded__"] = function(){'+
        '__atom__ra(function(){' +
          // Be sure to render the whole page
          'document.body.scrollTop=document.body.clientHeight;' +
          '__atom__ra(function(){'+
            // Take screenshot at offset
            'document.body.scrollTop='+(options.pageOffset || 0)+';'+
            '__atom__ra(__atom__load);'+
          '});' +
        '});' +
      '}');

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

    // Register the IPC sizeEvent once
    ipc.once(sizeEvent, function(e, data){
      popupWindow.setSize(data.width, data.height);
      popupWindow.webContents.executeJavaScript('window["__atom__loaded__"]()');
    });


    // Resize to the correct size
    // ensures that all styles are up to date
    popupWindow.setSize(options.width, options.height);

    if (options.page) {
      popupWindow.webContents.executeJavaScript('window["__atom__size"]()');
    } else {
      popupWindow.webContents.executeJavaScript('window["__atom__loaded__"]()');
    }
  };

  popupWindow.webContents.on('did-fail-load', function(e, errorCode, errorDescription) {
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

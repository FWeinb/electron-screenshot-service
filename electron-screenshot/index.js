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
    reply(null, { data: data.toPng(), size: data.getSize() }, cleanup);
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
    width: options.width,
    height: options.height,
    show: true,
    frame: false,
    // Used to load the ipc module into __electron__ipc`
    preload: __dirname + '/preload.js',
    'node-integration': false,
    transparent: options.transparent || false,
    'enable-larger-than-screen': true,
    'skip-taskbar': true,
    'overlay-scrollbars': true,
    'direct-write': true
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
    // Remove any loadTimeout
    clearTimeout(loadTimeout);

    // Inject custom CSS if necessary
    if (options.css !== undefined) {
      popupWindow.webContents.insertCSS(options.css);
    }

    var loadEvent = 'Loaded-' + popupWindow.id;
    var sizeEvent = 'Size-' + popupWindow.id;

    // requestAnimationFrame will call the function before the next repaint.
    // This way it is ensured that at least on paint has happend.
    popupWindow.webContents.executeJavaScript(
      'var __electron__ra = window.requestAnimationFrame;' +
      'function __electron__load(){__electron__ipc.send("'+loadEvent+'");};' +
      'function __electron__size(){var w = window,d = document,e = d.documentElement,g = d.body,' +
      'width = Math.max(w.innerWidth, e.clientWidth, g.clientWidth,'+options.width+'),' +
      'height = Math.max(w.innerHeight, e.clientHeight, g.clientHeight,'+options.height+');' +
      '__electron__ipc.send("'+sizeEvent+'",{width: width, height: height});' +
      '};' +
      'function __electron__loaded(){'+
        '__electron__ra(function(){' +
          // Take screenshot at offset
          'document.body.scrollTop='+(options.pageOffset || 0)+';'+
          '__electron__ra(__electron__load);'+
        '});' +
      '}');

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
      // Don't be smaller than options.width, options.height
      popupWindow.setSize(Math.max(options.width, data.width), Math.max(options.height, data.height));
      popupWindow.webContents.executeJavaScript('window["__electron__loaded"]()');
    });


    if (options.page) {
      popupWindow.webContents.executeJavaScript('window["__electron__size"]()');
    } else {
      popupWindow.webContents.executeJavaScript('window["__electron__loaded"]()');
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
      popupWindow.webContents.executeJavaScript('__electron__ipc.send("frame-count", window.frames.length)');
      asked = true;
    }

  });
  // Start loading the URL
  popupWindow.loadUrl(options.url);
}

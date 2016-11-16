electron-screenshot-service [![Build Status](https://travis-ci.org/FWeinb/electron-screenshot-service.svg?branch=master)](https://travis-ci.org/FWeinb/electron-screenshot-service)
====================
> Take screenshots using electron

# Install

```shell
npm install electron-screenshot-service
```

## Usage

```js
var fs = require('fs');
var screenshot = require('electron-screenshot-service');

screenshot({
  url : 'http://google.de',
  width : 1024,
  height : 768
})
.then(function(img){
  fs.writeFile('./out.png', img.data, function(err){
    screenshot.close();
  });
});
```

#### screenshot(options)

Will return a Promise containing an object like:

```js
{
  data: <Buffer >
  size: {
    width: X
    height: N
  }
}
```

In addition to [all options](http://electron.atom.io/docs/v0.36.5/api/browser-window/#new-browserwindow-options) that can be passed to the BrowserWindow you can pass:

##### delay

Type: `number` *(milliseconds)*  
Default: `0`

Delay capturing the screenshot.

Useful when the site does things after loading that you want to capture.

##### width

Type: `number`
Default: `0`

Specify the with of the browser window

##### height

Type: `number`
Default: `0`

Specify the height of the browser window

##### crop

Type: `Object`  
Default: `undefined`

An crop object may look like this:
```js
{
  x : 10,
  y : 10,
  width : 100,
  height : 100
}
```

##### css

Type: `String`  
Default: `undefined`

This css will be injected into the page before the screenshot is taken.

##### js

Type: `String`  
Default: `undefined`

It must contain a function definition that takes on parameter e.g.
```js
js: 'function(takeScreenshot){ /*Do some stuff*/ takeScreenshot();}'
```
or
```js
js: 'takeScreenshot => { /*Do some stuff*/ takeScreenshot();}'
```

##### transparent

Type: `Boolean`  
Default: `false`

This will enable transparency. Keep in mind that most site do set a background color on the html/body tag.
You can overwrite this by using the `css` option using something like `html,body{ background-color: transparent !important;}`.

##### page

Type: `Boolean`  
Default: `false`

This will try to capture the whole page. `width` and `height` are considered the minimum size.

#### screenshot.close()

Will close the screenshot service. Needed to let the node process exit

#### screenshot.scale(scale)

Scale the number of electron processes to `scale` processes. This will round-robin the screenshot
jobs across `scale` instances.

# Changelog

##### `4.0.3`

* Update to `electron@1.4.7`

##### `4.0.2`

* Update to `electron@1.4.5`
* Add version to sub-package fixing [#33](https://github.com/FWeinb/electron-screenshot-service/issues/33)

##### `4.0.1`

* Update to `electron@1.4.1`

##### `4.0.0`

* Update to `electron@1.4.0`

##### `3.3.1`

* Update to `electron@1.3.4`

##### `3.3.0`

* Update to `electron@1.3.1`

##### `3.2.3`

* Fix PORT bug on windows (Thanks to [peerbolte](https://github.com/FWeinb/electron-screenshot-service/pull/26))

##### `3.2.2`

* Update to `electron@1.2.7`

##### `3.2.1`

* Fix post install script on windows

##### `3.2.0`

* Update to `electron-screenshot-app@3.1.0`
* Support `options.js`

##### `3.1.3`

* Update to `electron@1.2.6`
* Fix bug in keeping `browserCount` correct. (Thanks to [jerbob92](https://github.com/FWeinb/electron-screenshot-service/pull/22))

##### `3.1.2`

* Update to `electron@1.2.5`

##### `3.1.1`

* Fix bug that prevent running in node `^6.0.0`

##### `3.1.0`

* Update to `electron@1.2.0`
* Use `cross-spawn` insated of `cross-spawn-async`
* Update dependencies

##### `3.0.0`

* Update to `electron@1.1.0`
* Update to `electron-screenshot-app@3.0.0`

##### `2.3.1`

* Update to `electron@0.37.7`

##### `2.3.0`

* Update to `electron@0.37.2`

##### `2.2.1`

* Fix a bug in `count` not being updated when an electron process dies (Thanks to [asafyish](https://github.com/asafyish))
* Update to `electron@0.36.8`

##### `2.2.1`

* Fix installation on windows (#14)

##### `2.2.0`

* Upgrade to `electron@0.36.7`.
* Update to `electron-screenshot-app@2.2.0`

##### `2.1.0`

* Upgrade to `electron@0.36.6`.
* Update to `electron-screenshot-app@2.1.0` fixing #11


##### `2.0.0`

* Upgrade to `electron@0.36.5`.
* Fix race-condition in error reporting.
* Add `screenshot.scale` API

##### `1.7.0`

* Upgrade to `electron@0.35.2`.

##### `1.6.0`

* Upgrade to `electron@0.34.0`.

##### `1.5.3`

* Upgrade to `electron@0.33.8`.

##### `1.5.3`

* Fix a typo in error handeling code. (Thanks to [@adig](https://github.com/adig) [#6](https://github.com/FWeinb/electron-screenshot-service/pull/6))
* Pin `electron` to version `0.33.4`

##### `1.5.2`

* Upgrade to `electron@0.33.4`.

##### `1.5.1`

* Upgrade to `electron@0.33.1`.

##### `1.5.0`

* Upgrade to `electron@0.33.0`.

##### `1.4.1`

* Upgrade to `electron@0.32.2`.

##### `1.4.0`

* Upgrade to `electron@0.32.1`.

##### `1.3.1`

* Upgrade to `electron@0.31.1`.
* Upgrade to `electron-screenshot-app@1.1.0`.

##### `1.3.0`

* Upgrade to `electron@0.31.0`.

##### `1.2.2`

* Upgrade to `electron@0.30.4`.

##### `1.2.1`

* Upgrade to `electron@0.30.2`.

##### `1.2.0`

  * Upgrade to `electron@0.30.1`.
  * Extract core functionality into [electron-screenshot-app](https://github.com/FWeinb/electron-screenshot-app) (See [#4](https://github.com/FWeinb/electron-screenshot-service/issues/4))

##### `1.1.4`

  * Upgrade to `electron@0.30.0`.

##### `1.1.3`

  * Upgrade to `electron@0.28.1`.

##### `1.1.1`

  * Fixed some issues with error handeling
  * Stop `electron` from closing when last window was closed

##### `1.1.0`

  * Upgrade to `electron@0.27.1`.
  * Use `electron-downloader`.
  * Add `transparent` support.

##### `1.0.2`

  * Upgrade to `electron@0.25.1`

##### `1.0.1`

  * Hide the window again.

##### `1.0.0`

  * Upgrade to `electron@0.24.0`
  * Renamed to `electron-screenshot-service`

##### `0.5.0`

  * Upgrade to `atom-shell@0.21.3`
  * The Promise will no return the image `data` and `size`.

##### `0.4.5`

  * Fix bug on linux (X11)

##### `0.4.4`

  * Update to atom-shell `.0.22.7`
  * Improved perfomance by switching to [`axon`](https://github.com/tj/axon) for ipc.

##### `0.4.3`

  * Fix scroll jumping

##### `0.4.1`

  * Cleanup repository
  * Remove duplicated dependency to `socket.io-client`

##### `0.4.0`

  * Update to atom-shell `0.20.6`.
  * Better handeling of pages with iframes
  * Include `jquery` because of a "bug" in `atom-shell` (See [#254](See https://github.com/atom/atom-shell/issues/254))
  * Better error handeling

##### `0.3.2`

  * Use `window.requestAnimationFrame` to be sure that at least one paint has happend.

##### `0.3.1`

  * Force a redraw after injecting css

##### `0.3.0`

  * Add `css` option to inject custom css

##### `0.2.0`

  * Update to atom-shell `0.20.5`
  * Add `close()` method

##### `0.1.3`

  * Update to atom-shell `0.19.5`

##### `0.1.2`

  * Update to atom-shell `0.15.8`

##### `0.1.1`

  * Update to atom-shell `0.15.4`

##### `0.1.0`

  * 0.1.0 Inital release

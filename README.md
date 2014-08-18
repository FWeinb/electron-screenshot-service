node-atom-screenshot
====================
> Take screenshots using atom-shell

# Install 

```shell
npm insall atom-screenshot
```

## Usage

```js
var fs = require('fs');
var screenshot = require('atom-screenshot');

screenshot({
  url : 'http://google.de',
  width : 1024,
  height : 768
})
.then(function(buffer){
  fs.writeFile('./out.png', buffer, function(err){

  });
});
```

#### screenshot(options)

##### delay

Type: `number` *(seconds)*  
Default: `0`

Delay capturing the screenshot.

Useful when the site does things after load that you want to capture.

##### width

Type: `int`  
Default: `0`

Specify the with of the browser window

##### height

Type: `int`  
Default: `0`

Specify the height of the browser window

##### crop
Type: `Object`  
Default: `undefined`

This will only work if generating png's. 
An crop object may look like this:
```js
{
  x : 10,
  y : 10,
  width : 100,
  height : 100
}
```

# Changelog

##### `0.1.2`

  * Update to atom-shell `0.15.8`

##### `0.1.1`

  * Update to atom-shell `0.15.4`


##### `0.1.0`

  * 0.1.0 Inital release

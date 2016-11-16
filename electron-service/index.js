'use strict';

const {app} = require('electron');
const screenshot = require('electron-screenshot-app');
const sock = require('axon').socket('rep');

const terminate = () => {
	app.quit();
};

sock.connect(parseInt(process.env.ELECTRON_SCREENSHOT_PORT, 10), process.env.HOST || 'localhost');

app.on('window-all-closed', () => {});
app.on('ready', () => {
	if (process.platform === 'darwin' && app.dock.hide !== undefined) {
		app.dock.hide();
	}

	sock.on('message', (task, options, reply) => {
		switch (task) {
			case 'take-screenshot' :
				screenshot(
					options,
					function (err, data, cleanup) {
						return reply(err ? err.message : null, data, cleanup);
					}
				);
				break;
			case 'close' :
				terminate();
				break;
			default:
		}
	});
});

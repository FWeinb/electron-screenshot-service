'use strict';

const {app} = require('electron');
const screenshot = require('electron-screenshot-app');
const sock = require('axon').socket('rep');

const terminate = () => {
	app.exit(0);
};

sock.connect(parseInt(process.env.ELECTRON_SCREENSHOT_PORT, 10));

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
				reply('Closing')
				sock.close();
				terminate();
				break;
			default:
		}
	});
});


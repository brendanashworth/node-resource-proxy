// main.js
// main file for the proxy
var fs = require('fs'),
	http = require('http'),
	urlParser = require('url'),
	express = require('express');

var app = express(),
	config = require('../config');

// Config stuff
config.options.cache.expireTime = 1000 * 60 * config.options.cache.minutes_until_expire;

function serveFromCache(filename, res) {
	fs.createReadStream(filename).pipe(res.status(200));
}

function serveFromExternal(url, res, writeStream) {
	http.get(url, function(result) {
		// check for 200 status code
		if (result.statusCode !== 200) {
			res.status(404).send('Resource not found.');
			return;
		}

		if (typeof result.headers['content-type'] !== 'undefined')
			res.status(200).set('Content-Type', result.headers['content-type']);

		result.pipe(res);

		if (typeof writeStream !== 'undefined') result.pipe(writeStream);

	}).on('error', function() {
		res.status(404).send('Resource not found.');
	});
}

// /r for resource
//   http://placekitten.com/200/300
//   /r/aHR0cDovL3BsYWNla2l0dGVuLmNvbS9nLzIwMC8zMDA=
app.get('/r/:url', function(req, res) {
	var encoded_url = req.params['url'],
		url = new Buffer(encoded_url, 'base64').toString('utf8');

	// check that URL at the door
	if (config.resources.whitelist) {
		var parsed = urlParser.parse(url);

		if (config.resources.allowed.hosts.indexOf(parsed.hostname) == -1) {
			res.status(500).send('Not allowed to access resource.');
			return;
		}
	}

	// cache related variables
	var filename = config.options.cache.directory + encoded_url;

	// handle the cache
	if (config.options.cache.use) {
		fs.stat(filename, function(err, stats) {
			if (!(typeof err !== 'undefined' && err == null)) {
				serveFromExternal(url, res, fs.createWriteStream(filename));
				return;
			}

			// check if it is older
			if (new Date(stats.mtime).getTime() + config.options.cache.expireTime > new Date().getTime()) {
				serveFromCache(filename, res);
			} else {
				serveFromExternal(url, res, fs.createWriteStream(filename));
			}
		});
	} else {
		serveFromExternal(url, res);
	}
});

app.listen(config.server.port, config.server.host);

console.log('App started.');

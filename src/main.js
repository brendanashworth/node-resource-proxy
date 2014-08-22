// main.js
// main file for the proxy
var http = require('http'),
	urlParser = require('url'),
	express = require('express');

var app = express(),
	config = require('../config');

// /r for resource
//   http://placekitten.com/200/300
//   /r/aHR0cDovL3BsYWNla2l0dGVuLmNvbS9nLzIwMC8zMDA=
app.get('/r/:url', function(req, res) {
	var encoded_url = req.params['url'],
		buffer = new Buffer(encoded_url, 'base64'),
		url = buffer.toString('utf8');

	// check that URL at the door
	if (config.resources.whitelist) {
		var parsed = urlParser.parse(url);

		if (config.resources.allowed.hosts.indexOf(parsed.hostname) == -1) {
			res.status(500).send('Not allowed to access resource.');
			return;
		}
	}

	// go
	http.get(url, function(result) {
		// check for 200 status code
		if (result.statusCode !== 200) {
			res.status(404).send('Resource not found.');
			return;
		}

		if (typeof result.headers['content-type'] !== 'undefined')
			res.set('Content-Type', result.headers['content-type']);

		result.pipe(res.status(200));
	}).on('error', function() {
		res.status(404).send('Resource not found.');
	});
});

app.listen(process.env.development ? 3000 : config.server.port, config.server.host);

console.log('App started.');

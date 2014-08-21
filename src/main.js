// main.js
// main file for the proxy
var http = require('http'),
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
		// todo
	}

	// go
	http.get(url, function(data) {
		// check for 200 status code
		if (data.statusCode !== 200) {
			res.status(404).send('Resource not found.');
			return;
		}

		if (typeof data.headers['content-type'] !== undefined)
			res.set('Content-Type', data.headers['content-type']);

		data.on('data', function(chunk) {
			console.log('got: ' + chunk);
			res.status(200).send(chunk);
		});
	}).on('error', function() {
		res.status(404).send('Resource not found.');
	});
});

app.get('/test', function(req, res) {
	res.send('This is a test');
})

app.listen(process.env.development ? 3000 : );

console.log('App started.');
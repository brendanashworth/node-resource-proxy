// main.js
// main file for the proxy
var fs = require('fs'),
	http = require('http'),
	urlParser = require('url');

var config = require('../config');

// Saves time during runtime
var cacheExpireTime = 1000 * 60 * config.options.cache.minutes_until_expire,
	regex = /^\/r\/(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})$/;

function serveFromCache(filename, res) {
	res.writeHead(200);

	fs.createReadStream(filename).pipe(res);
}

function serveFromExternal(url, res, writeStream) {
	http.get(url, function(result) {
		// check for 200 status code
		if (result.statusCode !== 200) {
			res.writeHead(404, {
				'Content-Type': 'text/plain'
			});

			res.write('Resource not found.');
			return;
		}

		// hand off header
		if (typeof result.headers['content-type'] !== 'undefined') {
			res.writeHead(200, {
				'Content-Type': result.headers['content-type']
			});
		} else {
			res.writeHead(200);
		}

		// pipe
		result.pipe(res);

		if (typeof writeStream !== 'undefined') result.pipe(writeStream);

	}).on('error', function() {
		res.writeHead(404, {
			'Content-Type': 'text/plain'
		});

		res.write('Resource not found.');
	});
}

// /r for resource
//   http://placekitten.com/200/300
//   /r/aHR0cDovL3BsYWNla2l0dGVuLmNvbS9nLzIwMC8zMDA=
var server = http.createServer(function(req, res) {
	// check to make sure it is base64
	if (!regex.test(req.url)) {
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		});

		res.write('Error: parameter was not Base64 compliant.');
		return;
	}

	var encoded_url = req.url.substring(3, req.url.length),
		url = new Buffer(encoded_url, 'base64').toString('utf8');

	// check that URL at the door
	if (config.resources.whitelist) {
		var parsed = urlParser.parse(url);

		if (config.resources.allowed.hosts.indexOf(parsed.hostname) == -1) {
			res.writeHead(500, {
				'Content-Type': 'text/plain'
			});

			res.write('Error: host is not whitelisted.');
			return;
		}
	}

	// handle caching
	if (config.options.cache.use) {
		var filename = config.options.cache.directory + encoded_url;

		// get modified time, also checks if the file exists
		fs.stat(filename, function(err, stats) {
			if (!(typeof err !== 'undefined' && err == null)) {
				// file doesn't exist... or some other issue happened.
				serveFromExternal(url, res, fs.createWriteStream(filename));
				return;
			}

			// check if it is older
			if (new Date(stats.mtime).getTime() + cacheExpireTime > new Date().getTime()) {
				serveFromCache(filename, res);
			} else {
				serveFromExternal(url, res, fs.createWriteStream(filename));
			}
		});
	} else {
		serveFromExternal(url, res);
	}
});

server.listen(config.server.port, config.server.host);
console.log('App started.');

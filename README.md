# node resource proxy

> A proxy server designed to proxy insecure assets on a secured connection. Differs from [camo](https://github.com/atmos/camo) for its configurability (to only allow URLs from a specific host / whitelist URLs) and its simplicity (base64 URL instead of HMAC).

### Install
```bash
$ git clone https://github.com/boboman13/node-resource-proxy.git && cd node-resource-proxy

$ nano config.json // Edit config.json to your desire

$ npm start
```

### Configuration
Configuration is provided in the `config.json` file. It is mostly self-explanatory.

### Performance
The proxy server is mostly high performing, while using `ab`...

```
Concurrency Level:      10
Time taken for tests:   3.239 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      82320000 bytes
HTML transferred:       81570000 bytes
Requests per second:    3087.43 [#/sec] (mean)
Time per request:       3.239 [ms] (mean)
Time per request:       0.324 [ms] (mean, across all concurrent requests)
Transfer rate:          24820.07 [Kbytes/sec] received
```
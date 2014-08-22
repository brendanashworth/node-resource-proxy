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
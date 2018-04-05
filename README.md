# testserve

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/andronix)

A simple port-sharing proxy for development on multiple local domains, supports
websockets, SSL, and queuing requests whilst development server restarts.

## Features

- Quick (near instant) startup
- Built in DNS server to redirect *.test to 127.0.0.1 (requires
  additional configuration for your system to use this server)
- Proxies regular HTTP requests and websocket connections based on the `Host`
  HTTP header
- Easy to configure
- Subdomain configuration is updated on a per-request basis - no need to
  restart server
- supports [xip.io](http://xip.io/) domains
- SSL termination (using SNI to support multiple domains on one port)
- Self-signed SSL certificate generation and help installing
- `testserve run --exponential-backoff` will automatically re-attempt requests
  when your development server restarts (e.g. due to file changes) saving
  you from receiving the error page in the intervening seconds (ALPHA)

## Status

This package is NOT ready for production usage, it's only intended for use on your own
development machine!

## Getting Started

testserve itself should run on Linux and OS X, but to have .test domains
resolve to localhost and to have it run on port 80 you need to do a little
additional configuration.

We've currently only instructed you how to do this on OS X and Ubuntu; pull
requests are welcome.

### Installing

```bash
npm install -g testserve
testserve install
```

Follow the instructions to set up port forwarding and DNS resolution.

### Running

To run the server:

`testserve run`

We don't currently daemonize the server, pull requests to add this
functionality would be welcome. In the mean time we recommend you [set up
`pm2`](http://pm2.keymetrics.io/docs/usage/quick-start/) and then tell it to
run testserve with:

`pm2 run /path/to/testserve -- run --exponential-backoff && pm2 dump`

### Configuring subdomains

#### Port forwarding

To set up a subdomain, simply run

`testserve add mysite 1337`

This'll tell testserve to proxy all HTTP requests for `mysite.test`
and `mysite.*.*.*.*.xip.io` to `localhost:1337`

#### Static files

Alternatively, to serve static files:

`testserve add staticsite /path/to/public`

This'll tell testserve to serve static content from `/path/to/public/` to anyone
requesting `http://staticsite.dev/`

#### SSL certificates

If you want a local domain to be served with SSL you must generate a
certificate for it:

`testserve ssl staticsite`

Then follow the instructions.

#### DNS resolution fails whilst offline

This is an issue with discoveryd (it also affects Pow - see
https://github.com/basecamp/pow/issues/471) - should be fixed by
updating to OS X 10.10.4

## TODO

Pull requests welcome!

- Tests
- Daemonize
- Scripts directory organzation
```
testserve
└── extras
    ├── macos-launchd
    ├── supervisord
    ├── systemd
    └── systemv
```
- Homebrew (`node` formula dependency) [Homebrew CONTRIBUTING](https://github.com/caskroom/homebrew-cask/blob/master/CONTRIBUTING.md)
- Linux instructions

# Forked from [mehserve](https://github.com/benjie/mehserve).
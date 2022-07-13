'use strict';

const Koa = require('koa');
const app = module.exports = new Koa();

const config = require('./config');
const path = require('path');
const Router = require('koa-router');
const router = new Router({
    prefix: process.env.ROUTER_PREFIX ? process.env.ROUTER_PREFIX : undefined
});
const logger = require('koa-logger');
const views = require('co-views');
const serveStatic = require('koa-static');
const server = require('http').createServer(app.callback());
const mount = require('koa-mount');

const render = views(path.join(__dirname, 'views'), {
    default: "pug",
    extension: "pug"
});

app.use(logger());
app.use(mount('/admin', require('./routes/admin/index.js')));
app.use(mount('/api', require('./routes/api/index.js')));

require('./routes')(app, router, render, server);

app.use(serveStatic(config.publicFolder));

if (!module.parent) {
    var port = process.env.PORT || config.port || 16016;
    server.listen(port);
    console.log('Running %s site at: http://localhost:%d', config.mode || process.env.NODE_ENV, port);
} else {
    module.exports = app
}
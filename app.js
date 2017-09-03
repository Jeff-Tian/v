'use strict';

const koa = require('koa');
const app = module.exports = koa();
const config = require('./config');
const path = require('path');
const fs = require('fs');
const router = require('koa-router')();
const logger = require('koa-logger');
const views = require('co-views');
const serveStatic = require('koa-static');
const server = require('http').createServer(app.callback());

const render = views(path.join(__dirname, 'views'), {
    default: "pug",
    extension: "pug"
});

app.use(logger());

require('./routes')(app, router, render, server);

if (['producation', 'prd', 'uat', 'qa'].indexOf(process.env.NODE_ENV) >= 0) {
    app.use(serveStatic('client/build'));
} else {
    app.use(serveStatic('client/public'));
}

if (!module.parent) {
    var port = process.env.PORT || config.port || 16016;
    server.listen(port);
    console.log('Running %s site at: http://localhost:%d', config.mode || process.env.NODE_ENV, port);
}
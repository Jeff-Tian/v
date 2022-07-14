const k2e = require('koa-to-express');

process.env.ROUTER_PREFIX = '/api';

const app = require('../app');

const expressApp = require('express')();

app.middleware.map(m => {
    expressApp.use(k2e(m));
})

module.exports = expressApp;
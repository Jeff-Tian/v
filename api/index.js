const k2e = require('@jeff-tian/koa-to-express');

process.env.ROUTER_PREFIX = '/api';

const app = require('../app');

const expressApp = require('express')();
expressApp.set('trust proxy', true);

app.middleware.map(m => {
    expressApp.use(k2e(m));
})

module.exports = expressApp;
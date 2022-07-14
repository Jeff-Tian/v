const serverless = require('serverless-http');
const k2e = require('koa-to-express');

const koaMiddleware = (ctx, next) => {
    ctx.body = 'hello';
    return next();
}

process.env.ROUTER_PREFIX = '/api';

const app = require('../app');

const expressApp = require('express')();

expressApp.use(k2e(koaMiddleware));

module.exports = expressApp;
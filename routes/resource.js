'use strict';

const config = require('../config');
const proxy = require('./proxy');
const koaMount = require('koa-mount');

module.exports = function (app, router, parse) {
    if (!process.env.NODE_ENV !== 'prd') {
        app.use(koaMount('/resources', function *() {
            this.body = yield proxy({
                host: 'www.buzzbuzzenglish.com',
                port: 80,
                path: '/resources' + this.request.url,
                method: 'GET'
            });
        }));
    }
};
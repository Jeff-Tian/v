'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const proxy = require('./proxy');
const Router = require('koa-router');

module.exports = function (app, router, parse) {
    router
        .post(serviceUrls.sso.signIn.frontEnd, function *(next) {
            let data = yield parse(this.request);
            data.application_id = config.applicationId;

            this.body = yield proxy({
                host: config.sso.inner.host,
                port: config.sso.inner.port,
                path: serviceUrls.sso.signIn.upstream,
                method: 'POST',
                data: data
            });
        })
    ;
};
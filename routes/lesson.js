'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const proxy = require('./proxy');
const Router = require('koa-router');
const qs = require('querystring');

module.exports = function (app, router, parse) {
    router
        .get(serviceUrls.buzz.courses.list.frontEnd, function *(next) {
            console.log('find courses');
            console.log(this.query);
            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.courses.list.upstream + '?' + qs.stringify(this.query),
                method: 'GET'
            });
        })
        .put(serviceUrls.buzz.courses.list.frontEnd, function *(next) {
            let data = yield parse(this.request);

            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.courses.list.upstream,
                method: 'PUT',
                data: data
            });
        })
        .post(serviceUrls.buzz.courses.list.frontEnd, function *(next) {
            let data = yield parse(this.request);

            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.courses.list.upstream,
                method: 'POST',
                data: data
            });
        })
        .get(serviceUrls.buzz.courses.get.frontEnd, function *(next) {
            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(serviceUrls.buzz.courses.get.upstream, {
                    category: this.params.category,
                    level: this.params.level,
                    lesson_id: this.params.lesson_id
                }),
                method: 'GET'
            })
        })
    ;
};
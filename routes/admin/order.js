'use strict';
const auth = require('koa-basic-auth');
const mount = require('koa-mount');

module.exports = function (app, router, parse) {
    app.use(mount('/admin', auth({ name: process.env.V_ADMIN, pass: process.env.V_PWD })));

    router.get('/admin/orders', function *(){
        this.body = 'OK';
    });
};
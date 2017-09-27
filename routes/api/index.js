const auth = require('koa-basic-auth');
const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const orderBll = require('../../bll/order');
const readFile = require('../../common/readFile');
const path = require('path');
const config = require('../../config');
const parse = require('co-body');
const orderStatus = require('../../bll/orderStatus');

router.get('/order/:orderId', function* (next) {
    this.body = orderBll.get(this.params.orderId);
});

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;
const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const orderBll = require('../../client/src/bll/order');
const config = require('../../client/src/config');
const asyncProxy = require('../../common/async-proxy');

router
    .get('/order/:orderId', async function (ctx, next) {
        ctx.body = await orderBll.get(ctx.params.orderId);
    })

    .get('/wechat-api/sign', async function (ctx, next) {
        ctx.body = await asyncProxy({
            url: `http://${config.serviceCache.host}:${config.serviceCache.port}/sign/buzz?url=${ctx.query.url}`,
            method: 'GET'
        });
    })
    .get('/proxy/:url', async function (ctx, next) {
        ctx.body = await asyncProxy({
            url: ctx.params.url,
            method: 'GET'
        });
    })
;

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;
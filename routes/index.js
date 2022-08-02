'use strict';

const config = require('../config');
const mount = require('koa-mount');
const serveStatic = require('koa-static');
const fs = require('fs');
const order = require('../bll/order');
const OrderStatus = require('../bll/orderStatus');
const util = require('util');

let readFileThunk = function (src) {
    return new Promise(function (resolve, reject) {
        fs.readFile(src, {
            'encoding': 'utf8'
        }, function (err, data) {
            if (err) return reject(err);

            resolve(data);
        });
    });
};

function helper(app, router, render) {
    const healthcheck = function (ctx, next) {
        ctx.body = {
            everything: 'is ok', time: new Date(), nev: '' + process.env.NODE_ENV
        };
    };

    router
        .get('/healthcheck', healthcheck)
        .post('/healthcheck', healthcheck)
}

function renderIndex() {
    return readFileThunk(__dirname + '/../client/build/index.html');
}

function renderErrorInfo(self, app, router, render, next) {
    return {
        message: 'all the predefined routes are not hit',
        info: util.inspect({self: self, app: app, router: router, render: render, next: next})
    }
}

async function renderIndexResponse(ctx) {
    ctx.body = await renderIndex();
}

function publicRouter(app, router, render) {
    if (['production'].indexOf(process.env.NODE_ENV) >= 0) {
        app.use(serveStatic('client/build', {
            gzip: true, maxage: 1000 * 60 * 60 * 24 * 360
        }));

        router
            .get('/v2.appcache', async function (ctx) {
                ctx.set('Content-Type', 'text/cache-manifest');
                ctx.body = await readFileThunk(__dirname + `/../public/v2.appcache`);
            })
            .get('/order/:orderId', renderIndexResponse)
            .get('/v/:uri/:orderId?', renderIndexResponse)
            .get('/sign-in', renderIndexResponse);

    } else {
        router
            .get('/v2.appcache', async function (ctx) {
                ctx.set('Content-Type', 'text/cache-manifest');
                ctx.body = await readFileThunk(__dirname + `/../public/v2.appcache`);
            })
            .get('/sign-in', renderIndexResponse);
    }

    app.use(mount('/node_modules', serveStatic('client/node_modules', {
        gzip: true, maxage: 1000 * 60 * 60 * 24 * 360
    })));
    app.use(mount('/src', serveStatic('client/src', {
        gzip: true, maxage: 1000 * 60 * 60 * 24 * 360
    })));
}

function socketIO(app, router, render, server) {
    const io = require('socket.io')(server);
    order.setIO(io);
    console.log("socket io set");
    io.on('connection', function (socket) {
        console.log('user connected');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('order-qr-remove', async function (msg) {
            if (typeof msg === 'object') {
                if (msg.message === 'create') {
                    io.emit('order-qr-remove', await order.create('qr-remove', msg.paymentMethod));
                }

                if (msg.message === OrderStatus.claimPaid) {
                    let theOrder = order.get(msg.orderId);
                    theOrder.status = OrderStatus.claimPaid;

                    io.emit('order-qr-remove', {
                        message: OrderStatus.claimPaid, order: theOrder
                    });
                }

                if (config.trustMode) {
                    let theOrder = order.get(msg.orderId);
                    theOrder.status = OrderStatus.paid;

                    order.notifyClient(theOrder);
                }

                if (msg.message === OrderStatus.cancelled) {
                    let theOrder = order.get(msg.orderId);
                    theOrder.status = OrderStatus.cancelled;

                    io.emit('order-qr-remove', {
                        message: OrderStatus.cancelled, order: theOrder
                    });
                }
            }

            io.emit('qr', '权限还未开放，敬请期待。');
        });
    });
}

module.exports = function (app, router, render, server) {
    helper(app, router, render);
    publicRouter(app, router, render);
    socketIO(app, router, render, server);

    app
        .use(router.routes())
        .use(router.allowedMethods());

    app.use(async (ctx, next) => {
        try {
            await next()
            if (ctx.status === 404) {
                ctx.body = renderErrorInfo(ctx, app, router, render, next);
            } else {
            }
        } catch (err) {
            console.error('err = ', err.message, err);
            ctx.body = util.inspect(err);
        }
    })
};
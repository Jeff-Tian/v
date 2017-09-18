'use strict';

const config = require('../config');
const mount = require('koa-mount');
const serveStatic = require('koa-static');
const fs = require('fs');
const coBody = require('co-body');
const order = require('../bll/order');

let readFileThunk = function (src) {
    return new Promise(function (resolve, reject) {
        fs.readFile(src, {
            'encoding': 'utf8'
        }, function (err, data) {
            console.error(err);
            if (err) return reject(err);

            console.log(data.toString());
            resolve(data);
        });
    });
};

function helper(app, router, render) {
    router
        .get('/healthcheck', function* (next) {
            this.body = {
                everything: 'is ok',
                time: new Date(),
                nev: '' + process.env.NODE_ENV
            };
        });
}

function renderIndex() {
    return readFileThunk(__dirname + '/../client/build/index.html');
}

function* renderIndexResponse() {
    this.body = yield renderIndex();
}

function secure(app, router, render) {
    let membership = require('koa-membership')(config);

    router
        .get('/', renderIndexResponse);
}

function publicRouter(app, router, render) {
    app.use(mount('/node_modules', serveStatic('client/node_modules', {
        gzip: true,
        maxage: 1000 * 60 * 60 * 24 * 360
    })));
    app.use(mount('/src', serveStatic('client/src', {
        gzip: true,
        maxage: 1000 * 60 * 60 * 24 * 360
    })));

    router
        .get('/sign-in', renderIndexResponse);
}

function socketIO(app, router, render, server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('user connected');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('order-qr-remove', function (msg) {
            console.log('message: ' + msg);
            if (msg === 'create') {
                io.emit('order-qr-remove', order.create('qr-remove'));
            }
            io.emit('qr', '权限还未开放，敬请期待。');
        });
    });
}

function routeFolder(folder, app, router, render, server) {
    fs.readdir(__dirname + `/${folder}`, function (err, results) {
        if (err) {
            throw err;
        }

        results.forEach(fileName => {
            require(`./${folder}/` + fileName)(app, router, render, server);
        });
    });
}

module.exports = function (app, router, render, server) {
    helper(app, router, render);
    publicRouter(app, router, render);
    // secure(app, router, render);
    socketIO(app, router, render, server);

    app
        .use(router.routes())
        .use(router.allowedMethods());
};
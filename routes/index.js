'use strict';

const config = require('../config');
const mount = require('koa-mount');
const serveStatic = require('koa-static');
const fs = require('fs');
const coBody = require('co-body');

let readFileThunk = function (src) {
    return new Promise(function (resolve, reject) {
        fs.readFile(src, {'encoding': 'utf8'}, function (err, data) {
            console.error(err);
            if (err) return reject(err);

            console.log(data.toString());
            resolve(data);
        });
    });
};

function helper(app, router, render) {
    router
        .get('/healthcheck', function *(next) {
            this.body = {everything: 'is ok', time: new Date(), nev: '' + process.env.NODE_ENV};
        })
    ;
}

function renderIndex() {
    return readFileThunk(__dirname + '/../client/build/index.html');
}

function * renderIndexResponse() {
    this.body = yield renderIndex();
}

function secure(app, router, render) {
    let membership = require('koa-membership')(config);

    router
        .get('/', renderIndexResponse)
        .get('/preview*', renderIndexResponse)
    ;
}

function publicRouter(app, router, render) {
    app.use(mount('/static', serveStatic('client/build/static', {
        gzip: true,
        maxage: 1000 * 60 * 60 * 24 * 360
    })));

    router
        .get('/sign-in', renderIndexResponse)
    ;
}

function api(app, router) {
    require('./lesson')(app, router, coBody);
    require('./sso')(app, router, coBody);
    require('./resource')(app, router, coBody);
}

module.exports = function (app, router, render) {
    helper(app, router, render);
    api(app, router);
    publicRouter(app, router, render);
    secure(app, router, render);

    app
        .use(router.routes())
        .use(router.allowedMethods());
};
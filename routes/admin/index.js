const auth = require('./auth');
const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const orderBll = require('../../bll/order');
const readFile = require('../../common/readFile');
const path = require('path');
let config = require('../../config');
const parse = require('co-body');
const orderStatus = require('../../bll/orderStatus');

function authenticateUser(ctx, username, password, returnUrl) {
    if (username === credentials.name && password === credentials.pass) {
        let token = new Buffer(`${username}:${password}`).toString('base64');

        ctx.cookies.set('auth', token, {
            expires: 0,
            path: '/',
            httpOnly: true
        });

        return {token: token, returnUrl: returnUrl || '/'};
    }

    throw new Error('fuck you!');
}

app.use(function* (next) {
    try {
        if (this.path === '/api/sign-in' && this.method === 'POST') {
            let data = yield  parse(this.request);
            console.log(`Authenticating...`);
            console.log(data);
            return this.body = authenticateUser(this, data.username, data.password, data.returnUrl);
        }

        yield next;
    } catch (ex) {
        console.error('ahhhhhhhhhhhh!   ---', this.path, ex);
        if (ex.status === 401) {
            let authPath = '/sign-in';

            if (this.headers.fetch) {
                ex.message = authPath;
                this.throw(ex);
            } else {
                console.log("redirecting to ", authPath);
                this.redirect(authPath);
            }
        } else {
            this.throw(401, ex);
        }
    }
});

const credentials = {name: process.env.V_ADMIN, pass: process.env.V_PWD};

app.use(auth(credentials));

if (['production', 'prd'].indexOf(process.env.NODE_ENV) >= 0) {
    router.get('/orders', function* (next) {
        let p = path.join(__dirname, `../../client/build`, `/index.html`);
        this.body = yield readFile.thunk(p);
    });
}

router
    .get('/api/orders', function* (next) {
        console.log('fetching orders...');
        this.body = orderBll.list();
    })
    .post('/api/orders/:orderId', function* (next) {
        let o = orderBll.get(this.params.orderId);
        let data = yield parse(this.request);
        o.status = data.status || orderStatus.paid;

        orderBll.notifyClient(o);

        this.body = o;
    })
    .delete('/api/orders/:orderId', function* (next) {
        let o = orderBll.get(this.params.orderId);
        o.status = orderStatus.cancelled;

        orderBll.notifyClient(o);

        this.body = o;
    })

    .get('/api/config', function* (next) {
        this.body = config;
    })
    .put('/api/config', function* (next) {
        let data = yield parse(this.request);
        let newConfig = Object.assign(config, data);

        config.update(newConfig);

        this.body = config;
    })
;

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;
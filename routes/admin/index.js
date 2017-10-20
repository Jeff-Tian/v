const auth = require('./auth');
const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const orderBll = require('../../bll/order');
const readFile = require('../../common/readFile');
const path = require('path');
const config = require('../../config');
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
        console.error('ahhhhhhhhhhhh!');
        if (ex.status === 401) {
            this.redirect('/sign-in');
        } else {
            this.throw(401, ex);
        }
    }
});

const credentials = {name: process.env.V_ADMIN, pass: process.env.V_PWD};

app.use(auth(credentials));

router.get('/orders', function* (next) {
    let p = path.join(__dirname, `../../client/build`, `/index.html`);
    this.body = yield readFile.thunk(p);
});

router
    .get('/api/orders', function* (next) {
        this.body = orderBll.list();
    })
    .post('/api/orders/:orderId', function* (next) {
        let o = orderBll.get(this.params.orderId);
        o.status = orderStatus.paid;

        orderBll.notifyClient(o);

        this.body = o;
    });

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;
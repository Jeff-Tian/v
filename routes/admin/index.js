const auth = require('koa-basic-auth');
const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const orderBll = require('../../bll/order');
const readFile = require('../../common/readFile');
const path = require('path');
const config = require('../../config');
const parse = require('co-body');

function authenticateUser(username, password, returnUrl) {
    if (username === credentials.name && password === credentials.pass) {
        return {token: 'true', returnUrl: returnUrl || '/'};
    }

    throw new Error('fuck you!');
}

app.use(function* (next) {
    try {
        if (this.path === '/api/sign-in' && this.method === 'POST') {
            let data = yield  parse(this.request);
            console.log(`Authenticating...`);
            console.log(data);
            return this.body = authenticateUser(data.username, data.password);
        }

        yield next;
    } catch (ex) {
        if (401 == ex.status) {
            this.status = 401;
            this.set('WWW-Authenticate', 'Basic');
            this.body = '请验证身份';
        } else {
            this.throw(401, ex);
        }
    }
});

const credentials = {name: process.env.V_ADMIN, pass: process.env.V_PWD};

app.use(auth(credentials));

router.get('/orders', function* (next) {
    let p = path.join(__dirname, `../../`, config.publicFolder, `/index.html`);
    this.body = yield readFile.thunk(p);
});

router.get('/api/orders', function* (next) {
    this.body = orderBll.list();
});

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;
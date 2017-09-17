const auth = require('koa-basic-auth');
const koa = require('koa');
const app = koa();
const router = require('koa-router')();

app.use(function* (next) {
    try {
        yield next;
    } catch (ex) {
        if (401 == ex.status) {
            this.status = 401;
            this.set('WWW-Authenticate', 'Basic');
            this.body = '请验证身份';
        } else {
            throw ex;
        }
    }
});

const credentials = {name: process.env.V_ADMIN, pass: process.env.V_PWD};
app.use(auth(credentials));

router.get('/orders', function* (next) {
    this.body = 'orders';
});

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;
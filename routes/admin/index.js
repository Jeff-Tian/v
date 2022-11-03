const auth = require('./auth');
const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const app = new Koa();
app.use(bodyParser());

const router = require('koa-router')();
const orderBll = require('../../client/src/bll/order');
const readFile = require('../../common/readFile');
const path = require('path');
let config = require('../../client/src/config');
const orderStatus = require('../../client/src/bll/orderStatus');
const {authErrorMessage} = require("../../client/src/share/constants");

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

    throw new Error(authErrorMessage);
}

app.use(async function (ctx, next) {
    try {
        console.log('admin path = ', ctx.path);
        if (ctx.path === '/api/sign-in' && ctx.method === 'POST') {
            let data = ctx.request.body
            console.log(`Authenticating...`);
            console.log(data);
            return ctx.body = authenticateUser(ctx, data.username, data.password, data.returnUrl);
        }

        await next();
    } catch (ex) {
        console.error('ahhhhhhhhhhhh!   ---', ctx.path, ex.message);
        if (ex.status === 401) {
            let authPath = '/sign-in';

            if (ctx.headers.fetch) {
                ex.message = authPath;
                ctx.throw(ex);
            } else {
                console.log("redirecting to ", authPath);
                ctx.redirect(authPath);
            }
        } else {
            ctx.throw(401, ex);
        }
    }
});

const credentials = {name: process.env.V_ADMIN, pass: process.env.V_PWD};

app.use(auth(credentials));

if (['production'].indexOf(process.env.NODE_ENV) >= 0) {
    router.get('/orders', async function (ctx, next) {
        let p = path.join(__dirname, `../../client/build`, `/index.html`);
        ctx.body = await readFile.thunk(p);
    });
}

router
    .get('/api/orders', async function (ctx, next) {
        console.log('fetching orders...');
        ctx.body = orderBll.list();
    })
    .post('/api/orders/:orderId', async function (ctx, next) {
        let o = orderBll.get(ctx.params.orderId);
        let data = ctx.request.body;
        o.status = data.status || orderStatus.paid;

        orderBll.notifyClient(o);

        ctx.body = o;
    })
    .delete('/api/orders/:orderId', async function (ctx, next) {
        let o = orderBll.get(ctx.params.orderId);
        o.status = orderStatus.cancelled;

        orderBll.notifyClient(o);

        ctx.body = o;
    })

    .get('/api/config', async function (ctx, next) {
        ctx.body = config;
    })
    .put('/api/config', async function (ctx, next) {
        let newConfig = Object.assign(config, ctx.request.body);

        config.update(newConfig);
        console.log('newConfig = ', config);

        ctx.body = config;
    })
;

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;
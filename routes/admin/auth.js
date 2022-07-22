'use strict';

const assert = require('assert');
const auth = require('./simple-form-auth');
const basicAuth = require('basic-auth');

module.exports = function (opts) {
    opts = opts || {};

    assert(opts.name, 'simple form auth .name required');
    assert(opts.pass, 'simple form auth .pass required');

    return async function simpleFormAuth(ctx, next) {
        try {
            let user = basicAuth(ctx) || auth(ctx);

            if (user && user.name === opts.name && user.pass === opts.pass) {
                await next();
            } else {
                console.error(`Auth failed. Tried with ${user.name}:${user.pass} to match ${opts.name}:${opts.pass}`);
                throw new Error(`Auth failed`);
            }
        } catch (ex) {
            console.error(ex);
            console.log("throwing 401...");
            ctx.throw(401, ex);
        }
    };
};
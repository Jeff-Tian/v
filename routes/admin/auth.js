'use strict';

const assert = require('assert');
const auth = require('./simple-form-auth');
const basicAuth = require('basic-auth');

module.exports = function (opts) {
    opts = opts || {};

    assert(opts.name, 'simple form auth .name required');
    assert(opts.pass, 'simple form auth .pass required');

    return function* simpleFormAuth(next) {
        try {
            let user = basicAuth(this) || auth(this);

            if (user && user.name === opts.name && user.pass === opts.pass) {
                yield next;
            } else {
                throw new Error('auth failed');
            }
        } catch (ex) {
            this.throw(401, ex);
        }
    };
};
'use strict';

const assert = require('assert');
const auth = require('./simple-form-auth');
const basicAuth = require('basic-auth');

module.exports = function (opts) {
    opts = opts || {};

    assert(opts.name, 'simple form auth .name required');
    assert(opts.pass, 'simple form auth .pass required');

    return function* simpleFormAuth(next) {
        let user = basicAuth(this) || auth(this);

        if (user && user.name === opts.name && user.pass === opts.pass) {
            yield next;
        } else {
            this.throw(401);
        }
    };
};
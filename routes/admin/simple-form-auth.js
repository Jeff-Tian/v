'use strict';

const USER_PASS_REGEXP = /^([^:]*):(.*)$/;

function Credentials(name, pass) {
    this.name = name;
    this.pass = pass;
}

function parse(cookie) {
    if (typeof cookie !== 'string') {
        return undefined;
    }

    let userPass = USER_PASS_REGEXP.exec(decodeBase64(cookie));

    if (!userPass) {
        return undefined;
    }

    return new Credentials(userPass[1], userPass[2]);
}

function getAuthorization(ctx) {
    if (!ctx.cookies.get('auth')) {
        throw new Error('auth cookie must be set');
    }

    return ctx.cookies.get('auth');
}

function decodeBase64(str) {
    return new Buffer(str, 'base64').toString();
}

function auth(ctx) {
    if (!ctx) {
        throw new TypeError('argument ctx is required')
    }

    if (typeof ctx !== 'object') {
        throw new TypeError('argument ctx is required to be an object');
    }

    let cookie = getAuthorization(ctx);

    return parse(cookie);
}

module.exports = auth;
module.exports.parse = parse;
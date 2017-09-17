'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../../app');

require('co-mocha');

let server = app.listen();

describe('admin order features', function () {
    it('requires log on', function* () {
        yield  request(server).get('/admin/orders')
            .expect(401).expect('请验证身份')
            .end();

        yield request(server).get('/admin/orders')
            .auth(process.env.V_ADMIN, process.env.V_PWD).expect(200).expect('orders')
            .end();
    });
});
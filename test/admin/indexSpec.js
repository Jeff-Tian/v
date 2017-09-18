'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../../app'),
    orderBLL = require('../../bll/order');

require('co-mocha');
let expect = require('expect.js');

let server = app.listen();

describe('admin index features', function () {
    it('show error for nonadmin', function* () {
        yield  request(server).post('/admin/api/sign-in')
            .send({
                username: 'badguy',
                password: ''
            })
            .expect(401)
            .end();
    });

    it('allows admin sign in', function* () {
        yield  request(server).post('/admin/api/sign-in')
            .send({
                username: process.env.V_ADMIN,
                password: process.env.V_PWD
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
                assert(res.body.token);
                assert(res.body.returnUrl);
            })
            .end();
    });
});
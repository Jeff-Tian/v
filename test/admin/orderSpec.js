'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../../app'),
    orderBLL = require('../../bll/order');

require('co-mocha');
let expect = require('expect.js');

let server = app.listen();

describe('admin order features', function () {
    it('requires log on for accessing admin orders page', function* () {
        yield  request(server).get('/admin/orders')
            .expect(401).expect('请验证身份')
            .end();
    });

    it('allows accessing admin orders page after log on', function *() {
        yield request(server).get('/admin/orders')
            .auth(process.env.V_ADMIN, process.env.V_PWD)
            .expect(200)
            .end();
    });

    it('requires log on for accessing admin api orders', function *(){
        yield  request(server).get('/admin/api/orders')
            .expect(401).expect('请验证身份')
            .end();
    });

    it('lists all orders', function*(){
        orderBLL.create('qr-remove');
        orderBLL.create('qr-remove');

        expect(orderBLL.list().length).to.be(2);

        yield request(server).get('/admin/api/orders')
            .auth(process.env.V_ADMIN, process.env.V_PWD)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
                assert(res.body.length, 2);
                assert(res.body[0].status, 'pending-pay');
            })
            .end();
    });
});
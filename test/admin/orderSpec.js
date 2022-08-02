'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../../app'),
    orderBLL = require('../../bll/order');

require('co-mocha');
let expect = require('expect.js');
const order = require("../../bll/order");
const orderStatus = require("../../bll/orderStatus");
const nock = require("nock");

let server = app.listen();

describe('admin order features', function () {
    // const scope = nock('https://uni-orders-jeff-tian.cloud.okteto.net').persist()
    const scope = nock('http://uni-orders:3000').persist()

    it('requires log on for accessing admin api orders', function* () {
        yield  request(server).get('/admin/api/orders')
            .expect(302)
            .end();
    });

    it('lists all orders', function* () {
        scope.post('/orders', "{\"cents\":1,\"remark\":\"v-order\",\"type\":\"qr-remove\"}").reply(200,
            {
                "id": 5,
                "number": "2022-08-02-16294579",
                "cents": 1,
                "randomDiscountCents": 1,
                "status": 0,
                "created_at": "2022-08-02T04:58:14.579Z",
                "paid_at": null,
                "cancelled_at": null,
                "timeout_at": null,
                "remark": "v-order"
            })

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

    describe('uni-orders', () => {
        it('converts uni-order to v-order', () => {
            const uniOrder = {
                "id": 4,
                "number": "2020-12-29-41899524",
                "cents": 100,
                "randomDiscountCents": 22,
                "status": 3,
                "created_at": "2020-12-29T11:38:19.524Z",
                "paid_at": null,
                "cancelled_at": null,
                "timeout_at": null,
                "remark": "创世订单"
            }

            const vOrder = order.convertUniOrderToVOrder(uniOrder)
            assert.deepStrictEqual(vOrder, {
                "createdTime": "2020-12-29T11:38:19.524Z",
                "orderId": 4,
                "paymentMethod": "uniOrder",
                "status": "pending-pay",
                "type": "创世订单",
                "updatedTime": "2020-12-29T11:38:19.524Z"
            })
        })

        describe('converts uni order status to v order status', () => {
            it('created --> pending pay', () => {
                const uniOrderStatus = 0
                assert.equal(order.convertUniOrderStatusToVOrderStatus(uniOrderStatus), orderStatus.pendingPay)
            })

            it('paid --> paid', () => {
                assert.equal(order.convertUniOrderStatusToVOrderStatus(1), orderStatus.paid)
            })

            it('cancelled --> cancelled', () => {
                assert.equal(order.convertUniOrderStatusToVOrderStatus(2), orderStatus.cancelled)
            })

            it('timeout --> timeout', () => {
                assert.equal(order.convertUniOrderStatusToVOrderStatus(3), orderStatus.pendingPay)
            })
        })
    })
});
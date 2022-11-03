'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../../app'),
    orderBLL = require('../../client/src/bll/order');

require('co-mocha');
let expect = require('expect.js');
const order = require("../../client/src/bll/order");
const orderStatus = require("../../client/src/bll/orderStatus");
const nock = require("nock");

let server = app.listen();

describe('admin order features', function () {
    // const scope = nock('https://uni-orders-jeff-tian.cloud.okteto.net').persist()
    // const scope = nock('http://uni-orders:3000').persist()
    const scope = nock(app.config.uniOrders.url).persist()

    it('requires log on for accessing admin api orders', function* () {
        yield  request(server).get('/admin/api/orders')
            .expect(302)
            .end();
    });

    it('lists all orders', async function () {
        console.log('app.config = ', app.config);
        const fakeOrder = {
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
        };

        scope
            .post('/orders', "{\"cents\":100,\"remark\":\"v-order\",\"type\":\"qr-remove\"}")
            .reply(200,
                fakeOrder)

        scope.persist().get('/orders').reply(200, {data: [fakeOrder, fakeOrder]})

        // await orderBLL.create('qr-remove');
        await orderBLL.create('qr-remove');

        expect((await orderBLL.list()).length).to.be(2);

        await request(server).get('/admin/api/orders')
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
                "remark": "创世订单",
                "paymentMethod": "wecom-pay",
            }

            const vOrder = order.convertUniOrderToVOrder(uniOrder)
            assert.deepStrictEqual(vOrder, {
                "createdTime": "2020-12-29T11:38:19.524Z",
                "orderId": 4,
                "paymentMethod": "wecom-pay",
                "status": "timeout",
                "type": "创世订单",
                "updatedTime": "2020-12-29T11:38:19.524Z",
                "cents": 100,
                "finalCents": 78,
                "randomDiscountCents": 22,
                "orderNumber": "2020-12-29-41899524"
            })

            const uOrder = {
                number: '2022-10-06-51663370',
                cents: 2,
                randomDiscountCents: 1,
                status: 0,
                created_at: '2022-10-06T10:21:03.370Z',
                remark: 'v-order',
                type: 'qr-remove',
                paymentMethod: 'wecom-pay',
                paid_at: null,
                cancelled_at: null,
                timeout_at: null,
                id: 21
            }

            const res2 = order.convertUniOrderToVOrder(uOrder)
            assert.deepStrictEqual(res2, {
                "createdTime": "2022-10-06T10:21:03.370Z",
                "orderId": 21,
                "paymentMethod": "wecom-pay",
                "status": "pending-pay",
                "type": "v-order",
                "updatedTime": "2022-10-06T10:21:03.370Z",
                "cents": 2,
                "finalCents": 1,
                "randomDiscountCents": 1,
                "orderNumber": "2022-10-06-51663370"
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
                assert.equal(order.convertUniOrderStatusToVOrderStatus(3), orderStatus.timeout)
            })
        })
    })
});
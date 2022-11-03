const {v1: uuidv1} = require('uuid');
const orderStatus = require('./orderStatus');
const axios = require("axios");
const config = require('../config')

let orders = {};
let io = null;

module.exports = {
    convertUniOrderStatusToVOrderStatus(uniOrderStatus) {
        switch (uniOrderStatus) {
            case 0:
                return orderStatus.pendingPay
            case 1:
                return orderStatus.paid
            case 2:
                return orderStatus.cancelled
            case 3:
                return orderStatus.timeout
            default:
                throw new Error(`unrecognized uniOrderStatus: ${uniOrderStatus}`)
        }
    },

    convertUniOrderToVOrder(uniOrder) {
        return {
            status: this.convertUniOrderStatusToVOrderStatus(uniOrder.status),
            createdTime: uniOrder.created_at,
            updatedTime: uniOrder.created_at,
            type: uniOrder.remark,
            paymentMethod: uniOrder.paymentMethod || 'uniOrder',
            orderId: uniOrder.id,
            cents: uniOrder.cents,
            randomDiscountCents: uniOrder.randomDiscountCents,
            finalCents: uniOrder.cents - uniOrder.randomDiscountCents,
            orderNumber: uniOrder.number,
        }
    },

    create: async function (type, paymentMethod) {
        let orderId = uuidv1();

        orders[orderId] = {
            status: orderStatus.pendingPay,
            createdTime: new Date(),
            updatedTime: new Date(),
            type: type,
            paymentMethod: paymentMethod,
            orderId: orderId
        };

        const res = await axios.post(`${config.uniOrders.url}/orders`, {
            cents: 100,
            remark: type || `v-order`,
            type,
            paymentMethod
        })

        return this.convertUniOrderToVOrder(res.data);
    },

    list: async function () {
        return axios.get(`${config.uniOrders.url}/orders`).then(({data: {data: orders}}) => orders.map(this.convertUniOrderToVOrder.bind(this)))
    },

    get: async function (orderId) {
        const {data: order} = await axios.get(`${config.uniOrders.url}/orders/${orderId}`)
        console.log('uniorder = ', order)
        return this.convertUniOrderToVOrder(order)
    },

    notifyClient: function (order) {
        if (!io) {
            console.error('io not set');
            return;
        }

        if (order.status === orderStatus.paid) {
            io.emit('order-paid', order);
        }

        if (order.status === orderStatus.pendingPay) {
            io.emit('order-pending', order);
        }
    },

    setIO: function (newIO) {
        io = newIO;
    }
};
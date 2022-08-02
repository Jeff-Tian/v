const uuidv1 = require('uuid/v1');
const orderStatus = require('./orderStatus');
const axios = require("axios");

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
                return orderStatus.pendingPay
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
            paymentMethod: 'uniOrder',
            orderId: uniOrder.id
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

        const res = await axios.post('http://uni-orders:3000/orders', {
            cents: 2,
            remark: `v-order`,
            type,
            paymentMethod
        })

        console.log('res = ', res.data);

        return this.convertUniOrderToVOrder(res.data);
    },

    list: function () {
        return axios.get(`http://uni-orders:3000/orders`).then(({data: orders}) => orders.map(this.convertUniOrderToVOrder))
    },

    get: async function (orderId) {
        const {data: order} = await axios.get(`http://uni-orders:3000/orders/${orderId}`)
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
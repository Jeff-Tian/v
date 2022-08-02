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
            cents: 1,
            remark: `v-order`,
            type,
            paymentMethod
        })

        console.log('res = ', res.data);

        return res.data;
    },

    list: function () {
        let orderList = Object.keys(orders).map(orderId => orders[orderId]);

        return orderList.sort((o1, o2) => {
            if (o1.createdTime > o2.createdTime) {
                return -1;
            }

            if (o1.createdTime < o2.createdTime) {
                return 1;
            }

            return 0;
        });
    },

    get: function (orderId) {
        return orders[orderId] || {};
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
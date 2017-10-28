const uuidv1 = require('uuid/v1');
const orderStatus = require('./orderStatus');

let orders = {};
let io = null;

module.exports = {
    create: function (type, paymentMethod) {
        let orderId = uuidv1();

        orders[orderId] = {
            status: orderStatus.pendingPay,
            createdTime: new Date(),
            updatedTime: new Date(),
            type: type,
            paymentMethod: paymentMethod,
            orderId: orderId
        };

        return orders[orderId];
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
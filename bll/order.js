const uuidv1 = require('uuid/v1');
const orderStatus = require('./orderStatus');

let orders = {};

module.exports = {
    create: function (type) {
        let orderId = uuidv1();

        orders[orderId] = {
            status: orderStatus.pendingPay,
            createdTime: new Date(),
            updatedTime: new Date(),
            type: type,
            orderId: orderId
        };

        return orders[orderId];
    },

    list: function () {
        let orderList = Object.keys(orders).map(orderId => orders[orderId]);

        return orderList.sort((o1, o2) => {
            if (o1.createdTime > o2.createdTime) {
                return 1;
            }

            if (o1.createdTime < o2.createdTime) {
                return -1;
            }

            return 0;
        });
    },

    get: function (orderId) {
        return orders[orderId];
    }
};
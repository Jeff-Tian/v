import Auth from './auth/auth';
import {browserHistory} from 'react-router';
import OrderStatus from './bll/orderStatus';
import {authErrorMessage} from "./share/constants";

async function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        const error = new Error(`HTTP Error: ${response.statusText}`);
        error.statusText = response.statusText;
        error.status = response.status;
        error.authPath = await response.text();
        throw error;
    }
}

async function handleError(ex) {
    if (ex.status === 401) {
        if (ex.authPath) {
            browserHistory.push(ex.authPath);
        } else {
            console.error(authErrorMessage);
        }
    }

    console.error('ex = ', ex, JSON.stringify(ex));
}

export default {
    fetchOrders: async function () {
        let authHeader = {
            Authorization: `Basic ${Auth.getToken()}`,
            fetch: true
        };

        try {
            let response = await fetch('/admin/api/orders', {
                accept: 'application/json',
                headers: authHeader
            });

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
        }
    },

    fetchOrder: async function (orderId) {
        try {
            let response = await fetch(`/api/order/${orderId}`, {
                accept: 'application/json'
            });

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
        }
    },

    markAsPaid: async function (orderId) {
        try {
            let response = await fetch(`/admin/api/orders/${orderId}`, {
                method: 'POST',
                accept: 'application/json',
                headers: Object.assign(Auth.getAutherizationHeader(), {
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    status: OrderStatus.paid
                })
            });

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
        }
    },

    markAsUnpaid: async function (orderId) {
        try {
            let response = await fetch(`/admin/api/orders/${orderId}`, {
                method: 'POST',
                accept: 'application/json',
                headers: Object.assign(Auth.getAutherizationHeader(), {
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    status: OrderStatus.pendingPay
                })
            });

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
        }
    },

    updateConfig: async function (newConfig) {
        try {
            let response = await fetch(`/admin/api/config`, {
                method: 'PUT',
                accept: 'application/json',
                headers: Object.assign(Auth.getAutherizationHeader(), {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(newConfig)
            });

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
            throw ex;
        }
    },

    getConfig: async function () {
        try {
            let response = await fetch(`/admin/api/config`, {
                method: 'GET',
                accept: 'application/json',
                headers: Auth.getAutherizationHeader()
            });

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
            throw ex;
        }
    },

    proxy: async function (url, options) {
        try {
            let response = await fetch(url, Object.assign({
                method: 'GET',
                accept: 'application/json',
                headers: Auth.getAutherizationHeader()
            }, options));

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
            throw ex;
        }
    }
}
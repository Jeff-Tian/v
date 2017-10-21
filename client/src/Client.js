import Auth from './auth/auth';
import {browserHistory} from 'react-router';

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
            console.error('fuck you!');
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
        let authHeader = {
            Authorization: `Basic ${Auth.getToken()}`
        };

        try {
            let response = await fetch(`/admin/api/orders/${orderId}/`, {
                method: 'POST',
                accept: 'application/json',
                headers: authHeader
            });

            return (await checkStatus(response)).json();
        } catch (ex) {
            await handleError(ex);
        }
    }
}
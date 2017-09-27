import Auth from './auth/auth';

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        const error = new Error(`HTTP Error: ${response.statusText}`);
        error.status = response.statusText;
        error.response = response;
        console.log(error); // eslint-disable-line no-console
        throw error;
    }
}

let authHeader = {
    Authorization: `Basic ${Auth.getToken()}`
};

export default {
    fetchOrders: async function () {
        try {
            let response = await fetch('/admin/api/orders', {
                accept: 'application/json',
                headers: authHeader
            });

            return checkStatus(response).json();
        } catch (ex) {
            console.error(ex);
        }
    },

    fetchOrder: async function (orderId) {
        try {
            let response = await fetch(`/api/order/${orderId}`, {
                accept: 'application/json'
            });

            return checkStatus(response).json();
        } catch (ex) {
            console.error(ex);
        }
    },

    markAsPaid: async function (orderId) {
        try {
            let response = await fetch(`/admin/api/orders/${orderId}/`, {
                method: 'POST',
                accept: 'application/json',
                headers: authHeader
            });

            return checkStatus(response).json();
        } catch (ex) {
            console.error(ex);
        }
    }
}
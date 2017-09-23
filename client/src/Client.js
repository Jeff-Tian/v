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

function parseJSON(response) {
    return response.json();
}

export default {
    fetchOrders: async function () {
        let token = Auth.getToken();

        try {
            let response = await fetch('/admin/api/orders', {
                accept: 'application/json',
                headers: {Authorization: `Basic ${token}`}
            });

            response = checkStatus(response);

            return parseJSON(response);
        }catch(ex){
            console.error(ex);
        }
    }
}
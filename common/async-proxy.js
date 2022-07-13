'use strict';

const request = require('co-request');

function composeUrl(host, port, path) {
    return 'http://' + host + ':' + port + path;
}

/**
 * Proxy
 * @param settings
 *  Always pass data even with 'GET' request to avoid 'Unsupported Media Type' error
 *  Always pass host and port to avoid host or port undefined error
 * @returns {*}
 */
async function proxy(settings) {
    let option = {
        uri: settings.url || composeUrl(settings.host, settings.port, settings.path),
        method: settings.method || 'POST'
    };

    if (settings.data) {
        option.json = Object.assign(settings.data, {
            application_id: config.applicationId
        });
    }

    try {
        let result = await request(option);
        return result.body;
    } catch (ex) {
        throw ex;
    }
}

module.exports = proxy;
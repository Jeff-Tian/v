'use strict';

const config = require('../config');
const request = require('co-request');

function composeUrl(host, port, path) {
    return 'http://' + host + ':' + port + path;
}

function *proxy(settings) {
    let option = {
        uri: composeUrl(settings.host, settings.port, settings.path),
        method: settings.method || 'POST'
    };

    if (settings.data) {
        option.json = Object.assign(settings.data, {
            application_id: config.applicationId
        });
    }

    let result = yield request(option);

    result = result.body;

    return result;
}

module.exports = proxy;
'use strict';

const util = require('util');

var config = {
    version: '1.0.0-' + Date.now()
};

var configPath = util.format('./config_%s.js', (process.env.NODE_ENV || 'dev'));

if (process.env.NODE_ENV === 'development') {
    configPath = util.format('./config_%s.js', 'dev');
}

console.log('~~~~~~~~~~~~~~~~~');
console.log(process.env.NODE_ENV);
console.log(process.env.REACT_APP_BUILT_BY);
console.log('~~~~~~~~~~~~~~~~~');

if (process.env.NODE_ENV === 'production') {
    if (['prd'].indexOf(process.env.REACT_APP_BUILT_BY) >= 0) {
        configPath = util.format('./config_%s.js', 'prd');
    } else {
        configPath = util.format('./config_%s.js', 'uat');
    }
}

var envConfig = require(configPath);

config = Object.assign(config, envConfig);

if (process.env.DATACENTER) {
    config.captcha.public.host = process.env.DATACENTER + '-' + config.captcha.public.host;
}

config.serviceUrls = require('./serviceUrls');

module.exports = config;
'use strict';

const util = require('util');
const devConf = require('./config_dev');
const prodConf = require('./config_production');

var config = null;

var configPath = util.format('./config_%s.js', (process.env.NODE_ENV || 'dev'));
console.log('configPath = ', configPath);

if (process.env.NODE_ENV === 'development') {
    configPath = util.format('./config_%s.js', 'dev');
}

console.log('~~~~~~~~~~~~~~~~~');
console.log(process.env.NODE_ENV);
console.log(process.env.REACT_APP_BUILT_BY);

console.log(devConf);
console.log('prodConf = ', prodConf);
console.log('~~~~~~~~~~~~~~~~~');
console.log('configPath = ', configPath);

// var envConfig = require(configPath === '.' ? './index.js' : configPath);

function getConfig() {
    if (!config) {
        config = {
            version: '1.0.0-' + Date.now(),
            publicFolder: 'client/build'
        };

        if (process.env.NODE_ENV === 'production') {
            if (['prd'].indexOf(process.env.REACT_APP_BUILT_BY) >= 0) {
                configPath = util.format('./config_%s.js', 'production');
            } else {
                configPath = util.format('./config_%s.js', 'uat');
            }
        }

        if (['production', 'uat', 'qa'].indexOf(process.env.NODE_ENV) >= 0) {
            config.publicFolder = 'client/build';
        }

        // config = Object.assign(config, envConfig);
    }

    return config;
}


module.exports = getConfig();
module.exports.update = function (newConfig) {
    config = newConfig;
};
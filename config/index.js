'use strict';

const util = require('util');
var config = null;

var configPath = util.format('./config_%s.js', (process.env.NODE_ENV || 'dev'));

if (process.env.NODE_ENV === 'development') {
    configPath = util.format('./config_%s.js', 'dev');
}

console.log('~~~~~~~~~~~~~~~~~');
console.log(process.env.NODE_ENV);
console.log(process.env.REACT_APP_BUILT_BY);
console.log('~~~~~~~~~~~~~~~~~');、

var envConfig = require(configPath);

function getConfig() {
    if (!config) {
        config = {
            version: '1.0.0-' + Date.now(),
            publicFolder: 'client/public'
        };

        if (process.env.NODE_ENV === 'production') {
            if (['prd'].indexOf(process.env.REACT_APP_BUILT_BY) >= 0) {
                configPath = util.format('./config_%s.js', 'prd');
            } else {
                configPath = util.format('./config_%s.js', 'uat');
            }
        }

        if (['producation', 'prd', 'uat', 'qa'].indexOf(process.env.NODE_ENV) >= 0) {
            config.publicFolder = 'client/build';
        }

        config = Object.assign(config, envConfig);
    }

    return config;
}


module.exports = getConfig();
module.exports.update = function (newConfig) {
    config = newConfig;
};
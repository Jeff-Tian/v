'use strict';

const util = require('util');

var config = {
    version: '1.0.0-' + Date.now(),
    publicFolder: 'client/public'
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

if(['producation', 'prd', 'uat', 'qa'].indexOf(process.env.NODE_ENV) >= 0){
    config.publicFolder = 'client/build';
}

var envConfig = require(configPath);

config = Object.assign(config, envConfig);

module.exports = config;
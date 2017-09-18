'use strict';

const fs = require('fs');

let readFileThunk = function (src) {
    return new Promise(function (resolve, reject) {
        fs.readFile(src, {
            'encoding': 'utf8'
        }, function (err, data) {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

module.exports = {
    thunk: readFileThunk
};
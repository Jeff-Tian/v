'use strict';

module.exports = {
    readImageFromFile: function (target, callback) {
        if (target.files && target.files[0]) {
            let fr = new FileReader();
            fr.onload = function (e) {
                if (typeof callback === 'function') {
                    callback(e.target.result);
                }
            };
            fr.readAsDataURL(target.files[0]);
        }
    }
};
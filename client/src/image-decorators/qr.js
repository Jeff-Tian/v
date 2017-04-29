'use strict';

module.exports = {
    decorate: function (canvas, context, theInscribedCircle, qr, callback) {
        const img = new Image();
        img.onload = function () {
            let qrCenter = theInscribedCircle.center;
            let width = 2 * theInscribedCircle.radius / 6.18;
            let height = width * img.height / img.width;
            context.drawImage(img, 0, 0, img.width, img.height, qrCenter.x - width / 2, qrCenter.y - height / 2, width, height);

            if (typeof callback === 'function') {
                callback(canvas);
            }
        };
        img.src = qr;
    }
};
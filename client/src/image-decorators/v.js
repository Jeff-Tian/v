'use strict';

module.exports = {
    decorate: function (canvas, context, theInscribedCircle, v, callback) {
        const img = new Image();
        img.onload = function () {
            let vCenter = {
                x: theInscribedCircle.radius / Math.sqrt(2),
                y: theInscribedCircle.radius / Math.sqrt(2)
            };
            let width = 2 * theInscribedCircle.radius / 3.82;
            let height = width * img.height / img.width;
            context.drawImage(img, 0, 0, img.width, img.height, theInscribedCircle.center.x + vCenter.x - width / 2, theInscribedCircle.center.y + vCenter.y - height / 2, width, height);

            if (typeof callback === 'function') {
                callback(canvas);
            }
        };
        img.src = v;
    }
};
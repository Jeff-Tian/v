const exports = {
    decorateQR: async function (canvas, context, theInscribedCircle, qr) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function () {
                let qrCenter = theInscribedCircle.center;
                let width = 2 * theInscribedCircle.radius / 6.18;
                let height = width * img.height / img.width;
                context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, qrCenter.x - width / 2, qrCenter.y - height / 2, width, height);

                resolve(canvas);
            };
            img.src = qr;
        });
    }
};

export default exports;
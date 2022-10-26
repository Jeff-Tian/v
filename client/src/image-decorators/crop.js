import shape from './shape';

function getPanRange(image, rotated) {
    console.log('(w, h) = ', image.naturalWidth, image.naturalHeight);

    function transpose(c) {
        let temp = c.x;

        c.x = c.y;
        c.y = temp;
    }

    let res = {x: Math.abs(image.naturalHeight - image.naturalWidth) / 2, y: 0};

    if (image.naturalHeight > image.naturalWidth) {
        transpose(res);
    }

    if (rotated === -90 || rotated === -270) {
        transpose(res);
    }

    return res;
}

function getOffset(img, offsetX, offsetY, rotated) {
    let panRange = getPanRange(img, rotated);

    if (rotated === -90) {
        return {
            offsetX: panRange.y + offsetY,
            offsetY: panRange.x - offsetX
        };
    }

    if (rotated === -180) {
        return {
            offsetX: panRange.x + offsetX,
            offsetY: panRange.y + offsetY
        };
    }

    if (rotated === -270) {
        return {
            offsetX: panRange.y - offsetY,
            offsetY: panRange.x + offsetX
        };
    }

    return {
        offsetX: panRange.x - offsetX,
        offsetY: panRange.y - offsetY
    };
}

const exports = {
    circleCropImageToCanvas: function (img, canvas, context, offsetX, offsetY, scaleX, scaleY, rotated) {
        let min = Math.min(img.naturalWidth, img.naturalHeight);

        context.save();
        let c = shape.drawInscribedCircle(canvas, context);
        context.clip();

        let offset = getOffset(img, offsetX / scaleX, offsetY / scaleY, rotated);

        if (!rotated) {
            context.drawImage(img, offset.offsetX, offset.offsetY, min, min, 0, 0, canvas.width, canvas.height);
        } else {
            let angle = rotated * Math.PI / 180;
            let x = canvas.width / 2;
            let y = canvas.height / 2;
            context.translate(x, y);
            context.rotate(angle);
            context.translate(-x, -y);
            context.drawImage(img, offset.offsetX, offset.offsetY, min, min, 0, 0, canvas.width, canvas.height);
            context.rotate(-angle);
        }

        context.restore();

        return c;
    },

    getPanRange: getPanRange
};

export default exports;
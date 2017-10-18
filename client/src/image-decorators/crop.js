import shape from './shape';

let minResolution = 400;

function getOffset(img, offsetX, offsetY, rotated) {
    if (rotated === 0) {
        return {
            offsetX: offsetX,
            offsetY: offsetY
        };
    }

    if (rotated === -90) {
        return {
            offsetX: offsetY,
            offsetY: offsetX
        };
    }

    if (rotated === -180) {
        return {
            offsetX: -offsetX,
            offsetY: -offsetY
        };
    }

    if (rotated === -270) {
        return {
            offsetX: -img.naturalWidth / 2 + offsetX,
            offsetY: -img.naturalHeight / 2 + offsetY
        };
    }

    return {
        offsetX: offsetX,
        offsetY: offsetY
    };
}

module.exports = {
    circleCropImageToCanvas: function (img, canvas, context, offsetX, offsetY, scaleX, scaleY, rotated) {
        let min = Math.min(img.naturalWidth, img.naturalHeight);
        scaleX = scaleX || img.naturalWidth / img.width;
        scaleY = scaleY || img.naturalHeight / img.height;

        canvas.width = min;
        canvas.height = min;

        if (min < minResolution) {
            canvas.width = minResolution;
            canvas.height = minResolution;
        }

        context.save();
        let c = shape.drawInscribedCircle(canvas, context);
        // context.clip();

        console.log('before rotate: ', offsetX * scaleX, offsetY * scaleY);
        let offset = getOffset(img, offsetX * scaleX, offsetY * scaleY, rotated);
        console.log('after rotate: ', offset, rotated);

        if (!rotated) {
            context.drawImage(img, -offset.offsetX, -offset.offsetY, min, min, 0, 0, canvas.width, canvas.height);
        } else {
            let angle = rotated * Math.PI / 180;
            let x = canvas.width / 2;
            let y = canvas.height / 2;
            context.translate(x, y);
            context.rotate(angle);
            context.drawImage(img, offset.offsetX, offset.offsetY, min, min, 0, 0, canvas.width, canvas.height);
            context.rotate(-angle);
            context.translate(-x, -y);
        }

        context.restore();

        return c;
    },

    getPanRange: function (image, rotated) {
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
};
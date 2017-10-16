import shape from './shape';

let minResolution = 400;

module.exports = {
    circleCropImageToCanvas: function (img, canvas, context, offsetX, offsetY) {
        context.save();

        let min = Math.min(img.naturalWidth, img.naturalHeight);
        let scaleX = img.naturalWidth / img.width;
        let scaleY = img.naturalHeight / img.height;

        canvas.width = min;
        canvas.height = min;

        if (min < minResolution) {
            canvas.width = minResolution;
            canvas.height = minResolution;
        }

        let c = shape.drawInscribedCircle(canvas, context);
        context.clip();
        context.drawImage(img, -offsetX * scaleX, -offsetY * scaleY, min, min, 0, 0, canvas.width, canvas.height);

        context.restore();

        return c;
    }
};
import shape from './shape';

module.exports = {
    circleCropImageToCanvas: function (img, canvas, context, offsetX, offsetY) {
        context.save();

        let min = Math.min(img.naturalWidth, img.naturalHeight);
        canvas.width = min;
        canvas.height = min;

        let scaleX = img.naturalWidth / img.width;
        let scaleY = img.naturalHeight / img.height;

        console.log('cropping with ', offsetX, offsetY);

        let c = shape.drawInscribedCircle(canvas, context);
        context.clip();
        context.drawImage(img, -offsetX * scaleX, -offsetY * scaleY, min, min, 0, 0, canvas.width, canvas.height);

        context.restore();

        return c;
    }
};
module.exports = {
    set: function (canvas, context, backgroundColor) {
        context.save();
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }
};
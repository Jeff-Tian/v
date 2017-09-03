module.exports = {
    drawInscribedCircle: function (canvas, context) {
        let center = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };

        let radius = Math.min(center.x, center.y);

        context.beginPath();
        context.arc(center.x, center.y, radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();

        return {
            center: center,
            radius: radius
        };
    }
};
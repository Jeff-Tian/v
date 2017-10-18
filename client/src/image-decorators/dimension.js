let minResolution = 400;

module.exports = {
    setCanvas: function (img, canvas) {
        let min = Math.min(img.naturalWidth, img.naturalHeight);

        canvas.width = Math.max(min, minResolution);
        canvas.height = Math.max(min, minResolution);
    },
};
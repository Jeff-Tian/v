import loadImage from '../../node_modules/blueimp-load-image/js/load-image.js';
import '../../node_modules/blueimp-load-image/js/load-image-exif';

module.exports = {
    readImageFromFile: function (target, callback) {
        if (target.files && target.files[0]) {
            let fr = new FileReader();
            fr.onload = function (e) {
                if (typeof callback === 'function') {
                    callback(e.target.result);
                }
            };
            fr.readAsDataURL(target.files[0]);
        }
    },

    loadImageFromFile: function (target, callback) {
        if(target.files && target.files[0]){
            loadImage(target.files[0], function(img){
                let canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                let dataURL = canvas.toDataURL('image/jpeg');

                loadImage.parseMetaData(target.files[0], function(data){
                    callback(dataURL, data);
                });
            });
        }
    }
};
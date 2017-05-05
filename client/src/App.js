import React, {Component} from 'react';
// import logo from './logo.svg';
import logo from '../public/v/v.png';
import qr from '../public/v/v-qr.png';
import v from '../public/v/v.png';
import vDecorator from './image-decorators/v.js';
import qrDecorator from './image-decorators/qr';
import './semantic-ui/semantic.min.css';
import './App.css';
import shape from './image-decorators/shape';
import fs from './fs/fs';

let maxXRange = 0;
let maxYRange = 0;

let minWidth = 400;
let minHeight = 400;
let canvasOffsetX = 0;
let canvasOffsetY = 0;

class App extends Component {
    constructor() {
        super();

        this.state = {
            imgSrc: '',
            selectedImageSrc: '',

            theImageStyle: {
                top: 0,
                left: 0
            },

            theImageCropStyle: {
                top: 0,
                left: 0,
                width: '100px',
                height: '100px'
            },

            theCroppingImageStyle: {
                width: '100%',
                height: 'auto',
                position: 'absolute'
            },

            theImageMaskStyle: {
                top: 0,
                left: 0
            }
        };

        let self = this;

        function cropImage(image, context, canvas, callback) {
            const img = new Image();
            img.onload = function () {
                let c = self.cropImage(img, minHeight, minWidth, canvas, context, canvasOffsetX, canvasOffsetY);

                if (typeof callback === 'function') {
                    callback(c);
                }
            };
            img.src = image;
        }

        function convertToPng(canvas) {
            self.setState({
                imgSrc: canvas.toDataURL('image/png')
            });
        }

        let canvas = null;
        let context = null;
        let photoFile = null;

        function $getModal() {
            let $ = window.jQuery;

            return $('.ui.modal.canvas');
        }

        this.onPhotoSelected = function (target) {
            canvas = target.refs['photo-canvas'];
            photoFile = target.refs['photo-file'];
            context = canvas.getContext('2d');

            fs.readImageFromFile(photoFile, function (image) {
                self.setState({
                    selectedImageSrc: image
                });
                cropAndDrawVAndQR(image, context, canvas, function () {
                    self.setCropperStyles();
                });
                listenGestures();
            });
        };

        function listenGestures() {
            let myCanvas = document.getElementById('image-crop');
            let mc = new window.Hammer(myCanvas);
            mc.on('pan', function (event) {
                canvasOffsetX += event.deltaX;
                if (canvasOffsetX > maxXRange) {
                    canvasOffsetX = maxXRange;
                }

                if (canvasOffsetX < -maxXRange) {
                    canvasOffsetX = -maxXRange;
                }

                canvasOffsetY += event.deltaY;
                if (canvasOffsetY > maxYRange) {
                    canvasOffsetY = maxYRange;
                }

                if (canvasOffsetY < -maxYRange) {
                    canvasOffsetY = -maxYRange;
                }

                self.setState({
                    theImageStyle: Object.assign({}, self.state.theImageStyle, {
                        top: canvasOffsetY,
                        left: canvasOffsetX
                    }),
                    theCroppingImageStyle: Object.assign({}, self.state.theCroppingImageStyle, {
                        top: -canvasOffsetY,
                        left: -canvasOffsetX
                    }),
                    theImageMaskStyle: Object.assign({}, self.state.theImageMaskStyle, {
                        top: -canvasOffsetY + parseFloat(self.state.theImageCropStyle.top),
                        left: -canvasOffsetX + parseFloat(self.state.theImageCropStyle.left)
                    })
                });

                // readImage(photoFile, context, canvas);
                // redraw(context, canvas);
            });
        }

        this.clear = function () {
            self.setState({
                imgSrc: ''
            });

            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (photoFile) {
                photoFile.value = null;
            }

            canvasOffsetX = 0;
            canvasOffsetY = 0;
        };

        this.generateImage = function () {
            cropAndDrawVAndQR(document.getElementById('the-image-mask').src, context, canvas, function () {
                convertToPng(canvas);

                $getModal().modal('hide');
            });
        };

        function cropAndDrawVAndQR(image, context, canvas, callback) {
            cropImage(image, context, canvas, function (c) {
                vDecorator.decorate(canvas, context, c, v, function (canvas) {
                    qrDecorator.decorate(canvas, context, c, qr, callback);
                    $getModal()
                        .modal('setting', 'closable', false)
                        .modal('show');
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            });
        }
    }

    setCropperStyles() {
        let imageMask = document.getElementById('the-image-mask');
        let diameter = Math.min(imageMask.offsetWidth, imageMask.offsetHeight);
        let theImageCropStyle = {
            width: diameter + 'px',
            height: diameter + 'px'
        };
        if (imageMask.offsetWidth > imageMask.offsetHeight && imageMask.offsetWidth > diameter) {
            maxXRange = (imageMask.offsetWidth - diameter) / 2;
        } else {
            maxXRange = 0;
        }
        theImageCropStyle.left = maxXRange + 'px';
        if (imageMask.offsetHeight > imageMask.offsetWidth && imageMask.offsetHeight > diameter) {
            maxYRange = (imageMask.offsetHeight - diameter) / 2;
            console.log('maxYRange = ', maxYRange);
        } else {
            maxYRange = 0;
        }
        theImageCropStyle.top = maxYRange + 'px';
        this.setState({
            theImageCropStyle: theImageCropStyle,
            theCroppingImageStyle: Object.assign({}, this.state.theCroppingImageStyle, {
                width: imageMask.offsetWidth + 'px',
                height: imageMask.offsetHeight + 'px',
                left: -maxXRange,
                top: -maxYRange
            })
        });
    }

    cropImage(img, minHeight, minWidth, canvas, context, canvasOffsetX, canvasOffsetY) {

        function drawInscribedCircle(context, canvas) {
            if (canvas.width > canvas.height) {
                maxXRange = (canvas.width - canvas.height) / 2;
                maxYRange = 0;
            } else {
                maxYRange = (canvas.height - canvas.width) / 2;
                maxXRange = 0;
            }

            return shape.drawInscribedCircle(canvas, context);
        }

        this.adjustImageStyles(img, minHeight, minWidth, canvas, this);

        context.save();
        let c = drawInscribedCircle(context, canvas);
        this.scaleCanvas(img, minHeight, minWidth, context, canvas);
        context.clip();
        context.drawImage(img, 0, 0, img.width, img.height, canvasOffsetX, canvasOffsetY, img.width, img.height);
        context.restore();
        return c;
    }

    scaleCanvas(img, minHeight, minWidth, context, canvas) {
        if (img.height < minHeight || img.width < minWidth) {
            context.scale(canvas.width / img.width, canvas.height / img.height);
        }
    }

    adjustImageStyles(img, minHeight, minWidth, canvas, self) {
        if (img.height >= minHeight && img.width >= minWidth) {
            canvas.width = img.width;
            canvas.height = img.height;

            self.setState({
                theImageStyle: {
                    width: '100%',
                    height: 'auto'
                }
            });
        } else {
            canvas.height = canvas.width * img.height / img.width;
            self.setState({
                theImageStyle: {
                    width: '100%',
                    height: 'auto'
                }
            });
        }
    }

    render() {

        return (
            <div className="App">
                <div className="App-header">
                    <div className="ui container">
                        <img src={logo} className="App-logo" alt="logo"/>
                    </div>
                </div>
                <p className="App-intro">
                    上传图片，自动加V
                </p>

                <div className="ui container">
                    <form name="photoForm" className="ui form">
                        <div className="field">
                            {
                                this.state.imgSrc ?
                                    <button type="reset" className="ui black deny button" onClick={this.clear}>
                                        清除</button>
                                    : ''
                            }

                        </div>
                        <div className="field"
                             style={{position: 'relative', border: 'solid 1px black', minHeight: '150px'}}>
                            <div className="hidden-input mask">
                                <input type="file" name="photo" onChange={() => this.onPhotoSelected(this)}
                                       ref="photo-file"
                                       accept=".png,.gif,.jpeg,.jpg"/>
                            </div>
                            <div className="before-upload mask">
                                <h1>点击此处选择图片</h1>
                            </div>
                            <a className="image mask" style={this.state.imgSrc ? {} : {display: 'none'}} target="_blank"
                               href={this.state.imgSrc}>
                                <img src={this.state.imgSrc} alt="v"
                                     style={{width: '100%', height: '100%', background: 'white'}}/>
                            </a>
                        </div>
                    </form>
                </div>

                <div className="ui fullscreen modal canvas">
                    <div className="image content">
                        <div id="the-image-wrapper">
                            <img id="the-image-mask" className="image-mask" src={this.state.selectedImageSrc} alt="v"
                                 style={this.state.theImageMaskStyle}/>
                            <div className="image-crop" id="image-crop" style={this.state.theImageCropStyle}>
                                <img src={this.state.selectedImageSrc} alt="v"
                                     style={this.state.theCroppingImageStyle}/>
                            </div>
                            <img id="the-image" ref="image" src={this.state.selectedImageSrc} alt="v"
                                 style={Object.assign({
                                     maxWidth: '100%',
                                     height: 'auto',
                                     display: 'none'
                                 }, this.state.theImageStyle)}/>
                        </div>
                        <canvas id="photo-canvas" ref="photo-canvas"
                                style={{
                                    'width': '100%',
                                    'height': 'auto',
                                    border: 'solid 1px black',
                                    visibility: 'hidden'
                                }}
                                onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}
                                onTouchEnd={this.onTouchEnd}
                                onTouchCancel={this.onTouchCancel}/>
                    </div>
                    `
                    <div className="actions">
                        <div className="ui black deny button" onClick={this.clear}>重来</div>
                        <div className="ui positive right labeled icon button" onClick={this.generateImage}>
                            确定
                            <i className="checkmark icon"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

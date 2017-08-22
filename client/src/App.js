import React, {
    Component
} from 'react';
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
import classNames from 'classnames';

let maxXRange = 0;
let maxYRange = 0;

let minWidth = 400;
let minHeight = 400;
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let self = null;
let rotated = 0;

let dragData = {};

class App extends Component {
    constructor() {
        super();

        this.state = this.resetStyles();

        self = this;

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

        this.onPhotoSelected = function (target) {
            self.state.loading = true;
            canvas = target.refs['photo-canvas'];
            photoFile = target.refs['photo-file'];
            context = canvas.getContext('2d');

            fs.readImageFromFile(photoFile, function (image) {
                self.setState({
                    selectedImageSrc: image
                });

                document.getElementById('the-image').onload = function () {
                    App.showModal();
                    self.setCropperStyles();
                    self.state.loading = false;
                };
            });
        };

        this.clear = function () {
            rotated = 0;
            self.setState(self.resetStyles());

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
            self.state.loading = true;
            cropAndDrawVAndQR(document.getElementById('the-image-mask').src, context, canvas, function () {
                convertToPng(canvas);

                App.hideModal();
                self.state.loading = false;
            });
        };

        function cropAndDrawVAndQR(image, context, canvas, callback) {
            cropImage(image, context, canvas, function (c) {
                vDecorator.decorate(canvas, context, c, v, function (canvas) {
                    qrDecorator.decorate(canvas, context, c, qr, callback);
                    App.showModal();
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            });
        }
    }

    resetStyles() {
        return {
            imgSrc: '',
            selectedImageSrc: '',

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
    }

    updateImagePosition(dragData) {
        self.setState({
            theCroppingImageStyle: Object.assign({}, self.state.theCroppingImageStyle, {
                top: parseFloat(dragData.theCroppingImageStyle.top) + dragData.delta.y,
                left: parseFloat(dragData.theCroppingImageStyle.left) + dragData.delta.x
            }),
            theImageMaskStyle: Object.assign({}, self.state.theImageMaskStyle, {
                top: dragData.delta.y + parseFloat(dragData.theImageMaskStyle.top),
                left: dragData.delta.x + parseFloat(dragData.theImageMaskStyle.left)
            })
        });
    }

    restrictDrag(dragData) {
        canvasOffsetX += dragData.delta.x;
        canvasOffsetY += dragData.delta.y;

        console.log('restrict drag with (mx, my): ', maxXRange, maxYRange);

        if (rotated === 0) {
            this.restrict(dragData);
        }

        if (rotated === -90) {
            this.restrictLeftRotated(dragData);
        }

        if (rotated === -180) {
            this.restrict(dragData);
        }

        if (rotated === -270) {
            this.restrict(dragData);
        }

        self.updateImagePosition(dragData);
    }

    restrict(dragData) {
        if (canvasOffsetX > maxXRange) {
            dragData.delta.x -= canvasOffsetX - maxXRange;
            canvasOffsetX = maxXRange;
        }

        if (canvasOffsetX < -maxXRange) {
            dragData.delta.x -= canvasOffsetX + maxXRange;
            canvasOffsetX = -maxXRange;
        }
        if (canvasOffsetY > maxYRange) {
            dragData.delta.y -= canvasOffsetY - maxYRange;
            canvasOffsetY = maxYRange;
        }

        if (canvasOffsetY < -maxYRange) {
            dragData.delta.y -= canvasOffsetY + maxYRange;
            canvasOffsetY = -maxYRange;
        }
    }

    restrictLeftRotated(dragData) {
        console.log('cox, coy = ', canvasOffsetX, canvasOffsetY);
        if (canvasOffsetX > maxYRange) {
            dragData.delta.x -= canvasOffsetX - maxYRange;
            canvasOffsetX = maxYRange;
        }

        if (canvasOffsetX < -maxYRange) {
            dragData.delta.x -= canvasOffsetX + maxYRange;
            canvasOffsetX = -maxYRange;
        }

        if (canvasOffsetY > maxXRange) {
            dragData.delta.y -= canvasOffsetY - maxXRange;
            canvasOffsetY = maxXRange;
        }

        if (canvasOffsetY < -maxXRange) {
            dragData.delta.y -= canvasOffsetY + maxXRange;
            canvasOffsetY = -maxXRange;
        }
    }

    static hideModal() {
        App.$getModal().modal('hide');
    }

    static $getModal() {
        let $ = window.jQuery;
        return $('.ui.modal.canvas');
    }

    static showModal() {
        App.$getModal()
            .modal('setting', 'closable', false)
            .modal('show');
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
            console.log('maxXrange = ', maxXRange);
        } else {
            maxXRange = 0;
        }
        theImageCropStyle.left = maxXRange + 'px';
        if (imageMask.offsetHeight > imageMask.offsetWidth && imageMask.offsetHeight > diameter) {
            maxYRange = (imageMask.offsetHeight - diameter) / 2;
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

    rotateImage(context, canvas) {
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rotated * Math.PI / 180);
    }

    getCanvasOffsetX(img) {
        if (rotated === 0) {
            return canvasOffsetX - img.width / 2;
        }

        if (rotated === -90) {
            return canvasOffsetY - img.width / 2;
        }

        if (rotated === -180) {
            return -canvasOffsetX - img.width / 2;
        }

        if (rotated === -270) {
            return -canvasOffsetY - img.width / 2;
        }

        return canvasOffsetX;
    }

    getCanvasOffsetY(img) {
        if (rotated === 0) {
            return canvasOffsetY - img.height / 2;
        }

        if (rotated === -90) {
            return canvasOffsetX - img.height / 2;
        }

        if (rotated === -180) {
            return -canvasOffsetY - img.height / 2;
        }

        if (rotated === -270) {
            return -canvasOffsetX - img.height / 2;
        }

        return canvasOffsetY;
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
        this.rotateImage(context, canvas);
        context.drawImage(img, 0, 0, img.width, img.height, this.getCanvasOffsetX(img), this.getCanvasOffsetY(img), img.width, img.height);
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
        } else {
            canvas.height = canvas.width * img.height / img.width;
        }
    }

    rotateLeft(e) {
        rotated -= 90;
        console.log(rotated);
        if (rotated === -360) {
            rotated = 0;
        }

        self.setState({
            theCroppingImageStyle: Object.assign({}, self.state.theCroppingImageStyle, {
                transform: 'rotate(' + rotated + 'deg)'
            }),
            theImageMaskStyle: Object.assign({}, self.state.theImageMaskStyle, {
                transform: 'rotate(' + rotated + 'deg)'
            })
        });

        // todo: simulate a user drag to properly restrict it
    }

    onDragStart(e) {
        dragData = {
            start: {
                x: e.clientX,
                y: e.clientY
            },
            delta: {
                x: 0,
                y: 0
            },
            theCroppingImageStyle: self.state.theCroppingImageStyle,
            theImageCropStyle: self.state.theImageCropStyle,
            theImageMaskStyle: self.state.theImageMaskStyle
        };

        console.log('dragging start, ', dragData);

        return false;
    }

    onDrag(e) {
        dragData.delta.x = e.clientX - dragData.start.x;
        dragData.delta.y = e.clientY - dragData.start.y;

        self.updateImagePosition(dragData);

        return false;

    }

    onDragEnd(e) {
        dragData.delta.x = e.clientX - dragData.start.x;
        dragData.delta.y = e.clientY - dragData.start.y;

        self.updateImagePosition(dragData);

        self.restrictDrag(dragData);
    }

    onDragExit(e) {
        return false;
    }

    onTouchStart(e) {
        self.onDragStart(e.touches[0]);
    }

    onTouchMove(e) {
        self.onDrag(e.touches[0]);
    }

    onTouchEnd(e) {
        self.restrictDrag(dragData);
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
                    <form name="photoForm" className={classNames({'ui': true, 'form': true, loading: this.state.loading})}>
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
                                       accept="image/*" capture="camera"/>
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
                            <div className="image-crop" id="image-crop" style={this.state.theImageCropStyle}
                                 draggable={false}
                                 onDragStart={this.onDragStart} onDrag={this.onDrag} onDragEnd={this.onDragEnd}
                                 onDragExit={this.onDragExit} onTouchStart={this.onTouchStart}
                                 onTouchMove={this.onTouchMove} onTouchEnd={this.onTouchEnd}>
                                <img src={this.state.selectedImageSrc} alt="v"
                                     style={this.state.theCroppingImageStyle}/>
                            </div>
                            <img id="the-image" ref="image" src={this.state.selectedImageSrc} alt="v"
                                 style={Object.assign({
                                     maxWidth: '100%',
                                     height: 'auto',
                                     display: 'block',
                                     visibility: 'hidden'
                                 }, {})}/>
                        </div>
                        <canvas id="photo-canvas" ref="photo-canvas"
                                style={{
                                    'width': '100%',
                                    'height': 'auto',
                                    border: 'solid 1px black',
                                    visibility: 'hidden',
                                    display: 'none'
                                }}
                                onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}
                                onTouchEnd={this.onTouchEnd}
                                onTouchCancel={this.onTouchCancel}/>
                    </div>
                    <div className="actions">
                        <div className="ui violet left icon button" onClick={this.rotateLeft} style={{float: 'left'}}>
                            <i className="undo icon"/>
                            向左旋转
                        </div>
                        <div className="ui buttons">
                            <div className="ui black deny button" onClick={this.clear}>
                                重来
                            </div>
                            <div className="or"></div>
                            <div className="ui positive right labeled icon button" onClick={this.generateImage}>
                                确定
                                <i className="checkmark icon"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
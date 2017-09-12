import React, {Component} from 'react';
// import logo from './logo.svg';
import logo from '../public/v/v.png';
import v from '../public/v/v.png';
import qr from '../public/v/v-qr.png';
import vDecorator from './image-decorators/v.js';
import qrDecorator from './image-decorators/qr';
import './semantic-ui/semantic.min.css';
import './App.css';
import shape from './image-decorators/shape';
import fs from './fs/fs';
import classNames from 'classnames';

const io = require('socket.io-client');

let maxXRange = 0;
let maxYRange = 0;

let minWidth = 400;
let minHeight = 400;
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let self = null;
let rotated = 0;

let dragData = {};
let popup = null;

function convertToJpeg(canvas, context) {
    let startX = 0;
    let startY = 0;
    let width = canvas.width;
    let height = canvas.height;
    let sideLength = Math.min(canvas.width, canvas.height);

    if (width > height) {
        startX = (width - height) / 2;
        width = height;
    }

    if (height > width) {
        startY = (height - width) / 2;
        height = width;
    }

    let imageData = context.getImageData(startX, startY, width, height);
    let cvs = document.createElement('canvas');
    cvs.setAttribute('width', sideLength);
    cvs.setAttribute('height', sideLength);
    let ctx = cvs.getContext('2d');
    ctx.width = sideLength;
    ctx.height = sideLength;
    ctx.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);

    self.setState({
        imgSrc: cvs.toDataURL('image/jpeg', 0.5)
    });

    return self.state.imgSrc;
}

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

        // function convertToPng(canvas) {
        //     self.setState({
        //         imgSrc: canvas.toDataURL('image/png')
        //     });
        // }

        let canvas = null;
        let context = null;
        let photoFile = null;
        let socket = io();

        function openOrderPage(orderInfo) {
            if (popup && !popup.closed) {
                popup.postMessage('link://' + `/order/${orderInfo.orderId}`, '*');
            } else {
                alert('尝试打开支付页面失败，请刷新页面重试。');
            }
        }

        function popupReady() {
            return new Promise((resolve, reject) => {
                window.addEventListener('message', function (event) {
                    console.log('got message');
                    if (event.data && event.data.indexOf && event.data.indexOf('poup://ready') === 0) {
                        console.log('from popup ready');
                        resolve();
                    }
                });
            });
        }

        function newOrderCreated() {
            return new Promise((resolve, reject) => {
                socket.on('order-qr-remove', function (msg) {
                   if(typeof msg === 'object'){
                       console.log('new order created');
                       resolve(msg);
                   }
                });
            });
        }

        Promise.all([popupReady(), newOrderCreated()]).then(results=>{
            openOrderPage(results[1]);
        });

        socket.on('order-qr-remove', function (msg) {
            if (msg === 'ok') {
                cropAndDrawV(document.getElementById('the-image-mask').src, context, canvas, function () {
                    convertToJpeg(canvas, context);
                    self.setState({loading: false});
                });
            } else if (msg === 'pending-pay') {
                alert(msg);
            } else {
                // alert(msg);
                self.setState({loading: false});
            }
        });

        this.onPhotoSelected = function (target) {
            self.state.loading = true;
            canvas = target.refs['photo-canvas'];
            photoFile = target.refs['photo-file'];
            context = canvas.getContext('2d');

            fs.loadImageFromFile(photoFile, function (image, data) {
                if (data && data.exif) {
                    let orientation = data.exif.get('Orientation');
                    if (orientation) {
                        if (orientation === 8) {
                            self.rotateLeft();
                        }
                        if (orientation === 6) {
                            self.rotateRight();
                        }
                        if (orientation === 3) {
                            self.rotate180DegreeLeftward();
                        }
                        if (orientation !== 1 && orientation !== 8 && orientation !== 6 && orientation !== 3) {
                            alert(orientation);
                        }
                    }
                }
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
            if (!confirm('真的要清除重来吗？')) {
                return;
            }

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
                convertToJpeg(canvas, context);

                App.hideModal();
                self.state.loading = false;
            });
        };

        this.removeQRCode = function () {
            self.state.loading = true;

            socket.emit('order-qr-remove', 'create');

            if (popup && !popup.closed) {
                try {
                    popup.location.href = '/popup.html';
                } catch (ex) {
                    popup.close();
                    popup = window.open('/popup.html');
                }
            } else {
                popup = window.open('/popup.html');
            }
        };

        this.download = function () {
            self.setState({loading: true});
            alert('请长按下面图片，直到出现弹出菜单，选择保存即可。');
            let a = document.createElement('a');
            a.href = convertToJpeg(canvas, context);
            a.download = 'papa.jpg';
            document.body.appendChild(a);
            a.click();
            self.setState({loading: false});
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

        function cropAndDrawV(image, context, canvas, callback) {
            cropImage(image, context, canvas, function (c) {
                vDecorator.decorate(canvas, context, c, v, function (canvas) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            });
        }
    }

    static hideModal() {
        App.$getModal()
            .modal('setting', {'closable': false, observeChanges: true})
            .modal('hide');
    }

    static $getModal() {
        let $ = window.jQuery;
        return $('.ui.modal.canvas');
    }

    static showModal() {
        App.$getModal()
            .modal('setting', {'closable': false, observeChanges: true})
            .modal('show');
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
            this.restrictLeftRotated(dragData);
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

            function drawWhiteBackground() {
                context.save();
                let fillStyle = context.fillStyle;
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = fillStyle;
                context.restore();
            }

            drawWhiteBackground();

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

    rotate() {
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
        setTimeout(function () {
            self.restrictDrag({
                start: {
                    x: 0,
                    y: 0
                },
                delta: {
                    x: 0,
                    y: 0
                },
                theCroppingImageStyle: self.state.theCroppingImageStyle,
                theImageCropStyle: self.state.theImageCropStyle,
                theImageMaskStyle: self.state.theImageMaskStyle
            });
        });
    }

    rotateLeft(e) {
        rotated -= 90;
        self.rotate();
    }

    rotateRight(e) {
        rotated -= 270;
        self.rotate();
    }

    rotate180DegreeLeftward(e) {
        rotated -= 180;
        self.rotate();
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
            <div
                className="App">
                <div
                    className="App-header">
                    <div
                        className="ui container">
                        <img
                            src={logo}
                            className="App-logo"
                            alt="logo"/>
                    </div>
                </div>
                < p
                    className="App-intro">
                    上传图片，自动加V
                </p>

                <div
                    className="ui container">
                    < form
                        name="photoForm"
                        className={classNames({
                            'ui': true, 'form': true, loading: this.state.loading
                        })
                        }>
                        <
                            div
                            className="field">
                            {
                                this.state.imgSrc ?
                                    <
                                        div>
                                        < button
                                            type="button"
                                            className="ui left floated button"
                                            onClick={this.removeQRCode
                                            }>
                                            去二维码
                                        </button>
                                        <div
                                            className="ui buttons">
                                            < button
                                                type="button"
                                                className={
                                                    classNames({
                                                        'ui': true,
                                                        'positive': true,
                                                        'button': true,
                                                        loading: this.state.loading
                                                    })
                                                }
                                                target="_blank"
                                                onClick={this.download
                                                }>
                                                下载
                                            </button>
                                            <div
                                                className="ui or">
                                            </div>
                                            < button
                                                type="reset"
                                                className="ui black deny button"
                                                onClick={this.clear
                                                }>
                                                清除
                                            </button>
                                        </div>
                                    </div>
                                    :
                                    ''
                            }

                        </div>
                        <div
                            className="field"
                            style={
                                {
                                    position: 'relative', border:
                                    'solid 1px black', minHeight:
                                    '150px'
                                }
                            }>
                            <
                                div
                                className="hidden-input mask">
                                <input
                                    type="file"
                                    name="photo"
                                    onChange={() => this.onPhotoSelected(this)
                                    }
                                    ref="photo-file"
                                    accept="image/*"/>
                            </div>
                            <div
                                className="before-upload mask">
                                < h1> 点击此处选择图片
                                </h1>
                            </div>
                            <div
                                className="image mask"
                                style={this.state.imgSrc ? {} : {display: 'none'}
                                }
                                target="_blank">
                                <img
                                    src={this.state.imgSrc
                                    }
                                    alt="v"
                                    style={
                                        {
                                            width: '100%', height:
                                            '100%', background:
                                            'white', display:
                                            'block'
                                        }
                                    }
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div
                    className="ui fullscreen modal canvas">
                    <div
                        className="image content">
                        <div
                            id="the-image-wrapper"
                            style={
                                {
                                    "overflow":
                                        "hidden"
                                }
                            }>
                            <
                                img
                                id="the-image-mask"
                                className="image-mask"
                                src={this.state.selectedImageSrc
                                }
                                alt="v"
                                style={this.state.theImageMaskStyle
                                }
                            />
                            <div
                                className="image-crop"
                                id="image-crop"
                                style={this.state.theImageCropStyle
                                }
                                draggable={false}
                                onDragStart={this.onDragStart
                                }
                                onDrag={this.onDrag
                                }
                                onDragEnd={this.onDragEnd
                                }
                                onDragExit={this.onDragExit
                                }
                                onTouchStart={this.onTouchStart
                                }
                                onTouchMove={this.onTouchMove
                                }
                                onTouchEnd={this.onTouchEnd
                                }>
                                <
                                    img
                                    src={this.state.selectedImageSrc
                                    }
                                    alt="v"
                                    style={this.state.theCroppingImageStyle
                                    }
                                />
                            </div>
                            <img
                                id="the-image"
                                ref="image"
                                src={this.state.selectedImageSrc
                                }
                                alt="v"
                                style={Object.assign({
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    visibility: 'hidden'
                                }, {})
                                }
                            />
                        </div>
                        < canvas
                            id="photo-canvas"
                            ref="photo-canvas"
                            style={
                                {
                                    'width':
                                        '100%',
                                    'height':
                                        'auto',
                                    border:
                                        'solid 1px black',
                                    visibility:
                                        'hidden',
                                    display:
                                        'none'
                                }
                            }
                            onTouchStart={this.onTouchStart
                            }
                            onTouchMove={this.onTouchMove
                            }
                            onTouchEnd={this.onTouchEnd
                            }
                            onTouchCancel={this.onTouchCancel
                            }
                        />
                    </div>
                    <div
                        className="actions">
                        <div
                            className="ui violet left icon button"
                            onClick={this.rotateLeft
                            }
                            style={
                                {
                                    float: 'left'
                                }
                            }>
                            <
                                i
                                className="undo icon"/>
                            向左旋转
                        </div>
                        <div
                            className="ui buttons">
                            <div
                                className="ui black deny button"
                                onClick={this.clear
                                }>
                                重来
                            </div>
                            <div
                                className="or">
                            </div>
                            <div
                                className="ui positive right labeled icon button"
                                onClick={this.generateImage
                                }>
                                确定
                                <i
                                    className="checkmark icon"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
            ;
    }
}

export default App;
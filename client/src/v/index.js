import React, {Component} from 'react';
import logo from '../../public/v/v.png';
import v from '../../public/v/v.png';
import qr from '../../public/v/v-qr.png';
import vDecorator from '../image-decorators/v.js';
import qrDecorator from '../image-decorators/qr';
import 'semantic-ui-css/semantic.min.css';
import '../App.css';
import shape from '../image-decorators/shape';
import fs from '../fs/fs';
import classNames from 'classnames';
import socket from '../socket.js';
import {browserHistory} from 'react-router';
import Client from '../Client';
import OrderStatus from '../../../bll/orderStatus';
import {Modal} from 'semantic-ui-react';

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

let photoFile = null;

let canvas = null;
let context = null;
let contextScaleX = 1;
let contextScaleY = 1;

let imageScale = 1;

function resetAllVars() {
    maxXRange = 0;
    maxYRange = 0;

    minWidth = 400;
    minHeight = 400;
    canvasOffsetX = 0;
    canvasOffsetY = 0;
    self = null;
    rotated = 0;

    dragData = {};
    popup = null;

    photoFile = null;

    canvas = null;
    context = null;
    contextScaleX = 1;
    contextScaleY = 1;

    imageScale = 1;
}

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

class VApp extends Component {
    constructor(props) {
        super();

        resetAllVars();

        self = this;

        this.state = this.resetStyles();
        this.loading = true;

        function cropImage(image, context, canvas, callback) {
            let c = self.cropImage(document.getElementById('the-image-mask-on-modal-canvas'), minHeight, minWidth, canvas, context);

            if (typeof callback === 'function') {
                callback(c);
            }
        }


        function openOrderPage(orderInfo) {
            if (popup && !popup.closed) {
                popup.postMessage(`link:///order/${orderInfo.orderId}`, '*');
                console.log('可以支付了');
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
                    if (typeof msg === 'object') {
                        console.log('new order created');
                        resolve(msg);
                    }
                });
            });
        }

        socket.on('order-qr-remove', function (msg) {
            if (msg === 'ok') {
                self.generateImageWithoutQRCode();
            } else if (msg === 'pending-pay') {
                alert(msg);
            } else {
                self.setState({loading: false});
            }
        });

        socket.on('order-paid', function (msg) {
            console.log(msg);

            cropAndDrawV(document.getElementById('the-image-mask-on-modal-canvas').src, context, canvas, function () {
                convertToJpeg(canvas, context);
                self.setState({loading: false});
            });
        });

        this.onPhotoSelected = function (target) {
            self.state.loading = true;
            canvas = document.getElementById('photo-canvas');
            context = canvas.getContext('2d');

            this.readPhotoFile(photoFile, this.props, function () {
                console.log('read photo file callback');
                document.getElementById('cropping-image').onload = function () {
                    self.showModal();
                    self.setCropperStyles();
                    self.state.loading = false;
                };
            });
        };

        this.clear = function () {
            if (!window.confirm('真的要清除重来吗？')) {
                return;
            }

            self.setState(self.resetStyles());

            resetAllVars();

            browserHistory.push('/');
        };

        this.generateImage = function () {
            self.state.loading = true;

            cropAndDrawVAndQR(self.state.modalImageSrc, context, canvas, function () {
                convertToJpeg(canvas, context);

                self.hideModal();
                self.state.loading = false;
            });
        };

        this.generateImageWithoutQRCode = function () {
            cropAndDrawV(self.modalImageSrc, context, canvas, function () {
                convertToJpeg(canvas, context);
                self.setState({loading: false});
            });
        };

        this.removeQRCode = function () {
            self.setState({loading: true});

            socket.emit('order-qr-remove', {
                message: 'create'
            });

            if (navigator.userAgent.indexOf('MicroMessenger') >= 0) {
                newOrderCreated().then(function (order) {
                    browserHistory.push(`/order/${order.orderId}`);
                });
            } else {
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


                Promise.all([popupReady(), newOrderCreated()]).then(results => {
                    openOrderPage(results[1]);
                });
            }
        };

        this.download = function () {
            self.setState({loading: true});
            alert('请长按下面图片，直到出现弹出菜单，选择保存即可。');
            try {
                let a = document.createElement('a');
                a.href = convertToJpeg(canvas, context);
                a.download = 'papa.jpg';
                document.body.appendChild(a);
                a.click();
            } catch (ex) {
                // alert(JSON.stringify(ex));
            } finally {
                self.setState({loading: false});
            }
        };

        function cropAndDrawVAndQR(image, context, canvas, callback) {
            cropImage(image, context, canvas, function (c) {
                vDecorator.decorate(canvas, context, c, v, function (canvas) {
                    qrDecorator.decorate(canvas, context, c, qr, callback);
                    self.showModal();
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

    hideModal() {
        this.setState({open: false});
    }

    showModal() {
        this.setState({open: true})
    }

    readPhotoFile(photoFile, props, callback) {
        try {
            photoFile = atob(props.params.vid);
        } catch (ex) {
            photoFile = localStorage.getItem('image');
        }

        if (!photoFile) {
            console.log('redirecting to select image');
            return browserHistory.push('/');
        }

        fs.loadImageFromURI(photoFile, function (image, data) {
            console.log('data = ', data);
            if (data && data.exif) {
                let orientation = data.exif.get('Orientation');
                console.log('orientation = ', orientation);
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
                modalImageSrc: image
            });

            console.log('callback after loaded image form url...');
            callback();
        });

        return photoFile;
    }

    async componentDidMount() {
        console.log('hello = ', this.props.location.query.orderId);

        if (this.props.location.query.orderId) {
            self.state.loading = true;
            canvas = this.refs['photo-canvas'];
            context = canvas.getContext('2d');

            this.setState({loading: true});
            let o = await Client.fetchOrder(this.props.location.query.orderId);
            console.log('order = ', o);

            photoFile = this.readPhotoFile(photoFile, this.props, function () {
                if (o.status === OrderStatus.paid) {
                    self.generateImageWithoutQRCode();
                } else {
                    self.generateImage();
                }
            });
        } else {
            console.log('reading local image from local storage');
            // this.onPhotoSelected(this);
            this.setState({open: true});
        }
    }

    modalDidMount() {
        setTimeout(function () {
            self.onPhotoSelected(self);
        });
    }

    modalOpen() {
        console.log('modal open');
        // self.onPhotoSelected(self);
    }

    resetStyles() {
        return {
            imgSrc: '',
            modalImageSrc: '',

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
            },

            open: false
        };
    }

    updateImagePosition(dragData) {
        self.setState({
            theCroppingImageStyle: Object.assign({}, self.state.theCroppingImageStyle, {
                top: parseFloat(dragData.theCroppingImageStyle.top) + dragData.delta.y,
                left: parseFloat(dragData.theCroppingImageStyle.left) + dragData.delta.x
            }),
            theImageMaskStyle: Object.assign({}, self.state.theImageMaskStyle, {
                top: parseFloat(dragData.theImageMaskStyle.top) + dragData.delta.y,
                left: parseFloat(dragData.theImageMaskStyle.left) + dragData.delta.x
            })
        });
    }

    restrictDrag(dragData) {
        console.log('current scale = ', contextScaleX, contextScaleY);

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
        let imageMask = document.getElementById('the-image-mask-on-modal-canvas');
        let diameter = Math.min(imageMask.offsetWidth, imageMask.offsetHeight);
        let theImageCropStyle = {
            width: diameter + 'px',
            height: diameter + 'px'
        };
        if (imageMask.offsetWidth > imageMask.offsetHeight && imageMask.offsetWidth > diameter) {
            console.log('imageMask.offsetWidth = ', imageMask.offsetWidth);
            console.log('imagemask natural with = ', imageMask.naturalWidth);
            imageScale = imageMask.offsetWidth / imageMask.naturalWidth;
            console.log('image scale = ', imageScale);
            console.log('diameter = ', diameter);
            maxXRange = (imageMask.offsetWidth - diameter) / 2;
            console.log('maxXrange = ', maxXRange);
            console.log('offset = ', canvasOffsetX, canvasOffsetY);
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

        theImageCropStyle.top = 0;
        theImageCropStyle.bottom = 0;

        this.setState({
            theImageCropStyle: theImageCropStyle,
            theCroppingImageStyle: Object.assign({}, this.state.theCroppingImageStyle, {
                width: imageMask.offsetWidth + 'px',
                height: imageMask.offsetHeight + 'px',
                left: -maxXRange,
                top: -maxYRange
            }),
            theImageMaskStyle: Object.assign({}, this.state.theImageMaskStyle, {
                // left: -maxXRange,
                top: -maxYRange
            })
        });
    }

    rotateImage(context, canvas) {
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rotated * Math.PI / 180);
    }

    getCanvasOffsetX(img) {
        console.log('offset before translate: ', canvasOffsetX, canvasOffsetY);
        console.log('img info:', img.width, img.height);
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

    cropImage(img, minHeight, minWidth, canvas, context) {

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

        this.adjustImageStyles(img, minHeight, minWidth, canvas);

        context.save();
        let c = drawInscribedCircle(context, canvas);
        this.scaleCanvas(img, minHeight, minWidth, context, canvas);
        context.clip();
        this.rotateImage(context, canvas);
        let offsetX = this.getCanvasOffsetX(img);
        let offsetY = this.getCanvasOffsetY(img);
        console.log('offset = ', offsetX, offsetY);
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offsetX * contextScaleX, offsetY * contextScaleY, img.width, img.height);
        context.restore();
        return c;
    }

    scaleCanvas(img, minHeight, minWidth, context, canvas) {
        if (img.height < minHeight || img.width < minWidth) {
            contextScaleX = canvas.width / img.width;
            contextScaleY = canvas.height / img.height;
            context.scale(contextScaleX, contextScaleY);
        }
    }

    adjustImageStyles(img, minHeight, minWidth, canvas) {
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

        this.simulateDragAndRestrict();
    }

    simulateDragAndRestrict() {
        // todo: simulate a user drag to properly restrict it
        self.setState({rotating: true});
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

            self.setState({rotating: false});
        }, 10);
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
        console.log('drag end');
        dragData.delta.x = e.clientX - dragData.start.x;
        dragData.delta.y = e.clientY - dragData.start.y;

        self.updateImagePosition(dragData);

        self.restrictDrag(dragData);

        console.log('current offset = ', canvasOffsetX, canvasOffsetY);
    }

    onDragExit(e) {
        return false;
    }

    onTouchStart(e) {
        console.log('touch start');
        self.onDragStart(e.touches[0]);
    }

    onTouchMove(e) {
        self.onDrag(e.touches[0]);
    }

    onTouchEnd(e) {
        console.log('on touch end');
        console.log('current offset = ', canvasOffsetX, canvasOffsetY);
        self.restrictDrag(dragData);
    }

    render() {
        const open = this.state.open;

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
                    <form
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
                                        <button type="button"
                                                className={classNames("ui left floated button", {loading: this.state.loading})}
                                                onClick={this.removeQRCode}>
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
                                    src={this.state.imgSrc}
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

                <Modal size={'fullscreen'} open={open} onClose={this.hideModal} onMount={this.modalDidMount}
                       onOpen={this.modalOpen} className={classNames({'loading': this.state.rotating})}>
                    <Modal.Content image scrolling>
                        <div id="the-image-wrapper" style={
                            {
                                "overflow": "hidden",
                                "height": this.state.theImageCropStyle.height
                            }
                        }>
                            <img id="the-image-mask-on-modal-canvas" className="image-mask"
                                 src={this.state.modalImageSrc} alt="v"
                                 style={this.state.theImageMaskStyle}/>
                            <div
                                className="image-crop"
                                id="image-crop"
                                style={this.state.theImageCropStyle}
                                draggable={false}
                                onDragStart={this.onDragStart}
                                onDrag={this.onDrag}
                                onDragEnd={this.onDragEnd}
                                onDragExit={this.onDragExit}
                                onTouchStart={this.onTouchStart}
                                onTouchMove={this.onTouchMove}
                                onTouchEnd={this.onTouchEnd}>
                                <img id={"cropping-image"}
                                     src={this.state.modalImageSrc
                                     }
                                     alt="v"
                                     style={this.state.theCroppingImageStyle
                                     }
                                />
                            </div>
                        </div>

                        <canvas
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
                    </Modal.Content>
                    <Modal.Actions>
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
                                onClick={this.generateImage}>
                                确定
                                <i
                                    className="checkmark icon"/>
                            </div>
                        </div>
                    </Modal.Actions>
                </Modal>
            </div>
        )
            ;
    }
}

export default VApp;
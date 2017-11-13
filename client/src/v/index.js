import React, {Component} from 'react';
import logo from '../../public/v/v.png';
import v from '../../public/v/v.png';
import qr from '../../public/v/v-qr.png';
import vDecorator from '../image-decorators/v.js';
import qrDecorator from '../image-decorators/qr';
import 'semantic-ui-css/semantic.min.css';
import '../App.css';
import crop from '../image-decorators/crop';
import dimension from '../image-decorators/dimension';
import background from '../image-decorators/background';
import fs from '../fs/fs';
import classNames from 'classnames';
import socket from '../socket.js';
import {browserHistory} from 'react-router';
import Client from '../Client';
import OrderStatus from '../../../bll/orderStatus';
import PaymentMethods from '../../../bll/paymentMethods';
import {Form, Modal} from 'semantic-ui-react';
import BackgroundColorSelector from './background-color-selector';
import SelectPaymentMethodsModal from '../payment/select-payment-methods-modal';
import '../wechat/share';

let maxXRange = 0;
let maxYRange = 0;

let canvasOffsetX = 0;
let canvasOffsetY = 0;
let self = null;
let rotated = 0;

let dragData = {};
let popup = null;

let canvas = null;
let context = null;

let imageScaleX = 1;
let imageScaleY = 1;

let interactive = false;

function saveCurrentState() {
    localStorage.setItem('state', JSON.stringify({
        maxXRange: maxXRange,
        maxYRange: maxYRange,
        canvasOffsetX: canvasOffsetX,
        canvasOffsetY: canvasOffsetY,
        rotated: rotated,
        dragData: dragData,
        imageScaleX: imageScaleX,
        imageScaleY: imageScaleY,
    }));
}

function resetAllVars() {
    maxXRange = 0;
    maxYRange = 0;

    canvasOffsetX = 0;
    canvasOffsetY = 0;
    self = null;
    rotated = 0;

    dragData = {};
    popup = null;

    canvas = null;
    context = null;

    imageScaleX = 1;
    imageScaleY = 1;

    try {
        let state = JSON.parse(localStorage.getItem('state'));

        if (state) {
            maxXRange = state.maxXRange;
            maxYRange = state.maxYRange;
            canvasOffsetX = state.canvasOffsetX;
            canvasOffsetY = state.canvasOffsetY;
            rotated = state.rotated;
            dragData = state.dragData;
            imageScaleX = state.imageScaleX;
            imageScaleY = state.imageScaleY;
        }

        console.log('init max:', maxXRange, maxYRange);
    } catch (ex) {
        console.error(ex);
    }
}


function convertToJpeg(canvas, context) {
    let startX = 0;
    let startY = 0;
    let width = canvas.width;
    let height = canvas.height;
    let sideLength = Math.min(canvas.width, canvas.height);

    if (width > height) {
        startX = (width - height) / 2;
    }

    if (height > width) {
        startY = (height - width) / 2;
    }

    let imageData = context.getImageData(startX, startY, width, height);
    let cvs = document.createElement('canvas');
    cvs.setAttribute('width', sideLength + 'px');
    cvs.setAttribute('height', sideLength + 'px');
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

        this.state = this.initState();

        this.loading = true;

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

        socket.on('order-qr-remove', async function (msg) {
            if (msg === 'ok') {
                self.setState({paid: true});
                await self.generateImage();
            }
        });

        socket.on('order-paid', async function (msg) {
            console.log(msg);
            self.setState({paid: true});
            await self.generateImage();
            self.setState({loading: false});
        });

        let croppingImageLoaded = false;
        this.onPhotoSelected = function (target) {
            self.state.loading = true;
            canvas = document.getElementById('photo-canvas');
            context = canvas.getContext('2d');

            this.readPhotoFile(this.props, function () {
                console.log('read photo file callback');
                let handleCroppingImageLoaded = function () {
                    self.showModal();
                    self.rotate();
                    self.setCropperStyles();
                    self.updateImagePosition(dragData);
                    self.state.loading = false;

                    croppingImageLoaded = true;

                    console.log('handled cropping image loaded');
                };
                if (!croppingImageLoaded) {
                    document.getElementById('cropping-image').onload = handleCroppingImageLoaded;
                } else {
                    handleCroppingImageLoaded();
                }
            });
        };

        this.clear = function () {
            if (!window.confirm('真的要清除重来吗？')) {
                return;
            }

            self.setState(self.initState());

            resetAllVars();

            browserHistory.push('/');
        };

        this.generateImage = async function () {
            self.setState({loading: true});

            if (!self.state.paid) {
                await cropAndDrawVAndQR(document.getElementById('uploaded-image'), context, canvas);
            } else {
                await cropAndDrawV(document.getElementById('uploaded-image'), context, canvas);
            }
            convertToJpeg(canvas, context);

            self.hideModal();
            self.setState({loading: false});
        };

        this.createOrder = function (method) {
            self.setState({loading: true});
            socket.emit('order-qr-remove', {
                message: 'create',
                paymentMethod: method
            });
            if (true || navigator.userAgent.indexOf('MicroMessenger') >= 0) {
                newOrderCreated().then(function (order) {
                    saveCurrentState();
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
        this.removeQRCode = function () {
            self.showPaymentModal();
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

        async function cropAndDrawVAndQR(imageToBeCropped, context, canvas) {
            dimension.setCanvas(imageToBeCropped, canvas);
            background.set(canvas, context, self.state.backgroundColor);
            let c = crop.circleCropImageToCanvas(imageToBeCropped, canvas, context, canvasOffsetX, canvasOffsetY, imageScaleX, imageScaleY, rotated);
            await vDecorator.decorateV(canvas, context, c, v);
            await qrDecorator.decorateQR(canvas, context, c, qr);
        }

        async function cropAndDrawV(image, context, canvas) {
            dimension.setCanvas(image, canvas);
            background.set(canvas, context, self.state.backgroundColor);
            let c = crop.circleCropImageToCanvas(image, canvas, context, canvasOffsetX, canvasOffsetY, imageScaleX, imageScaleY, rotated);

            await vDecorator.decorateV(canvas, context, c, v);
        }
    }

    componentWillUnmount() {
        this.unmounting = true;
    }

    hideModal() {
        self.setState({open: false});
    }

    showModal() {
        self.setState({open: true})
    }

    readPhotoFile(props, callback) {
        let photoFile = null;

        try {
            photoFile = atob(props.params.vid);
        } catch (ex) {
            photoFile = localStorage.getItem('image');
        }

        if (!photoFile) {
            console.log('redirecting to select image');
            return browserHistory.push('/');
        }

        fs.loadImageFromURI(photoFile, function (image, exifData) {
            if (!interactive) {
                setTimeout(function () {
                    self.initRotation(exifData);
                }, 500);
            }

            self.setState({
                modalImageSrc: image
            });

            console.log('callback after loaded image form url...');
            callback();
        });

        return photoFile;
    }

    initRotation(exifData) {
        console.log('data = ', exifData);

        if (!exifData || !exifData.exif) {
            try {
                exifData = JSON.parse(localStorage.getItem('exif'));
            } catch (ex) {
                exifData = null;
            }
        }

        if (exifData && exifData.exif) {
            let orientation = 1;

            try {
                orientation = exifData.exif.get('Orientation');
            } catch (ex) {
                orientation = parseInt(localStorage.getItem('orientation'), 10);
            }

            console.log('orientation = ', orientation);

            if (orientation && rotated === 0) {
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
    }

    async componentDidMount() {
        console.log('hello = ', this.props.location.query.orderId);
        console.log('hello = ', this.props.params.orderId);

        let orderId = this.props.location.query.orderId || this.props.params.orderId;

        self.showModal();

        if (orderId) {
            self.state.loading = true;

            this.setState({loading: true});
            let o = await Client.fetchOrder(orderId);
            console.log('order = ', o);

            if (o.status === OrderStatus.paid) {
                self.setState({paid: true});
            } else {
                self.setState({paid: false});
            }

            self.setState({loading: true});
            setTimeout(async function () {
                await self.generateImage();
                self.setState({loading: false});
            }, 1000);
        }
    }

    modalDidMount() {
        console.log('modal did mount');
        setTimeout(function () {
            self.onPhotoSelected(self);
        });
    }

    modalOpen() {
        console.log('modal open');
    }

    initState() {
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

            open: false,

            backgroundColor: '#ebebeb',
            paid: false
        };
    }

    updateImagePosition(dragData) {
        if (!dragData || !dragData.theCroppingImageStyle || !dragData.theImageMaskStyle) {
            return;
        }

        self.setState({
            theCroppingImageStyle: Object.assign({}, self.state.theCroppingImageStyle, {
                top: parseFloat(dragData.theCroppingImageStyle.top || 0) + dragData.delta.y,
                left: parseFloat(dragData.theCroppingImageStyle.left || 0) + dragData.delta.x
            }),
            theImageMaskStyle: Object.assign({}, self.state.theImageMaskStyle, {
                top: parseFloat(dragData.theImageMaskStyle.top || 0) + dragData.delta.y,
                left: parseFloat(dragData.theImageMaskStyle.left || 0) + dragData.delta.x
            })
        });

        console.log(self.state);
    }

    restrictDrag(dragData) {
        console.log('current scale = ', imageScaleX, imageScaleY);

        canvasOffsetX += dragData.delta.x;
        canvasOffsetY += dragData.delta.y;

        console.log('current offset: ', canvasOffsetX, canvasOffsetY);

        console.log('restrict drag with (mx, my): ', maxXRange, maxYRange);

        this.restrict(dragData);

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

        console.log('restricted: ', canvasOffsetX, canvasOffsetY);
    }

    setCropperStyles() {
        let imageMask = document.getElementById('the-image-mask-on-modal-canvas');
        let diameter = Math.min(imageMask.offsetWidth, imageMask.offsetHeight);
        let theImageCropStyle = {
            width: diameter + 'px',
            height: diameter + 'px'
        };
        this.setMaxRanges(imageMask);

        theImageCropStyle.left = this.getRotationHandledLeft() + 'px';
        theImageCropStyle.top = this.getRotationHandledTop() + 'px';

        theImageCropStyle.top = 0;
        theImageCropStyle.bottom = 0;

        this.setState({
            theImageCropStyle: theImageCropStyle,
            theCroppingImageStyle: Object.assign({}, this.state.theCroppingImageStyle, {
                width: imageMask.offsetWidth + 'px',
                height: imageMask.offsetHeight + 'px',
                left: -this.getRotationHandledLeft(),
                top: -this.getRotationHandledTop()
            }),
            theImageMaskStyle: Object.assign({}, this.state.theImageMaskStyle, {
                // left: -maxXRange,
                top: -this.getRotationHandledTop()
            })
        });
    }

    getRotationHandledTop() {
        return (rotated === -90 || rotated === -270 ? maxXRange : maxYRange);
    }

    getRotationHandledLeft() {
        return (rotated === -90 || rotated === -270 ? maxYRange : maxXRange );
    }

    setMaxRanges(imageMask) {
        let panRange = crop.getPanRange(imageMask, rotated);

        console.log('panRange = ', panRange, rotated);

        imageScaleX = imageMask.offsetWidth / imageMask.naturalWidth;
        imageScaleY = imageMask.offsetHeight / imageMask.naturalHeight;

        maxXRange = panRange.x * imageScaleX;
        maxYRange = panRange.y * imageScaleY;

        console.log('setting cropper styles: ', maxXRange, maxYRange);
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

        this.setMaxRanges(document.getElementById('the-image-mask-on-modal-canvas'));

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
        self.restrictDrag(dragData);
    }

    async selectColor(color) {
        self.setState({backgroundColor: color});
        setTimeout(async function () {
            await self.generateImage();
        }, 1);
    }

    edit() {
        interactive = true;
        self.showModal();
    }

    cancel() {
        console.log('closing');

        if (!self.state.imgSrc) {
            browserHistory.push('/');
        } else {
            self.setState({loading: false});
            self.hideModal();
        }
    }

    showPaymentModal() {
        this.setState({
            selectPaymentMethodOpen: true
        });
    }

    closePaymentModal() {
        this.setState({
            selectPaymentMethodOpen: false
        });
    }

    pay(method) {
        if ([PaymentMethods.wechatPay.method, PaymentMethods.bitcoin.method, PaymentMethods.alipay.method].indexOf(method) >= 0) {
            self.closePaymentModal();
            self.createOrder(method);
        } else {
            alert('暂不支持此支付方式：' + method);
        }
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
                    上传照片，自动加V
                </p>

                <img src={this.state.modalImageSrc} className={"ui fluid image"} alt={"v"} id={"uploaded-image"}
                     style={{"display": "none"}}/>

                <div
                    className="ui container">
                    <form name="photoForm"
                          className={classNames({'ui': true, 'form': true, loading: this.state.loading})}>
                        <div className="field">
                            {
                                this.state.imgSrc ?
                                    <div>
                                        {
                                            !this.state.paid
                                                ?
                                                <button type="button"
                                                        className={classNames("ui left floated button", {loading: this.state.loading})}
                                                        onClick={this.removeQRCode}>
                                                    去二维码
                                                </button>
                                                : ''
                                        }
                                        <div
                                            className="ui buttons">
                                            <button
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
                                            <button
                                                type="reset"
                                                className="ui black deny button"
                                                onClick={this.clear}>
                                                清除
                                            </button>
                                            <div className="ui or"></div>
                                            <button type={"button"} className={"ui button"} onClick={this.edit}>调整
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
                            <div className="image mask" style={this.state.imgSrc ? {} : {display: 'none'}}
                                 target="_blank">
                                <img src={this.state.imgSrc} alt="v"
                                     style={{width: '100%', height: '100%', background: 'white', display: 'block'}}/>
                            </div>
                        </div>
                        <Form.Field>
                            <BackgroundColorSelector selected={this.state.backgroundColor}
                                                     selectColor={this.selectColor}/>
                        </Form.Field>
                    </form>
                </div>

                <SelectPaymentMethodsModal open={this.state.selectPaymentMethodOpen}
                                           onClose={() => this.closePaymentModal()} pay={this.pay}/>

                <Modal size={'fullscreen'} open={this.state.open} onClose={this.cancel} onMount={this.modalDidMount}
                       onOpen={() => {
                           this.modalOpen();
                       }} className={classNames({'loading': this.state.rotating})} dimmer="blurring">
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
                                onClick={this.cancel}>
                                取消
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
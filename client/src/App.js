import React, {Component} from 'react';
// import logo from './logo.svg';
import logo from '../public/v/v.png';
import qr from '../public/v/v-qr.png';
import v from '../public/v/v.png';
import './semantic-ui/semantic.min.css';
import './App.css';

class App extends Component {
    constructor() {
        super();

        this.state = {
            imgSrc: ''
        };

        let maxXRange = 0;
        let maxYRange = 0;
        
        function drawInscribedCircle(context, canvas) {
            if (canvas.width > canvas.height) {
                maxXRange = canvas.width - canvas.height;
                maxYRange = 0;
            } else {
                maxYRange = canvas.height - canvas.width;
                maxXRange = 0;
            }

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

        let minWidth = 400;
        let minHeight = 400;
        let canvasOffsetX = 0;
        let canvasOffsetY = 0;

        function readImage(target, context, canvas, callback) {
            if (target.files && target.files[0]) {
                let fr = new FileReader();

                fr.onload = function (e) {
                    const img = new Image();
                    img.onload = function () {
                        if (img.height >= minHeight && img.width >= minWidth) {
                            canvas.width = img.width;
                            canvas.height = img.height;
                        } else {
                            canvas.height = canvas.width * img.height / img.width;
                        }

                        context.save();
                        let c = drawInscribedCircle(context, canvas);

                        if (img.height < minHeight || img.width < minWidth) {
                            context.scale(canvas.width / img.width, canvas.height / img.height);
                        }

                        context.clip();
                        context.drawImage(img, 0, 0, img.width, img.height, canvasOffsetX, canvasOffsetY, img.width, img.height);
                        window.drawImage = function (x, y, w, h, cx, cy, cw, ch) {
                            context.drawImage(img, x, y, w, h, cx, cy, cw, ch);
                        };
                        context.restore();

                        if (typeof callback === 'function') {
                            callback(c);
                        }
                    };
                    img.src = e.target.result;
                };

                fr.readAsDataURL(target.files[0]);
            }
        }

        function drawV(context, canvas, c, callback) {
            const img = new Image();
            img.onload = function () {
                let vCenter = {
                    x: c.radius / Math.sqrt(2),
                    y: c.radius / Math.sqrt(2)
                };
                let width = 2 * c.radius / 3.82;
                let height = width * img.height / img.width;
                context.drawImage(img, 0, 0, img.width, img.height, c.center.x + vCenter.x - width / 2, c.center.y + vCenter.y - height / 2, width, height);

                if (typeof callback === 'function') {
                    callback(canvas);
                }
            };
            img.src = v;
        }

        function drawQR(context, canvas, c, callback) {
            const img = new Image();
            img.onload = function () {
                let qrCenter = c.center;
                // let width = Math.max(2 * c.radius / 6.18, 97);
                let width = 2 * c.radius / 6.18;
                // let ratio = canvas.width / canvas.height;
                // canvas.height = Math.max(canvas.height, 600);
                // canvas.width = canvas.height * ratio;
                let height = width * img.height / img.width;
                context.drawImage(img, 0, 0, img.width, img.height, qrCenter.x - width / 2, qrCenter.y - height / 2, width, height);

                if (typeof callback === 'function') {
                    callback(canvas);
                }
            };
            img.src = qr;
        }

        let self = this;

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

            redraw(context, canvas);

            listenGestures();
        };

        function listenGestures() {
            let myCanvas = document.getElementById('photo-canvas');
            let mc = new window.Hammer(myCanvas);
            mc.on('pan', function (event) {
                canvasOffsetX += event.deltaX;
                if (canvasOffsetX > maxXRange / 2) {
                    canvasOffsetX = maxXRange / 2;
                }

                if (canvasOffsetX < -maxXRange / 2) {
                    canvasOffsetX = -maxXRange / 2;
                }

                canvasOffsetY += event.deltaY;
                if (canvasOffsetY > maxYRange / 2) {
                    canvasOffsetY = maxYRange / 2;
                }

                if (canvasOffsetY < -maxYRange / 2) {
                    canvasOffsetY = -maxYRange / 2;
                }

                // readImage(photoFile, context, canvas);
                redraw(context, canvas);
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
            convertToPng(canvas);
            $getModal().modal('hide');
        };

        this.onTouchStart = function (proxy, event) {
        };

        this.onTouchMove = function () {
        };

        this.onTouchEnd = function () {
        };

        this.onTouchCancel = function () {
        };

        function redraw(context, canvas) {
            readImage(photoFile, context, canvas, function (c) {
                drawV(context, canvas, c, function (canvas) {
                    drawQR(context, canvas, c);
                    $getModal()
                        .modal('setting', 'closable', false)
                        .modal('show');
                });
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
                        <canvas id="photo-canvas" ref="photo-canvas"
                                style={{'width': '100%', 'height': 'auto', border: 'solid 1px black'}}
                                onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}
                                onTouchEnd={this.onTouchEnd}
                                onTouchCancel={this.onTouchCancel}/>
                    </div>
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

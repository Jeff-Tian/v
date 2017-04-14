import React, {Component} from 'react';
import logo from './logo.svg';
import './semantic-ui/semantic.min.css';
import './App.css';

class App extends Component {
    constructor() {
        super();

        this.state = {
            imgSrc: ''
        };

        function drawInscribedCircle(context, canvas) {
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

        function readImage(target, context, canvas, callback) {
            if (target.files && target.files[0]) {
                let fr = new FileReader();

                fr.onload = function (e) {
                    const img = new Image();
                    img.onload = function () {
                        // context.imageSmoothingEnabled = false;
                        canvas.width = img.width;
                        canvas.height = img.height;
                        context.save();
                        let c = drawInscribedCircle(context, canvas);
                        context.clip();
                        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
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

        function drawV(context, canvas, c) {
            const img = new Image();
            img.onload = function () {
                let vCenter = {
                    x: c.radius / Math.sqrt(2),
                    y: c.radius / Math.sqrt(2)
                };
                let width = 2 * c.radius / 3.82;
                let height = width * img.height / img.width;
                context.drawImage(img, 0, 0, img.width, img.height, c.center.x + vCenter.x - width / 2, c.center.y + vCenter.y - height / 2, width, height);
            };
            img.src = 'http://localhost:16016/v/v.png';
        }

        this.onPhotoSelected = function (target) {
            let canvas = target.refs['photo-canvas'];
            let context = canvas.getContext('2d');

            readImage(target.refs['photo-file'], context, canvas, function (c) {
                drawV(context, canvas, c);
            });
        };
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
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>

                <div className="ui container">
                    <form name="photoForm" className="ui form">
                        <input type="file" name="photo" onChange={() => this.onPhotoSelected(this)} ref="photo-file"
                               accept=".png,.gif,.jpeg,.jpg"/>
                    </form>
                    <canvas id="photo-canvas" ref="photo-canvas"
                            style={{'width': '100%', 'height': 'auto', border: 'solid 1px black'}}/>
                </div>
            </div>
        );
    }
}

export default App;

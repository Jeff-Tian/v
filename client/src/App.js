import React, {Component} from 'react';
import logo from '../public/v/v.png';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import fs from './fs/fs';
import classNames from 'classnames';
import {browserHistory} from 'react-router';

class App extends Component {
    constructor() {
        super();

        let self = this;

        localStorage.removeItem('image');
        localStorage.removeItem('exif');
        localStorage.removeItem('orientation');

        this.onPhotoSelected = function (target) {
            self.state.loading = true;
            let photoFile = target.refs['photo-file'];
            fs.loadImageFromFile(photoFile, function (dataURL, exifData) {
                localStorage.setItem('image', dataURL);
                localStorage.setItem('exif', JSON.stringify(exifData));
                if (exifData.exif && exifData.exif.get) {
                    localStorage.setItem('orientation', exifData.exif.get('Orientation'));
                }

                console.log(exifData);

                browserHistory.push(`/v/local-image`);
            });
        };

        this.state = {loading: false};
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
                    上传照片，自动加V
                </p>

                <div className="ui container">
                    <form name="photoForm" className={classNames({
                        'ui': true, 'form': true, loading: this.state.loading
                    })}>
                        <div className="field">
                        </div>
                        <div className="field" style={
                            {
                                position: 'relative', border:
                                'solid 1px black', minHeight:
                                '150px'
                            }
                        }>
                            <div className="before-upload mask">
                                <label htmlFor="photo-file"
                                       style={{
                                           "display": "flex",
                                           "alignItems": "center",
                                           "textAlign": "center",
                                           "justifyContent": "space-around"
                                       }}>
                                    点击开始拍照或者选取已有照片
                                </label>
                            </div>
                            <div className="hidden-input mask">
                                <input type="file" name="photo" onChange={() => this.onPhotoSelected(this)
                                } ref="photo-file" accept="image/*" id={"photo-file"}/>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default App;
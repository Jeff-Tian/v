import React, {Component} from 'react';
import logo from '../public/v/v.png';
import './semantic-ui/semantic.min.css';
import './App.css';
import fs from './fs/fs';
import classNames from 'classnames';
import {browserHistory} from 'react-router';

class App extends Component {
    constructor() {
        super();

        this.state = this.resetStyles();

        let self = this;

        this.onPhotoSelected = function (target) {
            self.state.loading = true;
            let photoFile = target.refs['photo-file'];
            fs.loadImageFromFile(photoFile, function (dataURL) {
                localStorage.setItem('image', dataURL);

                browserHistory.push(`/v/local-image`);
            });
        };
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
                            <div className="hidden-input mask">
                                <input type="file" name="photo" onChange={() => this.onPhotoSelected(this)
                                } ref="photo-file" accept="image/*"/>
                            </div>
                            <div className="before-upload mask">
                                <h1> 点击此处选择图片
                                </h1>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default App;
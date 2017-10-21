import React, {Component} from 'react';
import logo from '../public/v/v.png';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import fs from './fs/fs';
import classNames from 'classnames';
import {browserHistory} from 'react-router';
import {Button, Form} from 'semantic-ui-react';

class App extends Component {
    constructor() {
        super();

        let self = this;

        localStorage.removeItem('image');
        localStorage.removeItem('exif');
        localStorage.removeItem('orientation');

        this.onPhotoSelected = function (target, ref) {
            self.state.loading = true;
            let photoFile = target.refs[ref];
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

        this.state = {loading: false, capture: 'user'};
    }

    componentDidMount() {
        this.refs['capture'].setAttribute('capture', 'user');
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
                        <Form.Field>
                            <Button.Group size={'huge'} className={"label-button"}>
                                <Button className={"ui primary button"} primary={true} type={"button"}
                                        htmlFor={"capture"}>
                                    <label htmlFor={"capture"}>快速自拍</label>
                                    <input type={"file"} name={"capture"}
                                           onChange={() => this.onPhotoSelected(this, "capture")} accept={"image/*"}
                                           ref={"capture"}
                                           id={"capture"} style={{display: "none"}} capture={this.state.capture}/>
                                </Button>
                                <Button.Or/>
                                <Button className={"ui secondary button"} secondary={true} type={"button"}
                                        htmlFor={"photo-file"}>
                                    <label htmlFor={"photo-file"}>从相册选择</label>
                                    <input type={"file"} name={"photo"}
                                           onChange={() => this.onPhotoSelected(this, "photo-file")} ref={"photo-file"}
                                           accept={"image/*"} id={"photo-file"} style={{"display": "none"}}/>
                                </Button>
                            </Button.Group>
                        </Form.Field>
                    </form>
                </div>
            </div>
        );
    }
}

export default App;
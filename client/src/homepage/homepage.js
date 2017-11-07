import React, {Component} from 'react';
import logo from '../../public/v/v.png';
import 'semantic-ui-css/semantic.min.css';
import '../App.css';
import classNames from 'classnames';
import {browserHistory} from 'react-router';
import {Form, Header, Image, Message} from 'semantic-ui-react';
import GetPhoto from '../shared/getPhoto';

class Homepage extends Component {
    constructor() {
        super();

        localStorage.removeItem('image');
        localStorage.removeItem('exif');
        localStorage.removeItem('orientation');
        localStorage.removeItem('state');

        this.onPhotoSelected = this.onPhotoSelected.bind(this);
        this.state = {error: null};
    }

    onPhotoSelected(dataURL, exifData) {
        try {
            localStorage.setItem('image', dataURL);
            localStorage.setItem('exif', JSON.stringify(exifData));
            if (exifData.exif && exifData.exif.get) {
                localStorage.setItem('orientation', exifData.exif.get('Orientation'));
            }

            browserHistory.push(`/v/local-image`);
        } catch (ex) {
            this.setState({
                error: '操作失败，请尝试选择一张更小的照片试一试。'
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
                    上传照片，自动加V
                </p>

                <div className="ui container">
                    <form name="photoForm" className={classNames({
                        'ui': true, 'form': true, error: !!this.state.error
                    })}>
                        {
                            this.state.error ?
                                (
                                    <Message error header="出错啦" list={[this.state.error]}/>
                                ) : ''
                        }
                        <Form.Field>
                            <GetPhoto onPhotoGot={this.onPhotoSelected}/>
                        </Form.Field>
                    </form>
                    <Header as="h2">普通自拍照瞬间变大V</Header>
                    <label htmlFor="capture">
                        <Image src="/images/add-v.jpg" fluid/>
                    </label>
                </div>
            </div>
        );
    }
}

export default Homepage;
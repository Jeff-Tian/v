import React from 'react';
import {Button} from 'semantic-ui-react';
import fs from '../fs/fs';
import classNames from 'classnames';

export default class GetPhoto extends React.Component {
    constructor() {
        super();

        this.state = {capture: 'user'}
    }

    async onPhotoSelected(target, ref) {
        this.setState({loading: true});
        let photoFile = target.refs[ref];
        let res = await fs.loadImageFromFileAsync(photoFile);
        this.props.onPhotoGot(res.dataURL, res.exif);
        this.setState({loading: false});
    }

    componentDidMount() {
        this.refs['capture'].setAttribute('capture', 'user');
    }

    render() {
        return (
            <Button.Group size={'huge'} className={"label-button"}>
                <Button className={classNames("ui primary button", {'loading': this.state.loading})} primary={true}
                        type={"button"}
                        htmlFor={"capture"}>
                    <label htmlFor={"capture"}>快速自拍</label>
                    <input type={"file"} name={"capture"}
                           onChange={() => this.onPhotoSelected(this, "capture")} accept={"image/*"}
                           ref={"capture"}
                           id={"capture"} style={{display: "none"}} capture={this.state.capture}/>
                </Button>
                <Button.Or/>
                <Button className={classNames("ui secondary button", {loading: this.state.loading})} secondary={true}
                        type={"button"}
                        htmlFor={"photo-file"}>
                    <label htmlFor={"photo-file"}>从相册选择</label>
                    <input type={"file"} name={"photo"}
                           onChange={() => this.onPhotoSelected(this, "photo-file")} ref={"photo-file"}
                           accept={"image/*"} id={"photo-file"} style={{"display": "none"}}/>
                </Button>
            </Button.Group>
        );
    }
}
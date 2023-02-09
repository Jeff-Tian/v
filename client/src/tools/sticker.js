import React from 'react';
import GetPhoto from '../shared/getPhoto';
import {Card, Container, Image} from 'semantic-ui-react';

const timeoutLength = 2500;

export default class Sticker extends React.Component {
    constructor() {
        super();

        this.state = {};

        this.onPhotoGot = this.onPhotoGot.bind(this);
    }

    onPhotoGot(dataURL, exif) {
        this.setState({
            base64: dataURL,
            imageSrc: dataURL
        });
    }

    render() {
        return (
            <Container textAlign="center">
                <Card fluid>
                    <Image src={this.state.imageSrc}/>
                    <Card.Content>
                        <Card.Header>将图片转换成微信表情格式</Card.Header>
                    </Card.Content>
                    <Card.Content extra>
                        <GetPhoto onPhotoGot={this.onPhotoGot}/>
                    </Card.Content>
                </Card>
            </Container>
        );
    }
}

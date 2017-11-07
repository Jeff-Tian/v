import React from 'react';
import {Card, Container, Divider, Image} from 'semantic-ui-react';
import GetPhoto from '../shared/getPhoto';

export default class FakeFace extends React.Component {
    onPhotoGot = (dataURL, exif) => {
        console.log(dataURL, exif);
    };

    constructor() {
        super();

        this.onPhotoGot = this.onPhotoGot.bind(this);
    }

    render() {
        return (
            <Container textAlign="center">
                <Divider horizontal/>
                <Card fluid>
                    <Image src='/images/fake-face/Official_portrait_of_Barack_Obama.jpg'/>
                    <Card.Content>
                        <Card.Header>Obama</Card.Header>
                        <Card.Meta>看起来不错？</Card.Meta>
                        <Card.Description>点击下面按钮，将这张照片中的脸换成你的！</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <GetPhoto onPhotoGot={this.onPhotoGot}/>
                    </Card.Content>
                </Card>
            </Container>
        );
    }
};
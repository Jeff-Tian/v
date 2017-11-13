import React from 'react';
import GetPhoto from '../shared/getPhoto';
import {Card, Container, Divider, Form, Image, Popup, TextArea} from 'semantic-ui-react';

const timeoutLength = 2500;

export default class ImageBase64 extends React.Component {
    constructor() {
        super();

        this.state = {};

        this.onPhotoGot = this.onPhotoGot.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
    }

    onPhotoGot(dataURL, exif) {
        this.setState({
            base64: dataURL,
            imageSrc: dataURL
        });
    }

    handleFocus(event) {
        event.target.select();
        document.execCommand('copy');
    }

    handlePopupOpen = () => {
        this.setState({
            popupOpen: true
        });

        this.timeout = setTimeout(() => {
            this.setState({popupOpen: false});
        }, timeoutLength);
    };

    render() {
        return (
            <Container textAlign="center">
                <Divider horizontal/>
                <Form>
                    <Popup content={`Copied!`} open={this.state.popupOpen} position='top right'
                           onOpen={this.handlePopupOpen} trigger={
                        <TextArea placeholder="Upload Image and the base64 will be displayed here"
                                  rows={4} value={this.state.base64} onFocus={this.handleFocus}/>
                    } on='focus'/>
                </Form>
                <Card fluid>
                    <Image src={this.state.imageSrc}/>
                    <Card.Content>
                        <Card.Header>Image Base64 Converter</Card.Header>
                    </Card.Content>
                    <Card.Content extra>
                        <GetPhoto onPhotoGot={this.onPhotoGot}/>
                    </Card.Content>
                </Card>
            </Container>
        );
    }
}
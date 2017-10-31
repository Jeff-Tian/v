import React from 'react';
import {Label, Icon, Button, Form, Segment, Modal, Input} from 'semantic-ui-react';

class ColorPicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            color: this.props.initColor
        };

        this.changeColor = this.changeColor.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
    }

    changeColor(e) {
        let color = e.target.value;

        this.setState({
            color: color
        });
    }

    handleFocus(event) {
        event.target.select();
    }

    render() {
        return (
            <Modal open={this.props.open} dimmer="blurring">
                <Modal.Header>自定义背景颜色</Modal.Header>
                <Modal.Content image>
                    <Segment inverted style={{background: this.state.color}}>
                        <Input label="颜色值：" placeholder="请输入16进制颜色值"
                               onChange={this.changeColor} value={this.state.color} ref={(input) => {
                            if (input) {
                                input.focus();
                            }
                        }} onFocus={this.handleFocus}>
                        </Input>
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="black" onClick={this.props.onCancel}>取消</Button>
                    <Button positive icon="checkmark" labelPosition="right" content="确定"
                            onClick={() => this.props.onConfirm(this.state.color)}/>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default ColorPicker;
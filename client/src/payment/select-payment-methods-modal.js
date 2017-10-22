import React, {Component} from 'react';
import SelectPaymentMethods from './select-payment-methods';
import {Modal, Button} from 'semantic-ui-react';

class SelectPaymentMethodsModal extends Component {

    constructor(props) {
        super();

        this.state = {
        };
    }

    select(method) {
        this.setState({
            selectedMethod: method
        });
    }

    render() {
        return (
            <Modal size='fullscreen' open={this.props.open} onClose={this.props.onClose} dimmer='blurring'>
                <Modal.Header>请选择支付方式</Modal.Header>
                <Modal.Content scrolling>
                    <Modal.Description>
                        <p>要使用高级功能，需要先完成支付。在验证支付成功后，即可使用所有的高级功能。</p>
                    </Modal.Description>
                    <SelectPaymentMethods select={(newMethod) => this.select(newMethod)}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button negative labelPosition="left" icon="frown" content="放弃"
                            onClick={() => this.props.onClose()}/>
                    <Button positive labelPosition="right" icon="cny" content="去支付"
                            onClick={() => this.props.pay(this.state.selectedMethod)}/>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default SelectPaymentMethodsModal;
import React, {Component} from 'react';
import SelectPaymentMethods from './select-payment-methods';
import {Modal} from 'semantic-ui-react';

class SelectPaymentMethodsModal extends Component {

    constructor(props) {
        super();

        this.state = {};
    }

    render() {
        return (
            <Modal size='fullscreen' open={this.props.open} onClose={this.props.onClose} dimmer='blurring'>
                <Modal.Header>请选择支付方式</Modal.Header>
                <Modal.Content scrolling>
                    <Modal.Description>
                        <p>要使用高级功能，需要先完成支付。在验证支付成功后，即可使用所有的高级功能。</p>
                    </Modal.Description>
                    <SelectPaymentMethods pay={this.props.pay}/>
                </Modal.Content>
            </Modal>
        );
    }
}

export default SelectPaymentMethodsModal;
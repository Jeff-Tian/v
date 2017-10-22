import React, {Component} from 'react';
import {Button, Card, Image} from 'semantic-ui-react';

class SelectPaymentMethods extends Component {

    constructor(props) {
        super();

        this.state = {
            selected: 'wechat-pay',
        };
    }

    payBy(method) {
        this.props.pay(method);
    }

    render() {
        return (

            <Card.Group>
                <Card>
                    <Card.Content>
                        <Image floated="right" size="tiny" src='/icons/wechat-pay.jpg'/>
                        <Card.Header>微信支付</Card.Header>
                        <Card.Meta>推荐使用</Card.Meta>
                    </Card.Content>

                    <Card.Content extra>
                        <Button primary onClick={() => this.payBy('wechat-pay')}>
                            去支付
                        </Button>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Content>
                        <Image floated="right" size="tiny" src='/icons/alipay.png'/>
                        <Card.Header>支付宝</Card.Header>
                        <Card.Meta>支付</Card.Meta>
                    </Card.Content>

                    <Card.Content extra>
                        <Button primary onClick={() => this.payBy('alipay')}>
                            去支付
                        </Button>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Content>
                        <Image floated="right" size="tiny" src='/icons/bitcoin.jpg'/>
                        <Card.Header>比特币</Card.Header>
                        <Card.Meta></Card.Meta>
                    </Card.Content>

                    <Card.Content extra>
                        <Button primary onClick={() => this.payBy('bitcoin')}>
                            支付
                        </Button>
                    </Card.Content>
                </Card>
            </Card.Group>
        );
    }
}

export default SelectPaymentMethods;
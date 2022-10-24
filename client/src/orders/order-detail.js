import React from 'react';
import Client from '../Client';
import socket from '../socket';
import OrderStatus from '../../../bll/orderStatus';
import {browserHistory} from 'react-router';
import {Button, Container, Feed, Header, Icon, Segment} from 'semantic-ui-react';
import PaymentMethods from '../../../bll/paymentMethods';
import {getPaymentQrForOrder} from "../payment/payment-qr";
import _ from "lodash";

class Orders extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            order: {}
        };
    }

    async componentDidMount() {
        let order = await Client.fetchOrder(this.props.params.orderId);

        if (_.isEmpty(order)) {
            return browserHistory.push(`/v/local-image`);
        }

        if (order.status === OrderStatus.paid) {
            return browserHistory.push(`/v/local-image/${order.orderId}`);
        }

        this.setState({
            order: order
        });

        socket.emit('order-qr-remove', 'order page opened');

        console.log('socket emit message order page opened');

        let self = this;
        socket.on('order-paid', function (msg) {
            console.log('order-paid: ', msg);
            if (msg.orderId === self.props.params.orderId) {
                self.setState({
                    order: msg
                });

                if (true || navigator.userAgent.indexOf('MicroMessenger') >= 0) {
                    // browserHistory.push(`/v/local-image?orderId=${self.props.params.orderId}`);
                    browserHistory.push(`/v/local-image/${self.props.params.orderId}`);
                } else {
                    window.close();
                }
            }
        });

        socket.on('order-pending', function (msg) {
            if (msg.orderId === self.props.params.orderId) {
                self.setState({
                    order: msg
                });
            }
        });
    }

    claimPaid(orderId) {
        socket.emit('order-qr-remove', {message: 'claim-paid', orderId: orderId, status: OrderStatus.claimPaid});

        let self = this;
        socket.on('order-qr-remove', function (msg) {
            console.log('order-qr-remove: ', msg);
            if (msg.message && msg.message === 'claim-paid') {
                self.setState({
                    order: msg.order
                });
            }
        });
    }

    cancelPayment(orderId) {
        socket.emit('order-qr-remove', {message: 'cancelled', orderId: orderId, status: OrderStatus.cancelled});

        let self = this;
        socket.on('order-qr-remove', function (msg) {
            console.log('order-qr-remove:', msg);
            if (msg.message && msg.message === OrderStatus.cancelled) {
                self.setState({
                    order: msg.order
                });

                if (true || navigator.userAgent.indexOf('MicroMessenger') >= 0) {
                    browserHistory.push(`/v/local-image/${msg.order ? msg.order.orderId : msg.orderId}`);
                } else {
                    window.close();
                }
            }
        });
    }

    render() {
        return (
            <div className="ui container">
                <div className="ui fluid card">
                    <Container fluid>
                        <Header size="large" color="red" as="h3">在付款后请不要关闭本页面，在验证通过后本页面会自动关闭！</Header>
                    </Container>
                    <div className="image">
                        <img
                            src={getPaymentQrForOrder(this.state.order)}
                            alt="付款二维码"/>
                        {
                            this.state.order.paymentMethod === PaymentMethods.bitcoin.method ?
                                (
                                    <Segment>
                                        <Header size="medium">付款信息</Header>
                                        <Feed>
                                            <Feed.Event date="URI: "
                                                        summary="bitcoin:16jag4GRKxoN8RGA5izzFHeVWfdofR5wHL?amount=1.00000000&label=pa-pa-pa&message=pa-pa-pa"
                                                        style={{wordBreak: 'break-all'}}/>
                                            <Feed.Event date="地址: " summary="16jag4GRKxoN8RGA5izzFHeVWfdofR5wHL"/>
                                            <Feed.Event date="金额: " summary="1.00000000 BTC"/>
                                            <Feed.Event date="标签: " summary="pa-pa-pa"/>
                                            <Feed.Event date="消息: " summary="pa-pa-pa"/>
                                        </Feed>
                                    </Segment>
                                )
                                : ('')
                        }
                    </div>
                    <div className={"content"}>
                        <div className={"header"}>订单号：{this.state.order.orderId}</div>
                        <div>
                            原价： {this.state.order.cents}
                        </div>
                        <div>
                            随机优惠： {this.state.order.randomDiscountCents}
                        </div>
                        <div>
                            优惠后价格： {this.state.order.finalCents}
                        </div>
                        <div className={"meta"}>
                            状态: {this.state.order.status}
                            {this.state.order.paymentMethod && PaymentMethods[this.state.order.paymentMethod] ? (
                                <Icon name={PaymentMethods[this.state.order.paymentMethod].icon}
                                      color={PaymentMethods[this.state.order.paymentMethod].activeColor}/>) : ''}
                        </div>
                        <div className={"description"}>
                            请长按识别或者扫描以上二维码，完成转账。在审核通过后即可使用所有高级功能！
                            <br/>

                            {
                                this.state.order.status === OrderStatus.pendingPay
                                    ? (
                                        <button className="ui primary button"
                                                onClick={() => this.claimPaid(this.state.order.orderId)}>我已付款
                                        </button>
                                    )
                                    : (
                                        this.state.order.status === OrderStatus.paid
                                            ? (<button className={"ui disabled button"}>审核已通过</button>)
                                            : (<button className="ui disabled button">等待主人审核中……</button>)
                                    )
                            }
                            {this.state.order.status === OrderStatus.pendingPay ? (
                                <Button secondary floated="right"
                                        onClick={() => this.cancelPayment(this.state.order.orderId)}>放弃付款</Button>
                            ) : ''}
                        </div>
                    </div>
                    <div className={"extra content"}>
                                <span className={"right floated"}>
                                    {this.state.order.updatedTime}
                                </span>
                        <span>
                                    {this.state.order.createdTime}
                                </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Orders;
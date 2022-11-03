import React from 'react';
import Client from '../Client';
import socket from '../socket';
import OrderStatus from '../bll/orderStatus';
import {browserHistory} from 'react-router';
import {Button, Container, Dimmer, Feed, Header, Icon, Loader, Segment} from 'semantic-ui-react';
import PaymentMethods from '../bll/paymentMethods';
import {getPaymentQrForOrder} from "../payment/payment-qr";
import _ from "lodash";
import qs from 'querystring';
import OrderHeader from "./header";
import Redirect from "../redirect";

class OrderDetail extends React.Component {
    constructor(props, context) {
        super(props, context);

        const redirect = props.location.search ? qs.parse(props.location.search)['?redirect'] : undefined;

        this.state = {
            order: {},
            redirect,
            loading: true
        };
    }

    async componentDidMount() {
        let order = await Client.fetchOrder(this.props.params.orderId);

        this.setState({loading: false})

        if (_.isEmpty(order)) {
            return browserHistory.push(`/v/local-image`);
        }

        if (order.status === OrderStatus.paid && !this.state.redirect) {
            this.setState({
                redirect: `/v/local-image/${order.orderId}`
            })
        }

        this.setState({
            order: order
        });

        socket.emit('order-qr-remove', 'order page opened');

        console.log('socket emit message order page opened');

        let self = this;
        socket.on('order-paid', function (msg) {
            console.log('order-paid: ', msg);
            alert(msg);
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

            if (self.state.redirect) {
                browserHistory.push(self.state.redirect);
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
                {
                    this.state.order.status === OrderStatus.paid && this.state.redirect &&
                    <Redirect redirect={this.state.redirect}/>
                }
                <Dimmer active={this.state.loading}>
                    <Loader/>
                </Dimmer>
                <div className="ui fluid card">
                    <Container fluid>
                        <OrderHeader order={this.state.order} redirect={this.state.redirect}/>
                    </Container>
                    <div className="image">
                        {this.state.order.status === OrderStatus.paid ?
                            <Dimmer active>
                                已支付
                            </Dimmer> :
                            <img
                                src={getPaymentQrForOrder(this.state.order)}
                                alt="付款二维码"/>
                        }
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
                            原价： {this.state.order.cents / 100} 元
                        </div>
                        <div>
                            随机优惠： {this.state.order.randomDiscountCents / 100}元
                        </div>
                        <div>
                            优惠后价格： {this.state.order.finalCents / 100} 元
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

export default OrderDetail;
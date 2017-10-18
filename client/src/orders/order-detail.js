import React from 'react';
import Client from '../Client';
import wechatPaymentQrCode from '../../public/images/wechat-pay.jpg';
import socket from '../socket';
import OrderStatus from '../../../bll/orderStatus';
import {browserHistory} from 'react-router';

class Orders extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            order: {}
        };
    }

    async componentDidMount() {
        let order = await Client.fetchOrder(this.props.params.orderId);

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

                if (navigator.userAgent.indexOf('MicroMessenger') >= 0) {
                    // browserHistory.push(`/v/local-image?orderId=${self.props.params.orderId}`);
                    browserHistory.push(`/v/local-image/${self.props.params.orderId}`);
                } else {
                    window.close();
                }
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

    render() {
        return (
            <div className="ui container">
                <div className="ui fluid card">
                    <div className="image">
                        <img src={wechatPaymentQrCode} alt="微信付款二维码"/>
                    </div>
                    <div className={"content"}>
                        <div className={"header"}>订单号：{this.state.order.orderId}</div>
                        <div className={"meta"}>
                            状态: {this.state.order.status}
                        </div>
                        <div className={"description"}>
                            请用微信扫描识别上面的付款码，完成一笔任意金额的转账。在审核通过后即可下载不带广告二维码的加 V 图片啦！
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
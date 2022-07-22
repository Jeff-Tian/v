import React from 'react';
import Client from '../Client';
import OrderStatus from '../../../bll/orderStatus';
import socket from '../socket';
import {Button, Icon} from 'semantic-ui-react';
import AdminMenus from './menu';

class Orders extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            orders: [],
            icons: {
                'wechat-pay': {name: 'wechat', activeColor: 'green'},
                'alipay': {name: 'font', activeColor: 'blue'},
                'bitcoin': {name: 'bitcoin', activeColor: 'yellow'}
            }
        };
    }

    async componentDidMount() {
        console.log('mount');
        this.setState({
            orders: await Client.fetchOrders()
        });

        let self = this;
        socket.on('order-paid', function (msg) {
            self.setState(prevState => ({
                orders: self.state.orders.map(o => o.orderId === msg.orderId ? msg : o)
            }));
        });

        socket.on('order-pending', function (msg) {
            self.setState(prevState => ({
                orders: self.state.orders.map(o => o.orderId === msg.orderId ? msg : o)
            }));
        });

        socket.on('order-qr-remove', function (msg) {
            if (typeof msg === 'object' && msg.orderId) {
                console.log('new order created: ', msg);

                self.upsertOrder(msg);
            }

            if (typeof msg === 'object' && msg.order) {
                console.log('order updated');

                self.upsertOrder(msg.order);
            }
        });
    }

    upsertOrder(order) {
        let self = this;

        let index = self.state.orders.findIndex(o => o.orderId === order.orderId);

        if (index >= 0) {
            console.log('updating...');
            self.setState(prevState => ({
                orders: self.state.orders.map(o => o.orderId === order.orderId ? Object.assign({}, o, order) : o)
            }));
        } else {
            self.setState(prevState => ({
                orders: [order, ...self.state.orders]
            }));
        }
    }

    async markAsPaid(orderId) {
        await Client.markAsPaid(orderId);
        // let orders = await Client.fetchOrders();
        // this.setState({
        //     orders: orders
        // });
    }

    async markAsUnpaid(orderId) {
        console.log('unpaid: ', orderId);
        await Client.markAsUnpaid(orderId);
    }

    render() {
        return (
            <div className="ui container">
                <AdminMenus/>
                <div className={"ui divided items"}>
                    {
                        (this.state.orders || []).length
                            ? this.state.orders.map(o => {
                                return (
                                    <div className={"item"} key={o.orderId || 'unknown'}>
                                        <div className={"content"}>
                                            <div className={"header"}>{o.orderId}</div>
                                            <div className={"meta"}>
                                                {this.state.icons[o.paymentMethod] && [OrderStatus.pendingPay, OrderStatus.claimPaid].indexOf(o.status) >= 0
                                                    ? (
                                                        <Icon name={this.state.icons[o.paymentMethod].name}
                                                              color={this.state.icons[o.paymentMethod].activeColor}/>
                                                    )
                                                    : <Icon
                                                        name={this.state.icons[o.paymentMethod] ? this.state.icons[o.paymentMethod].name : 'question circle'}/>
                                                }
                                                <span className={"cinema"}>{o.type}</span>
                                                <span className={"cinema"}>{o.status}</span>
                                            </div>
                                            <div className={"description"}>
                                                {o.data}
                                            </div>
                                            <div className={"extra"}>
                                                {
                                                    [OrderStatus.pendingPay, OrderStatus.claimPaid].indexOf(o.status) >= 0 ? (
                                                        <button className="ui right floated primary button"
                                                                onClick={() => this.markAsPaid(o.orderId)}>
                                                            Mark as Paid
                                                        </button>
                                                    ) : ''
                                                }
                                                {
                                                    [OrderStatus.claimPaid].indexOf(o.status) >= 0 ? (
                                                        <Button negative className="ui right floated"
                                                                onClick={() => this.markAsUnpaid(o.orderId)}>Mark as
                                                            unpaid</Button>
                                                    ) : ''
                                                }
                                                <div className={"ui label"}>{o.createdTime}</div>
                                                <div className={"ui label"}>{o.updatedTime}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                            : <p>没有订单</p>
                    }
                </div>
            </div>
        );
    }
}

export default Orders;
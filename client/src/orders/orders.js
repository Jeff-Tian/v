import React from 'react';
import Client from '../Client';
import OrderStatus from '../../../bll/orderStatus';
import socket from '../socket';
import {Button, Icon, Image as ImageComponent, Item, Label} from 'semantic-ui-react';

class Orders extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            orders: []
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

        socket.on('order-qr-remove', function (msg) {
            if (typeof msg === 'object') {
                console.log('new order created: ', msg);

                self.setState(prevState => ({
                    orders: [msg, ...self.state.orders]
                }));
            }
        });
    }

    async markAsPaid(orderId) {
        await Client.markAsPaid(orderId);
        // let orders = await Client.fetchOrders();
        // this.setState({
        //     orders: orders
        // });
    }

    render() {
        return (
            <div className="ui container">
                <div className={"ui divided items"}>
                    {
                        this.state.orders.length
                            ? this.state.orders.map(o => {
                                return (
                                    <div className={"item"} key={o.orderId}>
                                        <div className={"image"}>
                                            <img src={"/icons/" + o.paymentMethod + ".jpg"} alt={o.paymentMethod}/>
                                        </div>
                                        <div className={"content"}>
                                            <div className={"header"}>{o.orderId}</div>
                                            <div className={"meta"}>
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
};

export default Orders;
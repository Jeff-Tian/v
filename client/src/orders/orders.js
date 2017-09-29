import React from 'react';
import Client from '../Client';
import OrderStatus from '../../../bll/orderStatus';

class Orders extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            orders: []
        };
    }

    async componentDidMount() {
        let orders = await Client.fetchOrders();

        this.setState({
            orders: orders
        });
    }

    async markAsPaid(orderId) {
        await Client.markAsPaid(orderId);
        let orders = await Client.fetchOrders();
        this.setState({
            orders: orders
        });
    }

    render() {
        return (
            <div className="ui container">
                <table className="ui table">
                    <thead>
                    <tr>
                        <th>order Id</th>
                        <th>时间</th>
                        <th>状态</th>
                        <th>类型</th>
                        <th>上次修改时间</th>
                        <th>数据</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.orders.map(o => {
                            return (
                                <tr key={o.orderId}>
                                    <td>{o.orderId}</td>
                                    <td>{o.createdTime}</td>
                                    <td>{o.status}</td>
                                    <td>{o.type}</td>
                                    <td>{o.updatedTime}</td>
                                    <td>{o.data}</td>
                                    <td>
                                        {
                                            [OrderStatus.pendingPay, OrderStatus.claimPaid].indexOf(o.status) >= 0 ? (
                                                <button className="ui positive button"
                                                        onClick={() => this.markAsPaid(o.orderId)}>
                                                    Mark as Paid
                                                </button>
                                            ) : ''
                                        }
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
};

export default Orders;
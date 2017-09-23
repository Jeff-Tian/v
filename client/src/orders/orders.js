import React from 'react';
import Client from '../Client';

class Orders extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            orders: []
        };
    }

    async componentDidMount() {
        let orders = await Client.fetchOrders();
        console.log(orders);
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
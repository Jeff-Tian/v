import React from 'react';
import Client from '../Client';

class Orders extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    async componentDidMount(){
        let orders = await Client.fetchOrders();
        console.log(orders);
    }

    render() {
        return (
            <div className="ui container">
                <table className="ui table">
                    <thead>
                    <tr>
                        <th>test</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>world</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
};

export default Orders;
import React from 'react'
import OrderCard from "./card";
import {useRequest} from "ahooks-v2";

const OrderList = () => {
    const {loading, data: orders, error} = useRequest({
        url: '/api/orders',
        method: 'get'
    })

    if (error) {
        return <div className="ui container">
            <p>Code: ${error.status}</p>
            <p>Message: ${error.statusText}</p>
        </div>
    }

    if (loading) {
        return <div className="ui container">
            <div>Loading...</div>
        </div>
    }

    return <div className="ui container">
        <div className="ui three doubled stackable cards">
            <OrderCard key={0} order={{orderId: 0}}/>
            {orders.map(order => <OrderCard key={order.orderId} order={order}/>)}
        </div>
    </div>;
}
export default OrderList
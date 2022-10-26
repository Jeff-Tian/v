import React from 'react'
import OrderCard from "./card";
import {useRequest} from "ahooks-v2";

const OrderList = () => {
    const {loading, data: orders, error} = useRequest({
        url: 'https://uni-orders-jeff-tian.cloud.okteto.net/orders',
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
            {orders.map(order => <OrderCard key={order.id} order={order}/>)}
        </div>
    </div>;
}
export default OrderList
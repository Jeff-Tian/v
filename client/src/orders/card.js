import React from 'react'
import OrderPlaceholder from "./placeholder";

const OrderCard = ({order}) => {
    const {
        orderId,
        type,
        orderNumber
    } = order

    return orderId ? <div className="ui card">
        <div className="content">
            <div className="header">订单号：{orderNumber}</div>
        </div>
        <div className="content">
            <div className="ui sub header">{type}</div>
        </div>
        <a href={`/order/${orderId}`} className="ui bottom attached button">查看订单详情</a>
    </div> : <OrderPlaceholder/>;
}

export default OrderCard
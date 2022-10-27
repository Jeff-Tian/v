import React from 'react'

const OrderCard = ({order}) => {
    const {
        type,
        orderNumber
    } = order

    return <div className="ui card">
        <div className="content">
            <div className="header">订单号：{orderNumber}</div>
        </div>
        <div className="content">
            <div className="ui sub header">{type}</div>
        </div>
    </div>;
}

export default OrderCard
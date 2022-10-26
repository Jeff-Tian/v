import React from 'react'

const OrderCard = ({order}) => {
    const {
        id,
        number,
        cents,
        randomDiscountCents,
        status,
        created_at,
        paid_at,
        cancelled_at,
        timeout_at,
        remark,
        type,
        paymentMethod
    } = order

    return <div className="ui card">
        <div className="content">
            <div className="header">订单号：{number}</div>
        </div>
        <div className="content">
            <div className="ui sub header">{remark}</div>
        </div>
    </div>;
}

export default OrderCard
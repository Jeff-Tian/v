import React from 'react'
import OrderPlaceholder from "./placeholder";
import {Link} from "react-router";
import {Card, Icon, Image} from "semantic-ui-react";
import OrderStatus from "../bll/orderStatus";

const OrderCard = ({order}) => {
    const {
        orderId,
        type,
        orderNumber,
        status,
        createdTime
    } = order

    return orderId ? <Card>
        <Card.Content>
            <Image floated='right'>
                {{
                    [OrderStatus.cancelled]: <Icon name='times'/>,
                    [OrderStatus.timeout]: <Icon name='hide'/>,
                    [OrderStatus.pendingPay]: <Icon name="wait"/>,
                    [OrderStatus.paid]: <Icon name="heart"/>
                }[status]}
            </Image>
            <Card.Header>{type}</Card.Header>
            <Card.Meta>{status}</Card.Meta>
            <Card.Description>创建时间：{new Date(createdTime).toLocaleString()}</Card.Description>
        </Card.Content>
        <Card.Content description={`订单号：${orderNumber}`}>
        </Card.Content>
        <Card.Content extra>
            <Link to={`/order/${orderId}?redirect=/orders`} className="ui bottom attached button">查看订单详情</Link>
        </Card.Content>
    </Card> : <OrderPlaceholder/>;
}

export default OrderCard
import React from 'react'
import {Button, Card, Image} from "semantic-ui-react";
import {browserHistory} from "react-router";

const createOrder = async () => {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({type: 'wall-of-fame', paymentMethod: 'wecom-pay'})
    })

    const order = await response.json()

    browserHistory.push(`/order/${order.orderId}?redirect=/orders`)
}

const OrderPlaceholder = () => {
    return <Card>
        <Card.Content>
            <Image src="/images/add-v.jpg" floated="right" size="mini"/>
            <Card.Header>创建新订单</Card.Header>
            <Card.Meta>点击创建新订单</Card.Meta>
            <Card.Description>点击可以创建新订单，然后永远显示在此页面上</Card.Description>
        </Card.Content>
        <Card.Content extra>
            <Button basic color='green' onClick={createOrder}>
                创建新订单
            </Button>
        </Card.Content>
    </Card>
}

export default OrderPlaceholder;
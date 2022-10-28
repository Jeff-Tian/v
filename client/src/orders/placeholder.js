import React from 'react'
import {Button, Card, Image} from "semantic-ui-react";

const OrderPlaceholder = () => {
    return <Card>
        <Card.Content>
            <Image src="/images/add-v.jpg" floated="right" size="mini"/>
            <Card.Header>创建新订单</Card.Header>
            <Card.Meta>点击创建新订单</Card.Meta>
            <Card.Description>点击可以创建新订单，然后永远显示在此页面上</Card.Description>
        </Card.Content>
        <Card.Content extra>
            <Button basic color='green'>
                创建新订单
            </Button>
        </Card.Content>
    </Card>
}

export default OrderPlaceholder;
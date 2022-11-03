import React from 'react'
import OrderStatus from "../bll/orderStatus";
import {Header, Card} from "semantic-ui-react";
import {Link} from "react-router";

const OrderHeader = ({order, redirect}) => {
    if (order && order.status !== OrderStatus.paid) {
        return <Header size="large" color="red" as="h3">在付款后请不要关闭本页面，在验证通过后本页面会自动关闭！ 如果付款状态没有及时更新，请手动刷新页面。</Header>
    }

    return redirect ? <Card.Content extra>
        <Link to={redirect} className='ui button'>返回</Link>
    </Card.Content> : null
}

export default OrderHeader
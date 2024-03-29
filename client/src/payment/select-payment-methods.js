import React, {Component} from 'react';
import {Image, Segment, Icon} from 'semantic-ui-react';

class SelectPaymentMethods extends Component {

    constructor(props) {
        super();

        this.state = {
            methodList: [{
                method: 'wecom-pay',
                icon: '/icons/wecom-pay.png',
                displayName: '企业微信支付',
                selected: true
            },
                {
                    method: 'wechat-pay',
                    icon: '/icons/wechat-pay.jpg',
                    displayName: '微信支付',
                    selected: false
                }, {
                    method: 'alipay',
                    icon: '/icons/alipay.jpg',
                    displayName: '支付宝',
                    selected: false
                }, {
                    method: 'bitcoin',
                    icon: '/icons/bitcoin.jpg',
                    displayName: '比特币',
                    selected: false
                }]
        };
    }

    componentDidMount() {
        this.select(this.state.methodList[0]);
    }

    select(m) {
        this.state.methodList.map(m => m.selected = false);
        m.selected = true;
        this.setState({
            methodList: this.state.methodList
        });

        this.props.select && this.props.select(m.method);
    }

    render() {
        return (

            <Segment.Group piled>
                {
                    this.state.methodList.map((m) => {
                        return (
                            <Segment onClick={() => this.select(m)} key={m.method}>
                                <Image size="mini" src={m.icon} verticalAlign="middle" spaced="right"/>
                                <span>{m.displayName}</span>

                                {m.selected ? (
                                    <Icon size="big" color="blue" name="checkmark box" style={{float: "right"}}/>) : ''}
                            </Segment>
                        );
                    })
                }
            </Segment.Group>
        );
    }
}

export default SelectPaymentMethods;
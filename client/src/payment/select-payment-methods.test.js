import SelectPaymentMethods from './select-payment-methods';
import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<SelectPaymentMethods/>, div);
});

it('renders wechat pay', () => {
    const wrapper = shallow(<SelectPaymentMethods/>);
    const wechatpay = '微信支付';
    expect(wrapper.contains(wechatpay)).toEqual(true);
});
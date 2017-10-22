let m = {
    wechatPay: {
        method: 'wechat-pay',
        image: '/icons/wechat-pay.jpg',
        icon: 'wechat',
        activeColor: 'green',
        displayName: '微信支付',
        receiverImage: '/images/wechat-pay.jpg'
    },
    alipay: {
        method: 'alipay',
        image: '/icons/alipay.jpg',
        icon: 'fonts',
        activeColor: 'blue',
        displayName: '支付宝',
        receiverImage: '/images/alipay.jpg'
    },
    bitcoin: {
        method: 'bitcoin',
        image: '/icons/bitcoin.jpg',
        icon: 'bitcoin',
        activeColor: 'yellow',
        displayName: '比特币',
        receiverImage: '/images/bitcoin.png'
    }
};

m['wechat-pay'] = m.wechatPay;

module.exports = m;
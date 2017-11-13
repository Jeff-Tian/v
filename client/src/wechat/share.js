import React from 'react';
import ReactDOM from 'react-dom';
import Client from '../Client';

async function talkWithWechatShare() {
    if (typeof window.wx === 'undefined') {
        document.addEventListener('wxLoad', async function (e) {
            await talkWithWechatShare();
        }, false);
    }

    let index = window.location.href.indexOf('#');
    if (index < 0) index = undefined;

    let configObj = await Client.proxy(`/api/wechat-api/sign?url=${encodeURIComponent(window.location.href.substr(0, index))}`, {});
    console.log('wechat config = ', configObj);

    window.wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: configObj.appId, // 必填，公众号的唯一标识
        timestamp: configObj.timestamp, // 必填，生成签名的时间戳
        nonceStr: configObj.nonceStr, // 必填，生成签名的随机串
        signature: configObj.signature, // 必填，签名，见附录1
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });

    console.log('wechat config done');

    window.wx.ready(function () {
        console.log('微信准备好了!');

        let sharable = {
            title: '装逼神器',
            desc: '装逼神器 desc',
            link: window.location.href,
            imgUrl: 'data:image/png;base64,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'
        };


        window.wx.onMenuShareTimeline(Object.assign({}, sharable));
        window.wx.onMenuShareAppMessage(Object.assign({}, sharable));
    });

    window.wx.error(function () {
        console.error('与微信接口交流出现了障碍：', arguments);
    });
}

export default class WechatShare extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    async componentDidMount() {
        await talkWithWechatShare();
    }

    render() {
        return (
            <div>Hello Wechat Share</div>
        );
    }
};

ReactDOM.render(<WechatShare/>, document.getElementById('extra'));

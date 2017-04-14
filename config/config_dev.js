module.exports = {
    cdn: '',

    sso: {
        inner: {
            "host": "uat.service.hcd.com",
            "port": 10086
        }
    },

    captcha: {
        public: {
            "host": "uat.bridgeplus.cn",
            "port": "10001"
        },
        inner: {
            "host": "uat.bridgeplus.cn",
            "port": "10001"
        }
    },

    sms: {
        inner: {
            "host": "uat.service.hcd.com",
            "port": "10002",
            "code": "BUZZ_S1_cn"
        }
    },

    buzz: {
        inner: {
            host: 'uat.service.hcd.com',
            // host: 'localhost',
            port: 16160
        },

        public: {
            origin: 'http://localhost:16000'
        }
    },

    applicationId: "4f6b3929-38c3-4828-88a7-11da836cae34",

    logger: {
        appName: 'buzzAdmin'
    },

    mock: false,

    tracking: "http://10.20.32.51:14444/js/t.min.js?write-key=HjYKeEnEV7QiyFXCKxZXrPmqgsjkaQpb",

    admins: ['6c003a7a-08cf-4f02-8f5b-4d23ee70f8a0']
};
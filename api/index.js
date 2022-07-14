const serverless = require('serverless-http');

process.env.ROUTER_PREFIX = '/api';

const app = require('../app');

const handler = serverless(app);

export default async function (req, res) {
    // you can do other things here
    const result = await handler({}, {req, res});

    console.log('result = ', result);
    // and here
    res.send(result.body)
};

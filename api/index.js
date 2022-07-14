const serverless = require('serverless-http');

process.env.ROUTER_PREFIX = '/api';

const app = require('../app');

const handler = serverless(app);

export default async function (event, context) {
    console.log('event = ', event.toString());
    console.log('context = ', context.toString());
    // you can do other things here
    const result = await handler(event, context);

    console.log('result = ', result);
    // and here
    return result;
};

const serverless = require('serverless-http');
const app = require('../app');

const handler = serverless(app);

export default handler;
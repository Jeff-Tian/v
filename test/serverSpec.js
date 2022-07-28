'use strict';

let prepare = require('./helper/prepare');
let It = prepare.It;

describe('server healthcheck', function () {
    It.get('/healthcheck', {}, 200, /is ok/);
    It.post('/healthcheck', {}, 200, /is ok/);

    // It.get('/sign-in', {}, 200, /Buzz buzz English Admin/i);

    // It.get('/', {}, 302, 'Redirecting to <a href="/sign-in?return_url=%2F">/sign-in?return_url=%2F</a>.');
});
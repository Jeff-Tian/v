'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../../app');

require('co-mocha');

let server = app.listen();

describe('admin order features', function () {
    it('requires log on', function* () {
        yield  request(server).get('/admin/orders').send({})
            .expect(401).expect('Unauthorized')
            .end();
    });
});
'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../../app');

let config = require('../../config');

require('co-mocha');
let expect = require('expect.js');

let server = app.listen();

describe('admin config api features', function () {
    it('requires log on for accessing admin config api ', function* () {
        yield  request(server).get('/admin/api/config')
            .expect(302)
            .end();
    });

    it('allows accessing admin config api after log on', function* () {
        yield request(server).get('/admin/api/config')
            .auth(process.env.V_ADMIN, process.env.V_PWD)
            .expect(200)
            .end();
    });

    it('lists config', function* () {
        yield request(server).get('/admin/api/config')
            .auth(process.env.V_ADMIN, process.env.V_PWD)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(JSON.stringify(config))
            .end();
    });

    it('change config', function* () {
        yield request(server).put('/admin/api/config')
            .auth(process.env.V_ADMIN, process.env.V_PWD)
            .send({
                test: 'test'
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({...JSON.parse(JSON.stringify(config)), test: 'test'})
            .end();

        assert.equal(config.test, 'test');
    });
});
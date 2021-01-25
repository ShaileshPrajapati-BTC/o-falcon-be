"use strict";
const sails = require('sails');
const config = require("../../../../config/service/testing");
//const config = require(sails.config.appPath + '/config/service/testing');
const expect = require('chai').expect;
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const _ = require('lodash');
chai.use(chaiHttp);

describe('Admin:Master:Process', () => {
    let adminToken = "JWT ";
    let parentId = "";
    let Cookies;
    it('should auth with admin and extract token', (done) => {
        const loginParams = config.service.testing.ADMIN_AUTH;
        chai
            .request(config.service.testing.URL)
            .post('/auth/login')
            .set('content-type', 'application/json')
            .send(loginParams)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.include({code: sails.config.errors.OK.code});
                adminToken += res.body && res.body.data && res.body.data.token;
                Cookies = res.headers['set-cookie'].pop().split(';')[0];
                done();
            });
    });


    /**************** CREATE Master ***************************/
    it('should not create and return bad params', (done) => {
        const invalidMaster = {
            name: faker.random.word,
        };

        chai
            .request(config.service.testing.URL)
            .post('/admin/master/create')
            .set('content-type', 'application/json')
            .set('Authorization', adminToken)
            .send(invalidMaster)
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.include({code: sails.config.errors.BAD_REQUEST.code});
                done();
            });
    });

    it('should main create master', (done) => {
        const masterName = faker.random.word() + " " + faker.random.number();
        const invalidMaster = {
            name: masterName,
            code: masterName.toUpperCase(),
            group: faker.random.word().toUpperCase(),
            description: faker.random.words(),
            isActive: true,
            isDefault: true,
            image: faker.random.image(),
            likeKeyWords: _.map(_.range(10), (range) => {
                return faker.random.word();
            })
        };
        let req = chai
            .request(config.service.testing.URL)
            .post('/admin/master/create')
        req.cookies = Cookies;
        req
            .set('content-type', 'application/json')
            .set('Authorization', adminToken)
            .send(invalidMaster)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.include({code: sails.config.errors.OK.code});
                expect(res.body.data).to.have.property('id')
                // extract parent id
                if (res.body.data && res.body.data.id) {
                    parentId = res.body.data.id;
                }
                done();
            });
    });


    it('should create child master', (done) => {
        const masterName = faker.random.word();
        const invalidMaster = {
            parentId: parentId,
            name: masterName,
            code: masterName.toUpperCase(),
            group: faker.random.word().toUpperCase(),
            description: faker.random.words(),
            isActive: true,
            isDefault: true,
            image: faker.random.image(),
            likeKeyWords: _.map(_.range(10), (range) => {
                return faker.random.word();
            })
        };
        let req = chai
            .request(config.service.testing.URL)
            .post('/admin/master/create')
        req.cookies = Cookies;
        req
            .set('content-type', 'application/json')
            .set('Authorization', adminToken)
            .send(invalidMaster)
            .end(function (err, res) {
                console.log(res.body)
                expect(res).to.have.status(200);
                expect(res.body).to.include({code: sails.config.errors.OK.code});
                expect(res.body.data).to.have.property('id')
                done();
            });
    });

    it('should update master', (done) => {
        const masterName = faker.random.word();
        const invalidMaster = {
            parentId: parentId,
            name: masterName,
            code: masterName.toUpperCase(),
            group: faker.random.word().toUpperCase(),
            description: faker.random.words(),
            isActive: true,
            isDefault: true,
            image: faker.random.image(),
            likeKeyWords: _.map(_.range(10), (range) => {
                return faker.random.word();
            })
        };
        let req = chai
            .request(config.service.testing.URL)
            .post('/admin/master/create')
        req.cookies = Cookies;
        req
            .set('content-type', 'application/json')
            .set('Authorization', adminToken)
            .send(invalidMaster)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.include({code: sails.config.errors.OK.code});
                expect(res.body.data).to.have.property('id')
                done();
            });
    });

    it('should check delete dependency master', (done) => {
        var delReq={
            masters:[parentId]
        }
         chai
            .request(config.service.testing.URL)
            .post('/admin/master/bulk-destroy')
            .set('content-type', 'application/json')
            .set('Authorization', adminToken)
            .send(delReq)
            .end(function (err, res) {
                console.log(res.body)
                expect(res).to.have.status(200);
                expect(res.body).to.include({code: sails.config.errors.DEPENDENT.code});
                done();
            });
    });

    it('should delete with dependency master', (done) => {
        var delReq={
            masters:[parentId],
            clearDependencies:true
        }
          chai
            .request(config.service.testing.URL)
            .post('/admin/master/bulk-destroy')
            .set('content-type', 'application/json')
            .set('Authorization', adminToken)
            .send(delReq)
            .end(function (err, res) {
                console.log(res.body)
                expect(res).to.have.status(200);
                expect(res.body).to.include({code: sails.config.errors.OK.code});
                done();
            });
    });


});

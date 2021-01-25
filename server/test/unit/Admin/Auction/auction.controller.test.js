"use strict";
const sails    = require('sails');
const config   = require("../../../../config/service/testing");
//const config = require(sails.config.appPath + '/config/service/testing');
const expect   = require('chai').expect;
const chai     = require('chai');
const chaiHttp = require('chai-http');
const faker    = require('faker');
const _        = require('lodash');
chai.use(chaiHttp);

describe('Admin:Auction:Process', () => {
    let adminToken       = "JWT ";
    let Cookies;
    let createdAuction   = {};
    let invalidAuction   = {};
    let deleteAuctionIds = [];
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
    })

    it('should check delete dependency for auction', async () => {
        try {
            let auctions = [];

            for (let i of _.range(1, 5)) {
                let auction   = await Auction.create(sails.config.service.auction.getMockAuction()).fetch();
                let createLot = _.extend(sails.config.service.lot.getMockLot(), {auctionId: auction.id});
                await Lot.create(createLot).fetch();
                auctions.push(auction)
            }
            console.log("auctions", auctions)
            //console.log("createdLot", createdLot);
            var delReq = {
                ids: _.map(auctions, 'id')
            }
            await new Promise((resolve, reject) => {
                chai
                    .request(config.service.testing.URL)
                    .post('/admin/auction/bulk-destroy')
                    .set('content-type', 'application/json')
                    .set('Authorization', adminToken)
                    .send(delReq)
                    .then(function (res) {
                        console.log("res.body.data", JSON.stringify(res.body.data));
                        expect(res).to.have.status(200);
                        expect(res.body).to.include({code: 'E_DEPENDENT'});
                        expect(res.body.data).to.have.property('dependent');
                        expect(res.body.data.dependent).to.be.an('array');
                        deleteAuctionIds = _.map(auctions, 'id');
                        resolve(true)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })


        } catch (err) {
            throw err
        }
    });

    it('should delete with dependency master', (done) => {
        var delReq = {
            ids              : deleteAuctionIds,
            clearDependencies: true
        }
        chai
            .request(config.service.testing.URL)
            .post('/admin/auction/bulk-destroy')
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


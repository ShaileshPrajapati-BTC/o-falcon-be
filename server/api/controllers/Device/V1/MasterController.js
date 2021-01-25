/**
 * MasterController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const masterService = require(sails.config.appPath + '/api/services/master');
const moment = require('moment');
const deleteSyncService = require(sails.config.appPath + '/api/services/deleteSync');
const CommonService = require(sails.config.appPath + '/api/services/common');

module.exports = {

    /**
     * @description: list master(s) by paginate
     * @return {Promise.<void>}
     */
    async sync(req, res) {
        const params = _.omit(req.allParams(), 'id');
        try {
            let lastSyncDate = moment().toISOString();
            let response = {};
            let notSyncedRecords = new Promise(async (resolve, reject) => {
                try {
                    let filter = await CommonService.getSyncDateFilter(params);
                    if (filter) {
                        let query = Master.find(filter);
                        const masters = await query;
                        if (!masters || !masters.length) {
                            return res.notFound(null, sails.config.message.NOT_FOUND);
                        }
                        response.list = masters;
                        response.lastSyncDate = lastSyncDate;

                        let countFilter = await CommonService.removePagination(filter);
                        response.count = await Master.count(countFilter);
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            let deleteLog = new Promise(async (resolve, reject) => {
                try {
                    response.deletedIds = await deleteSyncService.syncRecords({
                        module: Lot.identity,
                        lastSyncDate: params.lastSyncDate
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            let rapPriceData = new Promise(async (resolve, reject) => {
                try {
                    response.rapPriceData = await masterService.syncRapPrice(params);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            let discountPriceData = new Promise(async (resolve, reject) => {
                try {
                    response.discountPriceData = await masterService.syncDiscountPrice(params);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            let labourChargesData = new Promise(async (resolve, reject) => {
                try {
                    response.labourChargesData = await masterService.syncLabourCharge(params);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            await Promise.all([notSyncedRecords, deleteLog, rapPriceData, discountPriceData, labourChargesData]);
            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log('err', err);
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    }

};


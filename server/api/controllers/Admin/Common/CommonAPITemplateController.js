/**
 * Common Controller Template
 *
 * @description :: Server-side logic for generating common Template for API.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// const _ = require('lodash');
// const Common = require(sails.config.appPath + '/api/services/common');
// const CommonValidatorService = require(sails.config.appPath + '/api/services/commonValidator');

module.exports = {

    /**
     * create  record with unique params
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async create(req, res) {
        let params = req.allParams();
        let modelName = 'user';
        let option = {
            params: params,
            modelName: modelName
        };

        // required params check
        try {
            await CommonValidator.validateCreateParams(option);
            let createdRecord = await sails.models[modelName]
                .create({})
                .fetch();

            return res.ok(createdRecord, sails.config.message.CREATED);
        } catch (error) {
            console.log(error);
            // sails.config.message.CREATE_FAILED

            return res.serverError(null, error);

        }

    },
    /**
     *  labour charge list
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async paginate(req, res) {
        let params = req.allParams();
        try {
            // get filter
            let filter = await Common.getFilter(params);
            console.log('filter1', filter);
            let recordsList = await `#{Model}`.find(filter)
                                              .meta({enableExperimentalDeepTargets: true});
            if (!recordsList.length) {
                return res.notFound({}, sails.config.message.RECORD_LIST_NOT_FOUND);
            }
            let response = {
                list: recordsList
            };
            // count
            let countFilter = await Common.removePagination(filter);
            response.count = await `#{Model}`.count(countFilter)
                                             .meta({enableExperimentalDeepTargets: true});
            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     *  labour charge  view
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async view(req, res) {
        let params = req.allParams();
        try {
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // find record
            let record = await `#{Model}`.findOne({id: params.id});
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            } else {
                return res.notFound({}, sails.config.message.RECORD_LIST_NOT_FOUND);
            }
        } catch (error) {
            console.log(error);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    /**
     *  labour charge update
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async update(req, res) {
        try {
            let params = req.allParams();
            let option = {
                params: params,
                globalId: '`#{ModelGlobalId}`'
            };
            // required params check
            if (!await CommonValidatorService.validateRequiredUpdateParams(option)) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // create update
            let paramsToUpdate = _.omit(params, 'id');
            let updatedRecord = await `#{Model}`.update({id: params.id})
                                                .set(paramsToUpdate)
                                                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(_.first(updatedRecord), sails.config.message.RECORD_UPDATED);
            } else {
                return res.notFound({}, sails.config.message.RECORD_LIST_NOT_FOUND);
            }
        } catch (error) {
            console.log(error);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
};

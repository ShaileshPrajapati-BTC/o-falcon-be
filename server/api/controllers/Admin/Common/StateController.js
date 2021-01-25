/**
 * MasterController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const modelName = 'State';
module.exports = {
    async paginate(req, res) {
        let params = req.allParams();
        try {
            let loginUser = req.user;
            let filter = {
                where: {
                    isActive: true,
                    isDeleted: false,
                    name: { "!=": "" }
                }
            };
            if (params.sort) {
                filter.sort = params.sort
            }
            else {
                filter.sort = "normalizeName ASC"
            }
            if (params.country) {
                filter.where.countryId = params.country
            }
            if (params.page && params.limit) {
                filter.skip = (params.page - 1) * params.limit;
                filter.limit = params.limit;
            }
            let result = {};
            result.list = await State.find(filter);
            result.count = await State.count(filter.where);
            return res.ok(result, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async create(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.name || !params.countryId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let option = {
                params: params,
                modelName: modelName
            };
            const loggedInUser = req.user;
            params.completedBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let createdRecord = await State.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();
            // required params check
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // create update
            let paramsToUpdate = _.omit(params, "id");
            let updatedRecord = await State.update({ id: params.id })
                .set(paramsToUpdate)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(
                    _.first(updatedRecord),
                    sails.config.message.SEQUENCE_UPDATED
                );
            } else {
                return res.ok({}, sails.config.message.NEWS_LIST_NOT_FOUND);
            }
        } catch (error) {
            console.log(error);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async createMultipleState(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.state.length || !params.countryId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let option = {
                params: params,
                modelName: modelName
            };
            const loggedInUser = req.user;
            params.createdBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let states = [];
            for (let state of params.states) {
                if (!state) {
                    continue
                }
                let stateObj = {
                    countryId: params.countryId,
                    name: state,
                    normalizeName: state.toLowerCase(),
                    isActive: true,
                    createdBy: params.createdBy
                }
                states.push(stateObj);
            }
            if(!states.length){
                return res.ok({}, sails.config.message.SEQUENCE_CREATE_FAILED);
            }
            let createdRecord = await State.createEach(states).fetch();

            return res.ok(createdRecord, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
};


/**
 * MasterController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const modelName = 'City';

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
            if (params.country) {
                filter.where.countryId = params.country
            }
            if (params.state) {
                filter.where.stateId = params.state
            }
            if (params.sort) {
                filter.sort = params.sort
            }
            else {
                filter.sort = "normalizeName ASC"
            }
            if (params.page && params.limit) {
                filter.skip = (params.page - 1) * params.limit;
                filter.limit = params.limit;
            }
            let response = {};
            response.list = await City.find(filter);
            response.count = await City.count(filter.where);

            return res.ok(response, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async create(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.name || !params.stateId || !params.countryId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let option = {
                params: params,
                modelName: modelName
            };
            const loggedInUser = req.user;
            params.createdBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let createdRecord = await CityService.create(params).fetch();

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
            let updatedRecord = await City.update({ id: params.id })
                .set(paramsToUpdate)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(
                    _.first(updatedRecord),
                    sails.config.message.SEQUENCE_UPDATED
                );
            } else {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
        } catch (error) {
            console.log(error);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async createMultipleCity(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.city.length || !params.stateId || !params.countryId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let option = {
                params: params,
                modelName: modelName
            };
            const loggedInUser = req.user;
            params.createdBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let cities = [];
            for (let city of params.city) {
                if (!city) {
                    continue
                }
                let cityObj = {
                    stateId: params.stateId,
                    countryId: params.countryId,
                    name: city,
                    normalizeName: city.toLowerCase(),
                    isActive: true,
                    createdBy: params.createdBy
                }
                cities.push(cityObj);
            }
            if(!cities.length){
                return res.ok({}, sails.config.message.SEQUENCE_CREATE_FAILED);
            }
            let createdRecord = await City.createEach(cities).fetch();

            return res.ok(createdRecord, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
};


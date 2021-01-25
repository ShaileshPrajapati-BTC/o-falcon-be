/**
 * MasterController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const modelName = 'Country';

module.exports = {
    async paginate(req, res) {
        let params = req.allParams();
        try {
            let response = {};
            let loginUser = req.user;
            params.isActive = true;
            params.isDeleted = false;
            let filter = await common.getFilter(params);
            filter.where.name = { "!=": "" };
            if (params.sort) {
                filter.sort = params.sort;
            } else {
                filter.sort = "normalizeName ASC";
            }
            response.list = await Country.find(filter);
            response.count = await Country.count(filter.where);

            return res.ok(response, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async create(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.name || !params.code || !params.timeZone) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let option = {
                params: params,
                modelName: modelName
            };
            const loggedInUser = req.user;
            params.completedBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let createdRecord = await Country.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async createMultipleCountry(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.country.length) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let option = {
                params: params,
                modelName: modelName
            };
            const loggedInUser = req.user;
            params.createdBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let countries = [];
            for (let country of params.countries) {
                if (!country.name) {
                    continue
                }
                let countryObj = {
                    name: country.name,
                    normalizeName: country.name.toLowerCase(),
                    code: country.code ? country.code : "",
                    ISDCode: country.ISDCode ? country.ISDCode : 0,
                    localIsoTime: country.localIsoTime ? country.localIsoTime : "",
                    timeZone: country.timeZone ? country.timeZone : "",
                    isActive: true,
                    createdBy: params.createdBy
                }
                countries.push(countryObj);
            }
            if(!countries.length){
                return res.ok({}, sails.config.message.SEQUENCE_CREATE_FAILED);
            }
            let createdRecords = await Country.createEach(countries).fetch();

            return res.ok(createdRecords, sails.config.message.OK);
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
            let updatedRecord = await Country.update({ id: params.id })
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
};


const modelName = 'staticpage';

module.exports = {
    async create(req, res) {
        try {
            let params = req.allParams();
            if (req.user.type === sails.config.USER.TYPE.FRANCHISEE) {
                params.addedBy = req.user.id;
            } else {
                params.addedBy = null;
            }

            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateCreateParams(option);
            let createdRecord = await sails.models[modelName].create(params).fetch();

            return res.ok(createdRecord, sails.config.message.STATIC_PAGE_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async update(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateUpdateParams(option);
            let record = _.omit(params, 'id');
            let updatedRecord = await StaticPage
                .update({ id: params.id })
                .set(record)
                .fetch();
            if (updatedRecord && updatedRecord.length > 0) {
                return res.ok(updatedRecord[0], sails.config.message.STATIC_PAGE_UPDATED);
            }

            return res.notFound({}, sails.config.message.STATIC_PAGE_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },
    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            if (req.user.type === sails.config.USER.TYPE.FRANCHISEE) {
                params.filter.addedBy = req.user.id;
            } else {
                params.filter.addedBy = null;
            }

            let filter = await common.getFilter(params);

            let recordsList = await StaticPage.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await StaticPage.count(countFilter);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async view(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // find record
            let record = await StaticPage.findOne({ id: params.id });
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.STATIC_PAGE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async viewForFranchisee(req, res) {
        try {
            // find record
            let params = req.allParams();
            if (params.filter.code === 'TERMS_CONDITION' && req.user.type === sails.config.USER.TYPE.DEALER) {
                params.filter.addedBy = req.user.franchiseeId;
                params.filter.userType = req.user.type;
            } else {
                params.filter.userType = sails.config.USER.TYPE.FRANCHISEE;
            }

            let filter = await common.getFilter(params);

            let record = await StaticPage.find(filter);
            // return record
            if (record) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.STATIC_PAGE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};

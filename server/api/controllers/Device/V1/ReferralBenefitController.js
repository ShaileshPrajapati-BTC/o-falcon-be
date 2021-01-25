module.exports = {
    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let loggedInUser = req.user;

            let filter = await common.getFilter(params);
            filter.where.userId = loggedInUser.id;
            filter.where.isDeleted = false;
            let recordsList = await ReferralBenefit.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await ReferralBenefit.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async view(req, res) {
        try {
            let params = req.allParams();
            // find record
            let record = await ReferralBenefit.findOne({ id: params.id });

            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.LIST_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
}
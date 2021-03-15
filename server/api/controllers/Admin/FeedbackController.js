module.exports = {
    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            if (req.user.type === sails.config.USER.TYPE.FRANCHISEE) {
                params.filter.dealerId = null;
            }
            let filter = await common.getFilter(params);
            // filter.sort = 'sequence desc';
            let recordsList = await Feedback.find(filter)
                .populate('addedBy', { select: ['firstName', 'lastName', 'name', 'franchiseeId', 'dealerId','mobiles','emails'] });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Feedback.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }

    }
};

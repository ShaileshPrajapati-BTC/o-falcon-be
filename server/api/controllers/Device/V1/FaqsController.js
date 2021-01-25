const modelName = 'faqs';

module.exports = {
    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            filter.sort = 'sequence asc';
            let recordsList = await Faqs.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Faqs.count(countFilter);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};

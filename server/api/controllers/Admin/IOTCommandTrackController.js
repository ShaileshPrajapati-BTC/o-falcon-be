const modelName = 'IOTCommandCallbackTrack';

module.exports = {

    async paginate(req, res) {
        try {
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let recordsList = await IOTCommandCallbackTrack.find(filter)
            if (!recordsList.length) {
                return res.ok({ list: [] }, sails.config.message.LIST_NOT_FOUND);
            }
            let response = { list: recordsList };

            let countFilter = await common.removePagination(filter);
            response.count = await IOTCommandCallbackTrack.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
}
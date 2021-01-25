module.exports = {

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let recordsList = await ActivityLog.find(filter)
                .populate('userId', { select: ['name', 'type'] });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            for (key in recordsList) {
                if (recordsList[key].referenceId) {
                    let referenceIdData = await common.getActivityLogReference(recordsList[key].referenceId, recordsList[key].module);
                    if (referenceIdData) {
                        recordsList[key].details = Object.assign({}, recordsList[key].details, referenceIdData);
                    }
                    recordsList[key].details = Object.assign({}, recordsList[key].details, { isDeleted: true });
                }                
            }
            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await ActivityLog.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
}
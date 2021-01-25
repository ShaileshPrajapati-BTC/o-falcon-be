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
}
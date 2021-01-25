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
}
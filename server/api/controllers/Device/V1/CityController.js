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
}
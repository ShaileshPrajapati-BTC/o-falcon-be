const modelName = 'staticpage';

module.exports = {
    async getPage(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.code) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // find record
            let record = await StaticPage.findOne({ code: params.code, userType: sails.config.USER.TYPE.CUSTOMER });
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.STATIC_PAGE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};

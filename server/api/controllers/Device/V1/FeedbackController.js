const modelName = 'feedback';

module.exports = {
    async giveFeedback(req, res) {
        try {
            let params = req.allParams();
            params.franchiseeId = req.user.franchiseeId ? req.user.franchiseeId : null;
            params.dealerId = req.user.dealerId ? req.user.dealerId : null;
            // let modelName = 'vehicle';
            const language = req.headers.language;
            params.language = language;
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateCreateParams(option);
            let createdRecord = await sails.models[modelName].create(params).fetch();

            return res.ok(createdRecord, sails.config.message.FEEDBACK_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};

const modelName = 'actionquestionnairemaster';
const franchisee = sails.config.USER.TYPE.FRANCHISEE;
const dealer = sails.config.USER.TYPE.DEALER;
module.exports = {
    async paginate(req, res) {
        try {
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let record = await ActionQuestionnaireMaster.find(filter);
            if (record) {
                return res.ok(record, sails.config.message.OK);
            }
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async create(req, res) {
        try {
            let params = req.allParams();
            if (req.user.type === franchisee || req.user.type === dealer) {
                params.addedBy = req.user.id;
            } else {
                params.addedBy = null;
            }
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateCreateParams(option);
            let record = await sails.models[modelName].create(params).fetch();

            return res.ok(record, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async update(req, res) {
        try {
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateUpdateParams(option);
            let reqData = _.omit(params, 'id');
            let updatedData = await ActionQuestionnaireMaster
                .update({ id: params.id })
                .set(reqData)
                .fetch();
            console.log('     ACTION QUESTIONNAIRE    ', updatedData);

            if (updatedData) {
                return res.ok(updatedData[0], sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.RECORD_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async delete(req, res) {
        let params = req.allParams();
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let data = await ActionQuestionnaireMaster.findOne({ id: params.id });
            if (!data || data.isDeleted) {
                return res.notFound({}, sails.config.message.RECORD_NOT_FOUND);
            }
            let updatedData = await ActionQuestionnaireMaster
                .update({ id: params.id })
                .set({ isDeleted: true, updatedBy: params.updatedBy })
                .fetch();

            if (updatedData) {
                return res.ok(updatedData, sails.config.message.MASTER_DELETED);
            }

            return res.notFound({}, sails.config.message.RECORD_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async view(req, res) {
        const params = req.allParams();
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let data = await ActionQuestionnaireMaster.findOne({ id: params.id });
            if (data) {
                return res.ok(data, sails.config.message.OK);
            }

            return res.badRequest(null, sails.config.message.NOT_FOUND);
        } catch (err) {
            return res.serverError({}, err);
        }


    }

};

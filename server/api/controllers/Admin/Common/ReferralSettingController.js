const modelName = 'ReferralSetting';
module.exports = {
    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let recordsList = await ReferralSetting.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await ReferralSetting.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async create(req, res) {
        let params = req.allParams();
        const loggedInUser = req.user;
        try {
            if (
                !params &&
                (!params.invitedUserBenefitType || !params.invitedUserBenefitValue) &&
                (!params.referralUserBenefitType || !params.referralUserBenefitValue)
            ) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            if (params.isDefault) {
                let defaultSetting = await ReferralSetting.findOne({ isDefault: true, isDeleted: false });
                if (defaultSetting) {
                    return res.badRequest(null, sails.config.message.ALREADY_SET_DEFAULT_REFERRAL_SETTING);
                }
            }

            let option = {
                params: params,
                modelName: modelName
            };
            params.completedBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let createdRecord = await ReferralSetting.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.REFERRAL_SETTING_CREATED);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();
            // required params check
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // create update
            let paramsToUpdate = _.omit(params, "id");
            let updatedRecord = await ReferralSetting.update({ id: params.id })
                .set(paramsToUpdate)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(
                    _.first(updatedRecord),
                    sails.config.message.REFERRAL_SETTING_UPDATED
                );
            } else {
                return res.ok({}, sails.config.message.REFERRAL_SETTING_LIST_NOT_FOUND);
            }
        } catch (error) {
            console.log(error);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            // find record
            let record = await ReferralSetting.findOne({ id: params.id });

            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.REFERRAL_SETTING_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        try {
            // create todo
            let referralSetting = await ReferralSetting.findOne({ id: params.id });
            if (!referralSetting || referralSetting.isDeleted) {
                return res.notFound({}, sails.config.message.REFERRAL_SETTING_LIST_NOT_FOUND);
            }
            const loggedInUser = req.user;
            let data = {};
            data.isDeleted = true;
            data.deletedBy = loggedInUser.id;
            data.deletedAt = new Date();
            let updatedReferralSetting = await ReferralSetting
                .update({ id: params.id })
                .set(data)
                .fetch();

            if (updatedReferralSetting && updatedReferralSetting.length) {
                return res.ok(updatedReferralSetting[0], sails.config.message.REFERRAL_SETTING_DELETED);
            }

            return res.notFound({}, sails.config.message.REFERRAL_SETTING_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
}
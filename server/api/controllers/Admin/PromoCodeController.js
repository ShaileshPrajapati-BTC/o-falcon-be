const modelName = 'promocode';
const PromoCodeService = require(`${sails.config.appPath}/api/services/promoCode`);
const isFranchisee = sails.config.USER.TYPE.FRANCHISEE;
const isDealer = sails.config.USER.TYPE.DEALER;

module.exports = {

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            if (req.user.type === isFranchisee || req.user.type === isDealer) {
                params.filter.addedBy = req.user.id;
            } else {
                params.filter.addedBy = null;
            }
            let filter = await common.getFilter(params);
            // filter.sort = 'sequence asc';
            let recordsList = await PromoCode.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let redeemCountSummary = await PromoCodeService.getPromoCodesRedeemCountSummary();
            let redeemCountObj;
            if (redeemCountSummary && redeemCountSummary.length) {
                _.forEach(recordsList, (record) => {
                    redeemCountObj = _.find(redeemCountSummary, (promoCode) => {
                        return promoCode._id == record.id
                    });
                    record.redeemCount = redeemCountObj && redeemCountObj.redeemCount ?
                        redeemCountObj.redeemCount : 0;
                });
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await PromoCode.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async add(req, res) {
        try {
            let params = req.allParams();
            if (req.user.type === isFranchisee || req.user.type === isDealer) {
                params.addedBy = req.user.id;
            } else {
                params.addedBy = null;
            }
            const fields = [
                'name',
                'code',
                'description',
                'tnc',
                'startDateTime',
                'endDateTime',
                'maxUseLimitPerUser'
            ];
            // TO-DO: change conditions
            // const reqDiscountType = params.discountType;
            // if(reqDiscountType === sails.config.PROMO_CODE_DISCOUNT_TYPE.FLAT){
            //     fields.push('flatDiscountAmount');
            // }
            commonValidator.checkRequiredParams(fields, params);
            let option = {
                params: params,
                modelName: modelName
            };

            await commonValidator.validateCreateParams(option);
            let createdRecord = await PromoCode.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.PROMO_CODE_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();
            // TO-DO: change conditions
            // const reqDiscountType = params.discountType;
            // if(reqDiscountType === sails.config.PROMO_CODE_DISCOUNT_TYPE.FLAT){
            //     const fields = ['flatDiscountAmount'];
            //     commonValidator.checkRequiredParams(fields, params);
            // }
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateUpdateParams(option);
            let data = _.omit(params, 'id');
            let updatedRecord = await PromoCode
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length > 0) {
                return res.ok(updatedRecord[0], sails.config.message.PROMO_CODE_UPDATED);
            }

            return res.notFound({}, sails.config.message.PROMO_CODE_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // find record
            let record = await PromoCode.findOne({ id: params.id });
            // return record
            if (record && record.id) {
                let redeemCountSummary = await PromoCodeService.getPromoCodesRedeemCountSummary(record.id);
                record.redeemCount = redeemCountSummary[0] && redeemCountSummary[0].redeemCount ?
                    redeemCountSummary[0].redeemCount : 0;

                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.PROMO_CODE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
};

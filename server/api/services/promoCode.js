const UtilService = require(`./util`);
const CommonService = require('./common');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    async addPromoCodeAmount(fareSummary, promoCodeId) {
        try {
            let newFareSummary = fareSummary;
            let promoCodeRecord = await PromoCode.findOne({ id: promoCodeId });
            const {
                type, // firstRide or not
                discountType, // flat or percentage
                flatDiscountAmount,
                percentage,
                maximumDiscountLimit
            } = promoCodeRecord;
            const rideFareAmount = fareSummary.subTotal;
            let promoCodeAmount = 0;
            if (type === sails.config.PROMO_CODE_TYPE.FIRST_RIDE) {
                promoCodeAmount = rideFareAmount;
            } else {
                if (discountType === sails.config.PROMO_CODE_DISCOUNT_TYPE.FLAT) {
                    promoCodeAmount = flatDiscountAmount;
                } else if (percentage === 100) {
                    promoCodeAmount = rideFareAmount;
                } else {
                    promoCodeAmount = (percentage * rideFareAmount) / 100;
                    promoCodeAmount = UtilService.getFloat(promoCodeAmount);
                }
                if (promoCodeAmount > maximumDiscountLimit && maximumDiscountLimit > 0) {
                    promoCodeAmount = maximumDiscountLimit;
                }
            }
            if (promoCodeAmount > rideFareAmount) {
                promoCodeAmount = rideFareAmount;
            }
            let newAmount = fareSummary.total - promoCodeAmount;
            if (newAmount < 0) {
                newAmount = 0;
            }

            if (newAmount > 0 && newAmount < 0.5) {
                let chargeDiff = 0.5 - newAmount;
                promoCodeAmount -= chargeDiff;
                newAmount = 0.5;
            }

            newFareSummary.promoCodeAmount = promoCodeAmount;
            newFareSummary.subTotal = newAmount;
            newFareSummary.total = newFareSummary.subTotal;
            if (sails.config.ROUND_OFF_RIDE_AMOUNT) {
                newFareSummary.total = Math.round(newFareSummary.total);
            }

            let response = {
                fareSummary: newFareSummary,
                totalFare: newAmount,
                promoCodeAmount: newFareSummary.promoCodeAmount
            };

            return response;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getPromoCodesRedeemCountSummary(promoCodeId) {
        let where = {};
        if (promoCodeId) {
            where.promoCodeId = ObjectId(promoCodeId);
        } else {
            where.promoCodeId = { $ne: null };
        }
        let query = [{ $match: where }, {
            $group: {
                _id: '$promoCodeId',
                redeemCount: { $sum: 1 }
            }
        }];

        let promoCodesRedeemCountSummary = await CommonService.runAggregateQuery(query, 'RideBooking');

        return promoCodesRedeemCountSummary;
    },

    async checkWalletPromoCodeMaxUsed(userId, promoCodeRecord) {
        let countFilter = {
            transactionBy: userId,
            promoCodeId: promoCodeRecord.id
        };
        let promoCodeAppliedCount = await TransactionLog.count(countFilter);
        if (promoCodeAppliedCount >= promoCodeRecord.maxUseLimitPerUser) {
            throw sails.config.message.PROMO_CODE_LIMIT_REACHED;
        }
    },

    afterCreate: async function () {
    },
    afterUpdate: async function () {
    },
    afterDestroy: async function () {
    }
};

const CommonService = require('./common');
const ObjectId = require('mongodb').ObjectID;
const CommissionService = require('./commissionService');
const EmailService = require('./email');
const UtilService = require('./util');

module.exports = {
    async addPayoutRequest(payoutObj) {
        let commissionPayout = await CommissionPayout.create(payoutObj).fetch();

        return commissionPayout;
    },

    async getTotalRequestedCommission(franchiseeId) {
        let query = [
            {
                $match: {
                    franchiseeId: ObjectId(franchiseeId),
                    status: sails.config.COMMISSION_PAYOUT_TYPE.REQUESTED
                }
            },
            {
                $group: {
                    _id: null,
                    sum: {
                        $sum: '$amount'
                    }
                }
            },
            { $project: { _id: 0, sum: 1 } }
        ];
        let data = await CommonService.runAggregateQuery(query, 'commissionpayout');

        return data;
    },

    async getFranchiseeCommissionSummary(franchiseeId) {
        let unpaidAmount = await CommissionService.getUnpaidCommissionFromNativeQuery(franchiseeId, sails.config.COMMISSION_PAYMENT_STATUS.UNPAID, '$franchiseeCommission');
        let partialPaidAmount = await CommissionService.getUnpaidCommissionFromNativeQuery(franchiseeId, sails.config.COMMISSION_PAYMENT_STATUS.PARTIAL_PAID, '$commissionRemainedToPay');
        let requestedCommission = await this.getTotalRequestedCommission(franchiseeId);
        let totalUnpaidCommission = 0;
        if (unpaidAmount && unpaidAmount.length > 0) {
            totalUnpaidCommission = unpaidAmount[0].sum;
        }
        if (partialPaidAmount && partialPaidAmount.length > 0) {
            totalUnpaidCommission += partialPaidAmount[0].sum;
        }
        let requestedCommissionAmount = 0;
        if (requestedCommission && requestedCommission.length > 0) {
            requestedCommissionAmount = requestedCommission[0].sum;
        }
        let remainedAmountToRequest = totalUnpaidCommission - requestedCommissionAmount;
        let response = {
            remainedAmountToRequest: remainedAmountToRequest,
            totalUnpaidCommission: totalUnpaidCommission,
            totalRequestedCommission: requestedCommissionAmount
        };

        return response;
    },

    async sendStatusChangeMail(data, user) {
        let primaryEmail = UtilService.getPrimaryEmail(user.emails);

        let mail_obj = {
            subject: 'Commission Payout Request',
            to: primaryEmail,
            template: 'commissionRequestStatusChangeEmail',
            data: data,
            language: user.preferredLang
        };
        EmailService.send(mail_obj);
    },

    async updateRideCommissionTransferred(franchiseeId, amount) {
        let rideRecordCount = 50;
        while (amount > 0) {
            if (amount < 50) {
                rideRecordCount = Math.ceil(amount);
            }
            let rides = await RideBooking.find({
                where: {
                    franchiseeId: franchiseeId,
                    commissionPaymentStatus: [
                        sails.config.COMMISSION_PAYMENT_STATUS.UNPAID,
                        sails.config.COMMISSION_PAYMENT_STATUS.PARTIAL_PAID
                    ]
                },
                limit: rideRecordCount
            });
            if (!rides || !rides.length) {
                break;
            }
            let i = 0;
            let ids = [];
            for (i = 0; i < rides.length; i++) {
                if (rides[i].commissionPaymentStatus == sails.config.COMMISSION_PAYMENT_STATUS.UNPAID) {
                    if (rides[i].franchiseeCommission <= amount) {
                        ids.push(rides[i].id);
                        amount = amount - rides[i].franchiseeCommission;
                    } else {
                        break;
                    }
                } else {
                    if (rides[i].commissionRemainedToPay <= amount) {
                        ids.push(rides[i].id);
                        amount = amount - rides[i].commissionRemainedToPay;
                    } else {
                        break;
                    }
                }
            }
            if (ids.length > 0) {
                await RideBooking.update({ id: ids }).set({
                    commissionPaymentStatus: sails.config.COMMISSION_PAYMENT_STATUS.COMPLETED,
                    commissionRemainedToPay: 0
                });
            }
            if (i < rides.length && amount != 0) {
                let commissionRemainedToPay = 0;
                if (rides[i].commissionRemainedToPay > amount) {
                    commissionRemainedToPay = rides[i].commissionRemainedToPay - amount;
                } else {
                    commissionRemainedToPay = rides[i].franchiseeCommission - amount;
                }

                await RideBooking.update({ id: rides[i].id }).set({
                    commissionPaymentStatus: sails.config.COMMISSION_PAYMENT_STATUS.PARTIAL_PAID,
                    commissionRemainedToPay: commissionRemainedToPay
                });
                break;
            }

        }
    },

    async beforeCreate(commissionPayout, cb) {
        const SeriesGeneratorService = require('./seriesGenerator');
        let seriesParams = {};
        seriesParams = { type: sails.config.SERIES_GENERATOR.TYPE.COMMISSION_REQUEST_SERIES };
        let series = await SeriesGeneratorService.nextSeriesGenerate(seriesParams);
        commissionPayout.requestId = series.series;

        cb(null, commissionPayout);
    }
}
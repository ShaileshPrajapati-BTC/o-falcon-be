const CommonService = require(`${sails.config.appPath}/api/services/common`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const CommissionService = require(`${sails.config.appPath}/api/services/commissionService`);
const CommissionPayoutService = require(`${sails.config.appPath}/api/services/commissionPayout`);
const ObjectId = require('mongodb').ObjectID;

module.exports = {

    async paginate(req, res) {
        try {
            let params = req.allParams();
            let filter = await CommonService.getFilter(params);
            let recordsList = await CommissionPayout.find(filter)
                .populate('franchiseeId', { select: ['name', 'firstName', 'lastName'] })
                .meta({ enableExperimentalDeepTargets: true });
            let countFilter = await CommonService.removePagination(filter);
            let response = { list: recordsList };
            response.count = await CommissionPayout.count(countFilter).meta({ enableExperimentalDeepTargets: true });
            let query = [];
            let matchFilter = {};
            if (params.filter && params.filter.franchiseeId) {
                matchFilter.franchiseeId = ObjectId(params.filter.franchiseeId);
            }
            if (params.filter && params.filter.createdAt) {
                matchFilter.createdAt = {
                    $gte: params.filter.createdAt['>='],
                    $lte: params.filter.createdAt['<=']
                };
            }
            if (params.search) {
                matchFilter.requestId = { $regex: new RegExp(params.search.keyword, 'i') };
            }
            if (!_.isEmpty(matchFilter)) {
                query.push({
                    $match: matchFilter
                })
            }
            query.push({
                $group:
                {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            });
            query.push(
                {
                    $project: {
                        _id: 0,
                        status: '$_id',
                        count: 1
                    }
                }
            );

            let countInfo = await CommonService.runAggregateQuery(query, 'commissionpayout');
            response.statusWiseCount = countInfo;

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async changeStatus(req, res) {
        try {
            let params = req.allParams();
            const fields = ['ids', 'status', 'remark'];
            commonValidator.checkRequiredParams(fields, params);
            let requests = await CommissionPayout.find(params.ids);
            if (!requests.length) {
                throw sails.config.message.COMMISSION_PAYOUT_REQUESTS_NOT_FOUND;
            }
            const remark = 'Commission Payout request updated.';
            _.forEach(requests, async (commissionPayoutObj) => {
                const currentTime = UtilService.getTimeFromNow();
                const trackObj = {
                    status: params.status,
                    dateTime: currentTime,
                    userId: ObjectId(req.user.id),
                    remark: params.remark
                }
                trackObj.data = [
                    {
                        before: commissionPayoutObj.status,
                        key: 'status',
                        remark: remark,
                        after: params.status
                    },
                    {
                        before: commissionPayoutObj.remark,
                        key: 'remark',
                        remark: remark,
                        after: params.remark
                    }
                ];
                const updateObj = {
                    $set: {
                        status: params.status,
                        remark: params.remark
                    },
                    $push: {
                        statusTrack: {
                            $each: [trackObj]
                        }
                    }
                };
                if (params.status == sails.config.COMMISSION_PAYOUT_TYPE.TRANSFERRED) {
                    updateObj.$set.transferredDateTime = new Date() + '';
                } else if (params.status == sails.config.COMMISSION_PAYOUT_TYPE.REJECTED) {
                    updateObj.$set.rejectionDatetime = new Date() + '';
                }
                let criteria = { _id: ObjectId(commissionPayoutObj.id) };
                await CommonService.runNativeQuery(criteria, updateObj, 'commissionpayout');
            });


            let payoutRequests = await CommissionPayout.find({ id: params.ids });
            let franchiseeIds = [];
            if (params.status == sails.config.COMMISSION_PAYOUT_TYPE.TRANSFERRED) {
                for (let commissionPayout of payoutRequests) {

                    await CommissionPayoutService.updateRideCommissionTransferred(commissionPayout.franchiseeId, commissionPayout.amount);

                    franchiseeIds.push(commissionPayout.franchiseeId);
                }
            }
            let users = await User.find({ id: franchiseeIds });
            for (let user of users) {
                let payoutRequest = payoutRequests.find(request => request.franchiseeId == user.id);
                let emailData = {
                    requestId: payoutRequest.id,
                    amount: payoutRequest.amount,
                };
                if (params.status == sails.config.COMMISSION_PAYOUT_TYPE.TRANSFERRED) {
                    emailData.status = "transferred";
                } else if (params.status == sails.config.COMMISSION_PAYOUT_TYPE.REJECTED) {
                    emailData.status = "declined";
                }
                await CommissionPayoutService.sendStatusChangeMail(emailData, user);
            }

            if (params.status == sails.config.COMMISSION_PAYOUT_TYPE.TRANSFERRED) {
                return res.ok(null, sails.config.message.COMMISSION_TRANSFERRED_SUCCESS);
            } else {
                return res.ok(null, sails.config.message.PAYOUT_REQUEST_REJECT_SUCCESS);
            }
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async addCommissionPayout(req, res) {
        try {
            const fields = ['amount', 'franchiseeId'];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const currentTime = UtilService.getTimeFromNow();
            let unpaidAmount = await CommissionPayoutService.getFranchiseeCommissionSummary(params.franchiseeId);
            if (params.amount > unpaidAmount.remainedAmountToRequest) {
                throw sails.config.message.NOT_ENOUGH_MONEY_TO_WITHDRAW;
            }
            let remark = 'commission payout updated.';
            const payoutObj = {
                status: sails.config.COMMISSION_PAYOUT_TYPE.REQUESTED,
                franchiseeId: params.franchiseeId,
                dateTime: currentTime,
                amount: params.amount,
                statusTrack: [
                    {
                        data: [],
                        dateTime: currentTime,
                        userId: req.user.id,
                        remark: remark,
                        status: sails.config.COMMISSION_PAYOUT_TYPE.REQUESTED,
                        amount: params.amount
                    }
                ]
            };
            let payoutRequest = await CommissionPayout.create(payoutObj).fetch();
            if (payoutRequest) {
                let user = await User.findOne({ id: params.franchiseeId });
                let emailData = {
                    requestId: payoutRequest.requestId,
                    amount: payoutRequest.amount,
                    status: 'placed'
                }
                await CommissionPayoutService.sendStatusChangeMail(emailData, user);
            }

            return res.ok(null, sails.config.message.COMMISSION_PAYOUT_ADD_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getPendingCommission(req, res) {
        try {
            const fields = ['franchiseeId'];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            let response = await CommissionPayoutService.getFranchiseeCommissionSummary(params.franchiseeId);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async updateAmountOfPayoutRequest(req, res) {
        try {
            const fields = ['amount', 'id'];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            let unpaidAmount = await CommissionPayoutService.getFranchiseeCommissionSummary(params.franchiseeId);
            if (params.amount > unpaidAmount.remainedAmountToRequest) {
                throw sails.config.message.NOT_ENOUGH_MONEY_TO_WITHDRAW;
            }
            const prevCommissionPayout = await CommissionPayout.findOne({ id: params.id });
            const currentTime = UtilService.getTimeFromNow();
            const remark = 'Commission Payout request amount edited.'
            const trackObj = {
                status: prevCommissionPayout.status,
                amount: params.amount,
                dateTime: currentTime,
                userId: ObjectId(req.user.id),
                remark: remark
            }
            if (prevCommissionPayout && prevCommissionPayout.id) {
                trackObj.data = [
                    {
                        before: prevCommissionPayout.amount,
                        key: 'amount',
                        remark: remark,
                        after: params.amount
                    }
                ];
            }

            const updateObj = {
                $set: {
                    amount: params.amount
                },
                $push: {
                    statusTrack: {
                        $each: [trackObj]
                    }
                }
            };

            let criteria = { _id: ObjectId(params.id) };
            // let payoutRequest = await CommissionPayout.update({ id: params.id }).set({ amount: params.amount });
            await CommonService.runNativeQuery(criteria, updateObj, 'commissionpayout');

            return res.ok({}, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};
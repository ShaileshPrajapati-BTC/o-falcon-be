const CommonService = require(`${sails.config.appPath}/api/services/common`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const RentPaymentService = require(`${sails.config.appPath}/api/services/rentPayment`);
const ObjectId = require("mongodb").ObjectID;
const transferringStatus = sails.config.RENT_PAYMENT_STATUS.TRANSFERRED;
const cancellingStatus = sails.config.RENT_PAYMENT_STATUS.REJECTED;
const dealerType = sails.config.USER.TYPE.DEALER;
const franchiseeType = sails.config.USER.TYPE.FRANCHISEE;
const superAdminType = sails.config.USER.TYPE.SUPER_ADMIN;
const receivableType = sails.config.RENT_PAYMENT_TYPE.ACCOUNT_RECEIVABLE;
const payableType = sails.config.RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE;

module.exports = {
    async paginate(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            if (!params.filter) {
                params.filter = { or: [] };
            }
            let backupParams = JSON.parse(JSON.stringify(params));
            params = RentPaymentService.getUpdatedParamsForRentPayment(
                params,
                loggedInUser
            );
            let filter = await CommonService.getFilter(params);
            let recordsList = await RentPayment.find(filter)
                .populate("referenceId", {
                    select: ["name", "firstName", "lastName"],
                })
                .meta({ enableExperimentalDeepTargets: true });
            let countFilter = await CommonService.removePagination(filter);
            await Promise.all(
                _.map(recordsList, async (record) => {
                    let fareSummary = record.fareSummary;
                    await Promise.all(
                        _.map(fareSummary, async (summary) => {
                            summary.vehicleId = await Vehicle.findOne({
                                id: summary.vehicleId,
                            }).select(["name"]);
                        })
                    );
                    record.fareSummary = fareSummary;
                })
            );
            let response = { list: recordsList };
            response.count = await RentPayment.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });
            let countInfo = await RentPaymentService.getStatusWiseCount(
                backupParams,
                loggedInUser
            );
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
            const fields = ["ids", "status", "remark"];
            commonValidator.checkRequiredParams(fields, params);
            let requests = await RentPayment.find(params.ids);
            if (!requests.length) {
                throw sails.config.message.RENT_PAYMENT_REQUESTS_NOT_FOUND;
            }
            const remark = "Rent Payment request updated.";
            let isTransferringStatus = true;
            _.forEach(requests, async (rentPaymentObj) => {
                const currentTime = UtilService.getTimeFromNow();
                console.log("changeStatus -> currentTime", currentTime);
                const trackObj = {
                    status: params.status,
                    dateTime: currentTime,
                    userId: req.user.id,
                    remark: params.remark,
                };
                trackObj.data = [
                    {
                        before: rentPaymentObj.status,
                        key: "status",
                        remark: remark,
                        after: params.status,
                    },
                    {
                        before: rentPaymentObj.remark,
                        key: "remark",
                        remark: remark,
                        after: params.remark,
                    },
                ];
                const updateObj = {
                    $set: {
                        status: params.status,
                        remark: params.remark,
                    },
                    $push: {
                        statusTrack: {
                            $each: [trackObj],
                        },
                    },
                };
                if (params.status == transferringStatus) {
                    updateObj.$set.transferredDateTime = currentTime;
                } else if (params.status == cancellingStatus) {
                    updateObj.$set.rejectionDatetime = currentTime;
                }
                let criteria = { _id: ObjectId(rentPaymentObj.id) };
                await CommonService.runNativeQuery(
                    criteria,
                    updateObj,
                    "rentpayment"
                );
                await RentPaymentService.handleWalletForRentPayment(
                    rentPaymentObj,
                    params.status
                );
                // isTransferringStatus = params.status === transferringStatus;
                // await RentPaymentService.sendStatusChangeMail(rentPaymentObj, isTransferringStatus);
            });
            if (params.status == transferringStatus) {
                return res.ok(
                    null,
                    sails.config.message.RENT_PAYMENT_TRANSFERRED_SUCCESS
                );
            } else {
                return res.ok(
                    null,
                    sails.config.message.RENT_PAYMENT_REJECT_SUCCESS
                );
            }
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async rentPaymentSummary(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            if (!params.filter) {
                params.filter = {};
            }
            params = RentPaymentService.getUpdatedParamsForRentPayment(
                params,
                loggedInUser
            );
            let filter = await CommonService.getFilter(params);
            let countFilter = await CommonService.removePagination(filter);
            let response = await RentPaymentService.rentPaymentSummary(
                countFilter,
                loggedInUser
            );

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async rentPaymentSummaryById(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            if (!params.filter) {
                params.filter = {
                    status: sails.config.RENT_PAYMENT_STATUS.REQUESTED
                };
            }
            let user = await User.findOne({ id: params.id });
            if (!user) {
                return res.notFound(
                    {},
                    sails.config.message.USER_LIST_NOT_FOUND
                );
            }
            params = RentPaymentService.getUpdatedParamsForRentPayment(
                params,
                user,
                true
            );
            delete params.id;
            let filter = await CommonService.getFilter(params);
            let countFilter = await CommonService.removePagination(filter);
            let response = await RentPaymentService.rentPaymentSummary(
                countFilter,
                user
            );

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async makeDummyData(req, res) {
        try {
            await RentPaymentService.requestRentPaymentForDealer();
            await RentPaymentService.requestRentPaymentForFranchisee();

            return res.ok({}, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
};

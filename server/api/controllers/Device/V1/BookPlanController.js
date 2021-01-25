const UtilService = require(`${sails.config.appPath}/api/services/util`);
const BookPlanService = require(`${sails.config.appPath}/api/services/bookPlan`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const UserService = require(`${sails.config.appPath}/api/services/user`);
const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);

module.exports = {
    async list(req, res) {
        try {
            const loggedInUser = req.user;
            let params = req.allParams();
            if (!params.planListType) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            const planListType = params.planListType;
            delete params.planListType;
            if (!params) {
                params = {};
            }
            let filter = await common.getFilter(params);

            if (filter) {
                filter.where.isActive = true;
                filter.where.endDateTimeToBuy = {
                    ">=": UtilService.getTimeFromNow(),
                };
                filter.where.isDeleted = false;
                if (loggedInUser.isBookingTrialPlanUsed) {
                    filter.where.isTrialPlan = false;
                }
            }
            if (planListType === sails.config.PLAN_LIST_TYPES.UPGRADABLE) {
                let currentBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                    loggedInUser.currentBookingPlanInvoiceId
                );
                if (!currentBookPlanInvoice) {
                    throw sails.config.message.NO_ACTIVE_CURRENT_PLAN;
                }
                if (filter) {
                    filter.where.planType =
                        currentBookPlanInvoice.planData.planType;
                    filter.where.isTrialPlan = false;
                }
            }

            let recordsList = await BookPlan.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = {
                list: recordsList,
            };
            let countFilter = await common.removePagination(filter);
            response.count = await BookPlan.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let record = await BookPlan.findOne({ id: params.id });
            if (!record || !record.id || record.isDeleted) {
                return res.ok({}, sails.config.message.BOOK_PLAN_NOT_FOUND);
            }

            return res.ok(record, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    buyPlan: async (req, res) => {
        try {
            const fields = ["planId"];
            let params = req.allParams();
            if (!params.planBuyType) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            const planBuyType = params.planBuyType;
            delete params.planBuyType;
            commonValidator.checkRequiredParams(fields, params);
            const loggedInUser = req.user;
            const userId = loggedInUser.id;
            const plan = await BookPlan.findOne({
                id: params.planId,
            });
            if (!plan || !plan.id || plan.isDeleted) {
                throw sails.config.message.BOOK_PLAN_NOT_FOUND;
            }
            const buyingCurrentPlan =
                planBuyType === sails.config.PLAN_BUY_TYPES.DEFAULT;
            const buyingNextPlan =
                planBuyType === sails.config.PLAN_BUY_TYPES.NEXT;
            const upgradingPlan =
                planBuyType === sails.config.PLAN_BUY_TYPES.UPGRADE;
            const activeRide = await RideBookingService.getActiveRide(userId);
            if (activeRide && (buyingCurrentPlan || upgradingPlan)) {
                throw sails.config.message.CANT_BUY_PLAN;
            }
            let latestUserObj;
            if (upgradingPlan && loggedInUser.nextBookingPlanInvoiceId) {
                await BookPlanService.makeNextPlanAsCurrent(loggedInUser, true);
                latestUserObj = await UserService.getLatestUserObj(
                    loggedInUser.id
                );

                return res.ok(
                    { loggedInUser: latestUserObj },
                    sails.config.message.NEXT_PLAN_TAKEN_AS_CURRENT
                );
            }
            BookPlanService.preConditionToBuyPlan(loggedInUser, plan);
            let lastBookPlanInvoice;
            if (buyingCurrentPlan) {
                lastBookPlanInvoice = await BookPlanService.checkCanBuyCurrentPlan(
                    loggedInUser,
                    plan
                );
            } else if (buyingNextPlan) {
                await BookPlanService.checkCanBuyNextPlan(loggedInUser, plan);
            } else if (upgradingPlan) {
                await BookPlanService.checkCanUpgradePlan(
                    loggedInUser.currentBookingPlanInvoiceId,
                    plan
                );
                lastBookPlanInvoice = await BookPlanService.refundIfNeeded(
                    loggedInUser,
                    plan
                );
            }

            let planTotalTimeLimit = BookPlanService.countTimeLimitInSeconds(
                plan.limitValue,
                plan.limitType
            );
            const addExtraTimeInNextPlan = upgradingPlan || buyingCurrentPlan;
            if (
                addExtraTimeInNextPlan &&
                lastBookPlanInvoice &&
                lastBookPlanInvoice.remainingTimeLimit > 0 &&
                !lastBookPlanInvoice.isTrialPlan
            ) {
                console.log("before planTotalTimeLimit", planTotalTimeLimit);
                planTotalTimeLimit += lastBookPlanInvoice.remainingTimeLimit;
                console.log("after planTotalTimeLimit", planTotalTimeLimit);
            }
            const expirationStartDateTime = UtilService.getTimeFromNow();
            const expirationEndDateTime = BookPlanService.addTime(
                plan.planType,
                plan.planValue
            );
            const createParams = {
                userId: userId,
                planId: plan.id,
                totalTimeLimit: planTotalTimeLimit,
                remainingTimeLimit: planTotalTimeLimit,
                planData: plan,
                planPrice: plan.price,
                planName: plan.name,
                isTrialPlan: plan.isTrialPlan,
                isRenewable: plan.isRenewable,
            };
            if (!buyingNextPlan) {
                createParams.expirationStartDateTime = expirationStartDateTime;
                createParams.expirationEndDateTime = expirationEndDateTime;
            }
            if (plan.planType === sails.config.BOOK_PLAN_TYPES.HOURLY) {
                createParams.isCancellable = false;
            }
            console.log("createParams", createParams);

            let planInvoice = await PlanInvoice.create(createParams).fetch();

            if (!planInvoice || !planInvoice.id) {
                throw sails.config.message.BUY_PLAN_FAILED;
            }

            if (buyingCurrentPlan && planInvoice.isTrialPlan) {
                console.log(
                    "buyingCurrentPlan && planInvoice.isTrialPlan **** true"
                );
                await BookPlanService.execTrialPlanUsedByUser(userId);
                await User.update(
                    { id: userId },
                    {
                        currentBookingPlanInvoiceId: planInvoice.id,
                    }
                );
                latestUserObj = await UserService.getLatestUserObj(
                    loggedInUser.id
                );

                return res.ok(
                    { loggedInUser: latestUserObj },
                    sails.config.message.BUY_PLAN_REQUEST_CHARGE_SUCCESS
                );
            }
            console.log("148, before chargeCustomerForPlanUsingWallet");
            let chargeObj = await PaymentService.chargeCustomerForPlanUsingWallet(
                planInvoice.id,
                plan.price,
                userId
            );

            if (chargeObj.flag) {
                let updateObj = {};
                if (buyingCurrentPlan) {
                    if (lastBookPlanInvoice) {
                        // making time-limit of lastPlan ZERO, as we already credit it's time-limit in new plan
                        await BookPlanService.emptyTimeLimitInInvoice(
                            lastBookPlanInvoice.id
                        );
                    }
                    updateObj.currentBookingPlanInvoiceId = planInvoice.id;
                } else if (buyingNextPlan) {
                    updateObj.nextBookingPlanInvoiceId = planInvoice.id;
                } else if (upgradingPlan) {
                    // making time-limit of lastPlan ZERO, as we already credit it's time-limit in new plan
                    await BookPlanService.emptyTimeLimitInInvoice(
                        lastBookPlanInvoice.id
                    );
                    updateObj.currentBookingPlanInvoiceId = planInvoice.id;
                }
                console.log("updateObj", updateObj);
                await User.update({ id: userId }, updateObj);
                latestUserObj = await UserService.getLatestUserObj(
                    loggedInUser.id
                );

                return res.ok(
                    {
                        paymentData: chargeObj.data,
                        loggedInUser: latestUserObj,
                    },
                    sails.config.message.BUY_PLAN_REQUEST_CHARGE_SUCCESS
                );
            }
            let errMsgObj = JSON.parse(
                JSON.stringify(
                    sails.config.message.BUY_PLAN_REQUEST_CHARGE_FAILED
                )
            );
            if (
                chargeObj &&
                chargeObj.data &&
                chargeObj.data.raw &&
                chargeObj.data.raw.message
            ) {
                errMsgObj.message += ` due to ${chargeObj.data.raw.message}`;
            } else if (chargeObj && chargeObj.data && chargeObj.data.message) {
                errMsgObj.message += ` due to ${chargeObj.data.message}`;
            }
            console.log("PaymentFailed", chargeObj);
            latestUserObj = await UserService.getLatestUserObj(loggedInUser.id);

            return res.ok(
                { paymentData: chargeObj.data, loggedInUser: latestUserObj },
                errMsgObj
            );
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    cancelPlan: async (req, res) => {
        try {
            let params = req.allParams();
            if (!params.planCancelType) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            const planCancelType = params.planCancelType;
            delete params.planCancelType;
            const loggedInUser = req.user;
            const userId = loggedInUser.id;
            let planInvoice;
            let latestUserObj;
            const cancellingCurrentPlan =
                planCancelType === sails.config.PLAN_CANCEL_TYPES.DEFAULT;
            const cancellingNextPlan =
                planCancelType === sails.config.PLAN_CANCEL_TYPES.NEXT;
            const activeRide = await RideBookingService.getActiveRide(userId);
            if (activeRide && cancellingCurrentPlan) {
                throw sails.config.message.CANT_CANCEL_BOOK_PLAN;
            }
            if (cancellingCurrentPlan) {
                planInvoice = await BookPlanService.getUserPlanInvoice(
                    loggedInUser.currentBookingPlanInvoiceId
                );
                if (!planInvoice) {
                    throw sails.config.message.NO_ACTIVE_CURRENT_PLAN;
                }
            } else if (cancellingNextPlan) {
                planInvoice = await BookPlanService.getUserPlanInvoice(
                    loggedInUser.nextBookingPlanInvoiceId
                );
                if (!planInvoice) {
                    throw sails.config.message.NO_ACTIVE_NEXT_PLAN;
                }
            }
            await BookPlanService.checkCanCancelPlan(
                planInvoice,
                cancellingNextPlan
            );
            const plan = await BookPlan.findOne({
                id: planInvoice.planId,
            });
            if (!plan || !plan.id || plan.isDeleted) {
                throw sails.config.message.BOOK_PLAN_NOT_FOUND;
            }

            if (planInvoice.planId !== plan.id) {
                throw sails.config.message.CANT_CANCEL_NOT_PURCHASED_PLAN;
            }
            if (
                cancellingCurrentPlan &&
                planInvoice.totalTimeLimit !== planInvoice.remainingTimeLimit
            ) {
                throw sails.config.message.CANT_CANCEL_USED_BOOK_PLAN;
            }
            if (planInvoice.isTrialPlan) {
                if (cancellingCurrentPlan) {
                    // don't make transactionLog, just change isCancelled to true
                    await BookPlanService.cancelCurrentPlan(
                        planInvoice.id,
                        userId
                    );
                    await BookPlanService.makeNextPlanAsCurrent(loggedInUser);
                } else if (cancellingNextPlan) {
                    await BookPlanService.cancelNextPlan(
                        planInvoice.id,
                        userId
                    );
                }
                latestUserObj = await UserService.getLatestUserObj(
                    userId
                );

                return res.ok(
                    { loggedInUser: latestUserObj },
                    sails.config.message.PLAN_CANCEL_SUCCESS
                );
            }

            let chargeObj = await PaymentService.refundCustomerForPlan(
                planInvoice.id,
                plan.price,
                userId
            );

            if (chargeObj.flag) {
                if (cancellingCurrentPlan) {
                    await BookPlanService.cancelCurrentPlan(
                        planInvoice.id,
                        userId
                    );
                    await BookPlanService.makeNextPlanAsCurrent(loggedInUser);
                } else if (cancellingNextPlan) {
                    await BookPlanService.cancelNextPlan(
                        planInvoice.id,
                        userId
                    );
                }
                latestUserObj = await UserService.getLatestUserObj(
                    userId
                );

                return res.ok(
                    {
                        paymentData: chargeObj.data,
                        loggedInUser: latestUserObj,
                    },
                    sails.config.message.PLAN_CANCEL_REFUND_SUCCESS
                );
            }
            let errMsgObj = JSON.parse(
                JSON.stringify(sails.config.message.PLAN_CANCEL_REFUND_FAILED)
            );
            if (
                chargeObj &&
                chargeObj.data &&
                chargeObj.data.raw &&
                chargeObj.data.raw.message
            ) {
                errMsgObj.message += ` due to ${chargeObj.data.raw.message}`;
            } else if (chargeObj && chargeObj.data && chargeObj.data.message) {
                errMsgObj.message += ` due to ${chargeObj.data.message}`;
            }
            console.log("PaymentFailed", chargeObj);
            latestUserObj = await UserService.getLatestUserObj(userId);

            return res.ok(
                {
                    paymentData: chargeObj.data,
                    loggedInUser: latestUserObj,
                },
                errMsgObj
            );
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    async userActivePlans(req, res) {
        try {
            const loggedInUser = req.user;
            let currentBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                loggedInUser.currentBookingPlanInvoiceId
            );
            let nextBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                loggedInUser.nextBookingPlanInvoiceId
            );

            let response = {};
            response.currentPlan = currentBookPlanInvoice;
            response.nextPlan = nextBookPlanInvoice;

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    renewPlan: async (req, res) => {
        try {
            const loggedInUser = req.user;
            const userId = loggedInUser.id;
            let lastBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                loggedInUser.currentBookingPlanInvoiceId
            );
            if (!lastBookPlanInvoice) {
                throw sails.config.message.NO_ACTIVE_CURRENT_PLAN;
            }
            let latestUserObj;
            if (loggedInUser.nextBookingPlanInvoiceId) {
                await BookPlanService.makeNextPlanAsCurrent(loggedInUser, true);
                latestUserObj = await UserService.getLatestUserObj(
                    loggedInUser.id
                );

                return res.ok(
                    { loggedInUser: latestUserObj },
                    sails.config.message.NEXT_PLAN_TAKEN_AS_CURRENT
                );
            }
            const plan = await BookPlan.findOne({
                id: lastBookPlanInvoice.planId,
            });
            if (!plan || !plan.id || plan.isDeleted) {
                throw sails.config.message.BOOK_PLAN_NOT_FOUND;
            }

            console.log("walletAmount", loggedInUser.walletAmount);
            console.log("price ", plan.price);
            if (
                !("walletAmount" in loggedInUser) ||
                (!plan.isTrialPlan && plan.price > loggedInUser.walletAmount)
            ) {
                throw sails.config.message.NOT_ENOUGH_AMOUNT_IN_WALLET;
            }
            if (plan.isTrialPlan) {
                throw sails.config.message.CANT_RENEW_TRIAL_PLAN;
            }
            if (!plan.isActive) {
                throw sails.config.message.PLAN_NOT_ACTIVE;
            }
            if (!plan.isRenewable) {
                throw sails.config.message.PLAN_NOT_RENEWABLE;
            }
            BookPlanService.checkDateToBuyPlanExpired(plan);

            let planTotalTimeLimit = BookPlanService.countTimeLimitInSeconds(
                plan.limitValue,
                plan.limitType
            );
            if (lastBookPlanInvoice.remainingTimeLimit > 0) {
                console.log("before planTotalTimeLimit", planTotalTimeLimit);
                planTotalTimeLimit += lastBookPlanInvoice.remainingTimeLimit;
                console.log("after planTotalTimeLimit", planTotalTimeLimit);
                await BookPlanService.emptyTimeLimitInInvoice(
                    lastBookPlanInvoice.id
                );
            }

            const expirationStartDateTime = UtilService.getTimeFromNow();
            const expirationEndDateTime = BookPlanService.addTime(
                plan.planType,
                plan.planValue
            );
            let createParams = {
                userId: userId,
                planId: plan.id,
                totalTimeLimit: planTotalTimeLimit,
                remainingTimeLimit: planTotalTimeLimit,
                planData: plan,
                planPrice: plan.price,
                planName: plan.name,
                isTrialPlan: plan.isTrialPlan,
                isRenewable: plan.isRenewable,
                expirationStartDateTime: expirationStartDateTime,
                expirationEndDateTime: expirationEndDateTime,
            };
            if (plan.planType === sails.config.BOOK_PLAN_TYPES.HOURLY) {
                createParams.isCancellable = false;
            }
            let planInvoice = await PlanInvoice.create(createParams).fetch();

            if (!planInvoice || !planInvoice.id) {
                throw sails.config.message.BUY_PLAN_FAILED;
            }
            let chargeObj = await PaymentService.chargeCustomerForPlanUsingWallet(
                planInvoice.id,
                plan.price,
                userId
            );

            if (chargeObj.flag) {
                await User.update(
                    { id: userId },
                    {
                        currentBookingPlanInvoiceId: planInvoice.id,
                    }
                );
                console.log(
                    "119 currentBookingPlanInvoice updated to: ",
                    planInvoice
                );
                latestUserObj = await UserService.getLatestUserObj(
                    loggedInUser.id
                );

                return res.ok(
                    {
                        paymentData: chargeObj.data,
                        loggedInUser: latestUserObj,
                    },
                    sails.config.message.RENEW_PLAN_REQUEST_CHARGE_SUCCESS
                );
            }
            let errMsgObj = JSON.parse(
                JSON.stringify(
                    sails.config.message.RENEW_PLAN_REQUEST_CHARGE_FAILED
                )
            );
            if (
                chargeObj &&
                chargeObj.data &&
                chargeObj.data.raw &&
                chargeObj.data.raw.message
            ) {
                errMsgObj.message += ` due to ${chargeObj.data.raw.message}`;
            } else if (chargeObj && chargeObj.data && chargeObj.data.message) {
                errMsgObj.message += ` due to ${chargeObj.data.message}`;
            }
            console.log("PaymentFailed", chargeObj);
            latestUserObj = await UserService.getLatestUserObj(loggedInUser.id);

            return res.ok(
                { paymentData: chargeObj.data, loggedInUser: latestUserObj },
                errMsgObj
            );
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    async planInvoiceList(req, res) {
        try {
            let params = req.allParams();
            if (!params) {
                params = {};
            }
            const loggedInUser = req.user;
            let filter = await common.getDateFilterForDevice(params);
            filter.where.userId = loggedInUser.id;
            let recordsList = await PlanInvoice.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await PlanInvoice.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
};

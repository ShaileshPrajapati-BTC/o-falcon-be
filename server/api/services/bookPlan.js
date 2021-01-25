const UtilService = require(`./util`);
// const CommonService = require('./common');
// const ObjectId = require('mongodb').ObjectID;
const PaymentService = require("./payment");
const NotificationService = require("./notification");

module.exports = {
    countTimeLimitInSeconds(limitValue, limitType) {
        switch (limitType) {
            case sails.config.BOOK_PLAN_LIMIT_TYPES.MINUTE:
                limitValue = limitValue * 60;
                break;
            case sails.config.BOOK_PLAN_LIMIT_TYPES.HOUR:
                limitValue = limitValue * 60 * 60;
                break;
        }

        return limitValue;
    },
    async getUserPlanInvoice(planInvoiceId) {
        if (!planInvoiceId) {
            return null;
        }
        // let planInvoice = await PlanInvoice.find({
        //     userId: userId,
        //     isCancelled: false,
        //     remainingTimeLimit: { "!=": 0 }
        // })
        //     .sort("createdAt desc")
        //     .limit(1);
        // planInvoice = planInvoice[0];
        const planInvoice = await PlanInvoice.findOne({
            id: planInvoiceId,
        });

        return planInvoice;
    },
    async deductTimeLimit(userId, timeToDecrease) {
        const user = await User.findOne({ id: userId });
        let currentBookPlanInvoice = await this.getUserPlanInvoice(
            user.currentBookingPlanInvoiceId
        );
        if (!currentBookPlanInvoice) {
            console.log("43 ------------------ currentBookPlanInvoice null");
            return;
        }
        let remainingTimeLimit =
            currentBookPlanInvoice.remainingTimeLimit - timeToDecrease;
        if (remainingTimeLimit < 0) {
            console.log("remainingTimeLimit < 0");
            remainingTimeLimit = 0;
        }
        await PlanInvoice.update(
            { id: currentBookPlanInvoice.id },
            {
                remainingTimeLimit: remainingTimeLimit,
            }
        );
        console.log(
            currentBookPlanInvoice.id,
            " time decreased ",
            timeToDecrease
        );
        // planInvoice = planInvoice[0];

        // if (planInvoice.remainingTimeLimit === 0) {
        //     await User.update(
        //         { id: userId },
        //         {
        //             currentBookingPlanInvoiceId: null
        //         }
        //     );
        // }
    },
    async cancelCurrentPlan(planInvoiceId, userId) {
        await PlanInvoice.update(
            { id: planInvoiceId },
            {
                remainingTimeLimit: 0,
                isCancelled: true,
            }
        );
        await User.update(
            { id: userId },
            {
                currentBookingPlanInvoiceId: null,
            }
        );
    },
    async cancelNextPlan(planInvoiceId, userId) {
        await PlanInvoice.update(
            { id: planInvoiceId },
            {
                remainingTimeLimit: 0,
                isCancelled: true,
            }
        );
        await User.update(
            { id: userId },
            {
                nextBookingPlanInvoiceId: null,
            }
        );
    },
    async emptyTimeLimitInInvoice(planInvoiceId) {
        if (!planInvoiceId) {
            return null;
        }
        let updatedInvoice = await PlanInvoice.update(
            { id: planInvoiceId },
            {
                remainingTimeLimit: 0,
            }
        ).fetch();
        updatedInvoice = updatedInvoice[0];

        return updatedInvoice;
    },
    async checkCanUpgradePlan(planInvoiceId, plan) {
        if (plan.isTrialPlan) {
            throw sails.config.message.CANT_UPGRADE_TO_TRIAL_PLAN;
        }
        if (!planInvoiceId) {
            throw sails.config.message.NO_CURRENT_BOOK_PLAN_FOR_UPGRADE;
        }
        let currentBookPlanInvoice = await this.getUserPlanInvoice(
            planInvoiceId
        );
        console.log(
            "checkCanUpgradePlan -> currentBookPlanInvoice",
            currentBookPlanInvoice
        );
        const planTotalTimeLimit = this.countTimeLimitInSeconds(
            plan.limitValue,
            plan.limitType
        );
        if (currentBookPlanInvoice.remainingTimeLimit >= planTotalTimeLimit) {
            throw sails.config.message.CANT_UPGRADE_PLAN;
            // have more time limit than purchasing plan
        }
        if (
            !currentBookPlanInvoice.isTrialPlan &&
            currentBookPlanInvoice.planData.planType !== plan.planType
        ) {
            throw sails.config.message.CANT_UPGRADE_TO_DIFFERENT_PLAN_LIMIT;
        }
    },
    checkDateToBuyPlanExpired(plan) {
        const timeNow = UtilService.getTimeFromNow();
        const timeDiff = UtilService.getTimeDifference(
            plan.endDateTimeToBuy,
            timeNow
        );
        console.log("timeDiff ", timeDiff);
        if (timeDiff > 0) {
            // todo: get specific message for this
            throw sails.config.message.CANT_BUY_PLAN;
            // plan's timeline to buy is gone.
        }
    },
    async execTrialPlanUsedByUser(userId) {
        await User.update(
            { id: userId },
            {
                isBookingTrialPlanUsed: true,
            }
        );
    },
    async checkCanDeletePlan(planId) {
        let usersWithCurrentBookingPlan = await User.find({
            currentBookingPlanInvoiceId: { "!=": null },
        })
            .populate("currentBookingPlanInvoiceId")
            .select(["currentBookingPlanInvoiceId"]);

        const result = _.find(
            usersWithCurrentBookingPlan,
            (plan) => plan.currentBookingPlanInvoiceId.planId === planId
        );

        console.log("checkCanDeletePlan --- ", result);
        if (result) {
            throw sails.config.message.CANT_DELETE_RUNNING_PLAN;
        }
    },
    async checkCanBuyCurrentPlan(loggedInUser, plan) {
        const canBuyMultipleTrialPlans = false; // for future, if requirement changes!
        if (
            !canBuyMultipleTrialPlans &&
            plan.isTrialPlan &&
            loggedInUser.isBookingTrialPlanUsed
        ) {
            throw sails.config.message.ALREADY_USED_ONE_TRIAL_PLAN;
        }

        let lastBookPlanInvoice = await this.getUserPlanInvoice(
            loggedInUser.currentBookingPlanInvoiceId
        );
        // const minTimeLimitToCheck =
        //     sails.config.BOOK_PLAN_MIN_TIME_LIMIT_TO_CHECK;
        // if (
        //     lastBookPlanInvoice &&
        //     !lastBookPlanInvoice.isTrialPlan &&
        //     lastBookPlanInvoice.remainingTimeLimit > minTimeLimitToCheck
        // ) {
        //     throw sails.config.message.ALREADY_SUBSCRIBED_TO_ONE_PLAN;
        // }

        if (lastBookPlanInvoice && lastBookPlanInvoice.isTrialPlan) {
            await this.emptyTimeLimitInInvoice(lastBookPlanInvoice.id);
        }

        return lastBookPlanInvoice;
    },
    async checkCanBuyNextPlan(loggedInUser, plan) {
        if (plan.isTrialPlan) {
            throw sails.config.message.CANT_BUY_TRIAL_PLAN_FOR_NEXT_PLAN;
        }
        let currentBookPlanInvoice = await this.getUserPlanInvoice(
            loggedInUser.currentBookingPlanInvoiceId
        );
        if (
            !loggedInUser.currentBookingPlanInvoiceId ||
            currentBookPlanInvoice.remainingTimeLimit === 0
        ) {
            throw sails.config.message.NO_CURRENT_BOOK_PLAN_FOR_NEXT_PLAN;
        }
        if (loggedInUser.nextBookingPlanInvoiceId) {
            throw sails.config.message.ALREADY_PURCHASED_NEXT_PLAN;
        }
    },
    preConditionToBuyPlan(loggedInUser, plan) {
        if (
            !("walletAmount" in loggedInUser) ||
            (!plan.isTrialPlan && plan.price > loggedInUser.walletAmount)
        ) {
            throw sails.config.message.NOT_ENOUGH_AMOUNT_IN_WALLET;
        }
        if (!plan.isActive) {
            throw sails.config.message.PLAN_NOT_ACTIVE;
        }
        this.checkDateToBuyPlanExpired(plan);
    },
    addTime(planType, planValue) {
        const timeNow = UtilService.getTimeFromNow();
        let endDateTime;
        switch (planType) {
            case sails.config.BOOK_PLAN_TYPES.HOURLY:
                endDateTime = UtilService.addTime(planValue, timeNow, "hours");
                break;
            case sails.config.BOOK_PLAN_TYPES.DAILY:
                endDateTime = UtilService.addTime(planValue, timeNow, "days");
                break;
            case sails.config.BOOK_PLAN_TYPES.WEEKLY:
                endDateTime = UtilService.addTime(planValue, timeNow, "weeks");
                break;
            case sails.config.BOOK_PLAN_TYPES.MONTHLY:
                endDateTime = UtilService.addTime(planValue, timeNow, "months");
                break;
        }

        return endDateTime;
    },
    async refundIfNeeded(loggedInUser, plan) {
        let lastBookPlanInvoice = await this.getUserPlanInvoice(
            loggedInUser.currentBookingPlanInvoiceId
        );

        if (
            lastBookPlanInvoice.remainingTimeLimit ===
            lastBookPlanInvoice.totalTimeLimit
        ) {
            // refund here then let him buy plan
            let refundChargeObj = await PaymentService.refundCustomerForPlan(
                lastBookPlanInvoice.id,
                plan.price,
                loggedInUser.id
            );

            if (!refundChargeObj.flag) {
                throw sails.config.message.PLAN_UPGRADE_REFUND_FAILED;
            }
            lastBookPlanInvoice = await this.emptyTimeLimitInInvoice(
                lastBookPlanInvoice.id
            );
            console.log("lastBookPlanInvoice ", lastBookPlanInvoice);
        }

        return lastBookPlanInvoice;
    },
    async makeNextPlanAsCurrent(user, addPrevPlanTimeLimit = false) {
        let nextPlanInvoiceId = user.nextBookingPlanInvoiceId;
        if (!nextPlanInvoiceId) {
            return;
        }
        const lastBookPlanInvoice = await this.getUserPlanInvoice(
            user.currentBookingPlanInvoiceId
        );
        console.log(
            "makeNextPlanAsCurrent -> lastBookPlanInvoice",
            lastBookPlanInvoice
        );
        console.log("addPrevPlanTimeLimit", addPrevPlanTimeLimit);
        const nextPlanInvoice = await this.getUserPlanInvoice(
            nextPlanInvoiceId
        );
        let updatedTotalTime = nextPlanInvoice.totalTimeLimit;
        let updatedRemTime = nextPlanInvoice.remainingTimeLimit;
        const expirationStartDateTime = UtilService.getTimeFromNow();
        const expirationEndDateTime = this.addTime(
            nextPlanInvoice.planData.planType,
            nextPlanInvoice.planData.planValue
        );
        if (
            addPrevPlanTimeLimit &&
            lastBookPlanInvoice &&
            lastBookPlanInvoice.remainingTimeLimit > 0
        ) {
            updatedTotalTime += lastBookPlanInvoice.remainingTimeLimit;
            updatedRemTime += lastBookPlanInvoice.remainingTimeLimit;
            console.log("298 ------------------");
        }
        let updateObj = {
            totalTimeLimit: updatedTotalTime,
            remainingTimeLimit: updatedRemTime,
            expirationStartDateTime: expirationStartDateTime,
            expirationEndDateTime: expirationEndDateTime,
            isCancellable: true,
        };
        if (
            nextPlanInvoice.planData.planType ===
            sails.config.BOOK_PLAN_TYPES.HOURLY
        ) {
            updateObj.isCancellable = false;
        }
        let updatedPlanInvoice = await PlanInvoice.update(
            { id: nextPlanInvoiceId },
            updateObj
        ).fetch();
        console.log(updatedPlanInvoice);
        console.log("306 ------------------");
        let updatedUser = await User.update(
            { id: user.id },
            {
                currentBookingPlanInvoiceId: nextPlanInvoiceId,
                nextBookingPlanInvoiceId: null,
            }
        ).fetch();

        if (updatedUser.length > 0) {
            console.log(
                updatedUser[0].currentBookingPlanInvoiceId,
                " -- ",
                updatedUser[0].nextBookingPlanInvoiceId
            );
        }
    },
    async checkCanCancelPlan(planInvoice, cancellingNextPlan = false) {
        const timeNow = UtilService.getTimeFromNow();
        const timeDiff = UtilService.getTimeDifference(
            planInvoice.expirationStartDateTime,
            timeNow,
            "hours"
        );
        console.log("timeDiff ", timeDiff);
        // 24 hrs
        if (timeDiff > 24) {
            throw sails.config.message.CANT_CANCEL_BOOK_PLAN;
        }
        if (cancellingNextPlan) {
            return;
        }
        if (!planInvoice.isCancellable) {
            throw sails.config.message.CANT_CANCEL_BOOK_PLAN;
        }
    },
    async removeCurrentBookPlan(planInvoices) {
        if (planInvoices.length === 0) {
            return;
        }
        for (let planInvoice of planInvoices) {
            let user = await User.findOne({
                id: planInvoice.userId,
                currentBookingPlanInvoiceId: planInvoice.id,
            });
            // todo: may need to empty RTL here
            if (!user) {
                console.log("planInvoice.id -> ", planInvoice.id);
                console.log("removeCurrentBookPlan - !user");
                continue;
            }
            let rides = await RideBooking.find({
                status: [
                    sails.config.RIDE_STATUS.RESERVED,
                    sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                    sails.config.RIDE_STATUS.ON_GOING,
                ],
                userId: planInvoice.userId,
            });
            if (rides.length > 0) {
                console.log(
                    "--------- removeCurrentBookPlan - rides.length > 0"
                );
                continue;
            }
            console.log('planInvoice.id ', planInvoice.id, ' - user.id -', planInvoice.userId);
            let updatedUser = await User.update(
                {
                    id: planInvoice.userId,
                    currentBookingPlanInvoiceId: planInvoice.id,
                },
                {
                    currentBookingPlanInvoiceId: null,
                }
            ).fetch();
            if (!updatedUser.length < 0) {
                console.log("currentPlan remove failed ", planInvoice.userId);
                continue;
            }
            // todo: may need to empty RTL here after currentBookingPlanInvoiceId null
            console.log("currentPlan removed ", planInvoice.id, ' - ', planInvoice.userId);
            updatedUser = updatedUser[0];
            console.log("376 ****************");
            if (updatedUser && updatedUser.nextBookingPlanInvoiceId) {
                // await this.emptyTimeLimitInInvoice(planInvoice.id);
                await this.makeNextPlanAsCurrent(updatedUser);
            }
        }
    },

    async updateRenewableStatus(oldValue, newValue, planId) {
        if (oldValue === newValue) {
            return;
        }
        let usersWithPlan = await User.find({
            currentBookingPlanInvoiceId: { "!=": null },
        }).select(["currentBookingPlanInvoiceId"]);
        let planInvoicesIdArray = _.map(
            usersWithPlan,
            (user) => user.currentBookingPlanInvoiceId
        );
        let planInvoices = await PlanInvoice.find({
            id: planInvoicesIdArray,
            planId: planId,
        }).select(["id", "planId", "userId"]);

        for (let planInvoice of planInvoices) {
            await PlanInvoice.update(
                { id: planInvoice.id },
                { isRenewable: newValue }
            );
        }
    },
    async notifyExpirePlanOrTimeLimit(
        users,
        message,
        isExpireNotification = true
    ) {
        let playerIds;
        for (let currentUser of users) {
            let updatedMessage = message;
            playerIds = [];
            // not adding null Ids in playerIds
            if (currentUser.androidPlayerId) {
                playerIds = playerIds.concat(currentUser.androidPlayerId);
            }
            if (currentUser.iosPlayerId) {
                playerIds = playerIds.concat(currentUser.iosPlayerId);
            }
            if (!playerIds.length) {
                continue;
            }
            if (currentUser.nextBookingPlanInvoiceId) {
                updatedMessage += " Your next plan will be used afterwards.";
            }
            if (isExpireNotification) {
                await this.sendNotificationForExpirePlan(
                    currentUser.currentBookingPlanInvoiceId,
                    playerIds,
                    updatedMessage
                );
            } else {
                await NotificationService.sendPushNotification({
                    playerIds: playerIds,
                    content: updatedMessage,
                    // data: pushNotificationOptions.data
                });
            }
        }
    },

    async sendNotificationForExpirePlan(planInvoiceId, playerIds, message) {
        if (!planInvoiceId) {
            return;
        }
        await NotificationService.sendPushNotification({
            playerIds: playerIds,
            content: message,
            // data: pushNotificationOptions.data
        });
        let currentBookPlanInvoice = await PlanInvoice.findOne({
            id: planInvoiceId,
        }).select(["isNotified"]);
        if (currentBookPlanInvoice.isNotified) {
            return;
        }

        await PlanInvoice.update({ id: planInvoiceId }, { isNotified: true });
        console.log("isNotified true for ", planInvoiceId);
    },

    async notifyExpirePlanDynamicDayWise(
        usersWithPlan,
        planInvoicesIdArray,
        daysToAdd,
        message
    ) {
        let timeToCheck = UtilService.addTime(daysToAdd, null, "days");
        let planInvoices = await this.getInvoiceListForCron(
            planInvoicesIdArray,
            timeToCheck
        );
        if (planInvoices.length === 0) {
            return [];
        }
        let userIdsToBeNotified = _.map(
            planInvoices,
            (planInvoice) => planInvoice.userId
        );
        let userObjects = _.filter(usersWithPlan, (user) => {
            return userIdsToBeNotified.includes(user.id);
        });
        await this.notifyExpirePlanOrTimeLimit(userObjects, message);

        let notifiedInvoiceIds = _.map(
            planInvoices,
            (planInvoice) => planInvoice.id
        );
        if (!notifiedInvoiceIds) {
            notifiedInvoiceIds = [];
        }

        return notifiedInvoiceIds;
    },

    async getInvoiceListForCron(planInvoicesIdArray, timeToCheck) {
        let currentTime = UtilService.getTimeFromNow();
        let invoices = await PlanInvoice.find({
            id: planInvoicesIdArray,
            expirationEndDateTime: {
                ">=": currentTime,
                "<=": timeToCheck,
            },
        }).select(["userId"]);

        return invoices;
    },

    afterCreate: async function () {},
    afterUpdate: async function () {},
    afterDestroy: async function () {},
};

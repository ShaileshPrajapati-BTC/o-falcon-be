const UtilService = require('./util');
const moment = require('moment');

module.exports = {
    checkAvailblePassForVehicleType(plan, vehicleType) {
        let isAvailable = false;
        plan.vehicleTypes.forEach(element => {
            if (element.vehicleType === vehicleType) {
                isAvailable = true;
            }
        });
        if (!isAvailable) {
            throw sails.config.message.BOOKING_PASS_NOT_FOUND;
        }
    },
    async checkUsedPassForVehicleType(userId, vehicleType) {
        const user = await User.findOne({ id: userId }).select(['currentBookingPassIds']);
        let currentBookingPassIds = user.currentBookingPassIds;

        if (!currentBookingPassIds) {
            console.log("------------------ currentBookingPassIds null");
            return;
        }
        let isAlreadyUsed = false;
        for (let planInvoiceId of currentBookingPassIds) {
            const planInvoice = await PlanInvoice.findOne({
                where: {
                    id: planInvoiceId,
                    remainingTimeLimit: { '!=': 0 }
                }
            });
            if (planInvoice.vehicleType === vehicleType) {
                isAlreadyUsed = true;
                break;
            }
        }

        if (isAlreadyUsed) {
            throw sails.config.message.CANT_BUY_PLAN;
        }
        return true;
    },
    getPlanPriceDetails(plan, vehicleType) {
        let planDetails;
        if (plan && plan.vehicleTypes) {
            planDetails = plan.vehicleTypes.filter((e) => e.vehicleType === vehicleType)
        }
        if (planDetails) {
            return planDetails[0];
        }
        return false;
    },
    countTimeLimitInSeconds(limitValue, limitType) {
        switch (limitType) {
            case sails.config.BOOKING_PASS_LIMIT_TYPES.MINUTES:
                limitValue = limitValue * 60;
                break;
            case sails.config.BOOKING_PASS_LIMIT_TYPES.HOUR:
                limitValue = limitValue * 60 * 60;
                break;
            case sails.config.BOOKING_PASS_LIMIT_TYPES.DAY:
                limitValue = limitValue * 60 * 60 * 24;
                break;
            case sails.config.BOOKING_PASS_LIMIT_TYPES.MONTH:
                limitValue = limitValue * 60 * 60 * 24 * 30;
                break;
        }
        return limitValue;
    },
    async getUserCurrentPass(userId, vehicle) {
        const user = await User.findOne({ id: userId }).select(['currentBookingPassIds']);
        let currentBookingPassIds = user.currentBookingPassIds;

        if (!currentBookingPassIds) {
            console.log("------------------ currentBookingPassIds null");
            return null;
        }
        let currentPass;
        for (let planInvoiceId of currentBookingPassIds) {
            const planInvoice = await PlanInvoice.findOne({ id: planInvoiceId });
            if (planInvoice.vehicleType === vehicle.type) {
                currentPass = planInvoice;
            }
        }
        return currentPass;
    },
    addTime(planType, planValue) {
        const timeNow = UtilService.getTimeFromNow();
        let endDateTime;
        switch (planType) {
            case sails.config.BOOKING_PASS_EXPIRATION_TYPES.HOUR:
                endDateTime = UtilService.addTime(planValue, timeNow, "hours");
                // let todayEndTime = UtilService.addExpireTime(timeNow, sails.config.END_WORKING_TIME);
                // let finalExpreTime = UtilService.isBeforeTime(endDateTime, todayEndTime)
                // if (!finalExpreTime) {
                //     endDateTime = todayEndTime;
                // }
                break;

            case sails.config.BOOKING_PASS_EXPIRATION_TYPES.DAY:
                endDateTime = UtilService.addTime(planValue, timeNow, "days");
                // endDateTime = UtilService.addExpireTime(endDate, sails.config.END_WORKING_TIME);
                break;

            case sails.config.BOOKING_PASS_EXPIRATION_TYPES.MONTH:
                endDateTime = UtilService.addTime(planValue, timeNow, "months");
                // let finalExpireDate = UtilService.subtractTime(1, endTime, "days");
                // endDateTime = UtilService.addExpireTime(finalExpireDate, sails.config.END_WORKING_TIME);
                break;
        }
        return endDateTime;
    },
    async getUserPlanInvoice(planInvoiceId) {
        if (!planInvoiceId) {
            return null;
        }
        const planInvoice = await PlanInvoice.findOne({
            id: planInvoiceId,
        });

        return planInvoice;
    },
    async updateTimeLimitInInvoice(planInvoiceId, remainingTimeLimit) {
        if (!planInvoiceId) {
            return null;
        }
        let updatedInvoice = await PlanInvoice.update(
            { id: planInvoiceId },
            {
                remainingTimeLimit: remainingTimeLimit,
            }
        ).fetch();
        updatedInvoice = updatedInvoice[0];

        return updatedInvoice;
    },
    async deductTimeLimit(planInvoiceId, timeToDecrease) {
        let currentBookPlanInvoice = await this.getUserPlanInvoice(planInvoiceId);

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
    },
    async removeCurrentBookingPass(planInvoices) {
        if (planInvoices.length === 0) {
            return;
        }
        for (let planInvoice of planInvoices) {
            let user = await User.findOne({ id: planInvoice.userId });
            let includeCurrentPlan = user.currentBookingPassIds.includes(planInvoice.id)

            if (!includeCurrentPlan) {
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
                    "--------- removeCurrentBookPlan----------"
                );
                continue;
            }

            let currentBookingPass = user.currentBookingPassIds;
            const currentBookingPassIds = currentBookingPass.filter(item => item !== planInvoice.id)
            let updatedUser = await User.update(
                {
                    id: planInvoice.userId
                },
                {
                    currentBookingPassIds: currentBookingPassIds,
                }
            ).fetch();
            if (!updatedUser.length < 0) {
                console.log("currentPlan remove failed ", planInvoice.userId);
                continue;
            }
        }
    },
}
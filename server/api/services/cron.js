const moment = require('moment');
const RideBookingService = require('./rideBooking');
const IotService = require('./iot');
const UtilService = require('./util');
const NotificationService = require('./notification');
const BookPlanService = require('./bookPlan');
const RentPaymentService = require('./rentPayment');
const TaskService = require('./task');
const BookingPassService = require('./bookingPass');
const SocketEvents = require('./socketEvents');
const EmailService = require(`./email`);
const NOQOODYPaymentService = require(`./Payment/Noqoody/payment`);
const MPGSPaymentService = require('./Payment/Mastercard/payment')
const OperationHoursService = require(`./operationalHours`);
const RedisDBService = require('./redisDB');
const ExcelReportService = require('./excelReport');
const user = require('./user');

module.exports = {
    async cancelRide() {
        try {
            let expiredReservationTime = moment().toISOString();
            let rides = await RideBooking.find({
                reservedEndDateTime: { '<=': expiredReservationTime },
                status: sails.config.RIDE_STATUS.RESERVED,
                isRequested: false
            });
            for (let ride of rides) {
                console.log('ride cancelled', ride.id);
                await RideBooking.update({ id: ride.id }, { isEndedByServer: true, updatedBy: ride.userId });
                await RideBookingService.cancelRide(ride);
            }
        } catch (e) {
            sails.log.error('Error while running cron cancel ride.', e);
        }
    },
    async endPausedRide() {
        try {
            let expiredPausedTime = moment().toISOString();
            let filter = {
                pauseEndDateTime: { '<=': expiredPausedTime },
                isPaused: true,
                isRequested: false,
                // vehicleType: { '!=': sails.config.VEHICLE_TYPE.BICYCLE },
                status: sails.config.RIDE_STATUS.ON_GOING
            };
            let rides = await RideBooking.find(filter);
            for (let ride of rides) {
                console.log('ride stopped', ride.id);
                await RideBookingService.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);
            }
        } catch (e) {
            sails.log.error('Error while running cron stop ride.', e);
        }
    },
    async endRideAfterMaxRideTime() {
        try {
            let currentTime = moment().toISOString();
            let nextOneMinuteTime = UtilService.addTime(1, currentTime);
            console.log('endRideAfterMaxRideTime', nextOneMinuteTime);
            let filter = {
                maxRideTime: {
                    '>=': currentTime,
                    '<=': nextOneMinuteTime
                },
                isPaused: false,
                isRequested: false,
                status: sails.config.RIDE_STATUS.ON_GOING
            };
            let rides = await RideBooking.find(filter).sort('maxRideTime asc');
            for (let ride of rides) {
                let timeDiff = UtilService.getTimeDifference(currentTime, ride.maxRideTime, 'seconds');
                await RideBookingService.setEndRideIntervalForLowBalance(ride, timeDiff, currentTime, nextOneMinuteTime);
            }
        } catch (e) {
            sails.log.error('Error while running cron stop ride.', e);
        }
    },
    async endRideAfterMaxKm() {
        try {
            console.log('in endRideAfterMaxKm');
            let filter = {
                maxKm: { '>=': 0 },
                isPaused: false,
                isRequested: false,
                status: sails.config.RIDE_STATUS.ON_GOING
            };
            let rides = await RideBooking.find(filter);
            for (let ride of rides) {
                let totalKm = await RedisDBService.getData(`ride-${ride.id}`);
                if (totalKm > 0 && totalKm >= ride.maxKm) {
                    console.log('ride stopped endRideAfterMaxRideTime', ride.id);
                    await RideBookingService.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);
                }
            }
        } catch (e) {
            sails.log.error('Error while running cron stop ride.', e);
        }
    },
    async checkNoCallBackNotReceivedFromIOT() {
        try {
            let currentTime = moment().toISOString();
            let rides = await RideBooking
                .find({
                    status: [2, 3],
                    requestEndDateTime: { '<=': currentTime },
                    isRequested: true
                });
            for (let ride of rides) {
                console.log('ride updated', ride.id);
                let error = sails.config.message.CANT_UNLOCK_VEHICLE;
                if (
                    ride.status === sails.config.RIDE_STATUS.ON_GOING &&
                    !ride.isPaused
                ) {
                    error = sails.config.message.CANT_LOCK_VEHICLE;
                } else if (ride.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
                    error = sails.config.message.SCOOTER_DISCONNECTED_WHILE_RIDE;
                }
                let vehicle = await RideBookingService.markVehicleDisconnected(ride.vehicleId);
                ride.vehicleId = vehicle;
                await RideBookingService.emitActiveRide(ride, error);
            }
        } catch (e) {
            sails.log.error(
                'Error while running cron checkNoCallBackNotReceivedFromIOT.',
                e
            );
        }
    },
    async activatePromoCode() {
        try {
            let currentTime = UtilService.getStartOfTheDay();
            let promoCodes = await PromoCode.find({
                startDateTime: { '<=': currentTime },
                endDateTime: { '>=': currentTime },
                isActive: false
            });
            for (let promoCode of promoCodes) {
                let timeDifference = UtilService.getTimeDifference(
                    promoCode.startDateTime,
                    currentTime
                );
                if (timeDifference < 60) {
                    console.log('promo code updated ', promoCode.id);
                    let updatedRecord = await PromoCode.update(
                        { id: promoCode.id },
                        { isActive: true }
                    ).fetch();
                    if (updatedRecord.length > 0) {
                        console.log('promo code activated', promoCode.id);
                    } else {
                        console.log(
                            'promo code activation failed',
                            promoCode.id
                        );
                    }
                }
            }
        } catch (e) {
            sails.log.error('Error while running cron activatePromoCode.', e);
        }
    },

    async deactivatePromoCode() {
        try {
            let currentTime = moment().toISOString();
            let promoCodes = await PromoCode.find({
                endDateTime: { '<=': currentTime },
                isActive: true
            });
            for (let promoCode of promoCodes) {
                console.log('promo code updated ', promoCode.id);
                let updatedRecord = await PromoCode.update(
                    { id: promoCode.id },
                    { isActive: false }
                ).fetch();
                if (updatedRecord.length > 0) {
                    console.log('promo code deactivated', promoCode.id);
                } else {
                    console.log(
                        'promo code deactivation failed',
                        promoCode.id
                    );
                }
            }
        } catch (e) {
            sails.log.error('Error while running cron deactivatePromoCode.', e);
        }
    },

    async deleteOldIotCallbackData() {
        try {
            let deleteTime = UtilService.subtractTime(1, null, 'days');
            let filter = { createdAt: { '<': deleteTime } };
            let deletedRecords = await IOTCommandCallbackTrack.count(filter);
            await IOTCommandCallbackTrack.destroy(filter);
            console.log('deleted IOTCommandCallbackTrack Records count:', deletedRecords);

            // let deleteTimeFor3Days = UtilService.subtractTime(3, null, 'days');
            // let filterFor3Days = { createdAt: { '<': deleteTimeFor3Days } };
            deletedRecords = await ActivityLog.count(filter);
            await ActivityLog.destroy(filter);
            console.log('deleted ActivityLog Records count:', deletedRecords);

            let deleteTimeFor7Days = UtilService.subtractTime(7, null, 'days');
            let filterFor7Days = { createdAt: { '<': deleteTimeFor7Days } };
            deletedRecords = await Notification.count(filterFor7Days);
            await Notification.destroy(filterFor7Days);
            console.log('deleted Notification Records count:', deletedRecords);

            deletedRecords = await ErrorLog.count(filterFor7Days);
            await ErrorLog.destroy(filterFor7Days);
            console.log('deleted ErrorLog Records count:', deletedRecords);

        } catch (e) {
            sails.log.error('Error while running cron deleteOldIotCallbackData.', e);
        }
    },

    async setOmniCallback() {
        try {
            let timeToCheck = UtilService.subtractTime(2, null, 'hours');
            let record = await IOTCallbackInfoTrack.find({
                where: { createdAt: { '>=': timeToCheck } },
                limit: 1,
                sort: 'createdAt desc'
            });
            if (!record || !record.length) {
                await IotService.setOmniCallback();
            }
        } catch (e) {
            sails.log.error('Error while running cron setOmniCallback', e);
        }
    },

    async notifyLowWalletAmount() {
        try {
            let users = await User.find({
                walletAmount: { '<=': sails.config.MIN_WALLET_NOTIFICATION_AMOUNT }
            });
            const message = "You have insufficient balance.";
            let playerIds;
            let rideCountInPrevDay;
            let timeToCheck = UtilService.subtractTime(1, null, 'days');
            for (let user of users) {
                rideCountInPrevDay = await RideBooking.count({
                    userId: user.id,
                    createdAt: { '>=': timeToCheck }
                });
                if (rideCountInPrevDay === 0) {
                    continue;
                }
                playerIds = [];
                // not adding null Ids in playerIds
                if (user.androidPlayerId) {
                    playerIds = playerIds.concat(user.androidPlayerId);
                }
                if (user.iosPlayerId) {
                    playerIds = playerIds.concat(user.iosPlayerId);
                }
                if (!playerIds.length) {
                    continue;
                }

                await NotificationService.sendPushNotification({
                    playerIds: playerIds,
                    content: message
                });
            }

        } catch (e) {
            sails.log.error('Error while running cron notifyLowWalletAmount', e);
        }
    },

    async activateBookPlan() {
        try {
            let currentTime = UtilService.getStartOfTheDay();
            let bookPlans = await BookPlan.find({
                startDateTimeToBuy: { '<=': currentTime },
                endDateTimeToBuy: { '>=': currentTime },
                isActive: false
            });
            for (let bookPlan of bookPlans) {
                let updatedRecord = await BookPlan.update(
                    { id: bookPlan.id },
                    { isActive: true }
                ).fetch();
                if (updatedRecord.length > 0) {
                    console.log('book plan activated', bookPlan.id);
                } else {
                    console.log(
                        'book plan activation failed',
                        bookPlan.id
                    );
                }
            }
        } catch (e) {
            sails.log.error('Error while running cron activateBookPlan.', e);
        }
    },

    async deactivateBookPlan() {
        try {
            let currentTime = UtilService.getStartOfTheDay();
            let bookPlans = await BookPlan.find({
                endDateTimeToBuy: { '<=': currentTime },
                isActive: true
            });
            for (let bookPlan of bookPlans) {
                let updatedRecord = await BookPlan.update(
                    { id: bookPlan.id },
                    { isActive: false }
                ).fetch();
                if (updatedRecord.length > 0) {
                    console.log('book plan deactivated', bookPlan.id);
                } else {
                    console.log(
                        'book plan deactivation failed',
                        bookPlan.id
                    );
                }
            }
        } catch (e) {
            sails.log.error('Error while running cron deactivateBookPlan.', e);
        }
    },
    async expirePaymentTransaction() {
        let currentTime = moment().toISOString();
        if (sails.config.DEFAULT_PAYMENT_METHOD.includes(sails.config.PAYMENT_GATEWAYS.NOQOODY)) {
            let transactionsToExpire = await TransactionLog.find({
                status: sails.config.STRIPE.STATUS.pending,
                // expiryDate: { '!=': '', '<=': currentTime }
            });
            for (let transactionToExpire of transactionsToExpire) {
                if (!transactionToExpire) {
                    continue;
                }
                if (transactionToExpire && transactionToExpire.noqoodyReferenceId) {
                    try {
                        await NOQOODYPaymentService.validatePayment(transactionToExpire.noqoodyReferenceId, 1, true);
                    } catch (err) {
                        console.log('expirePaymentTransaction', err);
                    }
                }
            }
        } else {
            let paymentExpire = {
                status: sails.config.STRIPE.STATUS.expired,
                remark: sails.config.STRIPE.MESSAGE.EXPIRE_PAYMENT
            };
            let transactions = await TransactionLog.update({
                status: sails.config.STRIPE.STATUS.pending,
                expiryDate: { '!=': '', '<=': currentTime }
            }).set(paymentExpire).fetch();

            console.log('transactions Expired', JSON.stringify(transactions));
        }
    },
    async removeDWMCurrentBookPlan() {
        // DWM: Daily, Weekly, Monthly
        // note: need to optimise this, in where condition
        try {
            let currentTime = moment().toISOString();
            let planInvoices = await PlanInvoice.find({
                'planData.planType': { '!=': sails.config.BOOK_PLAN_TYPES.HOURLY },
                expirationEndDateTime: { '<=': currentTime }
            }).meta({ enableExperimentalDeepTargets: true });
            await BookPlanService.removeCurrentBookPlan(planInvoices);
        } catch (e) {
            sails.log.error('Error while running cron removeDWMCurrentBookPlan.', e);
        }
    },
    async removeHourlyCurrentBookPlan() {
        try {
            let currentTime = moment().toISOString();
            let prevDayTime = UtilService.subtractTime(1, null, 'days');
            let planInvoices = await PlanInvoice.find({
                'planData.planType': sails.config.BOOK_PLAN_TYPES.HOURLY,
                expirationStartDateTime: { '>=': prevDayTime },
                expirationEndDateTime: { '<=': currentTime }
            }).meta({ enableExperimentalDeepTargets: true });
            await BookPlanService.removeCurrentBookPlan(planInvoices);
        } catch (e) {
            sails.log.error('Error while running cron removeHourlyCurrentBookPlan.', e);
        }
    },
    async handleIsCancellableKeyInPlan() {
        try {
            let timeToCheck = UtilService.subtractTime(1, null, 'days');
            let usersWithPlan = await User.find({
                currentBookingPlanInvoiceId: { '!=': null }
            })
                .select(['currentBookingPlanInvoiceId']);
            let planInvoicesIdArray = _.map(usersWithPlan, user => user.currentBookingPlanInvoiceId);
            let planInvoices = await PlanInvoice.find({
                id: planInvoicesIdArray,
                'planData.planType': { '!=': sails.config.BOOK_PLAN_TYPES.HOURLY },
                createdAt: { '<=': timeToCheck },
                isCancellable: true
            }).meta({ enableExperimentalDeepTargets: true });

            for (let planInvoice of planInvoices) {
                let updatedRecord = await PlanInvoice.update(
                    { id: planInvoice.id },
                    { isCancellable: false }
                ).fetch();
                if (updatedRecord.length > 0) {
                    console.log('updating isCancellable false for ', planInvoice.id);
                } else {
                    console.log('updating isCancellable false failed', planInvoice.id);
                }
            }
        } catch (e) {
            sails.log.error('Error while running cron handleIsCancellableKeyInPlan.', e);
        }
    },
    async notifyExpirePlanEvery10Min() {
        try {
            let usersWithPlan = await User.find({
                currentBookingPlanInvoiceId: { '!=': null }
            }).select(['androidPlayerId', 'iosPlayerId', 'currentBookingPlanInvoiceId', 'nextBookingPlanInvoiceId']);
            if (usersWithPlan.length === 0) {
                return;
            }
            let planInvoicesIdArray = _.map(usersWithPlan, user => user.currentBookingPlanInvoiceId);
            let timeToCheck = UtilService.addTime(10);
            let currentTime = moment().toISOString();
            let planInvoices = await PlanInvoice.find({
                id: planInvoicesIdArray,
                expirationEndDateTime: {
                    '>=': currentTime,
                    '<=': timeToCheck
                }
            }).select(['userId']);
            if (planInvoices.length === 0) {
                return;
            }
            let userIdsToBeNotified = _.map(planInvoices, planInvoice => planInvoice.userId);
            let message = "Your plan is going to expire in less than 10 minutes."
            let userObjToBeNotified = _.filter(usersWithPlan, (user) => {
                return userIdsToBeNotified.includes(user.id)
            })
            await BookPlanService.notifyExpirePlanOrTimeLimit(userObjToBeNotified, message);
        } catch (e) {
            sails.log.error('Error while running cron notifyExpirePlanEvery10Min.', e);
        }
    },
    async notifyExpirePlanDayWise() {
        try {
            let usersWithPlan = await User.find({
                currentBookingPlanInvoiceId: { '!=': null }
            }).select(['androidPlayerId', 'iosPlayerId', 'currentBookingPlanInvoiceId', 'nextBookingPlanInvoiceId']);
            if (usersWithPlan.length === 0) {
                return;
            }
            let planInvoicesIdArray = _.map(usersWithPlan, user => user.currentBookingPlanInvoiceId);
            let message;
            let notifiedInvoiceIds;
            message = "Your plan is going to expire in 1 day.";
            notifiedInvoiceIds = await BookPlanService.notifyExpirePlanDynamicDayWise(usersWithPlan, planInvoicesIdArray, 1, message);
            if (notifiedInvoiceIds && notifiedInvoiceIds.length > 0) {
                planInvoicesIdArray = _.filter(planInvoicesIdArray, invoiceId => {
                    return !notifiedInvoiceIds.includes(invoiceId);
                })
            }

            message = "Your plan is going to expire in about 3 days.";
            notifiedInvoiceIds = await BookPlanService.notifyExpirePlanDynamicDayWise(usersWithPlan, planInvoicesIdArray, 3, message);
            if (notifiedInvoiceIds && notifiedInvoiceIds.length > 0) {
                planInvoicesIdArray = _.filter(planInvoicesIdArray, invoiceId => {
                    return !notifiedInvoiceIds.includes(invoiceId);
                })
            }

            message = "Your plan is going to expire in about 7 days.";
            notifiedInvoiceIds = await BookPlanService.notifyExpirePlanDynamicDayWise(usersWithPlan, planInvoicesIdArray, 7, message);
        } catch (e) {
            sails.log.error('Error while running cron notifyExpirePlanDayWise.', e);
        }
    },
    async notifyTimeLimitOnGoingRides() {
        try {
            let timeToCheck = UtilService.addTime(10 * 60, null, 'seconds'); // 10 min to seconds
            let rides = await RideBooking.find({
                status: [
                    sails.config.RIDE_STATUS.RESERVED,
                    sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                    sails.config.RIDE_STATUS.ON_GOING
                ],
                planInvoiceId: { '!=': null }
            })
                .select(['planInvoiceId', 'userId'])
                .populate('planInvoiceId', {
                    where: {
                        remainingTimeLimit: { '<': timeToCheck }
                    }
                })
                .populate('userId', {
                    select: ['androidPlayerId', 'iosPlayerId', 'currentBookingPlanInvoiceId', 'nextBookingPlanInvoiceId',]
                });
            if (!rides || rides.length === 0) {
                return;
            }
            let usersArray = _.map(rides, ride => ride.userId);
            let message = "Your current plan contains less than 10 minutes of time limit";
            await BookPlanService.notifyExpirePlanOrTimeLimit(usersArray, message, false);
        } catch (e) {
            sails.log.error('Error while running cron notifyTimeLimitOnGoingRides.', e);
        }
    },

    async requestRentPayment() {
        try {
            if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE) {
                await RentPaymentService.requestRentPaymentForFranchisee();
            } else {
                await RentPaymentService.requestRentPaymentForDealer();
                await RentPaymentService.requestRentPaymentForFranchisee();
            }
        } catch (e) {
            sails.log.error('Error while running cron requestRentPayment.', e);
        }
    },

    async autoCreateTask() {
        try {
            // Find the vehicle that their location does not change the last 1 hours or up to 1 hours
            let now = new Date();
            let vehicles = await Vehicle.find({
                where: {
                    lastConnectionCheckDateTime: { ">=": new Date(now.getTime() - 1000 * 60 * 60) },
                    isRideCompleted: true,
                    isAvailable: true,
                    isDeleted: false
                }
            });

            if (vehicles && vehicles.length) {
                await Promise.all(_.map(vehicles, async function (vehicle) {
                    if (vehicle.id) {
                        // Find a particular vehicle that has an incomplete task.
                        let vehicleTask = await Task.find({
                            where: {
                                taskWorkFlow: {
                                    '!=': [
                                        sails.config.TASK.WORK_FLOW.COMPLETE,
                                        sails.config.TASK.WORK_FLOW.CANCELLED
                                    ]
                                },
                                referenceId: vehicle.id,
                                isDeleted: false
                            }
                        });
                        // console.log('vehicle Task is already created-----------------', vehicleTask);
                        // If particular vehicle have ongoing task the create move task for this particular vehicle
                        if (!vehicleTask.length) {
                            let nest = await Nest.find({
                                where: {
                                    capacity: { '!=': 0 },
                                    type: sails.config.NEST_TYPE.REPAIR,
                                    isActive: true
                                }
                            });
                            if (nest && nest.length) {
                                let newStatus = [{
                                    before: 0,
                                    after: sails.config.TASK.WORK_FLOW.OPEN,
                                    remark: 'System created task.',
                                    dateTime: UtilService.getTimeFromNow(),
                                    userId: null
                                }];
                                let taskObj = {
                                    taskType: sails.config.TASK.TASK_TYPE.LEVEL_1.MOVE,
                                    taskHeading: sails.config.TASK.TASK_HEADING.MOVE[1],
                                    timeLimitType: sails.config.TASK_SETTING.moveTask.timeLimitType,
                                    timeLimitValue: sails.config.TASK_SETTING.moveTask.timeLimitValue,
                                    incentiveAmount: sails.config.TASK_SETTING.moveTask.incentiveRange,
                                    taskWorkFlow: sails.config.TASK.WORK_FLOW.OPEN,
                                    module: sails.config.modules.vehicle,
                                    referenceId: vehicle.id,
                                    nestId: nest[0].id,
                                    statusTrack: newStatus,
                                    isSystemCreated: true,
                                    isIdealVehicleTask: true,
                                    canceledBy: [],
                                    level: sails.config.TASK.TASK_LEVEL.ONE
                                }
                                let createdRecord = await Task.create(taskObj).fetch();
                                if (createdRecord) {
                                    console.log("*****************Create task for move vehicle*****************");
                                }
                                console.log(taskObj.referenceId, sails.config.message.TASK_CREATED);
                            }
                        }
                    }
                }));
            }
        } catch (e) {
            sails.log.error('Error while running cron autoCreateTask.', e);
        }
    },

    async markTaskAsOverDue() {
        try {
            let startOfTheMinute = UtilService.getStartOfTheMinute();
            let endOfTheMinute = UtilService.getEndOfTheMinute();
            let tasks = await Task.find({
                and: [
                    { taskEndDateTime: { ">=": startOfTheMinute } },
                    { taskEndDateTime: { "<=": endOfTheMinute } },
                ],
                taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                isOverDue: false,
                isDeleted: false
            });
            let userIds = [];
            for (let task of tasks) {
                let updatedRecord = await Task.update(
                    { id: task.id },
                    { isOverDue: true }
                ).fetch();
                userIds.push(task.assignedTo);
                // todo:falcon -> send notification
                if (updatedRecord.length > 0) {
                    console.log("task is overdue --------- ", task.id);
                } else {
                    console.log("task overdue failed --------- ", task.id);
                }
            }
            let notifiableUsers = await User.find({ id: userIds })
                .select(['androidPlayerId', 'iosPlayerId']);;
            await TaskService.sendOverDueNotification(notifiableUsers);
        } catch (e) {
            sails.log.error("Error while running cron markTaskAsOverDue.", e);
        }
    },

    async createTaskForLowBatteryVehicle() {
        try {
            let vehicles = await Vehicle.find({
                where: {
                    batteryLevel: { ">=": 20 },
                    isRideCompleted: true,
                    isAvailable: true,
                    isDeleted: false
                }
            });
            await Promise.all(_.map(vehicles, async function (vehicle) {
                if (vehicle.id) {
                    let alreadyOngoingTaskForVehicle = await Task.findOne({
                        referenceId: vehicle.id,
                        taskWorkFlow: [
                            sails.config.TASK.WORK_FLOW.OPEN,
                            sails.config.TASK.WORK_FLOW.IN_PROGRESS
                        ],
                        isDeleted: false
                    });
                    if (!alreadyOngoingTaskForVehicle) {
                        let nest = await Nest.find({
                            where: {
                                capacity: { '!=': 0 },
                                type: sails.config.NEST_TYPE.RIDE,
                                isActive: true
                            }
                        });
                        if (nest && nest.length) {
                            let newStatus = [{
                                before: 0,
                                after: sails.config.TASK.WORK_FLOW.OPEN,
                                remark: 'System created task.',
                                dateTime: UtilService.getTimeFromNow(),
                                userId: null
                            }];
                            let taskObj = {
                                taskType: sails.config.TASK.TASK_TYPE.LEVEL_2.CHARGE,
                                taskHeading: sails.config.TASK.TASK_HEADING.CHARGE[1],
                                timeLimitValue: sails.config.TASK_SETTING.chargeTask.timeLimitValue,
                                incentiveRange: sails.config.TASK_SETTING.chargeTask.incentiveRange,
                                incentiveRange: sails.config.TASK_SETTING.chargeTask.incentiveRange,
                                taskWorkFlow: sails.config.TASK.WORK_FLOW.OPEN,
                                module: sails.config.modules.vehicle,
                                referenceId: vehicle.id,
                                nestId: nest[0].id,
                                statusTrack: newStatus,
                                isSystemCreated: true,
                                canceledBy: [],
                                level: sails.config.TASK.TASK_LEVEL.TWO
                            }
                            let createdRecord = await Task.create(taskObj).fetch();
                            if (createdRecord) {
                                console.log("*****************Create task for vehicle charge*****************");
                            }
                            console.log(taskObj.referenceId, sails.config.message.TASK_CREATED);
                        }
                    }
                }
            }));
        } catch (error) {
            sails.log.error('Error while running cron createTaskForLowBatteryVehicle.', error);
        }
    },

    async removeHourlyBookingPass() {
        try {
            let currentTime = moment().toISOString();
            let startDayTime = UtilService.getStartOfTheDay();

            let planInvoices = await PlanInvoice.find({
                or: [
                    {
                        limitType: sails.config.BOOKING_PASS_EXPIRATION_TYPES.HOUR,
                        expirationStartDateTime: { '>=': startDayTime },
                        expirationEndDateTime: { '<=': currentTime }
                    },
                    {
                        remainingTimeLimit: 0
                    }
                ]
            }).meta({ enableExperimentalDeepTargets: true });
            await BookingPassService.removeCurrentBookingPass(planInvoices);
        } catch (e) {
            sails.log.error('Error while running cron removeHourlyBookingPass.', e);
        }
    },
    async removeDailyMonthlyBookingPass() {
        try {
            let currentTime = UtilService.getTimeFromNow();
            let planInvoices = await PlanInvoice.find({
                limitType: { '!=': sails.config.BOOKING_PASS_EXPIRATION_TYPES.HOUR },
                expirationEndDateTime: { '<=': currentTime }
            }).meta({ enableExperimentalDeepTargets: true });
            await BookingPassService.removeCurrentBookingPass(planInvoices);
        } catch (e) {
            sails.log.error('Error while running cron removeDailyMonthlyBookingPass.', e);
        }
    },

    async cancelClaimNest() {
        try {
            let newDate = new Date();
            let nests = await Nest.find({
                and: [
                    { claimEndDateTime: { "<=": newDate } },
                ],
                isClaimed: true,
                isDeleted: false
            });
            console.log('Cancel claimed nest count ------- ', nests.length);
            for (let nest of nests) {
                console.log('----------Request cancel claim nest----------');
                console.log(nest.id);
                let updateObj = {
                    isClaimed: false,
                    isClaimedBy: null,
                    nestClaimTimeValue: 0
                }
                let updatedRecord = await Nest.update(
                    { id: nest.id },
                ).set(updateObj).fetch();
                if (updatedRecord.length > 0) {
                    await SocketEvents.sendCancelClaimNest(updatedRecord[0]);
                    console.log("Cancel nest claim successfully ------ ", nest.id);
                } else {
                    console.log("Cancel nest claim Failed! ------ ", nest.id);
                }
            }

        } catch (e) {
            sails.log.error("Error while running cron cancelClaimNest.", e);
        }
    },
    async dailyLightOn() {
        try {
            let totalInterval = 0;
            let lightOnEachInterval = setInterval(async () => {
                let vehicles = await Vehicle.find({
                    headLight: { '!=': 2 },
                    connectionStatus: true
                }).populate('manufacturer');
                console.log('totalInterval is run => ', totalInterval);
                console.log('vehicles', vehicles.length);
                if (vehicles.length <= 0 || totalInterval >= sails.config.MAX_CRON_INTERVAL) {
                    clearInterval(lightOnEachInterval);
                }
                for (let vehicle of vehicles) {
                    let command = 'lightOn';
                    let data = { command: command };
                    try {
                        let response = await IotService.commandToPerform(command, vehicle, data);
                        console.log('response', response);
                    } catch (e) {
                        sails.log.error(`Error while sending LigthOn. vehicleId = ${vehicle.id}`, e);
                    }
                }
                totalInterval++;
            }, 1000 * sails.config.CRON_INTERVAL_TIME_IN_MINUTE);

        } catch (e) {
            sails.log.error('Error while running cron dailyLightOn.', e);
        }
    },
    async dailyLightOff() {
        try {
            let totalInterval = 0;
            let lightOffEachInterval = setInterval(async () => {
                let vehicles = await Vehicle.find({
                    headLight: 2,
                    connectionStatus: true
                }).populate('manufacturer');
                console.log('totalInterval is run => ', totalInterval);
                console.log('vehicles', vehicles.length);
                if (vehicles.length <= 0 || totalInterval >= sails.config.MAX_CRON_INTERVAL) {
                    clearInterval(lightOffEachInterval);
                }
                for (let vehicle of vehicles) {
                    let command = 'lightOff';
                    let data = { command: command };
                    try {
                        let response = await IotService.commandToPerform(command, vehicle, data);
                        console.log('response', response);
                    } catch (e) {
                        sails.log.error(`Error while sending lightOff. vehicleId = ${vehicle.id}`, e);
                    }
                }
                totalInterval++;
            }, 1000 * sails.config.CRON_INTERVAL_TIME_IN_MINUTE);

        } catch (e) {
            sails.log.error('Error while running cron dailyLightOff.', e);
        }
    },
    async checkScooterHeartBeatReceived() {
        try {
            let time = UtilService.subtractTime(sails.config.DEFAULT_PING_INTERVAL, null, 'seconds');
            let vehicles = await Vehicle.find({
                connectionStatus: true,
                lastConnectedDateTime: { '<=': time }
            }).populate('manufacturer')
                .meta({ enableExperimentalDeepTargets: true });
            for (let vehicle of vehicles) {
                try {
                    let command = 'track';
                    let data = { command: command };
                    let response = await IotService.commandToPerform(command, vehicle, data);
                    console.log('response', response);
                } catch (e) {
                    sails.log.error('Error while getting location.', e);
                }
            }
        } catch (e) {
            sails.log.error('Error while running cron removeDailyMonthlyBookingPass.', e);
        }
    },
    async saveLocationDataOfVehicle() {
        // Save last Location track data of each vehicle
        try {
            await Vehicle.find({})
            .select(['nestId', 'imei', 'name', 'registerId']).populate('nestId', {select: ['zoneId']})
            .then(async res =>{
               await Promise.all(res.map(async(vehicle)=>{
                    let zoneName = vehicle.nestId && await Zone.find({id: vehicle.nestId.zoneId}).select(['name'])
                    let currentLocation = await IOTCallbackLocationTrack
                    .find({'data.imei': vehicle.imei})
                    .sort('createdAt DESC')
                    .limit(1)
                    .meta({ enableExperimentalDeepTargets: true });
                    console.log("vehicle.imei",vehicle.imei,currentLocation)
                    await IOTCallbackLocationData.create({
                            imei: vehicle.imei,
                            vehicleName: `${vehicle.name} -${vehicle.registerId}`,
                            zoneName: zoneName && zoneName[0] && zoneName[0].name || "",
                            data: currentLocation[0] && (currentLocation[0].data || {})
                    })
                }))
            })    
       
        } catch (error) {
            sails.log.error('Error while saving the location.', error);
        }
    },
    async destroyLocationDataAfter2Days() {
        let deleteTime = UtilService.subtractTime(1, null, 'days');
        let filter = { createdAt: { '<': deleteTime } };
        await IOTCallbackLocationData.destroy(filter)
    },
    async sendExcelReport() {
        try {
            var timezone = sails.config.DEFAULT_TIME_ZONE;
            let startTime = moment.tz(timezone).subtract('1', 'day').startOf('day').utc().toISOString();
            let endTime = moment.tz(timezone).startOf('day').utc().toISOString();
            console.log('start end time---- :>> ', startTime, endTime);

            let option = {
                startTime: startTime,
                endTime: endTime
            }

            await ExcelReportService.sendExcelReport(option, true);

        } catch (error) {
            sails.log.error('Error while running cron sendExcelReport.', error);
        }
    },

    async endRideAfterSpecificTime() {
        try {
            let expiryDate = UtilService.subtractTime(sails.config.END_RIDE_AFTER_SPECIFIC_TIME);
            let currentTime = UtilService.getTimeFromNow();

            let vehicles = await Vehicle.find({
                isRideCompleted: false,
                lastLocationChanged: { "<=": expiryDate },
            });

            if (vehicles && vehicles.length > 0) {
                let vehicleIds = _.map(vehicles, 'id');
                let rides = await RideBooking.find({
                    vehicleId: vehicleIds,
                    status: sails.config.RIDE_STATUS.ON_GOING,
                    isPaused: false,
                });

                for (let ride of rides) {
                    if (!ride) {
                        continue;
                    }
                    let timeToCheck = ride.startDateTime;
                    if (ride.stopOverTrack && ride.stopOverTrack.length > 0) {
                        let lastStopOverTrack = ride.stopOverTrack[ride.stopOverTrack.length - 1];
                        if (lastStopOverTrack.resumeTime) {
                            timeToCheck = lastStopOverTrack.resumeTime;
                        }
                    }

                    let startTime = UtilService.addTime(sails.config.END_RIDE_AFTER_SPECIFIC_TIME, timeToCheck);
                    if (startTime <= currentTime) {
                        try {
                            await RideBookingService.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);
                        } catch (e) {
                            sails.log.error('Error while running cron endRideAfterSpecificTime.', e);
                        }
                    }

                }
            }
        } catch (error) {
            sails.log.error('Error while running cron endRideAfterSpecificTime.', error);
        }
    },

    async endOperationalHoursAction() {
        try {
            let currentTime = moment().toISOString();
            console.log('end operation currentTime----', currentTime, sails.config.OPERATIONAL_HOURS_CLOSE_TIME);

            if (sails.config.OPERATIONAL_HOURS_CLOSE_TIME && sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                let expiredTime = moment(sails.config.OPERATIONAL_HOURS_CLOSE_TIME).diff(currentTime, 'seconds');
                expiredTime = Math.ceil(expiredTime / 60);
                console.log('expiredTime--', expiredTime);
                if (expiredTime == 0) {
                    // send closing hours socketEvent
                    await OperationHoursService.operationalHoursChangeEvent(true);

                    await RideBookingService.stopeRideOnDeActiveVehicle();

                    await Vehicle.update({
                        dealerId: null,
                        franchiseeId: null
                    }, { isActive: false });

                    await OperationHoursService.setOperationalHours();
                }
            }
        } catch (error) {
            sails.log.error('Error while running cron endOperationalHours.', error);
        }
    },

    async startOperationHoursAction() {
        try {
            let currentTime = moment().toISOString();
            console.log('start operation currentTime--', currentTime, sails.config.OPERATIONAL_HOURS_START_TIME);
            if (sails.config.OPERATIONAL_HOURS_START_TIME && sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                let startTime = moment(sails.config.OPERATIONAL_HOURS_START_TIME).diff(currentTime, 'seconds');
                startTime = Math.ceil(startTime / 60);
                console.log('startExpireTime--', startTime);
                if (startTime == 0) {
                    await Vehicle.update({
                        dealerId: null,
                        franchiseeId: null
                    }, { isActive: true });

                    await OperationHoursService.setOperationalHours();
                }
            }
        } catch (error) {
            sails.log.error('Error while running cron startOperationHoursAction.', error);
        }
    },

    async sendOperationalHoursExpireNotification() {
        try {
            let notificationInterval = sails.config.OPERATION_HOURS_NOTIFICATION_INTERVAL;
            let socketEventInterval = sails.config.OPERATION_HOURS_SOCKET_EVENT_INTERVAL;
            let currentTime = moment().toISOString();
            console.log('start operation currentTime--', currentTime, sails.config.OPERATIONAL_HOURS_START_TIME);
            if (sails.config.OPERATIONAL_HOURS_CLOSE_TIME) {
                let expiredTime = moment(sails.config.OPERATIONAL_HOURS_CLOSE_TIME).diff(currentTime, 'seconds');
                expiredTime = Math.ceil(expiredTime / 60);
                if (_.indexOf(notificationInterval, expiredTime) >= 0 || _.indexOf(socketEventInterval, expiredTime) >= 0) {
                    // find ongoing ride
                    let filter = {
                        where: {
                            status: [sails.config.RIDE_STATUS.ON_GOING, sails.config.RIDE_STATUS.RESERVED, sails.config.RIDE_STATUS.UNLOCK_REQUESTED]
                        },
                        select: ['userId']
                    }
                    let rides = await RideBooking.find(filter);
                    for (let ride of rides) {
                        if (_.indexOf(socketEventInterval, expiredTime) >= 0) {
                            let socket = await UtilService.getUserSocket(ride.userId);
                            socket = socket && socket[0];
                            if (socket && socket.socketId) {
                                let resData = await OperationHoursService.operationHoursSocketDataSet();
                                resData.isRemainingAlert = _.indexOf(notificationInterval, expiredTime) >= 0;
                                resData.remainingTime = expiredTime,
                                    await SocketEvents.endTimeOperationalHours(resData, socket);
                            }
                        }
                        if (_.indexOf(notificationInterval, expiredTime) >= 0) {
                            let userData = await UtilService.getNotificationPlayerIds(ride.userId);
                            await NotificationService
                                .sendPushNotification({
                                    playerIds: userData.playerIds,
                                    content: `${expiredTime} minutes left before Operations end. Your ride will end automatically.`,
                                    language: userData.preferredLang
                                });
                        }
                    }
                }
            }
        } catch (error) {
            sails.log.error('Error while running cron sendOperationalHoursExpireNotification.', error);
        }
    },
    async checkTransactionStatus() {
        try {
            const olderThanTenMin = moment().subtract(10, 'minute').toDate().toISOString();
            const pendingTransactions = await TransactionLog.find({
                status: sails.config.STRIPE.STATUS.pending,
                createdAt: { '<=': olderThanTenMin}
            });
            console.log(`checking status of ${pendingTransactions.length} transactions`);
            for(const trx of pendingTransactions) {
                console.log('checking status for:', trx.noqoodyReferenceId)
                const result = await MPGSPaymentService.checkPaymentStatus(trx.noqoodyReferenceId)
                await MPGSPaymentService.validatePayment(trx.noqoodyReferenceId, result)
            }
        } catch (error) {
            console.error(error)
            sails.log.error('Error while running cron checkTransactionStatus.', error);
    }
    },
    async expiringWalletOfUser(userId) {
        try {
            let startTime = moment().subtract({ 'minutes': 1 }).toISOString();
            let currentTime = moment().toISOString();
            let filter = { type: sails.config.USER.TYPE.CUSTOMER };
            if (!userId) {
                filter.walletExpiryDate = { '>=': startTime, '<=': currentTime }
            } else {
                filter.id = userId;
            }
            let users = await User.find(filter);
            // let walletExpiredTime = sails.config.WALLET_EXPIRED_TIME;
            if (users && users.length > 0) {
                await Promise.all(_.map(users, async (v, k) => {
                    let onGoingRides = await RideBooking.find({ userId: v.id, status: sails.config.RIDE_STATUS.ON_GOING })
                    if (onGoingRides && onGoingRides.length > 0 && onGoingRides[0].id) {
                        // console.log("FOR TRUE FLAG ONGOING RIDE");
                        await RideBooking.update({ id: onGoingRides[0].id }, { isWalletExpiredAtStop: true });
                    } else {
                        // console.log("FOR EXPIRED WALLET");
                        let historyObj = {
                            walletExpiredTime: '',
                            walletAmount: v.walletAmount,
                            datetime: moment().toISOString()
                        }
                        if (!v.walletExpiredHistory || _.size(v.walletExpiredHistory) === 0) {
                            v.walletExpiredHistory = [];
                        }
                        v.walletExpiredHistory.push(historyObj);
                        await User.update({ id: v.id }, { walletExpiryDate: '', walletExpiredHistory: v.walletExpiredHistory, walletAmount: 0 });
                        if (v.walletAmount) {
                            let transactionLog = {
                                chargeType: sails.config.TRANSACTION_LOG.STATUS.WALLET_DEBIT,
                                type: sails.config.STRIPE.TRANSACTION_TYPE.DEBIT,
                                status: sails.config.STRIPE.STATUS.succeeded,
                                amount: v.walletAmount,
                                transactionBy: v.id,
                                remark: sails.config.WALLET_EXPIRED,
                                isWalletTransaction: true
                            }
                            await TransactionLog.create(transactionLog);

                            let mobile = v.mobiles ? v.mobiles[0].countryCode + v.mobiles[0].mobile : '';
                            let email = v.emails ? v.emails[0].email : '';
                            // send SMS
                            if (mobile) {
                                await SMSService.send({
                                    message: `Dear ${v.name},
                                Your wallet has expired on ${moment(v.walletExpiryDate).startOf('day')} at ${moment(v.walletExpiryDate).format("hh:mm:ss a")}.
                                Your wallet balance is 0.00 QR\n\n
                                Regards,\n\n
                                Team Falcon.`,
                                    mobiles: mobile,
                                });
                            }

                            // Send Push Notifications
                            let playerIds = [];
                            if (v.androidPlayerId) {
                                playerIds = playerIds.concat(v.androidPlayerId);
                            }
                            if (v.iosPlayerId) {
                                playerIds = playerIds.concat(v.iosPlayerId);
                            }
                            if (playerIds.length > 0) {
                                await NotificationService
                                    .sendPushNotification({
                                        playerIds: playerIds,
                                        content: `Your wallet has expired. Your wallet balance is 0.00 QR`,
                                        title: `Wallet Expiry Message - Dear ${v.name},`
                                    });
                            }
                            // send Email if user has email
                            if (email) {
                                let mail_obj = {
                                    subject: `Your Wallet balance with Falcon has expired.`,
                                    to: email,
                                    template: "notificationEmail",
                                    name: v.name,
                                    data: {
                                        content: `Dear Rider,\n\n
                                    Your wallet has expired on ${moment(v.walletExpiryDate).startOf('day')} at ${moment(v.walletExpiryDate).format("hh:mm:ss a")}. 
                                    Your wallet balance is 0.00 QR\n\n
                                    Regards,\n\n
                                    Team Falcon`,
                                    },
                                };
                                await EmailService.send(mail_obj);
                            }
                        }
                    }
                }));
            }

        } catch (error) {
            console.log(error)
            throw new Error(error)
        }

    },
    async sendMessageBeforeExpireWallet() {

        let dateAfter30days = moment().add(30, "days").startOf("day").toISOString();
        let dateAfter15days = moment().add(15, "days").startOf("day").toISOString();
        let dateAfter7days = moment().add(7, "days").startOf("day").toISOString();
        let today = moment().add(1, "days").startOf("day").toISOString();

        let users = User.find({
            type: sails.config.USER.TYPE.CUSTOMER,
            // walletExpiryDate = { '>=': startTime, '<=': dateAfter30days },
            select: ["firstName", "name", "emails", "mobiles", "walletExpiryDate"]
        })
        await Promise.all(_.map(users, async (v, k) => {
            let mobile = v.mobiles[0].countryCode + v.mobiles[0].mobile;
            let email = v.emails[0] ? v.emails[0].email : '';

            if (v.walletExpiryDate) {
                let walletExpiryDate = moment(v.walletExpiryDate).startOf("day").toISOString();
                let daysMessageString = '';
                if (walletExpiryDate == dateAfter30days) {
                    daysMessageString = 'in 30 days';
                } else if (walletExpiryDate == dateAfter15days) {
                    daysMessageString = 'in 15 days';
                } else if (walletExpiryDate == dateAfter7days) {
                    daysMessageString = 'in 7 days';
                } else if (walletExpiryDate == today) {
                    daysMessageString = 'tomorrow at' + moment(v.walletExpiryDate).format("hh:mm:ss a");
                }
                if (daysMessageString) {
                    // send SMS
                    await SMSService.send({
                        message: `Dear ${v.name},\n\nYour wallet is expires ${daysMessageString}.
                        Please use the balance before it expires.\n\n
                        Regards,\n\n
                        Team Falcon.`,
                        mobiles: mobile,
                    });

                    // Send Push Notifications
                    let playerIds = [];
                    if (v.androidPlayerId) {
                        playerIds = playerIds.concat(v.androidPlayerId);
                    }
                    if (v.iosPlayerId) {
                        playerIds = playerIds.concat(v.iosPlayerId);
                    }
                    if (playerIds.length > 0) {
                        await NotificationService
                            .sendPushNotification({
                                playerIds: playerIds,
                                content: `Your wallet is expires ${daysMessageString}.
                                      Please use the balance before it expires.\n\n`,
                                title: `Wallet Expiry Message - Dear ${v.name},`
                            });
                    }
                    // send Email if user has email
                    if (email) {
                        let mail_obj = {
                            subject: `Your Wallet balance with Falcon expires ${daysMessageString.includes('tomorrow') ? 'tomorrow' : daysMessageString}`,
                            to: email,
                            template: "notificationEmail",
                            name: v.name,
                            data: {
                                content: `Dear ${v.name},\n\nYour wallet is expires ${daysMessageString}.
                                Please use the balance before it expires.\n\n
                                Regards,\n\n
                                Team Falcon.`,
                            },
                        };
                        await EmailService.send(mail_obj);
                    }
                }

            }
        }));
    }
};

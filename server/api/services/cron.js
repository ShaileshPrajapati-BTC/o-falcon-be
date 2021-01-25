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
const operationHoursService = require(`./operationalHours`);
const RedisDBService = require('./redisDB');

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
                vehicleType: { '!=': sails.config.VEHICLE_TYPE.BICYCLE },
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
            let endRideMinSecondDifference = 2;
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
            const self = this;
            for (let ride of rides) {
                let timeDiff = UtilService.getTimeDifference(currentTime, ride.maxRideTime, 'seconds');
                console.log('ride stopped endRideAfterMaxRideTime', ride.id, timeDiff);
                if (timeDiff <= endRideMinSecondDifference) {
                    await RideBookingService.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);
                } else {
                    timeDiff -= endRideMinSecondDifference;
                    self[`rideEnd${ride.id}`] = setInterval(async () => {
                        // console.log('before typeof interval', typeof self[`rideEnd${ride.id}`], self[`rideEnd${ride.id}`]);
                        await RideBookingService.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);
                        await clearInterval(self[`rideEnd${ride.id}`]);
                        // console.log('after typeof interval', typeof self[`rideEnd${ride.id}`], self[`rideEnd${ride.id}`]);
                        self[`rideEnd${ride.id}`] = null;
                        // console.log('after typeof interval', typeof self[`rideEnd${ride.id}`], self[`rideEnd${ride.id}`]);
                    }, 1000 * timeDiff);
                }
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
        if (sails.config.DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.NOQOODY) {
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
                        console.log('vehicle Task is already created-----------------', vehicleTask);
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
                                    taskType: sails.config.TASK.TASK_TYPE.LEVEL_2.MOVE,
                                    taskHeading: sails.config.TASK.TASK_HEADING.MOVE[1],
                                    timeLimitType: sails.config.TASK_SETTING.moveTask.timeLimitType,
                                    timeLimitValue: sails.config.TASK_SETTING.moveTask.timeLimitValue,
                                    incentiveRange: sails.config.TASK_SETTING.moveTask.incentiveRange,
                                    taskWorkFlow: sails.config.TASK.WORK_FLOW.OPEN,
                                    module: sails.config.modules.vehicle,
                                    referenceId: vehicle.id,
                                    nestId: nest[0].id,
                                    statusTrack: newStatus,
                                    isSystemCreated: true
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
                        referenceId: vehicle.referenceId,
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
                                isSystemCreated: true
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
                limitType: sails.config.BOOKING_PASS_EXPIRATION_TYPES.HOUR,
                expirationStartDateTime: { '>=': startDayTime },
                expirationEndDateTime: { '<=': currentTime }
            }).meta({ enableExperimentalDeepTargets: true });
            await BookingPassService.removeCurrentBookingPass(planInvoices);
        } catch (e) {
            sails.log.error('Error while running cron removeHourlyBookingPass.', e);
        }
    },
    async removeDailyMonthlyBookingPass() {
        try {
            let currentTime = moment().toISOString();
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

    async sendExcelReport() {
        try {
            var timezone = 'Asia/Qatar';
            let startTime = moment.tz(timezone).subtract('1', 'day').startOf('day').utc().toISOString();
            let endTime = moment.tz(timezone).startOf('day').utc().toISOString();
            console.log('start end time---- :>> ', startTime, endTime);
            let filter = {
                // remove limit first
                createdAt: {
                    '>=': startTime,
                    '<=': endTime
                }
            };
            console.log('filter', filter);
            let rideFilter = JSON.parse(JSON.stringify(filter));
            rideFilter.status = { '!=': sails.config.RIDE_STATUS.UNLOCK_REQUESTED };
            let utilizationReportList = await RideBooking.find(rideFilter)
                .select(['userId', 'vehicleId', 'createdAt', 'startDateTime', 'endDateTime', 'rideNumber', 'totalTime', 'totalKm', 'totalFare', 'fareSummary', 'status', 'rideType'])
                .populate('userId', { select: ['name', 'emails', 'mobiles', 'firstName', 'lastName'] })
                .populate('vehicleId', { select: ['name', 'registerId'] })
                .populate('zoneId', { select: ['name'] })
                .populate('planInvoiceId', { select: ['planName'] })
                .meta({ enableExperimentalDeepTargets: true })
                .sort('rideNumber asc')
            console.log('utilizationReportList.length :>> ', utilizationReportList.length);
            let utilizationReportData = [];
            let utilizationReportDataTotal = {
                date: 'Total',
                vehicleId: '',
                riderName: '',
                mobile: '',
                email: '',
                zoneName: '',
                rideNumber: 0,
                startTime: '',
                endTime: '',
                totalFare: 0,
                rideFare: 0,
                totalKm: 0,
                totalTime: 0,
                bookingPass: '',
                totalCost: 0,
                status: '',
                unlockFees: 0,
                pausedTime: '',
                pausedCharge: 0,
                reservedTime: '',
                reservedCharge: 0,
                cancelledCharge: 0
            };

            // let currencySymbol = sails.config.CURRENCY_SYM;
            if (utilizationReportList.length > 0) {
                for (let record of utilizationReportList) {
                    let obj = {};
                    obj.date = record.createdAt ? moment(record.createdAt).tz(timezone).format(`DD/MM/YYYY`) : '-';
                    obj.vehicleId = `${record.vehicleId.name} - (${record.vehicleId.registerId})`;

                    let userId = record.userId;
                    obj.riderName = userId.name;
                    if (!obj.riderName && userId.firstName) {
                        obj.riderName = `${userId.firstName} ${userId.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (userId && userId.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(userId.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(userId.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (userId && userId.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(userId.emails);
                        obj.email = primaryEmail;
                    }

                    obj.zoneName = record.zoneId.name;
                    obj.rideNumber = record.rideNumber;

                    obj.startTime = record.startDateTime ? moment(record.startDateTime).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`) : '-';
                    obj.endTime = record.startDateTime && record.endDateTime ? moment(record.endDateTime).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`) : '-';

                    // ?
                    // ?
                    obj.totalKm = record.totalKm;
                    obj.totalTime = record.totalTime ? moment.utc(record.totalTime * 1000).format('HH:mm:ss') : '-';
                    utilizationReportDataTotal.totalTime += record.totalTime;
                    obj.bookingPass = '-';
                    // console.log('record.planInvoiceId', record.planInvoiceId, record.type);
                    if (record.rideType === sails.config.RIDE_TYPE.BOOKING_PASS) {
                        obj.bookingPass = record.planInvoiceId && record.planInvoiceId.planName;
                    }
                    obj.totalCost = record.totalFare;
                    obj.status = record.status && sails.config.STATUS_OF_RIDE[record.status] ? sails.config.STATUS_OF_RIDE[record.status] : "-";
                    if (record.fareSummary) {
                        obj.rideFare = record.fareSummary.time ? record.fareSummary.time : 0;
                        obj.rideFare += record.fareSummary.distance || 0;
                        obj.totalFare = record.fareSummary.subTotal ? record.fareSummary.subTotal : 0; // ?
                        obj.unlockFees = record.fareSummary.unlockFees ? record.fareSummary.unlockFees : 0;
                        obj.pausedTime = record.fareSummary.pausedTime ? moment.utc(record.fareSummary.pausedTime * 1000).format('HH:mm:ss') : '-';
                        obj.pausedCharge = record.fareSummary.paused ? record.fareSummary.paused : 0;
                        obj.reservedTime = record.fareSummary.reservedTime ? moment.utc(record.fareSummary.reservedTime * 1000).format('HH:mm:ss') : '-';
                        obj.reservedCharge = record.fareSummary.reserved ? record.fareSummary.reserved : 0;
                        obj.cancelledCharge = record.fareSummary.cancelled ? record.fareSummary.cancelled : 0;
                    } else {
                        obj.totalFare = 0;
                        obj.rideFare = 0;
                        obj.unlockFees = 0;
                        obj.pausedTime = '-';
                        obj.pausedCharge = 0;
                        obj.reservedTime = '-';
                        obj.reservedCharge = 0;
                        obj.cancelledCharge = 0;
                    }
                    utilizationReportDataTotal.rideNumber += 1;
                    utilizationReportDataTotal.totalFare += obj.totalFare;
                    utilizationReportDataTotal.rideFare += obj.rideFare;
                    utilizationReportDataTotal.totalKm += obj.totalKm;
                    utilizationReportDataTotal.totalCost += obj.totalCost;
                    utilizationReportDataTotal.unlockFees += obj.unlockFees;
                    utilizationReportDataTotal.pausedCharge += obj.pausedCharge;
                    utilizationReportDataTotal.reservedCharge += obj.reservedCharge;
                    utilizationReportDataTotal.cancelledCharge += obj.cancelledCharge;
                    utilizationReportData.push(obj);
                }
            }
            utilizationReportDataTotal.totalFare = UtilService.getFloat(utilizationReportDataTotal.totalFare);
            utilizationReportDataTotal.rideFare = UtilService.getFloat(utilizationReportDataTotal.rideFare);
            utilizationReportDataTotal.totalKm = UtilService.getFloat(utilizationReportDataTotal.totalKm);
            utilizationReportDataTotal.totalCost = UtilService.getFloat(utilizationReportDataTotal.totalCost);
            utilizationReportDataTotal.unlockFees = UtilService.getFloat(utilizationReportDataTotal.unlockFees);
            utilizationReportDataTotal.pausedCharge = UtilService.getFloat(utilizationReportDataTotal.pausedCharge);
            utilizationReportDataTotal.reservedCharge = UtilService.getFloat(utilizationReportDataTotal.reservedCharge);
            utilizationReportDataTotal.cancelledCharge = UtilService.getFloat(utilizationReportDataTotal.cancelledCharge);

            // console.log('utilizationReportDataTotal.totalTime', utilizationReportDataTotal.totalTime);
            // console.log('typeof utilizationReportDataTotal.totalTime', typeof utilizationReportDataTotal.totalTime);
            // console.log('moment.utc ', moment.utc(utilizationReportDataTotal.totalTime * 1000).format('HH:mm:ss'));

            utilizationReportDataTotal.totalTime = utilizationReportDataTotal.totalTime ? moment.utc(utilizationReportDataTotal.totalTime * 1000).format('HH:mm:ss') : '-';
            utilizationReportData.push(utilizationReportDataTotal);

            let walletActivityList = await TransactionLog.find(filter)
                .select(['remark', 'amount', 'status', 'chargeType', 'createdAt', 'noqoodyReferenceId', 'rideId', 'transactionBy', 'type'])
                .populate('transactionBy', { select: ['name', 'emails', 'mobiles', 'walletAmount', 'firstName', 'lastName'] })
                .populate('rideId', { select: ['rideNumber', 'fareSummary', 'totalFare'] })
                .meta({ enableExperimentalDeepTargets: true })
            console.log('walletActivityList.length :>> ', walletActivityList.length);
            let walletActivityData = [];
            let walletActivityDataTotal = {
                date: 'Total',
                topUpAmount: 0,
                bonusTopUp: 0,
                discount: 0,
                rideFare: 0,
                expiredAmt: 0,
                reservedCharge: 0,
                tax: 0,
                unlockFees: 0,
                pausedCharge: 0,
                cancelledCharge: 0
            }
            if (walletActivityList.length > 0) {
                let userBalances = {};
                for (let record of walletActivityList) {
                    let tmpUserId = record.transactionBy && record.transactionBy.id;
                    if (!tmpUserId) {
                        continue;
                    }
                    if (userBalances[tmpUserId] === undefined) {
                        userBalances[tmpUserId] = record.transactionBy.walletAmount;
                    }
                    if (record.status !== sails.config.STRIPE.STATUS.succeeded) {
                        continue;
                    }
                    if (record.type === sails.config.STRIPE.TRANSACTION_TYPE.DEBIT) {
                        userBalances[tmpUserId] += record.amount;
                    } else if (record.type === sails.config.STRIPE.TRANSACTION_TYPE.CREDIT) {
                        userBalances[tmpUserId] -= record.amount;
                    }
                }
                for (let record of walletActivityList) {
                    if (!record.transactionBy || !record.transactionBy.id) {
                        continue;
                    }
                    let obj = {};
                    obj.date = record.createdAt ? moment(record.createdAt).tz(timezone).format(`DD/MM/YYYY`) : '-';

                    let transactionBy = record.transactionBy;
                    obj.riderName = transactionBy.name;
                    if (!obj.riderName && transactionBy.firstName) {
                        obj.riderName = `${transactionBy.firstName} ${transactionBy.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (transactionBy && transactionBy.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(transactionBy.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(transactionBy.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (transactionBy && transactionBy.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(transactionBy.emails);
                        obj.email = primaryEmail;
                    }
                    /////
                    obj.walletOpBalance = Number(parseFloat(userBalances[record.transactionBy.id]).toFixed(2)); //e divas start thayo tyare balance su hatu
                    obj.topUpAmount = '-'; //ketla nu recharge karavyu
                    obj.bonusTopUp = '-';     //system e ketla credit aapya
                    obj.discount = '-'; //discount koi aapelo money add karti vakhte
                    obj.expiredAmt = '-';     //puchi ne kau
                    obj.walletClBalance = Number(parseFloat(record.transactionBy.walletAmount).toFixed(2));    //e divas na end par wallet ma balance su hatu
                    obj.rideFare = '-';
                    obj.rideNumber = '-';
                    obj.reservedCharge = 0;
                    obj.tax = 0;
                    obj.unlockFees = 0;
                    obj.pausedCharge = 0;
                    obj.cancelledCharge = 0;
                    let rideId = record.rideId;
                    if (rideId) {
                        obj.rideNumber = rideId.rideNumber;
                        obj.rideFare = rideId.totalFare;
                        if (rideId.fareSummary) {
                            obj.reservedCharge = rideId.fareSummary.reserved ? rideId.fareSummary.reserved : 0;
                            obj.tax = rideId.fareSummary.tax ? rideId.fareSummary.tax : 0;
                            obj.unlockFees = rideId.fareSummary.unlockFees ? rideId.fareSummary.unlockFees : 0;
                            obj.pausedCharge = rideId.fareSummary.paused ? rideId.fareSummary.paused : 0;
                            obj.cancelledCharge = rideId.fareSummary.cancelled ? rideId.fareSummary.cancelled : 0;
                        }
                    } else {
                        obj.topUpAmount = record.amount;
                        obj.bonusTopUp = ` ${record.bonusAmount || 0}`;
                    }

                    obj.description = record.remark;
                    obj.referenceId = record.noqoodyReferenceId || '-';
                    obj.chargeType = sails.config.TRANSACTION_STATUS[record.chargeType] ? sails.config.TRANSACTION_STATUS[record.chargeType] : '-';
                    obj.status = sails.config.STRIPE.STRIPE_STATUS[record.status] ? sails.config.STRIPE.STRIPE_STATUS[record.status] : '-';

                    walletActivityData.push(obj);
                    if (Number(obj.topUpAmount)) {
                        walletActivityDataTotal.topUpAmount += Number(obj.topUpAmount);
                    }
                    if (Number(obj.bonusTopUp)) {
                        walletActivityDataTotal.bonusTopUp += Number(obj.bonusTopUp);
                    }
                    if (Number(obj.discount)) {
                        walletActivityDataTotal.discount += Number(obj.discount);
                    }
                    if (Number(obj.rideFare)) {
                        walletActivityDataTotal.rideFare += Number(obj.rideFare);
                    }
                    if (Number(obj.expiredAmt)) {
                        walletActivityDataTotal.expiredAmt += Number(obj.expiredAmt);
                    }
                    if (Number(obj.reservedCharge)) {
                        walletActivityDataTotal.reservedCharge += Number(obj.reservedCharge);
                    }
                    if (Number(obj.tax)) {
                        walletActivityDataTotal.tax += Number(obj.tax);
                    }
                    if (Number(obj.unlockFees)) {
                        walletActivityDataTotal.unlockFees += Number(obj.unlockFees);
                    }
                    if (Number(obj.pausedCharge)) {
                        walletActivityDataTotal.pausedCharge += Number(obj.pausedCharge);
                    }
                    if (Number(obj.cancelledCharge)) {
                        walletActivityDataTotal.cancelledCharge += Number(obj.cancelledCharge);
                    }
                }
            }
            walletActivityDataTotal.topUpAmount = UtilService.getFloat(walletActivityDataTotal.topUpAmount);
            walletActivityDataTotal.bonusTopUp = UtilService.getFloat(walletActivityDataTotal.bonusTopUp);
            walletActivityDataTotal.discount = UtilService.getFloat(walletActivityDataTotal.discount);
            walletActivityDataTotal.rideFare = UtilService.getFloat(walletActivityDataTotal.rideFare);
            walletActivityDataTotal.expiredAmt = UtilService.getFloat(walletActivityDataTotal.expiredAmt);
            walletActivityDataTotal.reservedCharge = UtilService.getFloat(walletActivityDataTotal.reservedCharge);
            walletActivityDataTotal.tax = UtilService.getFloat(walletActivityDataTotal.tax);
            walletActivityDataTotal.unlockFees = UtilService.getFloat(walletActivityDataTotal.unlockFees);
            walletActivityDataTotal.pausedCharge = UtilService.getFloat(walletActivityDataTotal.pausedCharge);
            walletActivityDataTotal.cancelledCharge = UtilService.getFloat(walletActivityDataTotal.cancelledCharge);

            walletActivityData.push(walletActivityDataTotal);
            let topUpFilter = JSON.parse(JSON.stringify(filter));
            topUpFilter.type = sails.config.STRIPE.TRANSACTION_TYPE.CREDIT;
            topUpFilter.status = sails.config.STRIPE.STATUS.succeeded;
            topUpFilter.noqoodyReferenceId = { '!=': '' };

            let walletTopUpList = await TransactionLog.find(topUpFilter)
                .select(['remark', 'amount', 'status', 'chargeType', 'createdAt', 'noqoodyReferenceId', 'rideId', 'transactionBy'])
                .populate('transactionBy', { select: ['name', 'emails', 'mobiles', 'walletAmount', 'firstName', 'lastName'] })
                .meta({ enableExperimentalDeepTargets: true })
            console.log('walletTopUpList.length :>> ', walletTopUpList.length);
            let walletTopUpData = [];
            let walletTopUpListTotal = {
                riderName: 'Total',
                topUpAmount: 0
            };
            if (walletTopUpList.length > 0) {
                for (let record of walletTopUpList) {
                    if (!record.transactionBy || !record.transactionBy.id) {
                        continue;
                    }
                    let obj = {};
                    let transactionBy = record.transactionBy;
                    obj.riderName = transactionBy.name;
                    if (!obj.riderName && transactionBy.firstName) {
                        obj.riderName = `${transactionBy.firstName} ${transactionBy.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (transactionBy && transactionBy.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(transactionBy.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(transactionBy.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (transactionBy && transactionBy.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(transactionBy.emails);
                        obj.email = primaryEmail;
                    }
                    obj.date = record.createdAt ? moment(record.createdAt).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`) : '-';
                    /////
                    obj.topUpAmount = record.amount; //ketla nu recharge karavyu
                    // obj.bonusTopUp = '-';     //system e ketla credit aapya

                    obj.referenceId = record.noqoodyReferenceId || '-';
                    obj.receiptNo = record.paymentTransactionId;
                    obj.paymentMethod = 'NOQOODY';
                    obj.chargeType = sails.config.TRANSACTION_STATUS[record.chargeType] ? sails.config.TRANSACTION_STATUS[record.chargeType] : '-';
                    obj.status = sails.config.STRIPE.STRIPE_STATUS[record.status] ? sails.config.STRIPE.STRIPE_STATUS[record.status] : '-';

                    walletTopUpData.push(obj);
                    if (Number(obj.topUpAmount)) {
                        walletTopUpListTotal.topUpAmount += Number(obj.topUpAmount);
                    }
                }
            }
            walletTopUpListTotal.topUpAmount = UtilService.getFloat(walletTopUpListTotal.topUpAmount);
            walletTopUpData.push(walletTopUpListTotal);

            let riderFilter = {
                type: sails.config.USER.TYPE.CUSTOMER,
                // isGuestUser: false
            };

            let query = [
                { $sort: { transactionBy: 1, createdAt: 1 } },
                {
                    $group:
                    {
                        _id: "$transactionBy",
                        date: { $last: "$createdAt" }
                    }
                }
            ];

            let lastActivityData = await common.runAggregateQuery(query, 'transactionlog');
            let lastActivityDataObj = {};
            for (let lastActivity of lastActivityData) {
                lastActivityDataObj[lastActivity._id.toString()] = moment(lastActivity.date).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`);
            }

            let ridersList = await User.find(riderFilter)
                .select(['name', 'emails', 'mobiles', 'walletAmount', 'createdAt', 'firstName', 'lastName'])
                .meta({ enableExperimentalDeepTargets: true })
            console.log('walletActivityList.length :>> ', walletActivityList.length);
            let ridersData = [];
            let ridersDataTotal = {
                riderName: 'Total',
                walletAmount: 0
            };

            if (ridersList.length > 0) {
                for (let record of ridersList) {
                    let obj = {};

                    obj.riderName = record.name;
                    if (!obj.riderName && record.firstName) {
                        obj.riderName = `${record.firstName} ${record.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (record && record.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(record.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(record.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (record && record.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(record.emails);
                        obj.email = primaryEmail;
                    }
                    obj.walletAmount = Number(parseFloat(record.walletAmount).toFixed(2));;
                    obj.date = record.createdAt ? moment(record.createdAt).tz(timezone).format(`DD/MM/YYYY`) : '-';

                    /////////// find Last Transcation
                    obj.lastActivityDate = '-';
                    if (lastActivityDataObj[record.id]) {
                        obj.lastActivityDate = lastActivityDataObj[record.id];
                    }

                    ridersData.push(obj);
                    if (Number(obj.walletAmount)) {
                        ridersDataTotal.walletAmount += Number(obj.walletAmount);
                    }
                }
            }
            ridersData.push(ridersDataTotal);

            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const utilizationReportSheet = workbook.addWorksheet('Utilization Report');
            utilizationReportSheet.mergeCells('A1', 'B1');
            utilizationReportSheet.getCell('A1').value = 'Utilization Revenue Report';
            utilizationReportSheet.getCell('A3').value = 'Start Date & Time:';
            utilizationReportSheet.getCell('B3').value = moment(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            utilizationReportSheet.getCell('A4').value = 'End Date & Time:';
            utilizationReportSheet.getCell('B4').value = moment(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            utilizationReportSheet.getRow(6).values = ['Date', 'E-Scooter / Vehicle ID', 'Rider Name', 'Mobile', 'Email', 'Zone Name', 'Ride Number', 'Trip Start Date & Time', 'Trip End Date & Time', 'Total Fare', 'Ride Fare',
                'Total KM', 'Trip Time', 'Booking Pass Type', 'Total Cost', 'Status', 'Unlock Fees', 'Paused Time', 'Paused Charge', 'Reserved Time', 'Reserved Charge', 'Cancelled Charge'];

            utilizationReportSheet.columns = [
                { key: 'date', width: 15 },
                { key: 'vehicleId', width: 30 },
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'zoneName', width: 20, outlineLevel: 1 },
                { key: 'rideNumber', width: 20, outlineLevel: 1 },
                { key: 'startTime', width: 20, outlineLevel: 1 },
                { key: 'endTime', width: 20, outlineLevel: 1 },
                { key: 'totalFare', width: 10, outlineLevel: 1 },
                { key: 'rideFare', width: 10, outlineLevel: 1 },
                { key: 'totalKm', width: 10, outlineLevel: 1 },
                { key: 'totalTime', width: 10, outlineLevel: 1 },
                { key: 'bookingPass', width: 15, outlineLevel: 1 },
                { key: 'totalCost', width: 15, outlineLevel: 1 },
                { key: 'status', width: 15, outlineLevel: 1 },
                { key: 'unlockFees', width: 15, outlineLevel: 1 },
                { key: 'pausedTime', width: 15, outlineLevel: 1 },
                { key: 'pausedCharge', width: 15, outlineLevel: 1 },
                { key: 'reservedTime', width: 15, outlineLevel: 1 },
                { key: 'reservedCharge', width: 15, outlineLevel: 1 },
                { key: 'cancelledCharge', width: 15, outlineLevel: 1 },
            ];
            utilizationReportSheet.addRows(utilizationReportData);
            // utilizationReportSheet.getRow(utilizationReportSheet.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            utilizationReportSheet.getRow(utilizationReportSheet.rowCount).font = {
                bold: true
            };

            const walletActivitySheet = workbook.addWorksheet('Wallet Activity');
            walletActivitySheet.mergeCells('A1', 'B1');
            walletActivitySheet.getCell('A1').value = 'Wallet Transactions Report';
            walletActivitySheet.getCell('A3').value = 'Start Date & Time:';
            walletActivitySheet.getCell('B3').value = moment(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            walletActivitySheet.getCell('A4').value = 'End Date & Time:';
            walletActivitySheet.getCell('B4').value = moment(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            walletActivitySheet.getRow(6).values = ['Date', 'Rider Name', 'Mobile', 'Email', 'Wallet Op.Balance',
                'Top-Up Amount', 'Bonus Top-Up', 'Discount', 'Ride Fare', 'Expired Amt', 'Wallet Cl.Balance', 'Ride Number', 'Description',
                'Payment gateway Ref. No.', 'ChargeType', 'Status', 'Reserved Charge', 'Tax', 'UnlockFees', 'Paused Charge', 'Cancelled Charge'];

            walletActivitySheet.columns = [
                { key: 'date', width: 15 },
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'walletOpBalance', width: 20, outlineLevel: 1 },
                { key: 'topUpAmount', width: 20, outlineLevel: 1 },
                { key: 'bonusTopUp', width: 20, outlineLevel: 1 },
                { key: 'discount', width: 20, outlineLevel: 1 },
                { key: 'rideFare', width: 10, outlineLevel: 1 },
                { key: 'expiredAmt', width: 10, outlineLevel: 1 },
                { key: 'walletClBalance', width: 10, outlineLevel: 1 },
                { key: 'rideNumber', width: 15, outlineLevel: 1 },
                { key: 'description', width: 15, outlineLevel: 1 },
                { key: 'referenceId', width: 15, outlineLevel: 1 },
                { key: 'chargeType', width: 15, outlineLevel: 1 },
                { key: 'status', width: 15, outlineLevel: 1 },
                { key: 'reservedCharge', width: 15, outlineLevel: 1 },
                { key: 'tax', width: 15, outlineLevel: 1 },
                { key: 'unlockFees', width: 15, outlineLevel: 1 },
                { key: 'pausedCharge', width: 15, outlineLevel: 1 },
                { key: 'cancelledCharge', width: 15, outlineLevel: 1 },
            ];

            walletActivitySheet.addRows(walletActivityData);
            // walletActivitySheet.getRow(walletActivitySheet.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            walletActivitySheet.getRow(walletActivitySheet.rowCount).font = {
                bold: true
            };

            const walletTopUp = workbook.addWorksheet('Wallet Top-up');
            walletTopUp.mergeCells('A1', 'B1');
            walletTopUp.getCell('A1').value = 'Wallet Top-Up Report';
            walletTopUp.getCell('A3').value = 'Start Date & Time:';
            walletTopUp.getCell('B3').value = moment(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            walletTopUp.getCell('A4').value = 'End Date & Time:';
            walletTopUp.getCell('B4').value = moment(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            walletTopUp.getRow(6).values = ['Rider Name', 'Mobile', 'Email', 'Date & Time Top Up',
                'Top-Up Amount', 'Payment gateway Ref. No.', 'Receipt No', 'Payment Method', 'ChargeType', 'Status'];

            walletTopUp.columns = [
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'date', width: 15 },
                { key: 'topUpAmount', width: 20, outlineLevel: 1 },
                { key: 'referenceId', width: 15, outlineLevel: 1 },
                { key: 'receiptNo', width: 15, outlineLevel: 1 },
                { key: 'paymentMethod', width: 15, outlineLevel: 1 },
                { key: 'chargeType', width: 15, outlineLevel: 1 },
                { key: 'status', width: 15, outlineLevel: 1 },
            ]

            walletTopUp.addRows(walletTopUpData);
            // walletTopUp.getRow(walletTopUp.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            walletTopUp.getRow(walletTopUp.rowCount).font = {
                bold: true
            };

            const ridersSheet = workbook.addWorksheet('Wallet Balance');
            ridersSheet.mergeCells('A1', 'B1');
            ridersSheet.getCell('A1').value = 'Wallet Balance Report';
            ridersSheet.getCell('A3').value = 'Start Date & Time:';
            ridersSheet.getCell('B3').value = moment(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            ridersSheet.getCell('A4').value = 'End Date & Time:';
            ridersSheet.getCell('B4').value = moment(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            ridersSheet.getRow(6).values = ['Rider Name', 'Mobile', 'Email', 'Wallet Opened Date',
                'Wallet Balance Amount', 'Last Activity Date'];

            ridersSheet.columns = [
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'date', width: 15 },
                { key: 'walletAmount', width: 30 },
                { key: 'lastActivityDate', width: 20, outlineLevel: 1 },
            ];

            ridersSheet.addRows(ridersData);
            // ridersSheet.getRow(ridersSheet.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            ridersSheet.getRow(ridersSheet.rowCount).font = {
                bold: true
            };

            let currentDate = moment(startTime).tz(timezone).format(`DD/MM/YY`);
            let subjectCurrentDate = moment(startTime).tz(timezone).format(`MM/DD/YY`);
            let filepath = `${sails.config.appPath}/assets/excel`;
            let filename = `FalconReport-${moment(startTime).tz(timezone).format(`DD-MM-YY`)}.xlsx`;

            await workbook.xlsx.writeFile(`${filepath}/${filename}`);
            let message = `Kindly find attached the Falcon scooter utilization report for ${subjectCurrentDate}.`;
            let setting = await Settings.findOne({
                type: sails.config.SETTINGS.TYPE.APP_SETTING
            });

            await EmailService.send({
                subject: `Falcon Report ${currentDate}`,
                to: setting.emailsForExportExcel,
                attachments: [`excel/${filename}`],
                template: 'dailyReport',
                data: {
                    name: '-',
                    message: message
                }
            });


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
                    await operationHoursService.operationalHoursChangeEvent(true);

                    await RideBookingService.stopeRideOnDeActiveVehicle();

                    await Vehicle.update({
                        dealerId: null,
                        franchiseeId: null
                    },
                        { isActive: false })
                        .fetch();


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
                    },
                        { isActive: true })
                        .fetch();
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
                                let resData = await operationHoursService.operationHoursSocketDataSet();
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
    }
};

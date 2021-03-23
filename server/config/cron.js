const CronService = require('../api/services/cron');
// const SocketEventsService = require("../api/services/socketEvents");
// const moment = require("moment");
module.exports.cron = {
    // cron every minute
    cancelRide: {
        schedule: '*/1 * * * *',
        onTick: function () {
            console.log('cancelRide', new Date());
            CronService.cancelRide();
        }
    },
    endPausedRide: {
        schedule: '*/1 * * * *',
        onTick: function () {
            console.log('endPausedRide', new Date());
            CronService.endPausedRide();
        }
    },
    endRideAfterMaxRideTime: {
        schedule: '*/1 * * * *',
        onTick: function () {
            if (!sails.config.IS_RIDE_END_AFTER_INSUFFICIENT_WALLET_BALANCE) {
                return;
            }
            console.log('endRideAfterMaxRideTime', new Date());
            CronService.endRideAfterMaxRideTime();
        }
    },
    endRideAfterMaxKm: {
        schedule: '*/1 * * * *',
        onTick: function () {
            if (!sails.config.IS_RIDE_END_AFTER_INSUFFICIENT_WALLET_BALANCE) {
                return;
            }
            console.log('endRideAfterMaxKm', new Date());
            CronService.endRideAfterMaxKm();
        }
    },
    checkNoCallBackNotReceivedFromIOT: {
        schedule: '*/1 * * * *',
        onTick: function () {
            console.log('checkNoCallBackNotReceivedFromIOT', new Date());
            CronService.checkNoCallBackNotReceivedFromIOT();
        }
    },
    activatePromoCode: {
        schedule: '0 0 * * *',
        onTick: function () {
            console.log('activatePromoCode', new Date());
            CronService.activatePromoCode();
        }
    },
    deactivatePromoCode: {
        schedule: '0 0 * * *',
        onTick: function () {
            console.log('deactivatePromoCode', new Date());
            CronService.deactivatePromoCode();
        }
    },
    expirePaymentTransaction: {
        schedule: '*/1 * * * *',
        onTick: function () {
            console.log('expirePaymentTransaction', new Date());
            CronService.expirePaymentTransaction();
        }
    },
    deleteOldIotCallbackData: {
        schedule: '0 */3 * * *',
        onTick: function () {
            console.log('deleteOldIotCallbackData', new Date());
            CronService.deleteOldIotCallbackData();
        }
    },
    // setOmniCallback: {
    //     schedule: '0 0 * * *',
    //     onTick: function () {
    //         console.log('setOmniCallback', new Date());
    //         CronService.setOmniCallback();
    //     }
    // },
    // notifyLowWalletAmount: {
    //     schedule: '0 10 * * *',
    //     onTick: function () {
    //         console.log('notifyLowWalletAmount', new Date());
    //         CronService.notifyLowWalletAmount();
    //     }
    // },
    activateBookPlan: {
        schedule: '0 0 * * *',
        onTick: function () {
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('activateBookPlan', new Date());
            CronService.activateBookPlan();
        }
    },
    deactivateBookPlan: {
        schedule: '0 0 * * *',
        onTick: function () {
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('deactivateBookPlan', new Date());
            CronService.deactivateBookPlan();
        }
    },
    removeDWMCurrentBookPlan: {
        schedule: '0 0 * * *',
        onTick: function () {
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('removeDWMCurrentBookPlan', new Date());
            CronService.removeDWMCurrentBookPlan();
        }
    },
    removeHourlyCurrentBookPlan: {
        schedule: '*/15 * * * *',
        onTick: function () {
            // every min: '*/1 * * * *'
            // every half hour: '*/30 * * * *'
            // every hour: '0 * * * *'
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('removeHourlyCurrentBookPlan', new Date());
            CronService.removeHourlyCurrentBookPlan();
        }
    },
    handleIsCancellableKeyInPlan: {
        schedule: '0 0 * * *',
        onTick: function () {
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('handleIsCancellableKeyInPlan', new Date());
            CronService.handleIsCancellableKeyInPlan();
        }
    },
    notifyExpirePlanEvery10Min: {
        schedule: '*/10 * * * *',
        onTick: function () {
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('notifyExpirePlanEvery10Min', new Date());
            CronService.notifyExpirePlanEvery10Min();
        }
    },
    notifyExpirePlanDayWise: {
        schedule: '0 10 * * *',
        onTick: function () {
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('notifyExpirePlanDayWise', new Date());
            CronService.notifyExpirePlanDayWise();
        }
    },
    notifyTimeLimitOnGoingRides: {
        schedule: '*/10 * * * *',
        onTick: function () {
            if (!sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE) {
                return;
            }
            console.log('notifyTimeLimitOnGoingRides', new Date());
            CronService.notifyTimeLimitOnGoingRides();
        }
    },
    // monthly request rent payment
    requestRentPayment: {
        // schedule: '*/1 * * * *',
        schedule: '0 0 1 * *',
        onTick: function () {
            if (!sails.config.RENT_SCOOTER_ACTIVE) {
                return;
            }
            console.log('requestRentPayment', new Date());
            // CronService.requestRentPayment();
        }
    },

    // autoCreateTask: {
    //     schedule: '*/5 * * * * *',
    //     onTick: function () {
    //         if (!sails.config.IS_AUTO_CREATE_TASK) {
    //             return
    //         }
    //         console.log('autoCreateTask', new Date());
    //         CronService.autoCreateTask();
    //     }
    // },
    markTaskAsOverDue: {
        schedule: '*/1 * * * *',
        onTick: function () {
            if (!sails.config.IS_AUTO_OVERDUE_TASK) {
                return;
            }
            console.log('markTaskAsOverDue  ------ ', new Date());
            CronService.markTaskAsOverDue();
        }
    },

    // createTaskForLowBatteryVehicle: {
    //     schedule: '*/1 * * * *',
    //     onTick: function () {
    //         if (!sails.config.IS_AUTO_CREATE_TASK) {
    //             return
    //         }
    //         console.log('createTaskForLowBatteryVehicle', new Date());
    //         CronService.createTaskForLowBatteryVehicle();
    //     }
    // },

    removeHourlyBookingPass: {
        schedule: '*/15 * * * *',
        onTick: function () {
            // every min: '*/1 * * * *'
            // every half hour: '*/30 * * * *'
            // every hour: '0 * * * *'
            if (!sails.config.IS_BOOKING_PASS_FEATURE_ACTIVE) {
                return;
            }
            console.log('removeHourlyBookingPass', new Date());
            CronService.removeHourlyBookingPass();
        }
    },
    removeDailyMonthlyBookingPass: {
        schedule: '0 0 * * *',
        onTick: function () {
            if (!sails.config.IS_BOOKING_PASS_FEATURE_ACTIVE) {
                return;
            }
            console.log('removeDailyMonthlyBookingPass', new Date());
            CronService.removeDailyMonthlyBookingPass();
        }
    },
    cancelClaimNest: {
        schedule: '* * * * *',
        onTick: function () {
            if (!sails.config.AUTO_CANCEL_CLAIM_NEST) {
                return;
            }
            console.log('cancelClaimNest ------ ', new Date());
            CronService.cancelClaimNest();
        }
    },
    // dailyLightOn: {
    //     schedule: '0 10 * * *',
    //     onTick: function () {
    //         if (!sails.config.IS_DAILY_LIGHT_ON_OFF) {
    //             return;
    //         }
    //         console.log('dailyLightOn', new Date());
    //         CronService.dailyLightOn();
    //     }
    // },
    // dailyLightOff: {
    //     schedule: '0 21 * * *',
    //     onTick: function () {
    //         if (!sails.config.IS_DAILY_LIGHT_ON_OFF) {
    //             return;
    //         }
    //         console.log('dailyLightOff', new Date());
    //         CronService.dailyLightOff();
    //     }
    // },
    checkScooterHeartBeatReceived: {
        schedule: '*/1 * * * *',
        onTick: function () {
            if (!sails.config.DEFAULT_PING_INTERVAL_ENABLED) {
                return;
            }
            console.log('checkScooterHeartBeatReceived', new Date());
            CronService.checkScooterHeartBeatReceived();
        }
    },
    sendExcelReport: {
        schedule: '30 21 * * *',
        // schedule: '*/1 * * * *',
        onTick: function () {
            console.log('emails :>> ', sails.config.EMAILS_FOR_EXPORT_EXCEL.length);
            if (!sails.config.IS_EXCEL_EXPORT_DAILY && sails.config.EMAILS_FOR_EXPORT_EXCEL.length <= 0) {
                return;
            }
            console.log('sendExcelReport******************88', new Date());
            CronService.sendExcelReport();
        }
    },
    saveLocationTrackData: {
        // schedule: '*/1 * * * *',
        schedule: '0 * * * *',//every hour
        onTick: function () {
            console.log('Save Location Data every hour ******************88', new Date());
            CronService.saveLocationDataOfVehicle();
        }
    },
    destroyLocationDataAfter2Days: {
        // schedule: '*/1 * * * *',
        schedule: '0 0 * * 0',//every 2 day
        onTick: async function () {
            console.log('Destroy Location Data every two day ******************88', new Date());
            CronService.destroyLocationDataAfter2Days();
        }
    },
    endRideAfterSpecificTime: {
        schedule: '*/1 * * * *',
        onTick: function () {
            console.log('endRideAfterSpecificTime', new Date());
            CronService.endRideAfterSpecificTime();
        }
    },

    endOperationalHoursAction: {
        schedule: '*/1 * * * *',
        onTick: function () {
            if (!sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                return;
            }
            console.log('endOperationalHoursAction', new Date());
            CronService.endOperationalHoursAction();

        }
    },

    startOperationHoursAction: {
        schedule: '*/1 * * * *',
        onTick: function () {
            if (!sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                return;
            }
            console.log('startOperationHoursAction', new Date());
            CronService.startOperationHoursAction();
        }
    },

    sendOperationalHoursExpireNotification: {
        schedule: '*/1 * * * *',
        onTick: function () {
            if (!sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                return;
            }
            console.log('sendOperationalHoursExpireNotification', new Date());
            CronService.sendOperationalHoursExpireNotification();
        }
    }
};

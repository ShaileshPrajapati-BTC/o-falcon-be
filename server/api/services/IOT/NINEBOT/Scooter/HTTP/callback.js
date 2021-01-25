const RideBookingService = require('../../../../rideBooking');
const IotCallbackHandler = require('../../../../iotCallbackHandler');

module.exports = {
    async scooterAlertCallback(data) {
        const notificationData = {
            1: sails.config.NOTIFICATION.IOT_NOTIFICATION.UNAUTHORIZED_MOVEMENT,
            2: sails.config.NOTIFICATION.IOT_NOTIFICATION.DOWN_GROUND_ALARM,
            3: sails.config.NOTIFICATION.IOT_NOTIFICATION.ILLEGAL_REMOVAL_ALARM,
            6: sails.config.NOTIFICATION.IOT_NOTIFICATION.LIFTED_UP_ALARM
        };
        const notification = notificationData[data.code];
        await RideBookingService.sendIOTNotification(data.imei, notification);
    },

    async scooterFaultCallback(data) {
        //scooter fault Callback
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async scooterHeartBeatCallback(data) {
        await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
    },

    async scooterUpgradeCallback(data) {
        // scooter upgrade callback
    }
};
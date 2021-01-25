const RideBookingService = require(`../../../../rideBooking`);
const NotificationService = require('../../../../notification');
const IotCallbackHandler = require('../../../../iotCallbackHandler');

module.exports = {

    async unlock(data) {
        console.log('--------unlock callback received Start--------');
        console.log('uid = ', data.uid);
        await IotCallbackHandler.unlockCallbackReceived(data);
        console.log('--------unlock callback received End--------');
    },

    async lock(data) {
        console.log('--------lock callback received Start--------');
        console.log('uid = ', data.uid);
        await IotCallbackHandler.lockCallbackReceived(data);
        console.log('--------lock callback received End--------');
    },

    async location(data) {
        await IotCallbackHandler.updateLocation(data);
    },

    async heart(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
        try {
            const notificationData = {
                1: sails.config.NOTIFICATION.IOT_NOTIFICATION.UNAUTHORIZED_MOVEMENT,
                2: sails.config.NOTIFICATION.IOT_NOTIFICATION.DOWN_GROUND_ALARM,
                3: sails.config.NOTIFICATION.IOT_NOTIFICATION.ILLEGAL_REMOVAL_ALARM
            };
            const imei = vehicle.imei;
            const status = data.status;
            const notification = notificationData[status];
            //await RideBookingService.sendOmniNotificationToAdmin(data, vehicle.id, vehicle.type);
            await RideBookingService.sendIOTNotification(imei, notification);
        } catch (e) {
            console.log('omniCallback heart ', e);
        }
    },

    async info(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async versionCheck(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async infoSet1(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async mac(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },


    async iccid(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },


    async version(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async key(data) {
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async warn(data) {
        const notificationData = {
            1: sails.config.NOTIFICATION.IOT_NOTIFICATION.UNAUTHORIZED_MOVEMENT,
            2: sails.config.NOTIFICATION.IOT_NOTIFICATION.DOWN_GROUND_ALARM,
            3: sails.config.NOTIFICATION.IOT_NOTIFICATION.ILLEGAL_REMOVAL_ALARM
        };
        const status = data.status;
        const notification = notificationData[status];
        await RideBookingService.sendIOTNotification(data.imei, notification);
    },

    async fault(data) {

    },

    async infoSet2(data) {

        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async track(data) {

        await IotCallbackHandler.findAndUpdateVehicle(data);
    }
};

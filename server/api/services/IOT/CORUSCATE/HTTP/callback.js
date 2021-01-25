const RideBookingService = require('../../../rideBooking');
const IotCallbackHandler = require('../../../iotCallbackHandler');

module.exports = {
    async start(data) {
        // console.log('--------start callback received Start--Coruscate=cb-iot------');
        await IOTCommandCallbackTrack.create({
            imei: data.imei,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: data
        });
        await IotCallbackHandler.unlockCallbackReceived(data);
        // console.log('--------start callback received End--Coruscate=cb-iot-------');
    },
    async stop(data) {
        await IOTCommandCallbackTrack.create({
            imei: data.imei,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: data
        });
        // console.log('--------stop callback received Start--Coruscate=cb-iot-----');
        await IotCallbackHandler.lockCallbackReceived(data);
        // console.log('--------stop callback received End--Coruscate=cb-iot-------');

    },
    async unlock(data) {
        await IOTCommandCallbackTrack.create({
            imei: data.imei,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: data
        });
        // console.log('--------unlock callback received Start--Coruscate=cb-iot-----');
        await IotCallbackHandler.unlockCallbackReceived(data);
        // console.log('--------unlock callback received End--Coruscate=cb-iot-------');

    },
    async lock(data) {
        await IOTCommandCallbackTrack.create({
            imei: data.imei,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: data
        });
        // console.log('--------lock callback received Start--Coruscate-iot-------');
        await IotCallbackHandler.lockCallbackReceived(data);
        // console.log('--------lock callback received End---Coruscate-iot------');
    },
    async track(data) {
        await IOTCommandCallbackTrack.create({
            imei: data.imei,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: data
        });
        await IotCallbackHandler.updateLocation(data);
    },
    async location(data) {
        await IOTCommandCallbackTrack.create({
            imei: data.imei,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: data
        });
        await IotCallbackHandler.updateLocation(data);
    },
}
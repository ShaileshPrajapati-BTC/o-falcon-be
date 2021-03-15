const Codec8Service = require('./codec8/callback');
const Codec8EService = require('./code8E/callback');
const Codec12Service = require('./codec12/callback');
const Codec14Service = require('./codec14/callback');
const UtilService = require('../../../../util');
const IotCallbackHandler = require('../../../../iotCallbackHandler');

module.exports = {
    async decodeAcknowledgement(ack) {
        if (!ack.startsWith('00000000')) {
            console.log("In IMEI Decode");
            let size = ack.substr(0, 4);
            size = parseInt(size, 16);
            let imei = ack.substr(4);
            if (imei.length !== size * 2) {

                throw Error('Invalid imei found.');
            }
            imei = UtilService.hex2Ascii(imei);

            return { imei: imei };
        }
        let codecId = ack.substr(16, 2).toLowerCase();
        let data;
        switch (codecId) {
            case '08':
                data = await Codec8Service.decodeAcknowledgement(ack);
                break;

            case '8e':
                data = await Codec8EService.decodeAcknowledgement(ack);
                break;

            case '0c':
                data = await Codec12Service.decodeAcknowledgement(ack);
                break;

            case '0e':
                data = await Codec14Service.decodeAcknowledgement(ack);
                break;
        }

        return data;
    },

    async callbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.imei)) {
            console.log('***********************Teltonika Callback Start*************************');
            console.log(data);
        }
        if (!_.has(data, 'lockStatus')) {
            if (_.has(data, 'ignition')) {
                data.lockStatus = !data.ignition;
            }
            if (_.has(data, 'digitalOutput1')) {
                data.lockStatus = !data.digitalOutput1;
            }
            if (_.has(data, 'dout1')) {
                if (data.dout1.toString() == '1') {
                    data.lockStatus = false;
                } else {
                    data.lockStatus = true;
                }
            }
        }
        if (!_.has(data, 'batteryLevel') && _.has(data, 'batteryCapacityLevel')) {
            data.batteryLevel = data.batteryCapacityLevel;
        }
        if (_.has(data, 'lockStatus')) {
            data.lockStatus = Boolean(data.lockStatus);
            await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        } else {
            await IotCallbackHandler.findAndUpdateVehicle(data);
        }
        // console.log('***********************Teltonika Callback End***************************');
    },
};
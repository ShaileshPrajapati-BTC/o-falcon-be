const UtilService = require('../../../../util');

module.exports = {
    decodeCallback(data) {
        let decodedData = {};
        switch (data[1]) {
            case '999':
                decodedData = this.decodeLoginCallback(data);
                break;

            case '100':
                decodedData = this.decodeHeartBeat(data);
                break;

            case '101':
                decodedData = this.decodePositionCallback(data);
                break;

            case '102':
                decodedData = this.decodeControllerCallback(data);
                break;

            case '103':
                decodedData = this.decodeExternalPowerCallback(data);
                break;

            case '104':
                decodedData = this.decodeAlarmCallback(data);
                break;

            case '105':
                decodedData = this.decodeAccessAreaCallback(data);
                break;

            case '106':
                decodedData = this.decodeBatteryLockStatusCallback(data);
                break;

            case '201':
                decodedData = this.decodeTrackCallback(data);
                break;

            case '206':
                decodeData = this.decodePingIntervalAck(data);

            default:
                break;
        }

        return decodedData;
    },

    decodeLoginCallback(ack) {
        let data = {
            imei: ack[0].substr(2),
            msgType: ack[1],
            ecuHardwareVersion: ack[2],
            ecuSoftwareVersion: ack[3],
            internalBatteryVoltage: ack[4],
            externalBatteryVoltage: ack[5]
        }

        return data;
    },

    decodeHeartBeat(ack) {
        let data = {
            internalBatteryVoltage: ack[2],
            externalBatteryVoltage: ack[3]
        };

        return data;
    },

    decodePositionCallback(ack) {
        let data = {
            lng: ack[3],
            lat: ack[4]
        };

        return data;
    },

    decodeControllerCallback(ack) {
        let data = {
            fault: ack[2],
            mileage: ack[3]
        }

        return data;
    },

    decodeExternalPowerCallback(ack) {
        let data = {
            chargeStatus: true
        };
        if (ack[2] == '0') {
            data.chargeStatus = false;
        }

        return data;
    },

    decodeAlarmCallback(ack) {
        let data = {
            alarmStatus: ack[2]
        };

        return data;
    },

    decodeAccessAreaCallback(ack) {
        let data = {
            station: ack[3],
            lockStatus: true
        };
        if (ack[4] == '1') {
            data.lockStatus = false;
        }
        if (ack[2] == '0') {
            data.notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.OUTSIDE_ZONE;
        }

        return data;
    },

    decodeBatteryLockStatusCallback(ack) {
        let data = {
            batteryLockStatus: false
        };
        if (ack[2] == '0') {
            data.batteryLockStatus = true;
        }

        return data;
    },

    decodeTrackCallback(ack) {
        let data = {
            lockStatus: true
        };
        if (ack[2] == '1') {
            data.lockStatus = false;
        }

        return data;
    },

    decodePingIntervalAck(ack) {
        if (ack[2] == '1') {
            let data = {
                pingInterval: true,
                ridePingInterval: true
            };

            return data;
        }

        return {};
    },

    async callbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.imei)) {
            console.log('*****************************TXED Callback Received*****************************');
            console.log(data);
        }
        if (data.pingInterval) {
            let vehicle = await Vehicle.findOne({ imei: data.imei });
            if (vehicle && vehicle.pingInterval) {
                data.pingInterval = vehicle.pingInterval.requestedValue;
            } else {
                delete data.pingInterval;
            }
            if (vehicle && vehicle.ridePingInterval) {
                data.ridePingInterval = vehicle.requestedValue;
            } else {
                delete data.ridePingInterval;
            }
        }
        if (typeof data.lockStatus == 'boolean') {
            await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        } else {
            await IotCallbackHandler.findAndUpdateVehicle(data);
        }
        // console.log('*****************************TXED Callback End**********************************');
    }
};
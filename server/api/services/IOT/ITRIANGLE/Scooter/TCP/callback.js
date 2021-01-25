const IotCallbackHandler = require('../../../../iotCallbackHandler');
const UtilService = require('../../../../util');

module.exports = {
    decodeCallback(data, imei) {
        if (data[0].startsWith == '$$') {
            if (data[3] == '15') {
                data = this.firstConnectionCallback(data);
            } else {
                if (data.length > 23) {
                    data = this.getHeartBeatCallback(data);
                } else {
                    data = this.getCompressedHeartBeat(data);
                }
            }
        } else {
            if (data[0].startsWith('http')) {
                data = this.getLocation(data[0], imei);
            } else {
                data = this.getTrackData(data, imei);
            }
        }

        return data;
    },

    firstConnectionCallback(data) {
        let decodedData = {
            clientId: data[1],
            imei: data[2],
            eventCode: data[3],
            firmwareVersion: data[4],
            ip: data[5],
            port: data[6],
            apn: data[7],
            ridePingInterval: data[8].substr(3, 2),
            pingInterval: data[9].substr(3, 2),
            adminNo1: data[10].replace('Ad1:', ''),
            adminNo2: data[11].replace('Ad2:', ''),
            gmtOffset: data[12].substr(4).replace('s', ''),
            maxSpeedLimit: data[14].substr(4).replace(' KM', ''),
            overSpeedDuration: data[15],
            gnssFixStatus: data[16]
        };
        let lockStatus = data[17].substr(9);
        if (lockStatus == 'ON') {
            decodedData.lockStatus = true;
        } else {
            decodedData.lockStatus = false;
        }

        return decodedData;
    },

    getHeartBeatCallback(data) {
        let decodedData = {
            clientId: data[1],
            imei: data[2],
            eventCode: data[3],
            lat: parseFloat(data[4]),
            lng: parseFloat(data[5]),
            dateTime: data[6],
            gnssFixStatus: data[7],
            gsmSignal: data[8],
            speed: parseInt(data[9]),
            accumulatedDistance: parseInt(data[10]) / 1000,
            course: data[11],
            satellites: data[12],
            HDOP: data[13],
            voltage: parseInt(data[16]) / 1000,
            digitalInputStatus: data[17],
            caseOpenStatus: data[18],
            overSpeedStarted: data[19],
            overSpeedEnd: data[20],
            immobilizerViolation: data[23],
            powerStatus: data[24],
            lowBatteryAlert: data[35],
            anglePollingBit: data[36],
            digitalOutput1Status: data[41],
            harshAcceleration: data[43],
            harshBraking: data[44],
            externalBatteryVoltage: parseInt(data[49]) / 1000,
            internalBatteryVoltage: parseInt(data[50]) / 1000
        };
        let lockStatus = data[28];
        if (lockStatus == '1') {
            decodedData.lockStatus = true;
        } else {
            decodedData.lockStatus = false;
        }

        return decodedData;
    },

    getCompressedHeartBeat(data) {
        let event = UtilService.dec2bin(data[17]);
        event = ('00000000000000000000000000000000' + event).substr(-32);
        let decodedData = {
            clientId: data[1],
            imei: data[2],
            eventCode: data[3],
            lat: parseFloat(data[4]),
            lng: parseFloat(data[5]),
            dateTime: data[6],
            gnssFixStatus: data[7],
            gsmSignal: data[8],
            speed: parseInt(data[9]),
            accumulatedDistance: parseInt(data[10]) / 1000,
            course: data[11],
            satellites: data[12],
            HDOP: data[13],
            voltage: parseInt(data[16]) / 1000,
            digitalInputStatus: event[31],
            caseOpenStatus: event[30],
            overSpeedStarted: event[29],
            overSpeedEnd: event[28],
            immobilizerViolation: event[25],
            powerStatus: event[24],
            lowBatteryAlert: event[13],
            anglePollingBit: event[12],
            digitalOutput1Status: event[7],
            harshAcceleration: event[5],
            harshBraking: event[4],
            externalBatteryVoltage: parseInt(data[18]) / 1000,
            internalBatteryVoltage: parseInt(data[19]) / 1000
        };
        let lockStatus = data[28];
        if (lockStatus == '1') {
            decodedData.lockStatus = true;
        } else {
            decodedData.lockStatus = false;
        }

        return decodedData;
    },

    getLocation(location, imei) {
        location = location.substr(30);
        location = location.split(',');
        const data = {
            lat: location[0],
            lng: location[1],
            imei: imei
        };

        return data;
    },

    getTrackData(trackData, imei) {
        let data = {
            digitalInput1: trackData[1].substr(4),
            digitalInput2: trackData[2].substr(4),
            digitalOutput1: trackData[3].substr(4),
            caseSw: trackData[4].substr(8),
            chargeStatus: parseInt(trackData[5].substr(11).replace(' ', '')),
            imei: imei
        };
        if (trackData[0].substr(4) == '0') {
            data.lockStatus = false;
        } else {
            data.lockStatus = true;
        }

        return data;
    },

    async callbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.imei)) {
            console.log('*****************************ITRIANGLE Callback Received*****************************');
            console.log(data);
        }
        if (typeof data.lockStatus == 'boolean') {
            await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        } else {
            await IotCallbackHandler.findAndUpdateVehicle(data);
        }
    }
};
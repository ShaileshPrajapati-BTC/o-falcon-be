const IotCallbackHandler = require('../../../../iotCallbackHandler');
const UtilService = require('../../../../util');
const ackStructure = {
    messageType: { start: 8, end: 2 },
    imei: { start: 10, end: 8 },
    commControlField: { start: 18, end: 4 },
    messageNumerator: { start: 22, end: 2 },
    hardwareVersion: { start: 24, end: 2 },
    firmwareVersion: { start: 26, end: 2 },
    protocol: { start: 28, end: 2 },
    status: { start: 30, end: 2 },
    gsmOperator: { start: 32, end: 2 },
    reasonSpecificData: { start: 34, end: 2 },
    reason: { start: 36, end: 2 },
    unitMode: { start: 38, end: 2 },
    unitIOStatus: { start: 40, end: 8 },
    currentGsmOperator: { start: 48, end: 2 },
    analogInput: { start: 50, end: 8 },
    mileageCounter: { start: 58, end: 6 },
    multiPurposeField: { start: 64, end: 12 },
    lastGPSFix: { start: 76, end: 4 },
    locationStatus: { start: 80, end: 2 },
    mode1: { start: 82, end: 2 },
    mode2: { start: 84, end: 2 },
    noOfSatellites: { start: 86, end: 2 },
    longitude: { start: 88, end: 8 },
    latitude: { start: 96, end: 8 },
    altitude: { start: 104, end: 8 },
    groundSpeed: { start: 112, end: 8 },
    speedDirection: { start: 120, end: 4 },
    datetime: { start: 124, end: 14 },
    crc: { start: 138, end: 2 }
};
module.exports = {
    decodeCallback(data) {
        let type = data.substr(ackStructure.messageType.start, ackStructure.messageType.end);
        let decodedData = {};
        switch (type) {
            case '00':
                decodedData = this.decodeGeneralCallback(data);
                break;
        }

        return decodedData;
    },

    decodeGeneralCallback(ack) {
        let callbacks = [];
        let dataArr = [];
        let acks = [];
        let IoTService = require('./iot');
        if (ack.length > 140) {
            for (let i = 0; i < ack.length / 140; i++) {
                callbacks.push(ack.substr((i * 140), (140)));
            }
        } else {
            callbacks.push(ack);
        }
        for (let i = 0; i < callbacks.length; i++) {
            ack = callbacks[i];
            if (!this.checkChecksum(ack)) {
                continue;
            }
            let data = {};
            data.messageType = ack.substr(ackStructure.messageType.start, ackStructure.messageType.end);
            data.imei = ack.substr(ackStructure.imei.start, ackStructure.imei.end);
            data.commControlField = ack.substr(ackStructure.commControlField.start, ackStructure.commControlField.end);
            data.messageNumerator = ack.substr(ackStructure.messageNumerator.start, ackStructure.messageNumerator.end);
            data.ecuHardwareVersion = ack.substr(ackStructure.hardwareVersion.start, ackStructure.hardwareVersion.end);
            data.ecuSoftwareVersion = ack.substr(ackStructure.firmwareVersion.start, ackStructure.firmwareVersion.end);
            data.protocol = ack.substr(ackStructure.protocol.start, ackStructure.protocol.end);
            data.reasonSpecificData = ack.substr(ackStructure.reasonSpecificData.start, ackStructure.reasonSpecificData.end);
            data.reason = ack.substr(ackStructure.reason.start, ackStructure.reason.end);
            data.unitMode = ack.substr(ackStructure.unitMode.start, ackStructure.unitMode.end);
            if (data.unitMode == '00') {
                data.lockStatus = false;
            } else {
                data.lockStatus = true;
            }
            data.unitIOStatus = ack.substr(ackStructure.unitIOStatus.start, ackStructure.unitIOStatus.end);
            let fioStatus = UtilService.hex2bin(data.unitIOStatus.substr(0, 2));
            let sioStatus = UtilService.hex2bin(data.unitIOStatus.substr(2, 2));
            let tioStatus = UtilService.hex2bin(data.unitIOStatus.substr(4, 2));
            let lioStatus = UtilService.hex2bin(data.unitIOStatus.substr(6, 2));
            data.acceleratorResponse = sioStatus[6];
            data.chargeStatus = lioStatus[7];
            data.batteryLevel = UtilService.hexToDec(ack.substr(ackStructure.analogInput.start + 2, 2)) * 0.01647058823;
            data.mileage = UtilService.hexToDec(ack.substr(ackStructure.mileageCounter.start, ackStructure.mileageCounter.end));
            let tenthByte = UtilService.hex2bin(ack.substr(18, 2));
            let locationByte = UtilService.hex2bin(ack.substr(80, 2));
            if (locationByte[7] == '1' && tenthByte[5] == '0' && tenthByte[4] == '0') {
                let vehicleCode = locationByte[5] + locationByte[6] + ack.substr(64, 12);
                data.vehicleCode = vehicleCode;
            }
            data.noOfSatellites = UtilService.hexToDec(ack.substr(ackStructure.noOfSatellites.start, ackStructure.noOfSatellites.end));
            data.lng = this.intelHex(ack.substr(ackStructure.longitude.start, ackStructure.longitude.end));
            data.lat = this.intelHex(ack.substr(ackStructure.latitude.start, ackStructure.latitude.end));
            data.lng = UtilService.hexToDec(data.lng);
            data.lat = UtilService.hexToDec(data.lat);
            data.lat = (data.lat * (180 / 3.142857142857143)) / 100000000;
            data.lng = (data.lng * (180 / 3.142857142857143)) / 100000000;
            data.altitude = ack.substr(ackStructure.altitude.start, ackStructure.altitude.end);
            data.altitude = UtilService.hexToDec(data.altitude) * 0.01;
            data.speed = UtilService.hexToDec(ack.substr(ackStructure.groundSpeed.start, ackStructure.groundSpeed.end)) * 0.036;

            dataArr.push(data);
            let ackData = IoTService.generateAck(data);
            acks.push(ackData);
        }

        for (let i = 1; i < dataArr.length; i++) {
            this.callbackReceived(dataArr[i]);
        }

        return { data: dataArr[0], ack: acks };
    },

    intelHex(data) {
        let hex = '';
        for (let i = data.length - 1; i >= 0; i = i - 2) {
            hex = hex + data.charAt(i - 1) + data.charAt(i);
        }

        return hex;
    },

    callbackReceived(data) {
        //Check reason and send Admin notification
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.imei)) {
            console.log('********************************Cellocator Callback***********************************');
            console.log(data);
            console.log('*********************************Cellocator Callback End******************************');
        }
    },

    checkChecksum(data) {
        data = data.substr(8);
        let checkSum = 0;
        for (let i = 0; i < data.length - 2; i = i + 2) {
            checkSum = checkSum + parseInt(data.substr(i, 2), 16);
        }
        checkSum = UtilService.decToHex(checkSum);
        checkSum = checkSum.substr(-2);

        if (checkSum == data.substr(data.length - 2, 2)) {
            return true;
        } else {
            return false;
        }
    }
};
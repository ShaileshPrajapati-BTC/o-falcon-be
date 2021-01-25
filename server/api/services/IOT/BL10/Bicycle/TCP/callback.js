const UtilService = require('../../../../util');
const IotCallbackHandler = require('../../../../iotCallbackHandler');
const BL10IotService = require('./iot');
const IoTService = require('../../../../iot');

module.exports = {
    async decodeAcknowledgement(ack, serialNo) {
        const protocols = sails.config.BL10.PROTOCOLS;
        let ackStructure = {
            startBit: { start: 0, end: 4 },
            packetLength: { start: 4, end: 2 },
            protocol: { end: 2 },
            data: { start: 10 },
            serialNo: { end: 4 },
            crc: { end: 4 },
            stopBit: { end: 4 }
        };
        if (ack.startsWith('7979')) {
            ackStructure.packetLength.end = 4;
        }
        ackStructure.protocol.start = ackStructure.packetLength.start + ackStructure.packetLength.end;
        ackStructure.data.start = ackStructure.protocol.start + ackStructure.protocol.end;
        let protocol = ack.substr(ackStructure.protocol.start, ackStructure.protocol.end);
        let ackDataAndResponse = {};
        console.log("Protocol ", protocol);

        switch (protocol) {
            case protocols.loginInformation:
                ackDataAndResponse = await this.decodeLoginAck(ackStructure, ack);
                break;

            case protocols.heartBeat:
                ackDataAndResponse = await this.decodeHeartBeat(ackStructure, ack, serialNo);
                break;

            case protocols.commandResponse:
                ackDataAndResponse = await this.decodeCommandResponse(ack, serialNo);
                break;

            case protocols.gpsLocationInformation:
                ackDataAndResponse = await this.decodeLocationAck(ackStructure, ack, serialNo);
                break;

            case protocols.locationInformationAlarm:
                ackDataAndResponse = await this.decodeLocationAck(ackStructure, ack, serialNo);
                break;

            case protocols.informationTransmissionPacket:
                ackDataAndResponse = await this.decodeInformationTransmissionPacket(ackStructure, ack, serialNo);
                break;

            default:
                break;
        }

        return ackDataAndResponse;
    },

    async decodeLoginAck(ackStructure, ack) {
        let data = {};
        data.imei = ack.substr(ackStructure.data.start, 16);
        data.modelIdNo = ack.substr(ackStructure.data.start + 16, 2);
        let ackResponse = await BL10IotService.generateLoginPacketResponse();
        let response = { ackData: data, serialNo: 0001 };
        if (ackResponse && ackResponse.length > 0) {
            response.ackResponse = ackResponse;
        }

        return response;
    },

    async decodeHeartBeat(ackStructure, ack, serialNo) {
        let data = {};
        let terminalInfo = ack.substr(ackStructure.data.start, 2);
        let nextDataStart = ackStructure.data.start + 2;
        let voltage = ack.substr(nextDataStart, 4);
        nextDataStart += 4;
        let networkSignal = ack.substr(nextDataStart, 2);
        data.networkSignal = parseInt(networkSignal, 16);
        nextDataStart += 2;
        let language = ack.substr(nextDataStart, 4);
        if (language == '0001') {
            data.language = 'Chinese';
        } else {
            data.language = 'English';
        }
        voltage = UtilService.hexToDec(voltage);
        let batteryConfig = sails.config.BL10.VOLTAGE_LEVEL;
        data.batteryLevel = await IoTService.getBatteryPercentageFromVolt(voltage, batteryConfig);
        terminalInfo = UtilService.hex2bin(terminalInfo);
        if (terminalInfo[7] == '1') {
            data.lockStatus = true;
        } else {
            data.lockStatus = false;
        }
        if (terminalInfo[5] == '1') {
            data.chargeStatus = true;
        } else {
            data.chargeStatus = false;
        }
        if (terminalInfo[1] == '1') {
            data.gpsPositioning = true;
        } else {
            data.gpsPositioning = false;
        }
        serialNo++;
        let ackResponse = BL10IotService.getGeneralAckResponse(serialNo, sails.config.BL10.PROTOCOLS.heartBeat);
        let response = { ackData: data, ackResponse: ackResponse, serialNo: serialNo };

        return response;
    },

    async decodeCommandResponse(ackStructure, ack, serialNo) {
        let data = {};
        let decodeType = ack.substr(18, 2);
        let encodedData = ack.substring(20, ack.length - 12);
        if (decodeType == '01') {
            data.responseMessage = UtilService.hex2Ascii(encodedData);
        } else {
            data.responseMessage = encodedData;
        }

        return data;
    },

    async decodeLocationAck(ackStructure, ack, serialNo) {
        let data = {};
        let date = '';
        let nextDataStart = ackStructure.data.start;
        date += '20' + ack.substr(nextDataStart, 2);
        nextDataStart += 2;
        date += '-' + ack.substr(nextDataStart, 2);
        nextDataStart += 2;
        date += '-' + ack.substr(nextDataStart, 2);
        nextDataStart += 2;
        date += ' ' + ack.substr(nextDataStart, 2);
        nextDataStart += 2;
        date += ':' + ack.substr(nextDataStart, 2);
        nextDataStart += 2;
        date += ':' + ack.substr(nextDataStart, 2);
        nextDataStart += 2;
        data.date = new Date(date);
        data.gpsInformationLength = ack.substr(nextDataStart, 2);
        if (data.gpsInformationLength != '00') {
            nextDataStart += 2;
            data.gpsSatellites = ack.substr(nextDataStart, 2);
            nextDataStart += 2;
            let latitude = ack.substr(nextDataStart, 8);
            latitude = UtilService.hexToDec(latitude);
            data.lat = latitude / 1800000;
            nextDataStart += 8;
            let longitude = ack.substr(nextDataStart, 8);
            longitude = UtilService.hexToDec(longitude);
            data.lng = longitude / 1800000;
            nextDataStart += 8;
            data.speed = ack.substr(nextDataStart, 2);
            data.speed = UtilService.hexToDec(data.speed);
            nextDataStart += 2;
            data.course = ack.substr(nextDataStart, 4);
            nextDataStart += 4;
            let statusData = UtilService.hex2bin(data.course.substr(0, 2));
            let latDirection = 'N';
            let lngDirection = 'W'
            if (statusData[4] == '0') {
                lngDirection = 'E'
            }
            if (statusData[5] == '0') {
                latDirection = 'S'
            }
            let { lat, lng } = UtilService.setDirectionWiseLocation(latDirection, lngDirection, data.lat, data.lng);
            data.lat = lat;
            data.lng = lng;
        } else {
            nextDataStart += 2;
        }
        data.mainBaseStationLength = ack.substr(nextDataStart, 2);
        if (data.mainBaseStationLength != '00') {
            nextDataStart += 2;
            // data.mcc = ack.substr(nextDataStart, 4);
            // data.mcc = UtilService.hexToDec(data.mcc);
            // nextDataStart += 4;
            // data.mnc = ack.substr(nextDataStart, 2);
            // data.mnc = UtilService.hexToDec(data.mnc);
            // nextDataStart += 2;
            // data.lac = ack.substr(nextDataStart, 4);
            // data.lac = UtilService.hexToDec(data.lac);
            // nextDataStart += 4;
            // data.ci = ack.substr(nextDataStart, 6);
            // data.ci = UtilService.hexToDec(data.ci);
            // nextDataStart += 6;
            // data.rssi = ack.substr(nextDataStart, 2);
            // nextDataStart += 2;
        } else {
            nextDataStart += 2;
        }
        data.subBaseStationLength = ack.substr(nextDataStart, 2);
        if (data.subBaseStationLength != '00') {
            // data.subBaseStationLength = UtilService.hexToDec(data.subBaseStationLength);
            // nextDataStart += 2;
            // for (let i = 0; i < data.subBaseStationLength; i++) {
            //     data['nlac' + (i + 1).toString()] = ack.substr(nextDataStart, 4);
            //     data['nlac' + (i + 1).toString()] = UtilService.hexToDec(data['nlac' + (i + 1).toString()]);
            //     nextDataStart += 4;
            //     data['nci' + (i + 1).toString()] = ack.substr(nextDataStart, 6);
            //     data['nci' + (i + 1).toString()] = UtilService.hexToDec(data['nci' + (i + 1).toString()]);
            //     nextDataStart += 6;
            //     data['nrssi' + (i + 1).toString()] = ack.substr(nextDataStart, 2);
            //     nextDataStart += 2;
            // }
        } else {
            nextDataStart += 2;
        }
        data.WiFiMessageLength = ack.substr(nextDataStart, 2);
        if (data.WiFiMessageLength != '00') {
            // data.WiFiMessageLength = UtilService.hexToDec(data.WiFiMessageLength);
            // for (let i = 0; i < data.WiFiMessageLength; i++) {
            //     data['mac' + (i + 1).toString()] = ack.substr(nextDataStart, 12);
            //     data['mac' + (i + 1).toString()] = UtilService.decToHex(data['mac' + (i + 1).toString()]);
            //     nextDataStart += 12;
            //     data['WiFiStrength' + (i + 1).toString()] = ack.substr(nextDataStart, 2);
            //     data['WiFiStrength' + (i + 1).toString()] = UtilService.hexToDec(data['WiFiStrength' + (i + 1).toString()]);
            //     nextDataStart += 2;
            // }
        } else {
            nextDataStart += 2;
        }

        data.status = ack.substr(nextDataStart, 2);
        switch (data.status.toLowerCase()) {
            case 'a0':
                data.lockStatus = true;
                break;

            case 'a1':
                data.lockStatus = false;
                break;

            default:
                break;
        }
        data.status = UtilService.hexToDec(data.status);
        nextDataStart += 2;
        // data.reservedExtensionLength = ack.substr(nextDataStart, 2);
        // data.reservedExtensionLength = UtilService.hexToDec(data.reservedExtensionLength);
        // nextDataStart += 2;
        // if (data.reservedExtensionLength > 0) {
        //     data.reservedExtension = ack.substr(nextDataStart, data.reservedExtensionLength * 2);
        //     data.reservedExtension = UtilService.hexToDec(data.reservedExtension);
        //     nextDataStart += data.reservedExtensionLength;
        // }
        serialNo++;
        let protocol = ack.substr(ackStructure.protocol.start, ackStructure.protocol.end);
        let ackResponse = await BL10IotService.getGeneralAckResponse(serialNo, protocol);
        let response = { ackData: data, ackResponse: ackResponse, serialNo: serialNo };

        return response;
    },

    async decodeInformationTransmissionPacket(ackStructure, ack, serialNo) {
        let packetSize = ack.substr(ackStructure.packetLength.start, ackStructure.packetLength.end);
        packetSize = UtilService.hexToDec(packetSize);
        let dataSize = packetSize - 5;
        let countSize = 0;
        let data = {};
        let nextDataStart = ackStructure.data.start;
        let informationModules = sails.config.BL10.INFORMATION_MODULE_NO;
        while (countSize < dataSize) {
            let moduleNo = ack.substr(nextDataStart, 2);
            nextDataStart += 2;
            let moduleLength = ack.substr(nextDataStart, 4);
            moduleLength = UtilService.hexToDec(moduleLength);
            moduleLength = parseInt(moduleLength);
            nextDataStart += 4;
            let moduleData = ack.substr(nextDataStart, moduleLength * 2);
            data[informationModules[moduleNo]] = UtilService.hexToDec(moduleData);
            nextDataStart += moduleLength * 2;
            countSize = countSize + 3 + moduleLength;
        }
        serialNo++;
        let ackResponse = await BL10IotService.getResponseOfInformationTransmissionPacket(serialNo);
        let response = { ackData: data, ackResponse: ackResponse, serialNo: serialNo };

        return response;
    },

    checkCrc(ack) {
        let data = ack.substr(4, ack.length - 12);
        // console.log('data', data);
        if (ack.startsWith('7878') && ack.substr(6, 2) == '01') {
            data += '78696e736977656926636f6e636f78';
        }
        let crc = BL10IotService.calculateCrc(data);
        // console.log('crc', crc);
        let receivedCrc = ack.substr(ack.length - 8, 4);
        // console.log('receivedCrc == crc', receivedCrc == crc);
        if (receivedCrc == crc) {
            return true;
        }

        return false;
    },

    async callbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.imei)) {
            console.log('***********************BL10 Callback Start*************************');
            console.log(data);
        }
        if (data.status) {
            const notificationData = {
                164: sails.config.NOTIFICATION.IOT_NOTIFICATION.UNAUTHORIZED_MOVEMENT,
                163: sails.config.NOTIFICATION.IOT_NOTIFICATION.DOWN_GROUND_ALARM,
                165: sails.config.NOTIFICATION.IOT_NOTIFICATION.ILLEGAL_REMOVAL_ALARM,
                162: sails.config.NOTIFICATION.IOT_NOTIFICATION.LOW_POWER_ALARM
            };
            const imei = data.imei;
            const status = data.status;
            const notification = notificationData[status];
            if (notification) {
                // await rideBooking.sendIOTNotification(imei, notification);
            }
        }
        if (typeof data.lockStatus === 'boolean') {
            await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        } else {
            await IotCallbackHandler.findAndUpdateVehicle(data);
        }
    },
};
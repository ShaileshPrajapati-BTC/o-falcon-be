const GogoBikeService = require('./iot');
const UtilService = require('../../../../util');

module.exports = {
    decodeCallback(ack, imei) {
        let protocol = ack.substr(6, 2);
        let data = {};
        switch (protocol) {
            case '01':
                data = this.decodeLoginPacket(ack);
                break;

            case '12':
                data = this.decodeLocationPacket(ack, imei);
                break;

            case '13':
                data = this.decodeHeartBeatPacket(ack, imei);
                break;

            case '16':
                data = this.decodeAlarmPacket(ack, imei);
                break;

            case '40':
                data = this.decodeBatteryStatusPacket(ack, imei);
                break;

            case '41':
                data = this.decodeMultimediaPacket(ack, imei);
                break;

            case '1a':
                data = this.decodeGPSAddressPacket(ack, imei);
                break;

            case '42':
                data = this.decodeMultimediaDataPacket(ack, imei);
                break;

            default:
                break;
        }

        return data;
    },

    generateNextSerialNo(imei) {
        let serialNo = sails.config.GOGOBIKE.serialNo[imei];
        if (!serialNo || serialNo >= 65535) {
            serialNo = 0;
        }
        serialNo++;
        sails.config.GOGOBIKE.serialNo[imei] = serialNo;
        serialNo = ('0000' + UtilService.decToHex(serialNo)).substr(-4);

        return serialNo;
    },

    decodeLoginPacket(ack) {
        let data = {
            imei: ack.substr(8, 16)
        };
        sails.config.GOGOBIKE.serialNo[data.imei] = 1;
        let loginAck = '05010001';
        let crc = GogoBikeService.calculateCrc(loginAck);
        loginAck = '7878' + loginAck + crc + '0d0a';


        return { data: data, ack: loginAck };
    },

    decodeLocationPacket(ack, imei) {
        let data = {};
        data.satellites = ack.substr(20, 2);
        data.lat = ack.substr(22, 8);
        data.lng = ack.substr(30, 8);
        data.speed = ack.substr(38, 2);
        data.course = ack.substr(40, 4);
        data.mcc = UtilService.hexToDec(ack.substr(44, 4));
        data.mnc = ack.substr(48, 2);
        data.lac = ack.substr(50, 4);
        data.cellId = ack.substr(54, 6);
        data.batteryLevel = UtilService.hexToDec(ack.substr(60, 2));
        data.serialNo = ack.substr(66, 4);
        data.satellites = UtilService.hexToDec(data.satellites.substr(1, 1));
        data.lat = UtilService.hexToDec(data.lat) / 1800000;
        data.lng = UtilService.hexToDec(data.lng) / 1800000;
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
        if (data.batteryLevel > 100) {
            delete data.batteryLevel;
        }

        return { data: data };
    },

    decodeAlarmPacket(ack, imei) {
        let data = {};
        data.satellites = ack.substr(20, 2);
        data.lat = ack.substr(22, 8);
        data.lng = ack.substr(30, 8);
        data.speed = ack.substr(38, 2);
        data.course = ack.substr(40, 4);
        data.lbsStrength = ack.substr(44, 2);
        data.mcc = UtilService.hexToDec(ack.substr(46, 4));
        data.mnc = ack.substr(50, 2);
        data.lac = ack.substr(52, 4);
        data.cellId = ack.substr(56, 6);
        data.terminalInfo = ack.substr(62, 2);
        data.batteryLevel = UtilService.hexToDec(ack.substr(64, 2));
        data.gsmStrength = ack.substr(66, 2);
        data.alarm = ack.substr(68, 4);
        data.serialNo = ack.substr(72, 4);
        data.satellites = UtilService.hexToDec(data.satellites.substr(1, 1));
        data.lat = UtilService.hexToDec(data.lat) / 1800000;
        let statusData = UtilService.hex2bin(data.course.substr(0, 2));
        data.lat = UtilService.hexToDec(data.lat) / 1800000;
        data.lng = UtilService.hexToDec(data.lng) / 1800000;
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
        if (data.batteryLevel > 100) {
            delete data.batteryLevel;
        }
        let terminalData = UtilService.hex2bin(data.terminalInfo);
        data.electricityStatus = terminalData[0];
        data.gpsStatus = terminalData[1];
        let alarmType = terminalData.substr(2, 3);
        alarmType = this.getAlarmNotification(alarmType);
        if (alarmType) {
            data.alarmType = alarmType;
        }
        data.chargeStatus = terminalData[5];
        data.accStatus = terminalData[6];
        data.lockStatus = terminalData[7];
        let alarm = data.alarm.substr(0, 2);
        alarm = this.getAlarmNotification(alarm);
        if (alarm) {
            data.alarmType = alarm;
        }

        let serialNo = this.generateNextSerialNo(imei);
        let alarmAck = '0516' + serialNo;
        let crc = GogoBikeService.calculateCrc(alarmAck);
        alarmAck = '7878' + alarmAck + crc + '0d0a';

        return { data: data, ack: alarmAck };
    },

    decodeHeartBeatPacket(ack, imei) {
        let data = {};
        data.terminalInfo = ack.substr(8, 2);
        data.batteryLevel = UtilService.hexToDec(ack.substr(10, 2));
        data.gsmStrength = ack.substr(12, 2);
        data.alarm = ack.substr(14, 4);
        data.serialNo = ack.substr(18, 4);
        if (data.batteryLevel > 100) {
            delete data.batteryLevel;
        }
        let terminalData = UtilService.hex2bin(data.terminalInfo);
        data.electricityStatus = terminalData[0];
        data.gpsStatus = terminalData[1];
        let alarmType = terminalData.substr(2, 3);
        alarmType = this.getAlarmNotification(alarmType);
        if (alarmType) {
            data.alarmType = alarmType;
        }
        data.chargeStatus = terminalData[5];
        data.accStatus = terminalData[6];
        data.lockStatus = terminalData[7];
        let alarm = data.alarm.substr(0, 2);
        alarm = this.getAlarmNotification(alarm);
        if (alarm) {
            data.alarmType = alarm;
        }

        let serialNo = this.generateNextSerialNo(imei);
        let heartBeatAck = '0513' + serialNo;
        let crc = GogoBikeService.calculateCrc(heartBeatAck);
        heartBeatAck = '7878' + heartBeatAck + crc + '0d0a';

        return { data: data, ack: heartBeatAck };
    },

    decodeBatteryStatusPacket(ack, imei) {
        let data = {};
        data.imei = ack.substr(8, 16);
        data.relativeSOC = ack.substr(32, 2);
        data.remainingCapacity = ack.substr(34, 4);
        data.absoluteSOC = ack.substr(38, 2);
        data.absoluteFullCapacity = ack.substr(40, 4);
        data.SOH = ack.substr(44, 2);
        data.internalTemperature = (UtilService.hexToDec(ack.substr(46, 4)) - 2731) / 10;
        data.realTimeCurrent = ack.substr(50, 4);
        data.voltage = ack.substr(54, 4);
        data.cycleIndex = ack.substr(58, 4);
        data.batteryVoltage1 = ack.substr(62, 28);
        data.batteryVoltage2 = ack.substr(90, 28);
        data.currentChargingInterval = ack.substr(118, 4);
        data.maxChargeInterval = ack.substr(122, 4);
        data.rwFinishedBarcode = ack.substr(126, 40);
        data.readVersionNumber = ack.substr(166, 4);
        data.batteryManufacturer = ack.substr(170, 32);
        data.batteryStatus = ack.substr(202, 8);
        data.controllerStatus = ack.substr(210, 8);
        data.controllerFaultCode = ack.substr(218, 8);
        data.serialNo = ack.substr(226, 2);

        let serialNo = this.generateNextSerialNo(imei);
        let batteryAck = '0d40' + data.imei + serialNo;
        let crc = GogoBikeService.calculateCrc(batteryAck);
        batteryAck = '7878' + batteryAck + crc + '0d0a';

        return { data: data, ack: batteryAck };
    },

    decodeMultimediaPacket(ack, imei) {
        let data = {};
        data.agreementNo = ack.substr(8, 2);
        data.imei = ack.substr(10, 16);
        data.lat = ack.substr(24, 8);
        data.lng = ack.substr(32, 8);
        data.altitude = ack.substr(40, 4);
        data.azimuth = ack.substr(44, 2);
        data.gpsSpeed = ack.substr(46, 2);
        data.signalState = ack.substr(48, 4);
        data.mcc = ack.substr(52, 4);
        data.mnc = ack.substr(56, 4);
        data.lac = ack.substr(60, 4);
        data.cellId = ack.substr(64, 4);
        data.multimediaId = ack.substr(68, 8);
        data.size = ack.substr(76, 8);
        data.multimediaType = ack.substr(84, 2);
        data.multimediaEncoding = ack.substr(86, 2);
        data.uploadEventType = ack.substr(88, 2);
        data.multimediaPacketId = ack.substr(90, 4);
        data.multimediaPacket = ack.substring(90, ack.length - 12);
        data.serialNo = ack.substr(ack.length - 12, 4);
        data.lat = UtilService.hexToDec(data.lat) / 1800000;
        data.lng = UtilService.hexToDec(data.lng) / 1800000;
        // let statusData = UtilService.hex2bin(data.course.substr(0,2));
        // let latDirection = 'N';
        // let lngDirection = 'W'
        // if (statusData[4] == '0') {
        //     lngDirection = 'E'
        // }
        // if (statusData[5] == '0') {
        //     latDirection = 'S'
        // }
        // let { lat, lng } = UtilService.setDirectionWiseLocation(latDirection, lngDirection, data.lat, data.lng);
        // data.lat = lat;
        // data.lng = lng;

        let serialNo = this.generateNextSerialNo(imei);
        let multimediaAck = '05' + data.agreementNo + serialNo;
        let crc = GogoBikeService.calculateCrc(multimediaAck);
        multimediaAck = '7878' + multimediaAck + crc + '0d0a';

        return { data: data, ack: multimediaAck };
    },

    decodeGPSAddressPacket(ack, imei) {
        let data = {};
        data.satellites = ack.substr(20, 2);
        data.lat = ack.substr(22, 8);
        data.lng = ack.substr(30, 8);
        data.gpsSpeed = ack.substr(38, 2);
        data.course = ack.substr(40, 4);
        data.phoneNo = ack.substr(44, 42);
        data.language = ack.substr(86, 4);
        data.serialNo = ack.substr(90, 4);
        let statusData = UtilService.hex2bin(data.course.substr(0, 2));
        data.lat = UtilService.hexToDec(data.lat) / 1800000;
        data.lng = UtilService.hexToDec(data.lng) / 1800000;
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

        let serialNo = this.generateNextSerialNo(imei);
        let gpsAddressAck = '4144445245535326260053004F00530028004C2626' + data.phoneNo + '2323';
        gpsAddressAck = '97' + ('0000' + UtilService.decToHex(gpsAddressAck.length / 2)).substr(-4) + '00000000' + gpsAddressAck + serialNo;
        let crc = GogoBikeService.calculateCrc(gpsAddressAck);
        gpsAddressAck = gpsAddressAck + crc;
        gpsAddressAck = '7878' + ('0000' + UtilService.decToHex(gpsAddressAck.length / 2)).substr(-4) + gpsAddressAck + '0d0a';

        return { data: data, ack: gpsAddressAck };
    },

    decodeCommandResponsePacket(ack, imei) {
        let data = {};
        data.commandLength = UtilService.hexToDec(ack.substr(6, 2));
        data.serverFlagBit = ack.substr(8, 8);
        data.command = ack.substr(16, (data.commandLength * 2) - 8);
        data.language = ack.substr(ack.length - 16, 2);
        data.command = UtilService.hex2Ascii(data.command);

        return { data: data };
    },

    decodeMultimediaDataPacket(ack, imei) {
        let data = {};
        data.agreementNo = ack.substr(6, 2);
        data.shootingOrder = ack.substr(16, 2);
        data.photoInterval = ack.substr(18, 4);
        data.saveLogo = ack.substr(22, 2);
        data.resolution = ack.substr(24, 2);
        data.allowCompression = ack.substr(26, 2);
        data.brightness = ack.substr(28, 2);
        data.contrast = ack.substr(30, 2);
        data.saturation = ack.substr(32, 2);
        data.chroma = ack.substr(34, 2);
        data.serialNo = ack.substr(36, 4);

        let serialNo = this.generateNextSerialNo(imei);
        let multimediaAck = '05' + data.agreementNo + serialNo;
        let crc = this.calculateCrc(multimediaAck);
        multimediaAck = '7878' + multimediaAck + crc + '0d0a';

        return { data: data, ack: multimediaAck };
    },

    getAlarmNotification(alarmType) {
        let notification;
        switch (alarmType) {
            case '03':
                notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.DOWN_GROUND_ALARM;
                break;

            case '02':
                notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.BASIC_EVENTS;
                notification.message = 'Power cut Alarm.'
                break;

            case '05':
                notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.OUTSIDE_ZONE;
                break;

            case '011':
                notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.LOW_POWER_ALARM;
                break;

            case '001':
                notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.DOWN_GROUND_ALARM;
                break;

            case '010':
                notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.BASIC_EVENTS;
                notification.message = 'Power cut Alarm.'
                break;

            default:
                break;
        }

        return notification;
    },

    async callbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.imei)) {
            console.log('**********************GOGOBIKE Callback Start*************************');
            console.log(data);
        }
        if (data.alarmType) {
            await rideBooking.sendIOTNotification(data.imei, data.alarmType);
        }
        if (typeof data.lockStatus === 'boolean') {
            await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        } else {
            await IotCallbackHandler.findAndUpdateVehicle(data);
        }
    },

    checkCrc(ack) {
        let data = ack.substr(4, ack.length - 12);
        let crc = GogoBikeService.calculateCrc(data);
        console.log('crc', crc);
        let receivedCrc = ack.substr(ack.length - 8, 4);
        console.log('receivedCrc == crc', receivedCrc == crc);
        if (receivedCrc == crc) {
            return true;
        }

        return false;
    }
};
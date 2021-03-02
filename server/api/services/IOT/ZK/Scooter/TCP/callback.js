const IotCallbackHandler = require('../../../../iotCallbackHandler');

module.exports = {

    async callbackReceived(fnName, reqData) {
        /* eslint-disable array-element-newline */
        let generalReports = [
            '+RESP:GTPNA', '+RESP:GTPFA', '+RESP:GTPNL', '+RESP:GTSTT', '+RESP:GTNCN',
            '+RESP:GTDOG', '+RESP:GTALM', '+RESP:GTALI', '+RESP:GTLOR', '+RESP:GTLOC',
            '+RESP:GTLOF', '+RESP:GTULS', '+RESP:GTULF', '+RESP:GTBOV', '+RESP:GTBRN',
            '+RESP:GTCSD', '+RESP:GTCFL', '+RESP:GTCFU', '+RESP:GTSCE', '+RESP:GTPCE',
            '+RESP:GTBTC', '+RESP:GTSTC', '+RESP:GTBPL', '+RESP:GTEPN', '+RESP:GTEPF',
            '+RESP:GTFRI', '+RESP:GTQRY', '+RESP:GTINF', '+RESP:GTRTL'
        ];
        // +RESP:GTFRI gave same response as above, no separate function for that
        let callbackType = reqData[0];
        console.log(`--------${callbackType}: callback received Start--------`);
        if (generalReports.indexOf(callbackType) > -1) {
            await this.generalReports(fnName, reqData);
        } else if (typeof this[fnName] === 'function') {
            await this[fnName](reqData);
        } else {
            console.log(`callback received with callbackType => ${callbackType}`);
        }
        console.log(`--------${callbackType}: callback received End--------`);
    },

    async generalReports(fnName, reqData) {
        let imei = reqData[2];
        let countNumber = reqData[36];
        let command = `+SACK:${countNumber}`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log(`can not send response callback -> ${reqData[0]}`);
            }
        });

        const data = {};
        data.protocolVersion = reqData[1];
        data.imei = imei;
        data.countNumber = countNumber;
        // data.deviceName = reqData[3];
        data.vin = reqData[4];
        data.qrCode = reqData[5];
        // 6,7 Reserved
        data.reportType = reqData[8];
        data.ecuErrorCode = reqData[9];

        data.gpsAccuracy = reqData[10];
        data.speed = reqData[11];
        data.azimuth = reqData[12];
        data.altitude = reqData[13];
        data.lng = Number(reqData[14]);
        data.lat = Number(reqData[15]);
        data.gpsUtcTime = reqData[16];
        // 17 Reserved

        data.mcc = reqData[18];
        data.mnc = reqData[19];
        data.lac = reqData[20];
        data.cellId = reqData[21];
        data.csq = reqData[22];

        data.networkType = reqData[23];
        data.state = reqData[24];
        data.powerSupply = reqData[25];
        data.mainPowerVoltage = reqData[26];
        data.backupBatteryVoltage = reqData[27];
        data.backupBatteryPercentage = reqData[28];
        data.ecuErrorType = reqData[29];
        data.alive = reqData[30];

        data.ecuLockState = reqData[31];
        data.taskId = reqData[32];
        data.ecuInfo = reqData[33];
        data.scooterBatteryPercentage = reqData[34];
        data.generatedTime = reqData[35];
        if (typeof this[fnName] === 'function') {
            await this[fnName](data);
        } else {
            await IotCallbackHandler.updateLocation(data);
        }
    },

    async respGtuls(reqDataObj) {
        let iotRideId = reqDataObj.taskId;
        let data = {
            status: 0,
            uid: iotRideId
        };
        await IotCallbackHandler.unlockCallbackReceived(data);
    },

    async respGtloc(reqDataObj) {
        let imei = reqDataObj.imei;
        let iotRideId = reqDataObj.taskId;
        let data = {
            status: 0,
            uid: iotRideId,
            imei: imei
        };
        console.log('uid = ', data.uid);
        await IotCallbackHandler.lockCallbackReceived(data);
    },

    async respGtulf(reqDataObj) {
        let iotRideId = reqDataObj.taskId;
        let data = {
            status: 1,
            uid: iotRideId
        };
        console.log('uid = ', data.uid);
        await IotCallbackHandler.unlockCallbackReceived(data);
    },

    async respGtlof(reqDataObj) {
        let imei = reqDataObj.imei;
        let iotRideId = reqDataObj.taskId;
        let data = {
            status: 1,
            uid: iotRideId,
            imei: imei
        };
        console.log('uid = ', data.uid);
        await IotCallbackHandler.lockCallbackReceived(data);
    },

    async ackGthbd(reqData) {
        let imei = reqData[2];
        let bleCommandPassword = reqData[4];

        let protocolVersion = reqData[1];
        let countNumber = reqData[6];
        let command = `+SACK:GTHBD,${protocolVersion},${countNumber}$`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> +SACK:GTHBD');
            }
        });
        let data = {
            imei: imei,
            bleCommandPassword: bleCommandPassword
        };
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async respGtmls(reqData) {
        await this.respGtmlsGtrss(reqData);
    },

    async respGtrss(reqData) {
        await this.respGtmlsGtrss(reqData);
    },

    async respGtmlsGtrss(reqData) {
        let imei = reqData[2];
        let countNumber = reqData[6];
        let command = `+SACK:${countNumber}$`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> respGtmls');
            }
        });
        const data = {};
        data.imei = imei;
        // data.deviceName = reqData[3];
        data.vin = reqData[4];
        data.powerSupply = reqData[9];
        data.mainPowerVoltage = reqData[10];
        data.backupBatteryVoltage = reqData[11];
        data.backupBatteryPercentage = reqData[12];
        data.ecuLockState = reqData[13];
        data.mechanicalLockState = reqData[14];
        // No need to update QrCode, protocol Version, report type, Generated Time
        // 6 reserved, 7, 15, 20 are reserved
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async respGtcid(reqData) {
        let imei = reqData[2];
        let countNumber = reqData[10];
        let command = `+SACK:${countNumber}$`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> respGtcid');
            }
        });
        const data = {};
        data.imei = imei;
        // data.deviceName = reqData[3];
        // data.vin = reqData[4];
        data.iccid = reqData[8];
        // 6 reserved, taskId no need to update
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async respGtver(reqData) {
        let imei = reqData[2];
        let countNumber = reqData[18];
        let command = `+SACK:${countNumber}$`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> respGtver');
            }
        });
        const data = {};
        data.imei = imei;
        // data.deviceName = reqData[3];
        // data.vin = reqData[4];
        // 6 reserved, no need to update task id
        data.deviceType = reqData[7];
        data.firmwareVersion = reqData[8];
        data.hardwareVersion = reqData[9];
        data.modemHardwareVersion = reqData[10];
        data.modemSoftwareVersion = reqData[11];
        data.bluetoothFirmwareVersion = reqData[12];
        data.scooterHardwareVersion = reqData[13];
        data.scooterFirmwareVersion = reqData[11];

        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async respGtres(reqData) {
        await this.respGtresGtwlc(reqData);
    },

    async respGtwlc(reqData) {
        await this.respGtresGtwlc(reqData);
    },

    async respGtresGtwlc(reqData) {
        let imei = reqData[2];
        let countNumber = reqData[18];
        let command = `+SACK:${countNumber}$`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> respGtver');
            }
        });
        const data = {};
        data.imei = imei;
        // data.deviceName = reqData[3];
        // data.vin = reqData[4];
        // 6,7 reserved, no need to update report type
        data.powerSupply = reqData[9];
        data.mainPowerVoltage = reqData[10];
        data.backupBatteryVoltage = reqData[11];
        data.backupBatteryPercentage = reqData[12];
        data.ecuLockState = reqData[13];
        data.mechanicalLockState = reqData[14];

        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async respGtals(reqData) {
        let imei = reqData[2];
        let totalLength = reqData.length;
        let countNumber = reqData[totalLength - 1];
        let command = `+SACK:${countNumber}$`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> respGtals');
            }
        });
        const data = {};
        data.imei = imei;
        // data.deviceName = reqData[3];
        // data.vin = reqData[4];
        // 6 reserved, taskId, discard no fix no need to update
        data.mode = reqData[9];
        data.pingInterval = reqData[11];
        data.ridePingInterval = reqData[12];
        data.backupSendInterval = reqData[13];
        await IotCallbackHandler.findAndUpdateVehicle(data);
    },

    async respGtalc(reqData) {
        let imei = reqData[2];
        let countNumber = reqData[145];
        let command = `+SACK:${countNumber}$`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> respGtalc');
            }
        });
        const data = {};
        data.imei = imei;
        // data.deviceName = reqData[3];
        // data.vin = reqData[4];
        // 6 reserved, taskId no need to update
        data.configurationMask = reqData[8];
        data.qss = reqData[9];
        data.apn = reqData[10];
        data.apnUsername = reqData[11];
        data.apnPassword = reqData[12];
        data.reportMode = reqData[13];
        data.networkMode = reqData[14];
        data.enableBuffer = reqData[15];
        data.mainServerIp = reqData[16];
        data.mainServerPort = reqData[17];
        data.lteMode = reqData[18];
        data.region = reqData[19];
        // 20 reserved
        data.pingInterval = reqData[21];
        data.enableSACK = reqData[22];
        data.enableBleUnlock = reqData[23];
        data.bleBroadCastName = reqData[24];
        data.cfg = reqData[25];
        data.newPassword = reqData[26];
        data.deviceName = reqData[27];
        data.gpsOnNeed = reqData[28];
        data.filtrateTheGpsDataTime = reqData[29];
        data.agpsMode = reqData[30];
        // 31, 34, 35 reserved
        data.reportItemMask = reqData[32];
        data.eventMask = reqData[33];
        data.backupVoicePlayEnable = reqData[36];
        data.powerOffEnable = reqData[37];
        data.voicePlayEnable = reqData[38];
        data.volume = reqData[39];
        data.alarmVolume = reqData[40];

        data.tma = reqData[41];
        data.sign = reqData[42];
        data.hourOffset = reqData[43];
        data.minuteOffset = reqData[44];
        data.daylightSaving = reqData[45];
        data.utcTime = reqData[46];
        // 47, 48, 49, 50 reserved
        data.fri = reqData[51];
        data.friMode = reqData[52];
        data.fri = reqData[52];
        data.discardNoFix = reqData[53];
        data.pingInterval = reqData[54];
        data.ridePingInterval = reqData[55];
        data.backupSendInterval = reqData[56];
        // 57, 58, 59, 60, 63, 66 reserved
        data.dog = reqData[61];
        data.dogMode = reqData[62];
        data.interval = reqData[64];
        data.time = reqData[65];
        data.reportBeforeReboot = reqData[67];
        data.unit = reqData[68];
        data.noNetworkInterval = reqData[69];
        data.noActivationInterval = reqData[70];
        data.sendTimeOutFail = reqData[71];
        // 72, 73, 74, 75, 76 reserved
        data.nmd = reqData[77];
        data.nonMovementDuration = reqData[78];
        data.movementDuration = reqData[79];
        data.sensitivityLevel = reqData[80];
        // 81, 82, 83, 84, 85, 89, 90, 91, 93 reserved
        data.alm = reqData[86];
        data.continuousVibrationAlarm = reqData[87];
        data.alarmInterval = reqData[88];
        data.ecc = reqData[92];
        data.maxSpeedLimit = reqData[94];
        data.speedUpMode = reqData[95];
        data.displayUnit = reqData[96];
        // 97, 98, 99, 100, 101, 106, 107, 108, 109, 110, 111 reserved
        data.led = reqData[102];
        data.greenLedToIndicateTheStatusEnable = reqData[103];
        data.ledWorkMode = reqData[104];
        data.ledBlinkFrequency = reqData[105];
        data.ipn = reqData[112];
        // 114:mainServerIp, 115:mainServerPort already used
        // 116, 117, 118, 119, 120, 121, 129 reserved
        data.vad = reqData[122];
        data.mechanicalLockEnable = reqData[123];
        data.electronicBellEnable = reqData[124];
        data.requestToStopServiceEnable = reqData[125];
        data.nfcWorkMode = reqData[126];
        data.scooterBatteryHeating = reqData[127];
        data.mechanicalLockType = reqData[128];
        data.nfc = reqData[130];
        // 131, 134, 135, 136, 138, 141, 142, 143 reserved, generated time no need to save
        data.tagIdSelection = reqData[132];
        data.tagIdString = reqData[133];
        data.bcp = reqData[137];
        data.passwordTypeSelection = reqData[139];
        data.staticPasswordString = reqData[140];

        await IotCallbackHandler.findAndUpdateVehicle(data);
    },
};

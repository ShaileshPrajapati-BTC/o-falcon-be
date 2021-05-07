const RideBookingService = require(`../../../../rideBooking`);
const UtilService = require(`../../../../util`);
const IotCallbackHandler = require('../../../../iotCallbackHandler');
const TaskService = require('../../../../task');

module.exports = {
    // No need to send callback other than L1, As per talk with Sharon(OMNI Support team)

    async q0(reqData) {
        // console.log('--------Q0: sign in callback received Start--------');

        const data = {};
        data.omniCode = reqData[1];
        data.iotBatteryLevel = parseFloat(reqData[4]) / 100;
        data.batteryLevel = parseInt(reqData[5]);
        data.networkSignal = parseInt(reqData[6]);
        data.imei = reqData[2];
        console.log('Q0', data.imei);
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------Q0: sign in callback received End--------');
    },

    async h0(reqData) {
        // console.log('--------H0: heartbeat callback received Start--------');
        let imei = reqData[2];
        const data = {};
        data.omniCode = reqData[1];
        data.imei = imei;
        // 0-unlocked, 1-locked
        data.lockStatus = parseInt(reqData[4]) === 1;
        data.iotBatteryLevel = parseFloat(reqData[5]) / 100;
        data.networkSignal = parseInt(reqData[6]);
        data.batteryLevel = parseInt(reqData[7]);
        data.chargeStatus = parseInt(reqData[8]) === 1;
        await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        // console.log('--------H0: heartbeat callback received End--------');
    },

    async r0(reqData) {
        // console.log('--------R0: request callback received Start--------');
        let imei = reqData[2];
        let isLock = parseInt(reqData[4]) === 1;
        let key = reqData[5];
        const VC = reqData[1];
        let command = `*SCOS,${VC},${imei},L1,${key}#`;
        // change command if it is request for unlock
        if (!isLock) {
            let iotRideId = reqData[6];
            let date = new Date();
            let timeStamp = Math.floor(date.getTime() / 1000);
            command = `*SCOS,${VC},${imei},L0,${key},${iotRideId},${timeStamp}#`;
        }

        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> R0');
            }
        });
        // console.log(`--------R0: request callback received End isLock = ${isLock}--------`);
    },

    async l0(reqData) {
        // console.log('--------L0: unlock callback received Start--------');
        let imei = reqData[2];
        let iotRideId = reqData[5];
        const VC = reqData[1];
        let command = `*SCOS,${VC},${imei},L0#`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> L0');
            }
        });
        const data = {
            imei: imei,
            status: parseInt(reqData[4]),
            uid: iotRideId
        };
        console.log('uid = ', data.uid);
        await IotCallbackHandler.unlockCallbackReceived(data);
        // console.log('--------L0: unlock callback received End--------');
    },

    async l1(reqData) {
        // console.log('--------L1: lock callback received Start--------');
        let imei = reqData[2];
        let iotRideId = reqData[5];
        const VC = reqData[1];
        let command = `*SCOS,${VC},${imei},L1#`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> L1');
            }
        });
        const data = {
            status: parseInt(reqData[4]),
            uid: iotRideId,
            imei: imei
        };
        await IotCallbackHandler.lockCallbackReceived(data);
        // console.log('--------L1: lock callback received End--------');
    },

    // IOT device settings

    // todo
    async s5(reqData) {
        // console.log('--------S5: obtain lock status callback received Start--------');
        // set after discuss
        const data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.accelerometerSensitivity = reqData[4];
        data.isUnlockStatusPingEnabled = reqData[5];
        data.pingInterval = parseInt(reqData[6]);
        data.ridePingInterval = parseInt(reqData[7]);

        await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        // console.log('--------S5: obtain lock status callback received End--------');
    },

    async s6(reqData) {
        // console.log('--------S6: callback received Start--------');
        let imei = reqData[2];
        const data = {};
        data.omniCode = reqData[1];
        data.imei = imei;
        data.batteryLevel = parseInt(reqData[4]);
        data.speedMode = parseInt(reqData[5]);
        data.speed = parseInt(reqData[6]);
        data.chargeStatus = parseInt(reqData[7]);
        data.battery1Voltage = parseInt(reqData[8]);
        data.battery2Voltage = parseInt(reqData[9]);
        data.lockStatus = parseInt(reqData[10]);
        data.networkSignal = parseInt(reqData[11]);


        // data.accelerometerSensitivity = parseInt(reqData[5]);
        // data.speed = parseInt(reqData[7]);
        // data.chargeStatus = parseInt(reqData[8]);
        // data.lockStatus = parseInt(reqData[10]);
        // data.networkSignal = parseInt(reqData[6]);

        await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        // console.log('--------S6: callback received End--------');
    },

    async s7(reqData) {
        // console.log('--------S7: callback received Start--------');
        const data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.headLight = parseInt(reqData[4]);
        data.accelerometerSensitivity = parseInt(reqData[5]);
        data.throttleResponse = parseInt(reqData[6]);
        data.tailLightTwinkling = parseInt(reqData[7]);

        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------S7: callback received End--------');
    },

    async s4(reqData) {
        // console.log('--------S4: callback received Start--------');
        // now no need to update this data, so commenting below code
        const data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.inchSpeedDisplay = reqData[4];
        data.cruiseControlSetting = reqData[5];
        data.startupModeSetting = reqData[6];
        data.buttonSwitchingSpeedMode = reqData[7];
        data.keySwitchHeadlight = reqData[8];
        data.lowSpeedModeSpeedLimitValue = reqData[9];
        data.mediumSpeedModeSpeedLimitValue = reqData[10];
        data.highSpeedModeSpeedLimitValue = parseInt(reqData[11]);
        data.maxSpeedLimit = parseInt(reqData[11]);

        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------S4: callback received End--------');
    },

    async w0(reqData) {
        // console.log('--------W0: Alarming callback received Start--------');
        const notificationData = {
            1: sails.config.NOTIFICATION.IOT_NOTIFICATION.UNAUTHORIZED_MOVEMENT,
            2: sails.config.NOTIFICATION.IOT_NOTIFICATION.DOWN_GROUND_ALARM,
            3: sails.config.NOTIFICATION.IOT_NOTIFICATION.ILLEGAL_REMOVAL_ALARM,
            4: sails.config.NOTIFICATION.IOT_NOTIFICATION.LOW_POWER_ALARM,
            6: sails.config.NOTIFICATION.IOT_NOTIFICATION.LIFTED_UP_ALARM,
            7: {
                ...sails.config.NOTIFICATION.IOT_NOTIFICATION.CRITICAL_EVENTS,
                message: 'Illegal Demolition Alarm'
            },
        };
        const imei = reqData[2];
        const status = parseInt(reqData[4]);
        const notification = notificationData[status];
        await RideBookingService.sendIOTNotification(imei, notification);
        await TaskService.autoCreateTaskForVehicleDamage(notificationData, imei);
        // console.log('--------W0: Alarming callback received End--------');
    },

    async v0(reqData) {
        // console.log('--------V0: Beep playback callback received Start--------');
        let imei = reqData[2];
        let data = { imei: imei };
        let playStatus = parseInt(reqData[4]);
        switch (playStatus) {
            case 1:
                data.alarmStatus = false;
                break;

            case 2:
                data.alarmStatus = true;
                break;

            case 80:
                data.voicePlayStatus = false;
                break;

            case 81:
                data.voicePlayStatus = true;
                break;

            default:
                break;
        }
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------V0: Beep playback callback received End--------');
    },

    async d0(reqData) {
        // console.log('--------D0: positioning callback received Start--------');
        let imei = reqData[2];
        // no need to use Command acquisition positioning upload identifier and UTC time
        const isInvalidPositioning = reqData[6] === 'V';
        if (isInvalidPositioning) {
            return;
        }
        const locationData = {
            latInput: reqData[7], latDirection: reqData[8], lngInput: reqData[9], longDirection: reqData[10]
        }
        let data = {
            imei: imei,
            mode: 'D'
        };
        data.omniCode = reqData[1];
        data.noOfSatellites = parseInt(reqData[11]);
        data.hdop = parseFloat(reqData[12]);
        data.altitude = parseInt(reqData[14]);
        await IotCallbackHandler.calculateAndUpdateLocation(locationData, data);
        // console.log('--------D0: positioning callback received End--------');
    },

    async d1(reqData) {
        // console.log('--------D1: Beep playback callback received Start--------');
        let imei = reqData[2];
        const isInvalidPositioning = reqData[6] === 'V';
        if (isInvalidPositioning) {
            return;
        }
        const locationData = {
            latInput: reqData[7], latDirection: reqData[8], lngInput: reqData[9], longDirection: reqData[10]
        }
        let data = {
            imei: imei,
            mode: 'D'
        };
        data.omniCode = reqData[1];
        data.noOfSatellites = parseInt(reqData[11]);
        data.hdop = parseFloat(reqData[12]);
        data.altitude = parseInt(reqData[14]);
        await IotCallbackHandler.calculateAndUpdateLocation(locationData, data);
        // console.log('--------D1: Beep playback callback received End--------');
    },

    async g0(reqData) {
        // console.log('--------G0: query firmware version cmd callback received Start--------');
        let data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.iotVersion = parseInt(reqData[4]);
        data.firmwareCompilationDate = reqData[5];
        data.ecuSoftwareVersion = parseInt(reqData[6]);
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------G0: query firmware version cmd callback received End--------');
    },

    // todo
    async e0(reqData) {
        // console.log('--------E0: Alarming callback received Start--------');
        let imei = reqData[2];
        let errorCode = reqData[4];

        // console.log('--------E0: Alarming callback received End--------');
    },

    async u0(reqData) {
        // console.log('--------U0: callback received Start--------');
        let data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.iotCode = reqData[4];
        data.ecuHardwareVersion = parseInt(reqData[5]);
        data.scooterControllerHardwareVersion = reqData[6];

        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------U0: callback received End--------');
    },

    async u1(reqData) {
        // console.log('--------U1: callback received Start--------');
        let data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.uploadedFiles = parseInt(reqData[4]);
        data.iotCode = reqData[5];

        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------U1: callback received End--------');
    },

    // todo
    async u2(reqData) {
        // console.log('--------U0: callback received Start--------');
        let data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.isUpgraded = parseInt(reqData[5]);
        data.iotCode = reqData[4];

        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------U0: callback received End--------');
    },

    async k0(reqData) {
        // console.log('--------K0: callback received Start--------');
        let data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.bleKey = reqData[4];
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------K0: callback received End--------');
    },

    async s1(reqData) {
        // console.log('--------S1: callback received Start--------');
        let criticalEvents = sails.config.NOTIFICATION.IOT_NOTIFICATION.CRITICAL_EVENTS;
        let basicEvents = sails.config.NOTIFICATION.IOT_NOTIFICATION.BASIC_EVENTS;
        const imei = reqData[2];
        const status = parseInt(reqData[4]);
        const notificationData = {
            1: {
                ...criticalEvents,
                message: 'IOT Shutdown.'
            },
            2: {
                ...criticalEvents,
                message: 'IOT Restart.'
            },
            10: {
                ...basicEvents,
                message: 'Scooter is reserved.'
            },
            11: {
                ...basicEvents,
                message: 'Cancel Scooter Reservation.'
            },
            12: {
                ...criticalEvents,
                message: 'Marking Scooter Failure.'
            },
            13: {
                ...criticalEvents,
                message: 'Cancel Scooter Fault Flag.'
            },
            16: {
                ...criticalEvents,
                message: 'Marked Scooter Lost.'
            },
            17: {
                ...criticalEvents,
                message: 'Cancel Scooter Lost.'
            }
        };
        const notification = notificationData[status];
        await RideBookingService.sendIOTNotification(imei, notification);
        // console.log('--------S1: callback received End--------');
    },

    async i0(reqData) {
        // console.log('--------I0: callback received Start--------');
        let data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.iccid = reqData[4];
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------I0: callback received End--------');
    },

    async m0(reqData) {
        // console.log('--------M0: callback received Start--------');
        let data = {};
        data.omniCode = reqData[1];
        data.imei = reqData[2];
        data.mac = reqData[4];
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------M0: callback received End--------');
    },
    async l5(reqData) {
        // console.log('--------L5: callback received Start--------');
        // set after discuss
        const data = {};
        data.imei = reqData[2];
        const commandType = parseInt(reqData[4]);
        const commandResponse = parseInt(reqData[5]);
        const commands = {
            1: {
                name: 'BatteryLock',
                key: 'batteryLockStatus'
            },
            2: {
                name: 'WheelLock',
                key: 'wheelLockStatus'
            },
            3: {
                name: 'CableLock',
                key: 'cableLockStatus'
            },
            33: {
                name: 'BatteryLock',
                key: 'batteryLockStatus'
            },
            34: {
                name: 'WheelLock',
                key: 'wheelLockStatus'
            },
            35: {
                name: 'CableLock',
                key: 'cableLockStatus'
            }
        };
        let msg = '';
        let command = commands[commandType];
        switch (commandResponse) {
            case 0:
                msg = `${command.name} Unlocked Successfully`;
                data[command.key] = false;
                break;
            case 1:
                msg = `${command.name} Unlocking Failed!`;
                data[command.key] = true;
                break;
            case 2:
                msg = `${command.name} Unlocking Timeout!`;
                data[command.key] = true;
                break;
            case 16:
                data[command.key] = true;
                break;
            case 17:
                data[command.key] = false;
                break;
        }
        if (msg) {
            let notification = {
                type: 12,
                sendInterval: 0,
                message: message,
                priority: notificationConstants.PRIORITY.NORMAL
            };
            await RideBookingService.sendIOTNotification(data.imei, notification);
        }
        if (typeof data[command.key] != 'undefined') {
            await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        }
        // console.log('--------L5: callback received End--------');
    }
};
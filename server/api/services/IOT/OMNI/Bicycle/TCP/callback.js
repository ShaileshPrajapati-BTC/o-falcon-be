const RideBookingService = require('../../../../rideBooking');
const UtilService = require('../../../../util');
const IotCallbackHandler = require('../../../../iotCallbackHandler');
const IoTService = require('../../../../iot');

module.exports = {

    async l0(reqData) {
        // console.log('--------L0: unlock callback received Start--------');
        let imei = reqData[2];
        let iotRideId = reqData[6];
        let currTimeInYear = UtilService.currTimeInYearForIot();
        let VC = reqData[1];
        let command = `*CMDS,${VC},${imei},${currTimeInYear},Re,L0#`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> L0');
            }
        });
        let data = {
            imei: imei,
            status: 0,
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
        let currTimeInYear = UtilService.currTimeInYearForIot();
        let VC = reqData[1];
        let command = `*CMDS,${VC},${imei},${currTimeInYear},Re,L1#`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> L0');
            }
        });
        let data = {
            status: 0,
            uid: iotRideId,
            imei: imei
        };
        await IotCallbackHandler.lockCallbackReceived(data);
        // console.log('--------L1: lock callback received End--------');
    },

    async d0(reqData) {
        // console.log('--------D1: positioning callback received Start--------');
        let imei = reqData[2];
        let currTimeInYear = UtilService.currTimeInYearForIot();
        let VC = reqData[1];
        let command = `*CMDS,${VC},${imei},${currTimeInYear},Re,D0#`;
        sails.config.sendTcpCommand(imei, command, (err) => {
            if (err) {
                console.log('can not send response callback -> L0');
            }
        });
        const invalidPositioning = reqData[6] === 'V';
        if (invalidPositioning) {
            return;
        }
        const locationData = {
            latInput: reqData[8], latDirection: reqData[9], lngInput: reqData[10], longDirection: reqData[11]
        }
        let data = {
            speed: 1, chargeStatus: false, mode: 'D', imei: imei, omniCode: VC
        };
        await IotCallbackHandler.calculateAndUpdateLocation(locationData, data);
        // console.log('--------D1: positioning callback received End--------');
    },

    async q0(reqData) {
        // console.log('--------Q0: sign in callback received Start--------');
        let omniCode = reqData[1];
        let imei = reqData[2];
        let batteryLevel = parseInt(reqData[6]);
        if (!batteryLevel) {
            let batteryConfig = sails.config.OMNI_BICYCLE_BATTERY_LEVEL;
            batteryLevel = IoTService.getBatteryPercentageFromVolt(reqData[5], batteryConfig);
        }
        let data = {
            imei: imei,
            omniCode: omniCode,
            batteryLevel: batteryLevel
        };
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------Q0: sign in callback received End--------');
    },

    async h0(reqData) {
        // console.log('--------H0: heartbeat callback received Start--------');
        let imei = reqData[2];
        let lockStatus = parseInt(reqData[5]) === 1; // 0-unlocked, 1-locked
        let batteryLevel = parseInt(reqData[9]);
        if (!batteryLevel) {
            let batteryConfig = sails.config.OMNI_BICYCLE_BATTERY_LEVEL;
            batteryLevel = IoTService.getBatteryPercentageFromVolt(reqData[6], batteryConfig);
        }
        let gsmSignalValue = reqData[7];

        let data = {
            imei: imei,
            lockStatus: lockStatus,
            batteryLevel: batteryLevel,
            omniCode: reqData[1]
        };
        await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        let isSendNotification = parseInt(reqData[8]);
        if (isSendNotification) {
            let notification = isSendNotification === 1 ? 'Shocking' : 'E-Bike Down';
            notification += ` Alarm from E-Bike ${imei}`;
            await RideBookingService.sendIOTNotification(imei, notification);
        }
        // console.log('--------H0: heartbeat callback received End--------');
    },

    async s5(reqData) {
        // console.log('--------S5: obtain lock status callback received Start--------');
        let imei = reqData[2];
        let batteryLevel = parseInt(reqData[10]);
        if (!batteryLevel) {
            let batteryConfig = sails.config.OMNI_BICYCLE_BATTERY_LEVEL;
            batteryLevel = IoTService.getBatteryPercentageFromVolt(reqData[5], batteryConfig);
        }

        let gsmSignalValue = reqData[6];
        let reserveParameter = reqData[7];
        let lockStatus = parseInt(reqData[8]) === 1;

        let data = {
            imei: imei,
            lockStatus: lockStatus,
            batteryLevel: batteryLevel,
            omniCode: reqData[1]
        };
        await IotCallbackHandler.findAndUpdateRideAndVehicle(data);
        // console.log('--------S5: obtain lock status callback received End--------');
    },

    async s8(reqData) {
        // console.log('--------S8: ringing for finding bike callback received Start--------');
        let imei = reqData[2];
        let secondsOfRinging = reqData[5];
        let reserveParameter = reqData[6];

        let data = {
            imei: imei
        };

        // console.log('--------S8: ringing for finding bike callback received End--------');
    },

    async g0(reqData) {
        // console.log('--------G0: query firmware version cmd callback received Start--------');
        let imei = reqData[2];
        let versionInfo = reqData[5];
        let compileTime = reqData[6];
        // console.log('--------G0: query firmware version cmd callback received End--------');
    },

    async w0(reqData) {
        // console.log('--------W0: alraming cmd callback received Start--------');
        let imei = reqData[2];
        let alramingStatus = reqData[5];
        // console.log('--------W0: alraming cmd callback received End--------');
    },

    async i0(reqData) {
        // console.log('--------I0: sim card iccid callback received Start--------');
        let imei = reqData[2];
        let iccid = reqData[5];
        let omniCode = reqData[1];
        let data = {
            imei: imei,
            iccid: iccid,
            omniCode: omniCode
        };
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------I0: sim card iccid callback received End--------');
    },

    async m0(reqData) {
        // console.log('--------I0: sim card iccid callback received Start--------');
        let imei = reqData[2];
        let mac = reqData[5];
        let omniCode = reqData[1];
        
        let data = {
            imei: imei,
            mac: mac,
            omniCode: omniCode
        };
        await IotCallbackHandler.findAndUpdateVehicle(data);
        // console.log('--------I0: sim card iccid callback received End--------');
    },

    async l3(reqData) {
        // console.log('--------L3: heartbeat callback received Start--------');
        let imei = reqData[2];
        const status = parseInt(reqData[5]) === 1 ? 'Failed to' : 'Successfully';
        const operation = parseInt(reqData[6]) === 1 ? 'Off' : 'On';
        let notification = `${status} Turn ${operation} the Power Of E-Bike: ${imei}`;

        await RideBookingService.sendIOTNotification(imei, notification);
        // console.log('--------L3: heartbeat callback received End--------');
    }
};

/* eslint-disable camelcase */
const RideBookingService = require('../../../../rideBooking');
const UtilService = require('../../../../util');
const ZimoIotService = require('./iot');
const IotCallbackHandler = require('../../../../iotCallbackHandler');

module.exports = {
    async subscribeScooter() {
        console.log('in subscribeScooter');
        let subMaster = await Master.findOne({ code: 'ZIMO' });
        if (!subMaster || !subMaster.id) {
            return;
        }
        let scooters = await Vehicle.find({
            where: {
                type: sails.config.VEHICLE_TYPE.SCOOTER,
                manufacturer: subMaster.id
            },
            select: ['imei']
        });
        const topicUrl = sails.config.ZIMO_TOPIC_URL;

        for (let scooter of scooters) {
            if (scooter.imei) {
                sails.config.mqttServer.subscribe(`${topicUrl}${scooter.imei}`, (err) => {
                    if (err) {
                        sails.log.error(`Can't subscribe scooter: ${scooter.imei}`);
                    }
                    sails.log.debug(`Subscribe to scooter: ${scooter.imei}`);
                });
            }
        }
    },

    async mt1Received(imei, data) {
        let vehicle = await this.getVehicle(imei);
        let currentTime = UtilService.getTimeFromNow();

        data.connectionStatus = true;
        data.lastConnectedDateTime = currentTime;
        data.lastConnectionCheckDateTime = currentTime;
        await this.createIOTLog(imei, data, data);
        await this.updateVehicle(vehicle, data);
    },

    async mt2Received(imei, reqData) {
        let vehicle = await this.getVehicle(imei);
        let data = {
            lat: reqData.la,
            lng: reqData.lo,
            status: 0,
            mode: 'D',
            speed: reqData.ws,
            batteryLevel: reqData.sb,
            chargeStatus: reqData.pw !== 0
        };
        reqData.imei = imei;
        reqData.status = 0;
        reqData.mode = 'D';
        reqData.pw = reqData.pw !== 0;
        await this.createIOTLog(imei, data, reqData);
        await IotCallbackHandler.findAndUpdateVehicle(reqData);
        await IOTCallbackLocationTrack.create({ imei: imei, data: reqData });
        // await IotCallbackHandler.updateCurrentLocation(vehicle, data);
        let ride = await this.getRide(vehicle.id);
        // await RideBookingService.sendNotificationToAdmin(reqData, vehicle.id, ride, vehicle.type, imei);
        await RideBookingService.sendZimoNotificationToAdmin(reqData, vehicle.imei);
        if (vehicle.isAvailable) {
            return;
        }
        if (!vehicle.isAvailable && vehicle.isRideCompleted) {
            await RideBookingService.rideStopped(vehicle, data);

            return;
        }
        // start ride, stop ride on rf
        // pause ride, resume ride on io
        if (!ride || !ride.status) {
            console.log('ride not found = ', ride);

            return;
        }
        let iotUpdateInfo = this.getIotUpdateInfo(reqData.rf, reqData.io);
        console.log(`ride.status=${ride.status}, rf=${reqData.rf} io=${reqData.io}`);
        console.log('iotUpdateInfo', iotUpdateInfo);
        let logForLockUnlock = false;
        if (iotUpdateInfo.isTripStarted && ride.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED
        ) {
            logForLockUnlock = true;
            await RideBookingService.startRide(ride, data);
        } else if (iotUpdateInfo.isTripStop && ride.status === sails.config.RIDE_STATUS.ON_GOING) {
            logForLockUnlock = true;
            let stopLocation = {
                type: 'Point',
                coordinates: [
                    data.lng,
                    data.lat
                ]
            };
            data.tripTime = reqData.tt;
            data.tripDistance = reqData.td;
            await RideBookingService.stopRideInstant(ride, stopLocation, true, data, sails.config.IS_AUTO_DEDUCT);
        } else if (iotUpdateInfo.isLocked &&
            ride.status === sails.config.RIDE_STATUS.ON_GOING && !ride.isPaused
        ) {
            logForLockUnlock = true;
            await RideBookingService.ridePaused(ride, data);
        } else if (!iotUpdateInfo.isLocked &&
            ride.status === sails.config.RIDE_STATUS.ON_GOING && ride.isPaused
        ) {
            logForLockUnlock = true;
            await RideBookingService.rideResumed(ride, data);
        }
        if (logForLockUnlock) {
            await IOTCallbackLockUnlockTrack.create({ imei: imei, data: reqData });
        }
    },

    async mt4Received(imei, reqData) {
        await IOTCallbackInfoTrack.create({ imei: imei, data: reqData });
        reqData.imei = imei;
        await this.createIOTLog(imei, reqData, reqData);
        await IotCallbackHandler.findAndUpdateVehicle(reqData);
    },

    async mt5Received(imei, reqData) {
        await IOTCallbackInfoTrack.create({ imei: imei, data: reqData });
        await this.createIOTLog(imei, reqData, reqData);
    },

    async otherDataReceived(imei, reqData) {
        await IOTCallbackInfoTrack.create({ imei: imei, data: reqData });
        await this.createIOTLog(imei, reqData, reqData);
        let commandToSend = reqData;
        console.log('reqData.from', reqData, typeof commandToSend);
        if (typeof commandToSend === 'string') {
            commandToSend = JSON.parse(commandToSend);
        }
        if (commandToSend.from && commandToSend.from === 'SM') {
            delete commandToSend.from;
            await ZimoIotService.publishToScooter(imei, commandToSend);
        }
    },

    getIotUpdateInfo(rf, io) {
        let iotInfo = {
            isTripStarted: false,
            isTripStop: false,
            isLocked: false
        };
        const rfBit = this.getBinaryNumber(rf);
        const ioBit = this.getBinaryNumber(io);
        iotInfo.isTripStarted = rfBit.substring(7, 8) === '1';
        iotInfo.isTripStop = rfBit.substring(8, 9) === '1';
        iotInfo.isLocked = ioBit.substring(6, 7) === '1';

        return iotInfo;
    },

    getBinaryNumber(number) {
        let str = number.toString(2);
        str = str.split('').reverse().join('');

        return str;
    },

    async getVehicle(imei) {
        let vehicle = await Vehicle.findOne({ imei: imei });

        return vehicle;
    },

    async updateVehicle(vehicle, data) {
        if (vehicle && vehicle.id && data) {
            data = this.modifyKeys(data);
            await IotCallbackHandler.updateVehicle(vehicle, data);
        }
    },

    modifyKeys(data) {
        let newData = {};
        let acceptKeys = ['mac', 'id', 'iot_hw', 'iot_sw', 'ecu_hw', 'ecu_fw',
            'connectionStatus', 'lastConnectedDateTime', 'lastConnectionCheckDateTime'
        ];
        let changeKeyName = {
            id: 'iccid',
            iot_hw: 'scooterVersion',
            iot_sw: 'iotVersion',
            ecu_hw: 'ecuHardwareVersion',
            ecu_fw: 'ecuSoftwareVersion'
        };
        for (let key of Object.keys(data)) {
            if (acceptKeys.indexOf(key) > -1) {
                let newKey = key;
                if (changeKeyName[newKey]) {
                    newKey = changeKeyName[newKey];
                }
                newData[newKey] = data[key];
            }
        }

        return newData;
    },

    async getRide(vehicleId) {
        let ride = await RideBooking
            .find({
                where: { vehicleId: vehicleId },
                sort: 'iotRideId desc',
                limit: 1
            })
            .populate('vehicleId');

        return ride[0];
    },

    async createIOTLog(imei, callback, actualCallback) {
        await IOTCommandCallbackTrack.create({
            imei: imei,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(actualCallback),
            decodedCallback: callback
        });
    }
};

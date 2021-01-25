const RideBookingService = require('./rideBooking');
const UtilService = require('./util');
const RedisDBService = require('./redisDB');

module.exports = {

    async unlockCallbackReceived(data) {
        let ride = await this.getRide(data.uid);
        if (!ride || !ride.status) {
            console.log('ride not found = ', data.uid);
            if (data.status === 0) {
                await this.findAndUpdateVehicle({
                    lockStatus: false,
                    imei: data.imei
                });
            }
            return;
        }
        console.log('ride.status = ', ride.status);
        if (ride.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
            // start ride
            await RideBookingService.startRide(ride, data);
        } else if (ride.status === sails.config.RIDE_STATUS.ON_GOING) {
            // resume ride
            await RideBookingService.rideResumed(ride, data);
        }
    },

    async lockCallbackReceived(data) {
        console.log('uid = ', data.uid);
        if (data.uid) {
            let ride = await this.getRide(data.uid);
            console.log('ride.status = ', ride && ride.status);

            if (ride && ride.status === sails.config.RIDE_STATUS.ON_GOING) {
                // pause ride
                await RideBookingService.ridePaused(ride, data);

                return;
            }
        }
        let vehicle = await Vehicle.findOne({
            imei: data.imei
        });

        await RideBookingService.rideStopped(vehicle, data);
    },

    async calculateAndUpdateLocation(locationData, data) {
        const { latInput, latDirection, lngInput, longDirection } = locationData;
        const { lat, lng } = UtilService.convertDMSToLocation(latInput, latDirection, lngInput, longDirection);
        data.lat = lat;
        data.lng = lng;

        await this.updateLocation(data);
    },

    async updateLocation(data) {
        await this.findAndUpdateVehicle(data);
    },

    async getRide(iotRideId) {
        if (!iotRideId) {
            return true;
        }
        let ride = await RideBooking
            .findOne({ iotRideId: iotRideId })
            .populate('vehicleId');

        return ride;
    },

    async getVehicle(imei) {
        let vehicle;
        try {
            vehicle = await RedisDBService.getData(imei);
        } catch (e) {
            console.log('IOT Callback Handler: getVehicle : can not get data from redis', e);
        }
        if (!vehicle || !vehicle.id) {
            vehicle = await Vehicle.findOne({ imei: imei })
                .select([
                    'id', 'imei', 'connectionStatus', 'currentLocation', 'lastSpeedSet',
                    'lastAlarmed', 'isRideCompleted', 'isAvailable', 'maxSpeedLimit',
                    'pingInterval', 'ridePingInterval', 'type', 'franchiseeId', 'dealerId', 'lastLocation'
                ]);

            await RedisDBService.setData(imei, vehicle);
        }

        return vehicle;
    },

    async updateVehicle(vehicle, data) {
        if (vehicle && vehicle.id && data) {
            data = this.modifyKeys(data, vehicle);
            data = this.filterVehicleData(data, vehicle);
            if (data.id) {
                delete data.id;
            }
            if (!vehicle.connectionStatus) {
                const IotService = require('./iot');
                let vehicleData = await RideBookingService.getVehicleForIOT(vehicle.id);
                console.log('updateVehicle data.omniCode', data.omniCode);
                if (data.omniCode) {
                    vehicleData.omniCode = data.omniCode;
                }
                await IotService.setDefaultIOTCommands(vehicleData);
            }
            // console.log('***********Vehicle*****************');
            // console.log(data);
            await RideBookingService.updateVehicle(vehicle, data);
        }
    },

    async findAndUpdateVehicle(data) {
        if (!data.imei) {
            return true;
        }
        let vehicle = await this.getVehicle(data.imei);
        await this.updateVehicle(vehicle, data);
    },

    async findAndUpdateRideAndVehicle(data) {
        if (!data.imei) {
            return true;
        }
        let vehicle = await this.getVehicle(data.imei);
        if (!vehicle || !vehicle.id) {
            return true;
        }
        await this.updateVehicle(vehicle, data);
        data = this.modifyKeys(data, vehicle);
        if (vehicle.lockStatus !== data.lockStatus) {
            await RideBookingService.findAndUpdateRide(vehicle.id, data.lockStatus);
        }
    },

    filterVehicleData(callbackData, vehicle) {
        let keysToBeFilter = sails.config.IOT_COMMANDS_AND_KEYS_FOR_FILTER_CALLBACK_DATA;
        for (let data of keysToBeFilter) {
            let key = data.key;
            if (callbackData[key]) {
                if (!vehicle[key]) {
                    callbackData[key] = {
                        actualValue: callbackData[key],
                        status: sails.config.SET_IOT_COMMAND_STATUS.success
                    };

                    continue;
                }
                let matchValueAndStatus = vehicle[key].requestedValue == callbackData[key] && vehicle[key].status != sails.config.SET_IOT_COMMAND_STATUS.success;
                if (matchValueAndStatus) {
                    vehicle[key].actualValue = callbackData[key];
                    vehicle[key].status = sails.config.SET_IOT_COMMAND_STATUS.success;
                    callbackData[key] = vehicle[key];
                }
            }
        }

        return callbackData;
    },

    modifyKeys(data, vehicle) {
        const currentTime = UtilService.getTimeFromNow();
        let newData = {
            connectionStatus: true,
            lastConnectedDateTime: currentTime,
            lastConnectionCheckDateTime: currentTime
        };
        let ignoreKeys = ['id', 'type', 'imei', 'status'];
        let changeKeyName = {
            power: 'batteryLevel',
            scooterBatteryPercentage: 'batteryLevel',
            sl: 'maxSpeedLimit',
            ping: 'pingInterval',
            tripint: 'ridePingInterval',
            hight_speed: 'maxSpeedLimit',
            Status: 'pingInterval',
            la: 'lat',
            lo: 'lng',
            sb: 'batteryLevel',
            pw: 'chargeStatus',
            ib: 'iotBatteryLevel',
            powerPercent: 'batteryLevel',
            online: 'connectionStatus',
            locked: 'lockStatus',
            charging: 'chargeStatus',
            latitude: 'lat',
            longitude: 'lng',
            speedMode: 'mode',
            battery_voltage: 'batteryLevel',
            satelliteNumber: 'noOfSatellites',
            lattitude: 'lat',
            digitalOutput1: 'lockStatus'
        };
        for (let key of Object.keys(data)) {
            if (!data[key] && typeof data[key] !== 'boolean' && data[key] !== 0) {
                continue;
            }
            if (ignoreKeys.indexOf(key) === -1) {
                let newKey = _.camelCase(key);
                if (changeKeyName[newKey]) {
                    newKey = changeKeyName[newKey];
                }
                try {
                    newData[newKey] = JSON.parse(data[key]);
                } catch (error) {
                    newData[newKey] = data[key];
                }
            }
        }
        if (newData.lockStatus && vehicle && vehicle.isRideCompleted && !vehicle.isAvailable) {
            newData.isAvailable = true;
        }

        return newData;
    }
};
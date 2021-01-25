const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;

const UtilService = require('./util');
const CommonService = require('./common');
const IotService = require('./iot');
const SocketEvents = require('./socketEvents');
const NotificationService = require('./notification');
const PromoCodeService = require('./promoCode');
const PaymentService = require('./payment');
const ZoneAndFareManagementService = require('./zone');
const WalletService = require('./wallet');
const BookPlanService = require('./bookPlan');
const BookingPassService = require('./bookingPass');
const UserService = require('./user');
const RedisDBService = require('./redisDB');

// Till Migration use flag as false
const isUseMinutesForRideSummary = false;

module.exports = {

    async getVehicleForIOT(vehicleId) {
        if (vehicleId && vehicleId.id) {
            vehicleId = vehicleId.id;
        }
        let vehicle;
        try {
            vehicle = await RedisDBService.getData(vehicleId);
        } catch (e) {
            console.log('can not get data from redis', e);
        }
        if (!vehicle || !vehicle.id) {
            vehicle = await Vehicle.findOne({ id: vehicleId })
                .select([
                    'lastSpeedLimit',
                    'connectionStatus',
                    'imei',
                    'omniCode',
                    'lastSpeedLimit',
                    'maxSpeedLimit',
                    'pingInterval',
                    'ridePingInterval'
                ])
                .populate('manufacturer', { select: ['name', 'code'] });

            await RedisDBService.setData(vehicle.id, vehicle);
        }

        return vehicle;
    },

    async getVehicleForIOTFromDB(vehicleId) {
        if (vehicleId && vehicleId.id) {
            vehicleId = vehicleId.id;
        }
        let vehicle = await Vehicle.findOne({ id: vehicleId })
            .populate('manufacturer');

        return vehicle;
    },

    async geLocation(vehicleId, seconds = 1) {
        let vehicle = await this.getVehicleForIOT(vehicleId);
        let res = await IotService.geLocation(vehicle, seconds);

    },

    getRequestEndDateTime() {
        let unit = 'seconds';
        let value = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;

        return UtilService.addTime(value, null, unit);
    },

    async handleTempRide(ride) {
        await RideBooking.destroyOne({ id: ride.id });
        const updateObj = {
            isAvailable: true,
            isRideCompleted: true
        };
        await Vehicle.update({ id: ride.vehicleId }, updateObj);
    },

    async requestLockUnlockScooter(command, ride, isReturn = false) {
        console.log('----------------requestLockUnlockScooter Start----------------');
        console.log('ride status', ride.status);
        console.log('ride paused', ride.isPaused);
        console.log('ride command', command);
        console.log('ride isReturn', isReturn);
        let vehicle = await this.getVehicleForIOT(ride.vehicleId);
        let res = await IotService.lockUnlock(command, vehicle, ride.iotRideId);
        // console.log('res=->',res);
        if (!res.isRequested) {
            await this.markVehicleDisconnected(vehicle.id);
            if (isReturn) {
                return res;
            } else {
                throw {
                    status: 401,
                    code: 'UNPROCESSABLE_ENTITY',
                    message: res.message
                };
            }
        }
        await this.autoLightOnOff(command, vehicle);
        let requestEndDateTime = this.getRequestEndDateTime();
        let userId = ride.userId;
        if (userId.id) {
            userId = userId.id;
        }
        await RideBooking.update(
            { id: ride.id },
            {
                isRequested: res.isRequested,
                requestEndDateTime: requestEndDateTime,
                currentRequestTry: ride.currentRequestTry + 1,
                updatedBy: userId
            }
        );
        console.log('----------------requestLockUnlockScooter End----------------');

        return res;
    },

    async autoLightOnOff(command, vehicle) {
        console.log('command', command);
        if (!sails.config.IS_DAILY_LIGHT_ON_OFF) {
            return true;
        }
        let commandToSend = '';
        if (command === 'start') {
            commandToSend = 'lightOn';
        } else if (command === 'stop') {
            commandToSend = 'lightOff';
        }
        console.log('commandToSend', commandToSend);
        if (!commandToSend) {
            return true;
        }
        console.log('sails.config.LIGHT_ON_TIME', sails.config.LIGHT_ON_TIME);
        console.log('sails.config.LIGHT_OFF_TIME', sails.config.LIGHT_OFF_TIME);
        let isBetweenTime = UtilService.checkTimeBetweenHour(
            sails.config.LIGHT_ON_TIME,
            sails.config.LIGHT_OFF_TIME
        );
        console.log('isBetweenTime', isBetweenTime);
        if (!isBetweenTime) {
            return true;
        }
        await IotService.commandToPerform(commandToSend, vehicle);
    },

    async startRide(ride, data) {
        // console.log('ride=>', JSON.stringify(ride));
        // console.log('data=>', JSON.stringify(data));
        let error;
        if (data.status === 0) {
            let currentTime = UtilService.getTimeFromNow();
            ride.statusTrack.push({
                dateTime: currentTime,
                remark: 'Scooter Unlocked',
                status: sails.config.RIDE_STATUS.ON_GOING
            });
            let updateObj = {
                status: sails.config.RIDE_STATUS.ON_GOING,
                statusTrack: ride.statusTrack,
                startDateTime: currentTime,
                startLocation: ride.vehicleId.currentLocation,
                isRequested: false,
                requestEndDateTime: '',
                updatedBy: ride.userId
            };
            if (sails.config.IS_RIDE_END_AFTER_INSUFFICIENT_WALLET_BALANCE) {
                let rideLimitData = {};
                try {
                    rideLimitData = await this.getRideLimitData(ride);
                } catch (e) {
                    console.log('e', e);
                }
                if (rideLimitData.maxKm) {
                    updateObj.maxKm = rideLimitData.maxKm;
                }
                if (rideLimitData.maxRideTime) {
                    updateObj.maxRideTime = UtilService.addTime(rideLimitData.maxRideTime, currentTime);
                }
            }
            let nest = await this.addRemoveVehicleInNest(ride.vehicleId, 'start');
            await this.addNestTrack(ride, nest);

            if (nest && sails.config.IS_NEST_ENABLED) {
                // updateObj.startNest = nest.id;
                if (nest.totalRides) {
                    await Nest.update({ id: nest.id }).set({ totalRides: nest.totalRides + 1 });
                } else {
                    await Nest.update({ id: nest.id }).set({ totalRides: 1 });
                }
            }
            await RideBooking.update({ id: ride.id }, updateObj);
            let vehicleId = ride.vehicleId;
            if (vehicleId && vehicleId.id) {
                vehicleId = vehicleId.id;
            }
            let updateVehicleData = {
                lockStatus: false,
                connectionStatus: true,
                lastConnectedDateTime: currentTime,
                lastConnectionCheckDateTime: currentTime
            };
            await Vehicle.update({ id: vehicleId }, updateVehicleData);
            if (sails.config.DEFAULT_POSITION_PING_INTERVAL_ENABLED_FOR_RIDE) {
                let vehicle = await this.getVehicleForIOT(vehicleId);
                const manufacturer = vehicle.manufacturer.code;
                await IotService.sendRequestToServer(
                    manufacturer,
                    "setPositionPingInterval",
                    vehicle,
                    { value: sails.config.DEFAULT_POSITION_PING_INTERVAL_FOR_RIDE }
                );
            }
        } else {
            error = sails.config.message.CANT_UNLOCK_VEHICLE;
        }
        await this.emitActiveRide(ride, error);
    },

    async ridePaused(ride, data) {
        let error;
        if (data.status === 0) {
            // console.log('in if ==0');
            let stopOverTrack = [];
            if (ride.stopOverTrack) {
                stopOverTrack = ride.stopOverTrack;
                let trackIndex = stopOverTrack.length - 1;
                if (!stopOverTrack[trackIndex].resumeTime) {
                    return;
                }
            }
            const currentTime = UtilService.getTimeFromNow();
            let trackData = {
                sequence: stopOverTrack.length + 1,
                pauseTime: currentTime,
                startLocation: ride.vehicleId.currentLocation
            };
            stopOverTrack.push(trackData);
            let pauseTimeLimit = await this.getPauseTimeLimit(ride);
            console.log('pauseTimeLimit', pauseTimeLimit);

            let pauseEndDateTime = UtilService.addTime(pauseTimeLimit, currentTime, 'seconds');
            console.log('pauseEndDateTime', pauseEndDateTime);
            let updateObj = {
                isRequested: false,
                requestEndDateTime: '',
                isPaused: true,
                stopOverTrack: stopOverTrack,
                updatedBy: ride.userId,
                maxRideTime: '',
                maxPauseEndDateTimeInSeconds: pauseTimeLimit
            };
            if (sails.config.PAUSE_RIDE_LIMIT_ENABLED) {
                ride.ridePausedCount++;
                if (ride.ridePausedCount >= sails.config.PAUSE_RIDE_LIMIT) {
                    ride.maxPauseLimitReached = true;
                }
                updateObj.ridePausedCount = ride.ridePausedCount;
                updateObj.maxPauseLimitReached = ride.maxPauseLimitReached;
            }
            if (ride.vehicleType !== sails.config.VEHICLE_TYPE.BICYCLE) {
                updateObj.pauseEndDateTime = pauseEndDateTime;
            }
            await RideBooking.update(
                { id: ride.id },
                updateObj
            );
            let vehicleId = ride.vehicleId;
            if (vehicleId.id) {
                vehicleId = vehicleId.id;
            }
            let updateVehicleData = {
                lockStatus: true,
                connectionStatus: true,
                lastConnectedDateTime: currentTime,
                lastConnectionCheckDateTime: currentTime
            };
            await Vehicle.update({ id: vehicleId }, updateVehicleData);
        } else {
            error = sails.config.message.CANT_LOCK_VEHICLE;
        }
        await this.emitActiveRide(ride, error);
    },

    async rideResumed(ride, data) {
        let error;
        if (data.status === 0) {
            if (!ride.stopOverTrack || !ride.stopOverTrack.length) {
                return;
            }
            let trackIndex = ride.stopOverTrack.length - 1;
            if (ride.stopOverTrack[trackIndex].resumeTime) {
                return;
            }
            ride.stopOverTrack[trackIndex].stopLocation = ride.vehicleId.currentLocation;
            ride.stopOverTrack[trackIndex].resumeTime = UtilService.getTimeFromNow();
            ride.stopOverTrack[trackIndex].duration = UtilService.getTimeDifference(
                ride.stopOverTrack[trackIndex].pauseTime,
                ride.stopOverTrack[trackIndex].resumeTime,
                'seconds'
            );
            let pauseTime = 0;
            for (let pauseTrack of ride.stopOverTrack) {
                pauseTime += pauseTrack.duration;
            }
            let updateObj = {
                isPaused: false,
                isRequested: false,
                requestEndDateTime: '',
                stopOverTrack: ride.stopOverTrack,
                pauseTime: pauseTime,
                pauseEndDateTime: '',
                updatedBy: ride.userId
            };
            let currentTime = UtilService.getTimeFromNow();
            if (sails.config.IS_RIDE_END_AFTER_INSUFFICIENT_WALLET_BALANCE) {
                let rideLimitData = await this.getRideLimitData(ride);
                if (rideLimitData.maxKm) {
                    updateObj.maxKm = rideLimitData.maxKm;
                }
                if (rideLimitData.maxRideTime) {
                    updateObj.maxRideTime = UtilService.addTime(rideLimitData.maxRideTime, currentTime);
                }
            }

            await RideBooking.update(
                { id: ride.id },
                updateObj
            );
            let vehicleId = ride.vehicleId;
            if (vehicleId.id) {
                vehicleId = vehicleId.id;
            }
            let updateVehicleData = {
                lockStatus: false,
                connectionStatus: true,
                lastConnectedDateTime: currentTime,
                lastConnectionCheckDateTime: currentTime
            };
            await Vehicle.update({ id: vehicleId }, updateVehicleData);
        } else {
            error = sails.config.message.CANT_UNLOCK_VEHICLE;
        }
        await this.emitActiveRide(ride, error);
    },

    async rideStopped(vehicle, data) {
        // console.log('rideStopped');
        // console.log(data);
        // console.log('rideStopped');
        if (data.status === 0 && vehicle.isRideCompleted) {
            let currentTime = UtilService.getTimeFromNow();
            let updateVehicleData = {
                isAvailable: true,
                lockStatus: true,
                connectionStatus: true,
                lastConnectedDateTime: currentTime,
                lastConnectionCheckDateTime: currentTime
            };
            await Vehicle.update({ id: vehicle.id }, updateVehicleData);
            if (sails.config.DEFAULT_POSITION_PING_INTERVAL_ENABLED_FOR_RIDE) {
                let vehicleData = await this.getVehicleForIOT(vehicle.id);
                const manufacturer = vehicleData.manufacturer.code;
                await IotService.sendRequestToServer(
                    manufacturer,
                    "setPositionPingInterval",
                    vehicleData,
                    { value: sails.config.DEFAULT_POSITION_PING_INTERVAL }
                );
            }
        }
        if (data.uid) {
            await RideBooking.update(
                { iotRideId: data.uid },
                {
                    isRequested: false,
                    requestEndDateTime: ''
                }
            );
        }
    },
    /* no use now, we are using updateVehicle
    async updateCurrentLocation(vehicle, data) {
        // let min = 1;
        // let max = 5;
        // let meters = parseInt((Math.random() * (max - min)) + min);
        // meters *= -1;
        // data.lng = this.getNewLong(
        //     vehicle.currentLocation.coordinates[1],
        //     vehicle.currentLocation.coordinates[0],
        //     meters
        // );
        // meters *= -1;
        // data.lat = this.getNewLat(
        //     vehicle.currentLocation.coordinates[1],
        //     meters
        // );
        // console.log('here 1');
        // if (vehicle.isRideCompleted) {
        //     return;
        // }
        // console.log('here 2');

        // above calculation is only for testing purpose;
        if (!vehicle.currentLocation || !vehicle.currentLocation.coordinates) {
            vehicle.currentLocation = {
                type: 'Point',
                coordinates: []
            };
        }
        vehicle.currentLocation.coordinates = [
            data.lng,
            data.lat
        ];
        const currentTime = UtilService.getTimeFromNow();
        let updateObj = {
            currentLocation: vehicle.currentLocation,
            connectionStatus: true,
            lastConnectedDateTime: currentTime,
            lastConnectionCheckDateTime: currentTime
        };
        if (data.speed) {
            updateObj.speed = data.speed;
            if (sails.config.DEFAULT_DISTANCE_UNIT === sails.config.DISTANCE_UNIT.MILES) {
                updateObj.speed = UtilService.convertKmToMiles(data.speed);
            }
        }
        if (data.batteryLevel) {
            updateObj.batteryLevel = data.batteryLevel;
        }
        if (data.chargeStatus) {
            updateObj.chargeStatus = data.chargeStatus;
        }
        await Vehicle.update(
            { id: vehicle.id },
            updateObj
        );
        if (!data.mode) {
            return;
        }
        // console.log('here 3');
        let ride = await RideBooking
            .findOne({
                vehicleId: vehicle.id,
                status: sails.config.RIDE_STATUS.ON_GOING,
                isPaused: false
            })
            .populate('userId', { select: ['connectedSockets'] });
        if (!ride || !ride.id) {
            return;
        }
        // console.log('here 4');
        let locationTrack = [];
        if (ride.locationTrack) {
            locationTrack = ride.locationTrack;
        }
        let dateTime = currentTime;
        if (data.utcDate && data.utcTime) {
            dateTime = UtilService.convertOmniUTCDate(data.utcDate, data.utcTime);
        }
        locationTrack.push({
            coordinates: updateObj.currentLocation.coordinates,
            dateTime: dateTime
        });
        await RideBooking.update(
            { id: ride.id },
            { locationTrack: locationTrack, updatedBy: ride.userId.id }
        );
        let vehicleData = await Vehicle.findOne({ id: vehicle.id });
        // no need this field for mobile side, and need object if field is given
        delete vehicleData.nestId;
        let resData = {
            rideId: ride.id,
            vehicleData: vehicleData
        };
        let socket = ride.userId.connectedSockets && ride.userId.connectedSockets[0];
        // console.log('here 5');
        if (socket && socket.socketId) {
            // console.log('here 6');
            await SocketEvents.locationUpdate(resData, socket);
        }
        const coordinates = [data.lat, data.lng];
        await this.checkRideOutsideZone(ride, vehicle.imei, coordinates);
        // console.log('here 7');
    }, */

    async emitActiveRide(ride, error) {
        console.log('---------------emitActiveRide Start---------------');
        // console.log('ride-emit-=>>' , ride);
        console.log('error', error);
        if (error) {
            if (ride.isRequested && ride.endDateTime) {
                await this.stopRideInstant(ride, ride.vehicleId.currentLocation, ride.userId, {}, sails.config.IS_AUTO_DEDUCT);
            } else {
                await RideBooking.update({ id: ride.id }, {
                    isRequested: false,
                    requestEndDateTime: '',
                    updatedBy: ride.userId
                });
            }
        }
        let rideData = await this.getRideResponse(ride.id);
        if (error) {
            rideData.error = error;
        }
        let socket = await UtilService.getUserSocket(ride.userId);
        socket = socket && socket[0];
        console.log('Emit Active Ride socket.socketId', socket);

        if (socket && socket.socketId) {
            await SocketEvents.activeRide(rideData, socket);
        } else {
            let message = 'Ride Updated.';
            if (error && error.message) {
                message = error.message;
            } else if (rideData.status === sails.config.RIDE_STATUS.ON_GOING && rideData.isPaused) {
                message = 'Ride Paused.';
            } else if (rideData.status === sails.config.RIDE_STATUS.ON_GOING && !rideData.isPaused) {
                message = 'Ride Started.';
                if (rideData.stopOverTrack && rideData.stopOverTrack.length > 0) {
                    message = 'Ride Resumed.';
                }
            } else if (rideData.status === sails.config.RIDE_STATUS.COMPLETED) {
                message = 'Ride Completed.';
            }
            console.log('in else Emit Active Ride socket.socketId', message);
            let userWithPlayerIds = await UtilService.getUserPlayerIds(ride.userId);
            let preferredLang;
            if (!userWithPlayerIds || !userWithPlayerIds.id) {
                userWithPlayerIds = await User.findOne({
                    where: { id: ride.userId },
                    select: ['androidPlayerId', 'iosPlayerId', 'preferredLang'],
                });
                console.log('userWithPlayerIds', userWithPlayerIds);
                await UtilService.setUserPlayerIds(ride.userId, userWithPlayerIds);
                preferredLang = userWithPlayerIds.preferredLang;
            }
            let playerIds = [];
            if (userWithPlayerIds.androidPlayerId) {
                playerIds = playerIds.concat(userWithPlayerIds.androidPlayerId);
            }
            if (userWithPlayerIds.iosPlayerId) {
                playerIds = playerIds.concat(userWithPlayerIds.iosPlayerId);
            }
            console.log('playerIds => ', playerIds);
            console.log('message => ', message);
            await NotificationService
                .sendPushNotification({
                    playerIds: playerIds,
                    content: message,
                    language: user.preferredLang
                });
        }
        console.log('---------------emitActiveRide End---------------');
    },

    async getSetting() {
        let setting = {
            basicRadius: sails.config.BASIC_RADIUS,
            unlockRadius: sails.config.UNLOCK_RADIUS,
            minBatteryLevel: sails.config.MIN_BATTERY_LEVEL,
            rideReserveTimeLimit: sails.config.RIDE_RESERVE_TIME_LIMIT,
            rideReserveTimeFreeLimit: sails.config.RIDE_RESERVE_TIME_FREE_LIMIT,
            pauseTimeLimit: sails.config.PAUSE_TIME_LIMIT
        };

        if (sails.config.UNLOCK_RADIUS === 0) {
            delete setting.unlockRadius;
        }

        return setting;
    },

    async getMinBatteryLevel() {
        return sails.config.MIN_BATTERY_LEVEL;
    },

    // async getSettingValue(key) {
    //     const setting = await Settings.findOne({
    //         where: { type: sails.config.SETTINGS.TYPE.APP_SETTING },
    //         select: [key]
    //     });

    //     return setting[key];
    // },

    async findMatchedScooters(options, user) {
        try {
            const setting = await this.getSetting();
            const isClusteringEnable = options.isClusteringEnable;
            let query = [];
            if (!isClusteringEnable) {
                query.push({
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: options.currentLocation
                        },
                        distanceField: 'distance',
                        distanceMultiplier: 0.001,
                        spherical: true
                    }
                });
            }
            let matchFilter = {
                isAvailable: true,
                isActive: true,
                connectionStatus: true,
                isDeleted: false,
                isTaskCreated: false
            };
            if (isClusteringEnable) {
                matchFilter.currentLocation = { $ne: null };
            }
            let vehicleType = options.vehicleType;
            if (vehicleType) {
                if (vehicleType === sails.config.VEHICLE_TYPE.SCOOTER) {
                    matchFilter.type = sails.config.VEHICLE_TYPE.SCOOTER;
                    matchFilter.batteryLevel = { $gte: setting.minBatteryLevel };
                } else if (vehicleType === sails.config.VEHICLE_TYPE.BICYCLE) {
                    matchFilter.type = sails.config.VEHICLE_TYPE.BICYCLE;
                } else if (vehicleType === sails.config.VEHICLE_TYPE.BIKE) {
                    matchFilter.type = sails.config.VEHICLE_TYPE.BIKE;
                    // matchFilter.batteryLevel = { $gte: setting.minBatteryLevel };
                }
            } else {
                matchFilter['$or'] = [
                    {
                        type: sails.config.VEHICLE_TYPE.SCOOTER,
                        batteryLevel: { $gte: setting.minBatteryLevel }
                    },
                    { type: sails.config.VEHICLE_TYPE.BICYCLE },
                    {
                        type: sails.config.VEHICLE_TYPE.BIKE,
                        // batteryLevel: { $gte: setting.minBatteryLevel }
                    }
                ];
            }
            query.push({ $match: matchFilter });
            if (!isClusteringEnable) {
                query.push({
                    $redact: {
                        $cond: {
                            if: { $lt: ['$distance', setting.basicRadius] },
                            then: '$$KEEP',
                            else: '$$PRUNE'
                        }
                    }
                });
            }
            matchFilter = {
                $or: []
            };
            matchFilter["$or"].push(
                {
                    dealerId: { $exists: true },
                    fleetType: { $in: [sails.config.USER.FLEET_TYPE.GENERAL] }
                },
                {
                    dealerId: null,
                    franchiseeId: null
                }
            );
            if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE) {
                console.log("535 ----- ")
                matchFilter["$or"].push(
                    {
                        franchiseeId: { $exists: true },
                        fleetType: { $in: [sails.config.USER.FLEET_TYPE.GENERAL] }
                    },
                )
            }
            if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE && user.franchiseeId) {
                console.log("545 ----- ")
                matchFilter["$or"].push({
                    franchiseeId: { $exists: true },
                    franchiseeId: ObjectId(user.franchiseeId),
                    fleetType: { $in: [user.fleetType] }
                });
            }
            if (user.dealerId) {
                matchFilter["$or"].push({
                    dealerId: { $exists: true },
                    dealerId: ObjectId(user.dealerId),
                    fleetType: { $in: [user.fleetType] }
                });
            }
            query.push({ $match: matchFilter });
            let matchedScooters = await CommonService.runAggregateQuery(
                query,
                'vehicle'
            );

            // return matchedScooters;
            if (matchedScooters.length > 0 || !sails.config.ADD_DUMMY_SCOOTERS) {
                return matchedScooters;
            }

            await this.generateDummyZoneAndScooters(options);
            matchedScooters = await this.findMatchedScooters(options, user);

            return matchedScooters;
        } catch (e) {
            throw new Error(e);
        }
    },

    async findNearestNestScooters(options) {
        try {
            const setting = await this.getSetting();
            let query = [];
            query.push(
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: options.currentLocation
                        },
                        distanceField: 'distance',
                        distanceMultiplier: 0.001,
                        spherical: true
                    }
                },
                {
                    $redact: {
                        $cond: {
                            if: { $lt: ['$distance', setting.basicRadius] },
                            then: '$$KEEP',
                            else: '$$PRUNE'
                        }
                    }
                },
                { $match: { type: sails.config.NEST_TYPE.RIDER } },
                { $sort: { distance: 1 } },
                { $limit: 3 }
            );
            let matchFilter = {
                "$expr": { "$eq": ["$nestId", "$$nId"] },
                isAvailable: true,
                isActive: true,
                connectionStatus: true,
                isDeleted: false,
                currentLocation: { $ne: null },
                isTaskCreated: false
            };

            let vehicleType = options.vehicleType;
            if (vehicleType) {
                if (vehicleType === sails.config.VEHICLE_TYPE.SCOOTER) {
                    matchFilter.type = sails.config.VEHICLE_TYPE.SCOOTER;
                    matchFilter.batteryLevel = { $gte: setting.minBatteryLevel };
                } else if (vehicleType === sails.config.VEHICLE_TYPE.BICYCLE) {
                    matchFilter.type = sails.config.VEHICLE_TYPE.BICYCLE;
                } else if (vehicleType === sails.config.VEHICLE_TYPE.BIKE) {
                    matchFilter.type = sails.config.VEHICLE_TYPE.BIKE;
                    // matchFilter.batteryLevel = { $gte: setting.minBatteryLevel };
                }
            } else {
                matchFilter['$or'] = [
                    {
                        type: sails.config.VEHICLE_TYPE.SCOOTER,
                        batteryLevel: { $gte: setting.minBatteryLevel }
                    },
                    { type: sails.config.VEHICLE_TYPE.BICYCLE },
                    {
                        type: sails.config.VEHICLE_TYPE.BIKE,
                        // batteryLevel: { $gte: setting.minBatteryLevel }
                    }
                ];
            }
            query.push({
                $lookup: {
                    from: 'Vehicle',
                    "let": { "nId": "$_id" },
                    pipeline: [
                        {
                            $match: matchFilter
                        },
                        { $limit: 3 }
                    ],
                    as: 'vehicles'
                }
            });

            let matchedNest = await CommonService.runAggregateQuery(
                query,
                'nest'
            );

            let vehicles = [];
            for (i = 0; i < matchedNest.length; i++) {
                if (matchedNest[i] && matchedNest[i].vehicles.length > 0) {
                    vehicles = matchedNest[i].vehicles;
                    delete matchedNest[i].vehicles;
                    for (key in vehicles) {
                        vehicles[key].nestId = matchedNest[i];
                    }
                    break;
                }
            }

            return vehicles;
        } catch (e) {
            throw new Error(e);
        }
    },

    async generateDummyZoneAndScooters(options) {
        let zone = await this.findZoneDataForLocation(
            options.currentLocation
        );
        console.log('generateDummyZoneAndScooters -> zone.length ', zone.length);
        if (!zone || !zone.length) {
            console.log('creating zone');
            const dummyPolygon = this.createDummyPolygon(options.currentLocation);
            let newDummyZone = {
                name: `Virtual Zone ${UtilService.randomNumber(4)}`,
                // userId: adminUser.id,
                vehicleTypes: [1],
                boundary: {
                    type: 'Polygon',
                    coordinates: [dummyPolygon]
                },
                baseCurrency: 2,
            };
            let newDummyFare = {
                timeFare: 12,
                distanceFare: 10,
                ridePauseFare: 2,
                rideReserveFare: 3,
                lateFare: 0,
                cancellationFare: 5,
                timeFareFreeLimit: 2,
                distanceFareFreeLimit: 3,
                minimumFareType: 2,
                baseFare: 2,
                parkingFine: 1,
                unlockFees: 0,
                rideDeposit: 1
            };
            // newDummyZone.statusTrack = ZoneAndFareManagementService.getStatusTrack(adminUser.id, newDummyZone);
            zone = await Zone.create(newDummyZone).fetch();
            newDummyZone.zoneId = zone.id;
            await FareManagement.create(newDummyFare);
            console.log('zone created');
        }
        await this.addDummyScooters(options.currentLocation);
    },

    async createDummyZoneUser() {
        const dummyZoneUser = await User.create({
            type: 2,
            name: 'Zone Dummy User',
            emails: [
                {
                    email: sails.config.ZONE_DUMMY_USER_EMAIL,
                    isPrimary: true,
                    isVerified: true
                }
            ],
            firstName: 'zone',
            lastName: 'admin',
            mobiles: [
                {
                    mobile: '9977884736',
                    countryCode: '+91',
                    isPrimary: true,
                    isVerified: true
                }
            ],
            dob: '07-11-1993',
            addresses: [],
            password: 'eScooter@170719',
            isActive: true
        }).fetch();
        console.log('dummy user created');

        return dummyZoneUser;
    },

    async checkRiderInsideRadius(currentLocation, vehicleId, radius) {
        try {
            let query = [
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: currentLocation
                        },
                        distanceField: 'distance',
                        // distanceMultiplier: 1,
                        // spherical: true
                    }
                },
                { $match: { _id: ObjectId(vehicleId) } },
                {
                    $redact: {
                        $cond: {
                            if: { $lt: ['$distance', radius] },
                            then: '$$KEEP',
                            else: '$$PRUNE'
                        }
                    }
                }
            ];
            let matchedScooters = await CommonService.runAggregateQuery(
                query,
                'vehicle'
            );
            if (matchedScooters.length > 0) {
                return true;
            }

            return false;
        } catch (e) {
            throw new Error(e);
        }
    },


    async rideDepositPaymentFail(ride, chargeObj) {
        ride.statusTrack.push({
            userId: ride.userId,
            dateTime: UtilService.getTimeFromNow(),
            remark: 'Your card is invalid. So you can not proceed this ride.',
            status: sails.config.RIDE_STATUS.CANCELLED
        });
        let updateObj = {
            endDateTime: UtilService.getTimeFromNow(),
            status: sails.config.RIDE_STATUS.CANCELLED,
            statusTrack: ride.statusTrack,
            isPaid: true,
            totalKm: 0,
            totalTime: 0,
            totalFare: 0,
            updatedBy: ride.userId
        };
        let rideData = await RideBooking.update(
            { id: ride.id },
            updateObj
        ).fetch();

        rideData = rideData[0];
        await Vehicle.update(
            { id: rideData.vehicleId },
            { isAvailable: true, isRideCompleted: true }
        );

        const userObj = await User.findOne({ id: ride.userId });
        let primaryCard = UtilService.getPrimaryObj(userObj.cards);
        let customMessage = sails.config.message.MIN_FARE_PAYMENT_FAIL;
        if (chargeObj.data && chargeObj.data.errorMessage) {
            customMessage = {
                ...customMessage,
                message: chargeObj.data.errorMessage + " So you can not proceed this ride."
            }
        }
        let cardMask = `**** ${primaryCard.last4}`;
        customMessage.message = customMessage.message.
            replace('card-number', cardMask);
        throw customMessage;
        // let primaryCard = UtilService.getPrimaryObj(user.cards);
        // if (!primaryCard) {
        //     primaryCard = user.cards[0];
        // }
        // primaryCard.expireTime = UtilService.addTime(1, null, 'hour');
        // console.log('cards before -- ', user.cards);
        // let cards = _.filter(user.cards, card => card.isPrimary !== true);
        // cards.push(primaryCard);
        // console.log('cards after -- ', cards);
        // await User.update({ id: ride.userId }, { cards: cards });
    },

    async cancelRide(ride, userId, isAutoDeduct = false, isRideEndFromAdmin = false) {
        const isSystemCancelled = !userId;
        ride.statusTrack.push({
            userId: userId,
            dateTime: UtilService.getTimeFromNow(),
            remark: isSystemCancelled ? 'System Cancelled ride' : 'User cancelled ride',
            status: sails.config.RIDE_STATUS.CANCELLED
        });
        let fareSummary = this.calculateCancellationFare(ride, isSystemCancelled);
        let updateObj = {
            endDateTime: UtilService.getTimeFromNow(),
            status: sails.config.RIDE_STATUS.CANCELLED,
            statusTrack: ride.statusTrack,
            totalKm: 0,
            totalTime: 0,
            totalFare: fareSummary.total,
            fareSummary: fareSummary,
            updatedBy: userId,
            isRideEndFromAdmin: isRideEndFromAdmin
        };
        if (ride.isPrivateRide) {
            updateObj.totalFare = 0;
        }
        if (updateObj.totalFare === 0) {
            updateObj.isPaid = true;
        }
        if (sails.config.PAYMENT_DISABLED) {
            updateObj.isPaid = true;
        }
        let rideData = await RideBooking.update(
            { id: ride.id },
            updateObj
        ).fetch();
        rideData = rideData[0];

        console.log('inside cancel ride isPaid, autoDeduct, rideId ----> ', rideData.isPaid, isAutoDeduct, ride.id);
        let cancelRidePaymentFlag = true;
        const isSubscriptionRideType = ride.rideType === sails.config.RIDE_TYPE.SUBSCRIPTION;
        if (isSubscriptionRideType) {
            console.log('decreasing rideData.fareSummary.reservedTime - ', rideData.fareSummary.reservedTime);
            await BookPlanService.deductTimeLimit(ride.userId, rideData.fareSummary.reservedTime);
        }
        if (!rideData.isPaid && isAutoDeduct) {
            console.log('inside autoDeduct cancelRide');
            let chargeObj = await PaymentService.chargeCustomerForRide(rideData);
            console.log('after autoDeduct cancelRide -> rideId', ride.id, ' -- chargeObj ', chargeObj);
            if (!chargeObj.flag) {
                console.log('chargeObj.flag -> ', chargeObj.flag);
                cancelRidePaymentFlag = false;
            }
        }
        await Vehicle.update({ id: rideData.vehicleId }, { isAvailable: true, isRideCompleted: true });
        await this.updateRideSummary(rideData);

        if (!cancelRidePaymentFlag) {
            return res.ok(chargeObj.data, sails.config.message.RIDE_REQUEST_CHARGE_FAILED);
        }

        rideData = await RideBooking.findOne({ id: ride.id });

        return rideData;
    },

    async checkPendingPayment(userId, isReturn) {
        const pendingPaymentRide = await RideBooking.findOne({
            status: [
                sails.config.RIDE_STATUS.COMPLETED,
                sails.config.RIDE_STATUS.CANCELLED
            ],
            isPaid: false,
            userId: userId
        });

        if (pendingPaymentRide && pendingPaymentRide.id) {
            if (isReturn) {
                let res = await this.getRideResponse(pendingPaymentRide.id);

                return res;
            }
            throw sails.config.message.RIDE_PAYMENT_PENDING;
        }
    },

    async updateVehicle(vehicle, data) {
        const currentTime = UtilService.getTimeFromNow();
        let diff = 0;
        if (data.lng && data.lat) {
            if (!vehicle.currentLocation || !vehicle.currentLocation.coordinates) {
                vehicle.currentLocation = {
                    type: 'Point',
                    coordinates: [
                        data.lng,
                        data.lat
                    ]
                };
                data.currentLocation = vehicle.currentLocation;
            }
            if (!vehicle.lastLocation || !vehicle.lastLocation.coordinates) {
                vehicle.lastLocation = {
                    type: 'Point',
                    coordinates: []
                };
                vehicle.lastLocation.coordinates = [
                    data.lng,
                    data.lat
                ];
                data.lastLocation = vehicle.lastLocation;
                data.lastLocationChanged = currentTime;
            }
            diff = UtilService.getDifferenceOfLocation(
                { lat: data.lat, lng: data.lng },
                { lat: vehicle.lastLocation.coordinates[1], lng: vehicle.lastLocation.coordinates[0] }
            );
            if ((diff >= sails.config.SCOOTER_LOCATION_CHANGE_MIN_DISTANCE &&
                diff <= sails.config.SCOOTER_LOCATION_CHANGE_MAX_DISTANCE) ||
                vehicle.isRideCompleted
            ) {
                data.isLocationChanged = true;
                data.lastLocationChanged = currentTime;
                vehicle.lastLocation.coordinates = [
                    data.lng,
                    data.lat
                ];
                data.lastLocation = vehicle.lastLocation;
            } else {
                if (data.isLocationChanged) {
                    data.isLocationChanged = false;
                    data.lastLocationChanged = currentTime;
                }
            }
            if (data.isLocationChanged) {
                // update current location only if it is between distance
                vehicle.currentLocation.coordinates = [
                    data.lng,
                    data.lat
                ];
                data.currentLocation = vehicle.currentLocation;
                data.locationUpdatedAt = currentTime;
            }
            delete data.lat;
            delete data.lng;
        }
        if (data.speed && sails.config.DEFAULT_DISTANCE_UNIT === sails.config.DISTANCE_UNIT.MILES) {
            data.speed = UtilService.convertKmToMiles(data.speed);
        }
        delete data.mode;
        if (!sails.config.IS_FRANCHISEE_ENABLED && data.franchiseeId) {
            delete data.franchiseeId;
        }
        let ride = await RideBooking
            .findOne({
                vehicleId: vehicle.id,
                status: sails.config.RIDE_STATUS.ON_GOING,
                isPaused: false
            });
        let isVehicleOutsideZone = false;
        if (ride && data.currentLocation) {
            isVehicleOutsideZone = await this.checkRideOutsideZone(ride, vehicle.imei, data.currentLocation.coordinates);
            data.isVehicleOutsideZone = isVehicleOutsideZone;
            if (!isVehicleOutsideZone) {
                if (vehicle.lastSpeedSet != '') {
                    data.lastSpeedSet = '';
                }
                if (vehicle.lastAlarmed != '') {
                    data.lastAlarmed = '';
                }
            }
        } else {
            if (typeof data.lockStatus == 'boolean' && data.lockStatus == true) {
                if (vehicle.lastSpeedSet != '') {
                    data.lastSpeedSet = '';
                }
                if (vehicle.lastAlarmed != '') {
                    data.lastAlarmed = '';
                }
            }
        }

        let isSendConnectionNotification = false;
        if (vehicle && !vehicle.connectionStatus) {
            isSendConnectionNotification = true;
        }
        vehicle = await Vehicle.update({ id: vehicle.id }, data).fetch();
        vehicle = vehicle[0];
        if (isSendConnectionNotification) {
            const connectionType = sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.VEHICLE_CONNECTED;
            await notification.sendConnectionNotification(vehicle, connectionType);
        }

        if (vehicle && !vehicle.chargeStatus && vehicle.type !== sails.config.VEHICLE_TYPE.BIKE) {
            await this.sendBatteryNotification(vehicle);
        }

        if (!data.currentLocation) {
            return true;
        }
        let notifyVehicleData = {
            rideId: ride ? ride.id : "",
            vehicleData: vehicle
        }

        await SocketEvents.notifyLocationAdmin(notifyVehicleData, diff);
        // check here
        // we are update the ride from findAndUpdateRide function for lockstatus.
        if (!ride || !ride.id || (typeof data.lockStatus == "boolean" && vehicle.lockStatus !== data.lockStatus)) {
            return true;
        }

        let dateTime = currentTime;
        if (data.utcDate && data.utcTime) {
            dateTime = UtilService.convertOmniUTCDate(data.utcDate, data.utcTime);
        }
        let locationTrackData = {
            $push: {
                locationTrack: {
                    coordinates: data.currentLocation.coordinates,
                    dateTime: dateTime
                }
            }
        };
        let filter = { rideId: ObjectId(ride.id) };
        await CommonService.runNativeUpdateQuery(filter, locationTrackData, 'ridelocationtrack');

        // no need this field for mobile side, and need object if field is given
        delete vehicle.nestId;
        let resData = {
            rideId: ride.id,
            vehicleData: vehicle
        };
        let isRideEndForceFully = false;
        if (isVehicleOutsideZone && vehicle.type == sails.config.VEHICLE_TYPE.SCOOTER) {
            try {
                let nextCommandSentTimeLimit = await UtilService.subtractTime(sails.config.OUTSIDE_ZONE_COMMAND_INTERVAL, currentTime, 'seconds');
                let vehicleData = await this.getVehicleForIOT(vehicle.id);
                let data = {};
                if (vehicle.lastAlarmed == '') {
                    console.log("-------------------\nAlarm on\n--------------------");
                    data.lastAlarmed = currentTime;
                    await IotService.commandToPerform('alarmOn', vehicleData, { value: sails.config.OUT_SIDE_ZONE_ALARM_DURATION });
                    data.lastSpeedSet = currentTime;
                    console.log("-------------------\nSpeed Set\n--------------------");
                    await IotService.commandToPerform('setMaxSpeed', vehicleData, { value: sails.config.OUT_SIDE_ZONE_SPEED_LIMIT });
                    await Vehicle.update({ id: vehicle.id }, data);
                } else if (vehicle.lastSpeedSet <= nextCommandSentTimeLimit && vehicle.lastSpeedSet != '') {
                    console.log("-------------------\nEnd Ride\n--------------------");
                    let rideData = await RideBooking.findOne({ id: ride.id });
                    if (sails.config.IS_STOP_RIDE_OUT_SIDE_ZONE) {
                        isRideEndForceFully = true;
                        await this.stopRideForceFully(rideData, null, sails.config.IS_AUTO_DEDUCT, true);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        let currentNest = await this.findNest(data.currentLocation.coordinates);

        if (currentNest && currentNest.length) {
            currentNest = currentNest[0];
            if (ride.currentNestId != currentNest._id.toString()) {
                await this.performNestExitOperation(ride, vehicle);
                await RideBooking.update({ id: ride.id }).set({ currentNestId: currentNest._id.toString(), currentNestType: currentNest.type });
                isRideEndForceFully = await this.performNestInsertOperation(ride, vehicle, currentNest);
            }
        } else {
            if (ride.currentNestType != 0) {
                await this.performNestExitOperation(ride, vehicle);
                await RideBooking.update({ id: ride.id }).set({ currentNestId: null, currentNestType: 0 });
            }
        }

        if (currentNest && currentNest.type) {
            resData.currentNestType = currentNest.type;
        } else {
            resData.currentNestType = 0;
        }
        let socket = await UtilService.getUserSocket(ride.userId);
        socket = socket && socket[0];
        // console.log('here 5');
        // add condition here
        if (socket && socket.socketId && !isRideEndForceFully) {
            await SocketEvents.locationUpdate(resData, socket);
        }
        if (sails.config.IS_RIDE_END_AFTER_INSUFFICIENT_WALLET_BALANCE && diff > 0 && data.isLocationChanged && !isRideEndForceFully && ride.maxKm > 0) {
            try {
                await this.updateKMForRide(ride.id, diff);
            } catch (e) {
                console.log('in updateKMForRide e', e);
            }
        }
    },

    async performNestInsertOperation(ride, vehicle, currentNest) {
        let vehicleData = await this.getVehicleForIOT(vehicle.id);
        let isStopRideForceFully = false;
        switch (currentNest.type) {
            case sails.config.NEST_TYPE.NON_RIDE:
                if (sails.config.IS_STOP_RIDE_FOR_NO_RIDE_ZONE) {
                    console.log("-------------------\nEnd Ride\n--------------------");
                    let rideData = await RideBooking.findOne({ id: ride.id });
                    isStopRideForceFully = true;
                    await this.stopRideForceFully(rideData, null, sails.config.IS_AUTO_DEDUCT, true);
                    if (sails.config.IS_DE_ACTIVE_VEHICLE_FOR_NO_RIDE_ZONE) {
                        await Vehicle.update({ id: vehicle.id }, { isActive: false });
                    }
                } else {
                    console.log("-------------------\nAlarm on\n--------------------");
                    await IotService.commandToPerform('alarmOn', vehicleData, { value: sails.config.OUT_SIDE_ZONE_ALARM_DURATION });
                    let updateVehicleData = {};
                    if (vehicleData && vehicleData.maxSpeedLimit && vehicleData.maxSpeedLimit.actualValue) {
                        updateVehicleData.lastSpeedLimit = vehicle.maxSpeedLimit.actualValue;
                    } else {
                        updateVehicleData.lastSpeedLimit = sails.config.DEFAULT_VEHICLE_SPEED_LIMIT;
                    }
                    await Vehicle.update({ id: vehicleData.id }).set(updateVehicleData);
                    console.log("-------------------\nSet Speed Limit - 0\n--------------------");
                    await IotService.commandToPerform('setMaxSpeed', vehicleData, { value: sails.config.NON_RIDE_ZONE_SPEED_LIMIT });
                }
                break;

            case sails.config.NEST_TYPE.NO_PARKING:
                // console.log("Send Socket Event to Device team to hide pause and end ride button");
                break;

            case sails.config.NEST_TYPE.SLOW_SPEED:
                let updateVehicleObj = {};
                if (vehicleData && vehicleData.maxSpeedLimit && vehicleData.maxSpeedLimit.actualValue) {
                    updateVehicleObj.lastSpeedLimit = vehicle.maxSpeedLimit.actualValue;
                } else {
                    updateVehicleObj.lastSpeedLimit = sails.config.DEFAULT_VEHICLE_SPEED_LIMIT;
                }
                await Vehicle.update({ id: vehicleData.id }).set(updateVehicleObj);
                console.log("-------------------\nSet Speed Limit\n--------------------");
                await IotService.commandToPerform('setMaxSpeed', vehicleData, { value: currentNest.speedLimit });
                break;

            case sails.config.NEST_TYPE.PARKING:
                break;

            default:
                break;
        }

        return isStopRideForceFully;
    },

    async performNestExitOperation(ride, vehicle) {
        let vehicleData = await this.getVehicleForIOT(vehicle.id);
        switch (ride.currentNestType) {
            case sails.config.NEST_TYPE.NON_RIDE:
                // console.log("-------------------\nUnLock\n--------------------");
                // if (vehicle.manufacturer.code == sails.config.VEHICLE_MANUFACTURER.ZIMO) {
                //     await IotService.lockUnlock('unlock', vehicleData);
                // }
                console.log("-------------------\nAlarm on\n--------------------");
                await IotService.commandToPerform('alarmOn', vehicleData, { value: sails.config.OUT_SIDE_ZONE_ALARM_DURATION });
                console.log("-------------------\nSet Speed Limit\n--------------------");
                await IotService.commandToPerform('setMaxSpeed', vehicleData, { value: vehicleData.lastSpeedLimit });
                break;

            case sails.config.NEST_TYPE.NO_PARKING:
                break;

            case sails.config.NEST_TYPE.SLOW_SPEED:
                console.log("-------------------\nSet Speed Limit\n--------------------");
                await IotService.commandToPerform('setMaxSpeed', vehicleData, { value: vehicleData.lastSpeedLimit });
                break;

            case sails.config.NEST_TYPE.PARKING:
                break;

            default:
                break;
        }
    },

    async sendBatteryNotification(vehicle) {
        const minBatteryLevel = await this.getMinBatteryLevel();
        const batteryTypes = sails.config.VEHICLE_BATTERY_TYPE;
        const notificationData = sails.config.NOTIFICATION.IOT_NOTIFICATION.BATTERY;
        const batteryLevelInfo = sails.config.NOTIFICATION.BATTERY_LEVEL_INFO;
        for (let key in batteryTypes) {
            if (vehicle[key] && vehicle[key] <= minBatteryLevel) {
                let sendInterval;
                let priority;
                for (const key in batteryLevelInfo) {
                    if (vehicle.batteryLevel <= batteryLevelInfo[key].batteryLevel) {
                        sendInterval = batteryLevelInfo[key].sendInterval;
                        priority = batteryLevelInfo[key].priority;
                        break;
                    }
                }
                const msg = notificationData.message.replace('batteryLevel', `${vehicle.batteryLevel} % ${batteryTypes[key]}`);
                const notification = {
                    type: notificationData.type,
                    message: msg,
                    sendInterval: sendInterval,
                    priority: priority
                };
                this.sendIOTNotification(vehicle.imei, notification);
            }
        }
    },

    async validateReserveRide(userId) {
        let currentRide = await this.checkForActiveRide(userId);
        if (currentRide && currentRide.status === sails.config.RIDE_STATUS.RESERVED) {
            throw sails.config.message.ALREADY_RESERVED_RIDE;
        }
    },

    async validateStartRide(currentLocation, vehicleId) {
        const setting = await this.getSetting();
        if (!setting.unlockRadius) {
            return true;
        }
        const isInsideRadius = await this.checkRiderInsideRadius(
            currentLocation, vehicleId, setting.unlockRadius
        );
        if (!isInsideRadius) {
            throw sails.config.message.CANT_START_RIDE_AT_THIS_LOCATION;
        }
    },

    async isRiderInsideRadius(currentLocation, vehicleId) {
        const setting = await this.getSetting();
        const isInsideRadius = await this.checkRiderInsideRadius(
            currentLocation, vehicleId, setting.basicRadius
        );
        if (!isInsideRadius) {
            throw sails.config.message.CANT_RESERVE_RIDE_AT_THIS_LOCATION;
        }
    },

    async checkLocationIsInsideNoRideArea(currentLocation) {
        let currentNest = await this.findNest(currentLocation, null, sails.config.NEST_TYPE.NON_RIDE);

        if (currentNest && currentNest.length > 0) {
            throw sails.config.message.CANT_START_RIDE_AT_NO_RIDE_AREA;
        }
    },

    async isRiderInsideUnlockRadius(currentLocation, vehicleId) {
        const setting = await this.getSetting();
        if (!setting.unlockRadius) {
            await this.checkLocationIsInsideNoRideArea(currentLocation);

            return true;
        }
        const isInsideRadius = await this.checkRiderInsideRadius(
            currentLocation, vehicleId, setting.unlockRadius
        );
        if (!isInsideRadius) {
            throw sails.config.message.CANT_START_RIDE_AT_THIS_LOCATION;
        }
        await this.checkLocationIsInsideNoRideArea(currentLocation);
    },

    async checkVehicleAvailability(vehicle, isReserved = false) {
        if (!vehicle.imei) {
            throw sails.config.message.PLEASE_CONFIGURE_IMEI;
        }
        if (!vehicle.isAvailable && !isReserved) {
            throw sails.config.message.SCOOTER_NOT_AVAILABLE;
        }
        const minBatteryLevel = await this.getMinBatteryLevel();

        const shouldCheckBatteryLevel =
            sails.config.CHECK_BATTERY_LEVEL_VEHICLE_TYPE.includes(vehicle.type);
        if (shouldCheckBatteryLevel && vehicle.batteryLevel < minBatteryLevel) {
            throw sails.config.message.SCOOTER_LOW_BATTERY;
        }
        if (!vehicle.isActive) {
            throw sails.config.message.SCOOTER_NOT_ACTIVE;
        }
        if (!vehicle.connectionStatus) {
            throw sails.config.message.SCOOTER_NOT_CONNECTED;
        }
        if (!vehicle.currentLocation) {
            throw sails.config.message.SCOOTER_NOT_AVAILABLE_FOR_RIDE;
        }
        if (vehicle.isTaskCreated) {
            throw sails.config.message.VEHICLE_NOT_AVAILABLE;
        }

        return true;
    },

    async checkVehicleAvailabilityFromVehicleId(vehicleId) {
        let vehicle = await Vehicle.findOne({ id: vehicleId });
        if (!vehicle) {
            throw sails.config.message.SCOOTER_NOT_FOUND;
        }
        await this.checkVehicleAvailability(vehicle);

        return vehicle;
    },

    async checkReservationTimeExpired(ride) {
        isReservationTimeExpired = moment().isSameOrAfter(ride.reservedEndDateTime);
        if (isReservationTimeExpired) {
            await this.cancelRide(ride);
            throw sails.config.message.RIDE_RESERVATION_TIME_EXPIRED;
        }
    },

    async checkForActiveRide(userId, isReturn) {
        let currentRide = await this.getActiveRide(userId);

        if (!isReturn && currentRide && currentRide.status === sails.config.RIDE_STATUS.ON_GOING) {
            throw sails.config.message.ALREADY_STARTED_RIDE;
        }

        return currentRide;
    },

    isPauseTimeOver(ride) {
        return moment().isSameOrAfter(ride.pauseEndDateTime);
    },

    async getActiveRide(userId) {
        let ride = await RideBooking.findOne({
            status: [
                sails.config.RIDE_STATUS.RESERVED,
                sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                sails.config.RIDE_STATUS.ON_GOING
            ],
            userId: userId
        });

        return ride;
    },

    async getActiveRideForUserSync(userId) {
        let ride = await this.getActiveRide(userId);

        // check if ride is reserved and reservation time is over
        if (ride && ride.status === sails.config.RIDE_STATUS.RESERVED) {
            // check reservation time is within limit or not
            try {
                this.checkReservationTimeExpired(ride);
            } catch (error) {
                console.log(error);
                ride = undefined;
            }
        }
        if (ride && ride.isPaused) {
            const isPauseTimeOver = this.isPauseTimeOver(ride);
            if (isPauseTimeOver) {
                try {
                    await this.stopRide(ride);
                    ride = undefined;
                } catch (error) {
                    console.log('error', error);
                }
            } else {
                let pauseTime = 0;
                for (let pauseTrack of ride.stopOverTrack) {
                    let duration = pauseTrack.duration;
                    if (!duration) {
                        duration = UtilService.getTimeDifference(
                            pauseTrack.pauseTime,
                            moment().toISOString(),
                            'seconds'
                        );
                    }
                    pauseTime += duration;
                }
                await RideBooking.update({ id: ride.id }, { pauseTime: pauseTime, updatedBy: userId });
            }
        }
        if (ride) {
            ride = await this.getRideResponse(ride.id);
        }

        return ride;
    },

    async stopRide(ride, userId, isAutoDeduct = false, scooterImage, isRideEndFromAdmin = false, sendSocketEvent = true) {
        let chargeData;
        let vehicle = await Vehicle.findOne({ id: ride.vehicleId })
            .populate('manufacturer');
        // Check is vehicle is within boundary
        let stopLocation = vehicle.currentLocation;
        if (vehicle.dealerId) {
            await this.checkVehicleInsideRideZone(vehicle, ride);
        } else {
            await this.isVehicleWithinBoundary(ride, stopLocation.coordinates);
        }

        //change stop location
        if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
            await this.isVehicleWithinNest(ride.endNest, stopLocation.coordinates, 'stop');
        } else {
            await this.isVehicleWithinBoundary(ride, stopLocation.coordinates);
        }
        if (vehicle.type === sails.config.VEHICLE_TYPE.BICYCLE && vehicle.lockStatus === false) {
            throw sails.config.message.LOCK_BICYCLE;
        }
        let updateObj = {
            scooterImage: scooterImage ? scooterImage : '',
            updatedBy: userId,
            isRideEndFromAdmin: isRideEndFromAdmin
        };
        if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
            let nest = await this.addRemoveVehicleInNest(vehicle, 'stop');
            await NestTrack.update({ rideId: ride.id }).set({ nestId: nest.id });

            if (!nest) {
                throw sails.config.message.END_RIDE_IN_NEST;
            } else {
                updateObj.endNest = nest.id;
            }
        }

        let updatedRecord = await RideBooking.update({ id: ride.id }, updateObj).fetch();
        ride = updatedRecord[0];
        let manufacturerCode = vehicle.manufacturer.code;
        if (sails.config.STOP_RIDE_FROM_IOT.indexOf(manufacturerCode) > -1) {
            await this.stopRideFromIOT(ride, vehicle.currentLocation, userId);
        } else {
            chargeData = await this.stopRideInstant(ride, vehicle.currentLocation, userId, {}, isAutoDeduct, sendSocketEvent);
        }
        rideData = await this.getRideResponse(ride.id);
        console.log('rideData.isPaid for id - ', rideData.isPaid, ride.id);

        rideData.chargeData = chargeData;

        return rideData;
    },

    async stopRideForceFully(ride, userId, isAutoDeduct = false, isRideEndFromAdmin = false) {
        console.log('in stopRideForceFully', isRideEndFromAdmin);
        let chargeData;
        let vehicle = await Vehicle.findOne({ id: ride.vehicleId })
            .populate('manufacturer');

        let updateObj = {
            updatedBy: userId,
            isRideEndFromAdmin: isRideEndFromAdmin
        };
        if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
            let nest = await this.addRemoveVehicleInNest(vehicle, 'stop');
            if (nest) {
                await NestTrack.update({ rideId: ride.id }).set({ nestId: nest.id });
                updateObj.endNest = nest.id;
            }
        }

        let updatedRecord = await RideBooking.update({ id: ride.id }, updateObj).fetch();
        ride = updatedRecord[0];
        let manufacturerCode = vehicle.manufacturer.code;
        if (sails.config.STOP_RIDE_FROM_IOT.indexOf(manufacturerCode) > -1 && vehicle.connectionStatus) {
            await this.stopRideFromIOT(ride, vehicle.currentLocation, userId);
        } else {
            chargeData = await this.stopRideInstant(ride, vehicle.currentLocation, userId, {}, isAutoDeduct);
        }
        rideData = await this.getRideResponse(ride.id);
        console.log('rideData.isPaid for id - ', rideData.isPaid, ride.id);

        rideData.chargeData = chargeData;

        return rideData;
    },

    async addRemoveVehicleInNest(vehicle, rideStatus) {
        if (!sails.config.IS_NEST_ENABLED) {
            return;
        }
        try {
            if (rideStatus == 'start') {
                let nest = await Nest.findOne({ id: vehicle.nestId });
                if (!nest || !nest.id) {
                    return false;
                }
                nest = await Nest.update({ id: nest.id }).set({ totalVehicles: nest.totalVehicles - 1 }).fetch();
                await Vehicle.update({ id: vehicle.id }).set({ nestId: null });
                if (nest && nest.length) {

                    return nest[0];
                }
            } else {
                let matchedNest = await this.findNest(vehicle.currentLocation.coordinates);
                if (matchedNest && matchedNest.length) {
                    let updatedNest = await Nest.update({ id: matchedNest[0]._id.toString() }).set({ totalVehicles: matchedNest[0].totalVehicles + 1 }).fetch();
                    await Vehicle.update({ id: vehicle.id }).set({ nestId: matchedNest[0]._id.toString() });
                    if (updatedNest && updatedNest.length) {

                        return updatedNest[0];
                    }
                }
            }

            return false;
        } catch (error) {
            console.log(error);
        }
    },

    async addNestTrack(ride, nest) {
        try {
            let nestTrackObj = {
                vehicleId: ride.vehicleId.id,
                nestId: nest.id,
                previousNestId: ride.vehicleId.nestId,
                transferBy: ride.userId,
                transferDate: moment().toISOString(),
                remark: 'Ride in the Nest',
                rideId: ride.id
            }
            await NestTrack.create(nestTrackObj);

            return true;
        } catch (error) {
            console.log(error);
        }
    },

    async stopRideInstant(ride, stopLocation, userId, data, isAutoDeduct = false, sendSocketEvent = true) {
        let stopOverTrack = ride.stopOverTrack;
        let isPaused = ride.isPaused;
        if (ride.isPaused) {
            let trackIndex = stopOverTrack.length - 1;
            stopOverTrack[trackIndex].stopLocation = stopLocation;
            stopOverTrack[trackIndex].resumeTime = UtilService.getTimeFromNow();
            stopOverTrack[trackIndex].duration = UtilService.getTimeDifference(
                stopOverTrack[trackIndex].pauseTime,
                stopOverTrack[trackIndex].resumeTime,
                'seconds'
            );
        }
        if (!isPaused && data && (data.tripTime || data.tripDistance)) {
            isPaused = true;
        }
        let fareSummary = await this.calculateFareForRide(ride, data);
        console.log('fareSummary========== :>> ', fareSummary);
        let promoCodeObj;
        if (ride.isPromoCodeApplied && !ride.promoCodeAmount) {
            promoCodeObj = await PromoCodeService.addPromoCodeAmount(fareSummary, ride.promoCodeId);
            fareSummary = promoCodeObj.fareSummary;
            // const updatedRecord = await RideBooking.update({ id: ride.id },
            //     { promoCodeAmount: promoCodeObj.promoCodeAmount }
            // ).fetch();
            // if (!updatedRecord || updatedRecord.length <= 0) {
            //     console.log(`Can't applied Promocode.`);
            //     throw sails.config.message.RIDE_REQUEST_CHARGE_FAILED;
            // }

            // return res.ok(updatedRecord[0], sails.config.message.PROMO_CODE_APPLIED );
        }
        if (sails.config.CALCULATE_PARKING_FINE) {
            fareSummary.total += fareSummary.parkingFine;
        }
        let currentTime = UtilService.getTimeFromNow();
        ride.statusTrack.push({
            userId: userId,
            dateTime: currentTime,
            remark: userId ? 'User stopped ride' : 'System stopped ride',
            status: sails.config.RIDE_STATUS.COMPLETED
        });
        let updateObj = {
            endDateTime: ride.endDateTime || currentTime,
            endLocation: stopLocation,
            status: sails.config.RIDE_STATUS.COMPLETED,
            statusTrack: ride.statusTrack,
            stopOverTrack: stopOverTrack,
            totalKm: fareSummary.travelDistance,
            totalTime: fareSummary.travelTime,
            totalFare: fareSummary.total,
            fareSummary: fareSummary,
            isPaused: false,
            pauseEndDateTime: '',
            pauseTime: fareSummary.pauseTime,
            isRequested: false,
            requestEndDateTime: ''
        };

        if (userId !== true) {
            updateObj.updatedBy = userId;
        }

        if (promoCodeObj && promoCodeObj.promoCodeAmount) {
            updateObj.promoCodeAmount = promoCodeObj.promoCodeAmount;
        }
        if (sails.config.IS_FRANCHISEE_ENABLED && ride.franchiseeId) {
            let commissionSetting = await Commission.findOne({ franchiseeId: ride.franchiseeId });
            let firstDate = UtilService.getFirstDateOfMonth();
            if (new Date(commissionSetting.updatedAt) > new Date(firstDate)) {
                if (commissionSetting.track && commissionSetting.track.length && commissionSetting.length > 1) {
                    commissionSetting = commissionSetting.track[commissionSetting.track.length - 2];
                }
            }
            if (commissionSetting) {
                let commission = 0.00;
                if (commissionSetting.type == sails.config.COMMISSION_TYPES.AMOUNT) {
                    commission = commissionSetting.amount;
                } else if (commissionSetting.type == sails.config.COMMISSION_TYPES.PERCENTAGE) {
                    commission = (fareSummary.total * commissionSetting.percentage) / 100;
                }
                updateObj.franchiseeCommission = commission;
            }
        }
        let rideData = await RideBooking.update(
            { id: ride.id },
            updateObj
        ).fetch();
        rideData = rideData[0];
        let vehicleUpdateObj = {
            currentLocation: stopLocation,
            isRideCompleted: true,
            lastUsed: currentTime
        };

        if (userId === true) {
            vehicleUpdateObj.isAvailable = true;
            vehicleUpdateObj.isRideCompleted = true;
            vehicleUpdateObj.lockStatus = true;
            vehicleUpdateObj.lastConnectedDateTime = currentTime;
            vehicleUpdateObj.lastConnectionCheckDateTime = currentTime;
        }

        if (isPaused) {
            vehicleUpdateObj.isAvailable = true;
        }
        await Vehicle.update(
            { id: rideData.vehicleId },
            vehicleUpdateObj
        );
        await this.updateRideSummary(rideData);
        if (!isPaused && userId !== true) {// todo today check vechicle lockstatus here
            await this.requestLockUnlockScooter('stop', ride, true);
        }
        let chargeObj;
        const isSubscriptionRideType = ride.rideType === sails.config.RIDE_TYPE.SUBSCRIPTION;
        if (isSubscriptionRideType) {
            let totalTimeToDecrease = rideData.totalTime + rideData.fareSummary.reservedTime;
            console.log(ride.id, ' - decreasing rideData.totalTime - ', totalTimeToDecrease);
            await BookPlanService.deductTimeLimit(rideData.userId, totalTimeToDecrease);
        }

        // const isBookingPassRideType = ride.rideType === sails.config.RIDE_TYPE.BOOKING_PASS;
        // if (isBookingPassRideType) {
        //     let totalTimeToDecrease = rideData.totalTime + rideData.fareSummary.reservedTime;
        //     console.log(ride.id, ' - decreasing rideData.totalTime - ', totalTimeToDecrease);
        //     await BookingPassService.deductTimeLimit(rideData.planInvoiceId, totalTimeToDecrease);
        // }

        if (isAutoDeduct) {
            chargeObj = await PaymentService.chargeCustomerForRide(rideData);
            chargeObj = chargeObj.data;
        }
        if (sendSocketEvent) {
            await this.emitActiveRide(rideData);
        }
        if (sails.config.IS_RIDE_END_AFTER_INSUFFICIENT_WALLET_BALANCE) {
            await RedisDBService.removeKey(`ride-${ride.id}`);
        }

        return chargeObj;
    },

    async stopRideFromIOT(ride, stopLocation, userId) {
        let currentTime = UtilService.getTimeFromNow();
        ride.statusTrack.push({
            userId: userId,
            dateTime: currentTime,
            remark: `${userId ? 'User' : 'System'} requested stopped ride`,
            status: sails.config.RIDE_STATUS.ON_GOING
        });
        let updateObj = {
            endDateTime: currentTime,
            endLocation: stopLocation,
            isRequested: true,
            updatedBy: userId
        };
        await RideBooking.update({ id: ride.id }, updateObj);
        await this.requestLockUnlockScooter('stop', ride, true);
        ride = await RideBooking.findOne({ id: ride.id });
        await this.emitActiveRide(ride);
    },

    calculateDistanceForRide(startLocation, locationTrack) {
        const maxDistancePerSecond = 10;
        let distance = 0;
        let start = startLocation;
        let end;
        if (!locationTrack) {
            locationTrack = start;
        }
        for (i = 0; i < locationTrack.length; i++) {
            if (i > 0) {
                start = locationTrack[i - 1];
            }
            end = locationTrack[i];
            let lat1 = start.coordinates[1];
            let lon1 = start.coordinates[0];
            let lat2 = end.coordinates[1];
            let lon2 = end.coordinates[0];

            let timeDiff = UtilService.getTimeDifference(start.dateTime, end.dateTime, 'seconds');
            // console.log('timeDiff', timeDiff);
            // if (timeDiff <= 0) {
            //     continue;
            // }
            let checkDistance = this.calculateDistance(lat1, lon1, lat2, lon2);
            // console.log('checkDistance 1', checkDistance);
            checkDistance *= 1000;
            // console.log('checkDistance 2', checkDistance);
            if (checkDistance <= 0) {
                continue;
            }
            let perSecondDistance = checkDistance;
            if (timeDiff > 0) {
                perSecondDistance = checkDistance / timeDiff
            }
            // console.log('perSecondDistance', timeDiff, perSecondDistance);
            if (perSecondDistance > maxDistancePerSecond) {
                continue;
            }
            // console.log('distance 1', distance);
            distance += checkDistance;
            // console.log('distance 2', distance);
        }
        if (distance > 0) {
            distance /= 1000;
        }
        distance = UtilService.getFloat(distance);

        return distance;
    },

    calculateDistance(lat1, lon1, lat2, lon2, unit = 'K') {
        if (!lat1 || !lat2 || !lon1 || !lon2) {
            return 0;
        }
        if ((lat1 === lat2) && (lon1 === lon2)) {
            return 0;
        }

        let radLat1 = Math.PI * lat1 / 180;
        let radLat2 = Math.PI * lat2 / 180;
        let theta = lon1 - lon2;
        let radTheta = Math.PI * theta / 180;
        let dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit === 'K') {
            dist *= 1.609344;
        }
        if (unit === 'N') {
            dist *= 0.8684;
        }

        return dist;

    },

    async addFareData(currentLocation, scooters) {
        // let userIds = _.map(scooters, 'userId');
        let zoneIds = [];
        for (const key in scooters) {
            if (!scooters[key]) {
                continue;
            }
            let zoneData = await this.findZoneDataForLocation(
                scooters[key].currentLocation.coordinates
            );
            scooters[key].zone = zoneData && zoneData[0] ? zoneData[0] : {};
            scooters[key].fareData = {};
            let zoneId = String(scooters[key].zone._id);
            scooters[key].zone.id = zoneId;
            if (zoneId && zoneId !== "undefined" && zoneIds.indexOf(zoneId) === -1) {
                zoneIds.push(zoneId);
            }
            if (scooters[key]._id) {
                scooters[key].id = String(scooters[key]._id);
            }
            // console.log("addFareData -> scooters", scooters)
        }
        console.log("addFareData -> zoneIds -  ", zoneIds);
        let fareData = await FareManagement.find({
            zoneId: zoneIds
        });
        let nestData = [];
        if (sails.config.IS_NEST_ENABLED) {
            nestData = await Nest.find({
                zoneId: zoneIds,
                isActive: true,
                isDeleted: false,
                type: {
                    "!=": sails.config.FEEDER_NEST_TYPES,
                },
            });
        }
        for (const key in scooters) {
            if (!scooters[key] || !scooters[key].zone) {
                continue;
            }
            let scooterZoneId = scooters[key].zone.id;
            let fareObj = _.find(fareData, {
                zoneId: scooterZoneId,
                vehicleType: scooters[key].type
            });
            if (fareObj) {
                fareObj.fareManagementId = fareObj.id || "";
                scooters[key].fareData = fareObj;
            } else {
                scooters[key].fareData = {};
            }

            let nests = [];
            if (sails.config.IS_NEST_ENABLED) {
                nests = _.filter(nestData, obj => {
                    return String(obj.zoneId) === scooterZoneId
                });
            }
            scooters[key].zone.subZones = nests;
        }

        return scooters;
    },

    async findZoneForVehicle(vehicle, user) {
        let mVehicle = JSON.parse(JSON.stringify(vehicle))
        console.log('vehicle.currentLocation.coordinates ', mVehicle.currentLocation.coordinates)
        let query = {};
        if (mVehicle.dealerId) {
            if (mVehicle.fleetType && mVehicle.fleetType.length && user.dealerId && mVehicle.dealerId == user.dealerId) {
                if (mVehicle.fleetType.findIndex(type => type == user.fleetType) >= 0) {
                    query.dealerId = ObjectId(mVehicle.dealerId);
                    query.fleetType = user.fleetType;
                } else {
                    if (mVehicle.fleetType.findIndex(type => type == sails.config.USER.FLEET_TYPE.GENERAL) >= 0) {
                        query.dealerId = ObjectId(mVehicle.dealerId);
                        query.fleetType = sails.config.USER.FLEET_TYPE.GENERAL;
                    } else {
                        throw sails.config.message.PRIVATE_USER_CAN_USE_PROPERTY;
                    }
                }
            } else {
                if (mVehicle.fleetType.findIndex(type => type == sails.config.USER.FLEET_TYPE.GENERAL) >= 0) {
                    query.dealerId = ObjectId(mVehicle.dealerId);
                    query.fleetType = sails.config.USER.FLEET_TYPE.GENERAL;
                } else {
                    throw sails.config.message.PRIVATE_USER_CAN_USE_PROPERTY;
                }
            }
            mVehicle.franchiseeId = null;
        } else if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE && mVehicle.franchiseeId) {
            if (mVehicle.fleetType && mVehicle.fleetType.length && user.franchiseeId && mVehicle.franchiseeId == user.franchiseeId) {
                if (mVehicle.fleetType.findIndex(type => type == user.fleetType) >= 0) {
                    console.log("1715 ----- ")
                    query.franchiseeId = ObjectId(mVehicle.franchiseeId);
                    query.fleetType = user.fleetType;
                } else {
                    console.log("1719 ----- ")
                    if (mVehicle.fleetType.findIndex(type => type == sails.config.USER.FLEET_TYPE.GENERAL) >= 0) {
                        console.log("1721 ----- ")
                        query.franchiseeId = ObjectId(mVehicle.franchiseeId);
                        query.fleetType = sails.config.USER.FLEET_TYPE.GENERAL;
                    } else {
                        console.log("1725 ----- ")
                        throw sails.config.message.PRIVATE_USER_CAN_USE_PROPERTY;
                    }
                }
            } else {
                console.log("1730 ----- ")
                if (mVehicle.fleetType.findIndex(type => type == sails.config.USER.FLEET_TYPE.GENERAL) >= 0) {
                    query.franchiseeId = ObjectId(mVehicle.franchiseeId);
                    query.fleetType = sails.config.USER.FLEET_TYPE.GENERAL;
                } else {
                    console.log("1735 ----- ")
                    throw sails.config.message.PRIVATE_USER_CAN_USE_PROPERTY;
                }
            }
        } else {
            query.$or = [
                { dealerId: { $exists: false } },
                {
                    dealerId: null,
                    franchiseeId: null
                }
            ];
            if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE) {
                console.log("1745 ----- ")
                query.$or.push(
                    { franchiseeId: { $exists: false } },
                )
            }
        }
        if (!sails.config.CLIENT_FEATURE_ACTIVE && sails.config.IS_FRANCHISEE_ENABLED) {
            delete query.$or;
        }
        let zoneData = await this.findZoneDataForLocation(
            mVehicle.currentLocation.coordinates,
            null,
            mVehicle.type,
            mVehicle.franchiseeId,
            query
        );
        if (!zoneData || !zoneData[0]) {
            console.log('1268 ********** CREATE_DUMMY_ZONE', sails.config.CREATE_DUMMY_ZONE)
            if (!sails.config.CREATE_DUMMY_ZONE) {
                throw sails.config.message.NOT_IN_SPECIFIED_ZONE;
            } else {
                let dummyZone = await ZoneAndFareManagementService.createDummyZone(
                    mVehicle.currentLocation.coordinates,
                    mVehicle.type,
                    mVehicle.id
                );
                dummyZone._id = dummyZone.id;
                zoneData = [dummyZone];
            }
        }

        return zoneData[0];
    },

    async findZoneDataForLocation(currentLocation, userId = null, vehicleType = null, franchiseeId = null, extraQuery = {}) {
        let query = extraQuery;
        query.isDeleted = false;
        if (!query.isActive) {
            query.isActive = true;
        };
        if (sails.config.IS_FRANCHISEE_ENABLED && franchiseeId) {
            query.franchiseeId = ObjectId(franchiseeId);
        }
        if (vehicleType) {
            query.vehicleTypes = vehicleType;
        }
        // if (userId) {
        //     if (!_.isArray(userId)) {
        //         userId = [userId];
        //     }
        //     for (let key in userId) {
        //         if (!userId[key]) {
        //             continue;
        //         }
        //         userId[key] = ObjectId(userId[key]);
        //     }
        //     query.userId = { $in: userId };
        // }
        let matchedZones = [];
        if (sails.config.HAS_POLYGON_ZONE) {
            matchedZones = await this.findPolygonTypeZone(query, currentLocation);
        }
        if (sails.config.HAS_CIRCLE_ZONE) {
            let circleZones = await this.findCircleTypeZone(query, currentLocation);
            matchedZones = matchedZones.concat(circleZones);
        }

        return matchedZones;
    },

    async findPolygonTypeZone(query, coordinates) {
        let newQuery = {
            ...query,
            boundary: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    }
                }
            }
        };

        let matchedZones = await CommonService.runFindNativeQuery(newQuery, 'zone');

        return matchedZones;
    },

    async findCircleTypeZone(query, coordinates) {
        let newQuery = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    distanceField: 'distance',
                    // distanceMultiplier: 1,
                    spherical: true
                }
            },
            {
                $redact: {
                    $cond: {
                        if: { $lt: ['$distance', '$boundary.radius'] },
                        then: '$$KEEP',
                        else: '$$PRUNE'
                    }
                }
            },
            {
                $match: { ...query },
            }
        ];
        let matchedZones = await CommonService.runAggregateQuery(
            newQuery,
            'Zone'
        );

        return matchedZones;
    },

    async getFare(options) {
        const { distance, time, from } = options;
        const zoneData = await this.findZoneDataForLocation(from);
        if (!zoneData || !zoneData[0]) {
            throw sails.config.message.ZONE_NOT_FOUND;
        }
        let fareData = this.calculateFare(zoneData[0], distance, time);
        fareData = _.merge(fareData, zoneData[0]);

        return fareData;
    },

    async getFareDataForRide(zoneId, vehicleType) {
        let fareData = await FareManagement.findOne({ zoneId: zoneId, vehicleType: vehicleType, isDeleted: false });
        if (!fareData || !fareData.id) {

            throw sails.config.message.NOT_IN_SPECIFIED_ZONE;
        }
        let setting = await this.getSetting();
        let data = _.cloneDeep(fareData);
        data.rideReserveTimeLimit = setting.rideReserveTimeLimit;
        data.pauseTimeLimit = setting.pauseTimeLimit;
        data.rideReserveTimeFreeLimit = setting.rideReserveTimeFreeLimit;

        return data;
    },

    async getFareForZone(options) {
        const { distance, time, fareId } = options;
        const fareData = await FareManagement.findOne({ id: fareId });
        let fare = this.calculateFare(fareData, distance, time);

        return fareData;
    },

    async calculateFareForRide(ride, data = {}) {
        const fareData = ride.fareData;
        let fareSummary = {
            timeFareFreeLimit: fareData.timeFareFreeLimit,
            distanceFareFreeLimit: fareData.distanceFareFreeLimit,
            reserved: 0,
            paused: 0,
            late: 0,
            cancelled: 0,
            distance: 0,
            time: 0,
            subTotal: 0,
            reservedTime: 0,
            pausedTime: 0,
            lateTime: 0,
            travelDistance: 0,
            travelTime: 0,
            tax: 0,
            parkingFine: 0,
            unlockFees: 0,
            rideDeposit: 0,
            total: 0,
            bookPlanExtraTakenTime: 0,
            bookingPassExtraTimeUsed: 0,
            rideDiscountPercentage: 0,
            rideDiscountAmount: 0,
            unlockDiscountPercentage: 0,
            unlockDiscountAmount: 0,
            bookingPassUsedTime: 0
        };

        if (ride.reservedDateTime) {
            fareSummary.reservedTime = UtilService.getTimeDifference(
                ride.reservedDateTime,
                ride.startDateTime,
                'seconds'
            );
            // convert into minutes
            let reservedTimeInMinute = UtilService.getFloat(fareSummary.reservedTime / 60);
            fareSummary.reserved = this.calculateReservationCharge(
                reservedTimeInMinute,
                fareData
            );
        }
        if (ride.stopOverTrack && ride.stopOverTrack.length > 0) {
            let pausedTime = 0;
            for (let pauseTrack of ride.stopOverTrack) {
                pausedTime += pauseTrack.duration;
            }
            // convert into minutes
            let pausedTimeInMinute = UtilService.getFloat(pausedTime / 60);
            if (pausedTimeInMinute > fareData.pauseTimeLimit) {
                // if seconds are more than limit, need to reset to it's limit.
                // for eg. limit is 5min and cron runs at 5 min 30 sec, need to reset limit to 5 min
                pausedTime = fareData.pauseTimeLimit * 60;
                pausedTimeInMinute = fareData.pauseTimeLimit;
            }
            fareSummary.pausedTime = pausedTime;
            fareSummary.paused = UtilService.getFloat(pausedTimeInMinute * fareData.ridePauseFare);
        }
        fareSummary.travelTime = UtilService.getTimeDifference(
            ride.startDateTime,
            UtilService.getTimeFromNow(),
            'seconds'
        );
        fareSummary.travelTime -= fareSummary.pausedTime;
        let travelTimeInMinute = UtilService.getFloat(fareSummary.travelTime / 60);
        // for now distance = time;
        if (data && data.tripDistance) {
            fareSummary.travelDistance = data.tripDistance;
        } else {
            let locationTrackData = await RideLocationTrack.findOne({ rideId: ride.id });
            if (!locationTrackData) {
                locationTrackData = {
                    locationTrack: []
                };
            }
            fareSummary.travelDistance = this.calculateDistanceForRide(ride.startLocation, locationTrackData.locationTrack);
        }
        if (sails.config.DEFAULT_DISTANCE_UNIT === sails.config.DISTANCE_UNIT.MILES) {
            fareSummary.travelDistance = UtilService.convertKmToMiles(fareSummary.travelDistance);
        }
        // fareSummary.travelDistance = parseInt(fareSummary.travelTime * Math.random());

        fareSummary.distance = this.calculateDistanceFare(fareData, fareSummary.travelDistance);
        fareSummary.time = this.calculateTimeFare(fareData, travelTimeInMinute, ride.rideType);
        fareSummary.late += fareSummary.late;
        if (fareData.unlockFees && sails.config.CALCULATE_UNLOCK_FEES) {
            fareSummary.unlockFees = fareData.unlockFees;
        }
        if (fareData.rideDeposit) {
            fareSummary.rideDeposit = fareData.rideDeposit;
        }
        console.log('ride.isEndedByServer - ', ride.isEndedByServer);
        if (!ride.scooterImage && !ride.isEndedByServer && sails.config.CALCULATE_PARKING_FINE) {
            fareSummary.parkingFine += this.calculateParkingFineFare(fareData);
        }

        subTotal = fareSummary.distance + fareSummary.time;
        fareSummary.subTotal = subTotal;

        //////////////////////////////
        if (ride.rideType === sails.config.RIDE_TYPE.BOOKING_PASS) {
            fareSummary = await this.calculateFareForBookingPassRide(ride, fareData, fareSummary)
        }

        subTotal = fareSummary.subTotal + fareSummary.reserved + fareSummary.paused + fareSummary.unlockFees;
        subTotal = UtilService.getFloat(subTotal);
        fareSummary.subTotal = subTotal;
        fareSummary.isBaseFareApplied = false;
        if (fareSummary.subTotal < fareData.baseFare && ride.rideType !== sails.config.RIDE_TYPE.BOOKING_PASS) {
            fareSummary.subTotal = fareData.baseFare;
            fareSummary.isBaseFareApplied = true;
        }
        let tax = this.calculateTax(subTotal);
        fareSummary.tax = tax; // calculate tax
        fareSummary.total = fareSummary.subTotal + fareSummary.tax;
        fareSummary.total = UtilService.getFloat(fareSummary.total);
        if (isUseMinutesForRideSummary) {
            fareSummary.reservedTime = UtilService.getFloat(fareSummary.reservedTime / 60);
            fareSummary.pausedTime = UtilService.getFloat(fareSummary.pausedTime / 60);
            fareSummary.travelTime = UtilService.getFloat(fareSummary.travelTime / 60);
        }

        if (ride.rideType === sails.config.RIDE_TYPE.SUBSCRIPTION) {
            fareSummary = await this.calculateFareForSubscriptionRide(ride, fareData, fareSummary)
        }
        if (sails.config.ROUND_OFF_RIDE_AMOUNT) {
            fareSummary.total = Math.round(fareSummary.total);
        }
        if (sails.config.IS_REFERRAL_ENABLE) {
            let referralCodeBenefit = await this.checkFreeReferralCodeBenefit(ride.userId);
            if (referralCodeBenefit) {
                this.addBenefitToReferralUser(ride.userId, referralCodeBenefit);
                if (referralCodeBenefit.benefit !== sails.config.REFERRAL.BENEFIT.FREE_AMOUNT) {
                    fareSummary.total = 0;

                    return fareSummary;
                } else {
                    await RideBooking.update(
                        { id: ride.id },
                        { isFreeRide: true }
                    );
                }
            }
        }

        return fareSummary;
    },
    async getPriceFromTime(fareData, time, rideType) {
        //time in second
        const timeInMinute = UtilService.getFloat(time / 60);
        const totalFare = this.calculateTimeFare(fareData, timeInMinute, rideType);
        const totalFareOfTime = UtilService.getFloat(totalFare);

        return totalFareOfTime;
    },
    async getDiscountPriceFromTime(fareData, time, rideType, discount) {
        let totalFareOfTime = await this.getPriceFromTime(fareData, time, rideType);

        const discountPrice = discount / 100;
        const finalDiscountFare = UtilService.getFloat(totalFareOfTime - (totalFareOfTime * discountPrice));

        let discountFareOfUsedPassTime = {
            finalDiscountFare: finalDiscountFare,
            discountAmount: totalFareOfTime * discountPrice
        }
        return discountFareOfUsedPassTime;
    },
    async calculateFareForBookingPassRide(ride, fareData, fareSummary) {
        let rideDiscount = false;
        let unlockDiscount = false;
        let finalFareWithDiscount = 0;
        let currentPlanInvoice = await BookingPassService.getUserPlanInvoice(ride.planInvoiceId);
        let passDiscountDetail = await BookingPassService.getPlanPriceDetails(currentPlanInvoice.planData, currentPlanInvoice.vehicleType)
        if (currentPlanInvoice &&
            currentPlanInvoice.planData &&
            currentPlanInvoice.planData.passType
        ) {
            if (currentPlanInvoice.planData.passType.includes(sails.config.BOOKING_PASS_TYPE.RIDE)) {
                rideDiscount = true;
            }
            if (currentPlanInvoice.planData.passType.includes(sails.config.BOOKING_PASS_TYPE.UNLOCK)) {
                unlockDiscount = true;
            }
        }
        console.log('currentPlanInvoice.remainingTimeLimit :>> ', currentPlanInvoice.remainingTimeLimit);
        console.log('fareSummary.travelTime :>> ', fareSummary.travelTime);
        if (rideDiscount) {
            //check ride is in working hours or not 
            const endDateTime = ride.endDateTime || UtilService.getTimeFromNow();
            const todayEndTime = UtilService.addExpireTime(UtilService.getTimeFromNow(), sails.config.END_WORKING_TIME);

            const isRideEndBeforeWorkingHour = UtilService.isBeforeTime(endDateTime, todayEndTime)
            fareSummary.rideDiscountPercentage = passDiscountDetail.rideDiscount;
            console.log('isRideEndBeforeWorkingHour :>> ', isRideEndBeforeWorkingHour);
            let finalChargeSummary;

            if (!isRideEndBeforeWorkingHour) {
                finalChargeSummary = await this.calculateChargeForRideEndBeforeWorkingHour(ride, currentPlanInvoice, todayEndTime, fareData, passDiscountDetail, fareSummary);
            }
            else {
                if (currentPlanInvoice.remainingTimeLimit >= fareSummary.travelTime) {
                    finalChargeSummary = await this.calculateChargewithDiscount(
                        ride, currentPlanInvoice, fareSummary, passDiscountDetail);

                } else {
                    finalChargeSummary = await this.calculateChargewithExtraTime(
                        ride, currentPlanInvoice, fareSummary, fareData, passDiscountDetail);
                }
            }
            finalFareWithDiscount = finalChargeSummary.finalFareWithDiscount;
            fareSummary = finalChargeSummary.fareSummary;
        }
        if (unlockDiscount && sails.config.CALCULATE_UNLOCK_FEES) {
            fareSummary = await this.calculateUnlockFeeswithDiscount(
                passDiscountDetail, fareSummary
            );
        }
        fareSummary.bookingPassUsedTime = fareSummary.travelTime - fareSummary.bookingPassExtraTimeUsed;
        fareSummary.subTotal = finalFareWithDiscount;
        return fareSummary;
    },
    async calculateChargeForRideEndBeforeWorkingHour(ride, currentPlanInvoice, todayEndTime, fareData, passDiscountDetail, fareSummary) {
        const endDateTime = ride.endDateTime || UtilService.getTimeFromNow();

        const bookPassUsingTime = UtilService.getTimeDifference(ride.startDateTime, todayEndTime, 'seconds');
        let discountFareOfUsedPassTime;
        let bookingPassExtraTimeUsed = 0;

        if (bookPassUsingTime) {
            let planInvoiceTrack;
            if (currentPlanInvoice.remainingTimeLimit >= bookPassUsingTime) {
                const remainingTimeLimit = currentPlanInvoice.remainingTimeLimit - bookPassUsingTime;
                const remainingTimeRoundFig = Math.floor(remainingTimeLimit / 60) * 60;
                await BookingPassService.updateTimeLimitInInvoice(currentPlanInvoice.id, remainingTimeRoundFig);

                const discountFarePassTime = await this.getDiscountPriceFromTime(
                    fareData,
                    bookPassUsingTime,
                    ride.rideType,
                    passDiscountDetail.rideDiscount);

                planInvoiceTrack = {
                    userId: ride.userId,
                    dateTime: UtilService.getTimeFromNow(),
                    remark: 'Booking Pass is used for ride!',
                    planInvoiceId: currentPlanInvoice.id,
                    remainingTimeLimit: remainingTimeRoundFig
                };

                discountFareOfUsedPassTime = {
                    discountAmount: discountFarePassTime.discountAmount,
                    finalDiscountFare: discountFarePassTime.finalDiscountFare
                }
            } else {
                let extraTime = bookPassUsingTime - currentPlanInvoice.remainingTimeLimit;

                await BookingPassService.updateTimeLimitInInvoice(currentPlanInvoice.id, 0);

                planInvoiceTrack = {
                    userId: ride.userId,
                    dateTime: UtilService.getTimeFromNow(),
                    remark: 'Booking Pass is used for ride with extra time!',
                    planInvoiceId: currentPlanInvoice.id,
                    remainingTimeLimit: 0
                };

                const totalFareOfExtraTime = await this.getPriceFromTime(
                    fareData,
                    extraTime,
                    ride.rideType);
                const discountFareOfPassTime = await this.getDiscountPriceFromTime(
                    fareData,
                    currentPlanInvoice.remainingTimeLimit,
                    ride.rideType,
                    passDiscountDetail.rideDiscount);

                const finalFareWithDiscount = totalFareOfExtraTime + discountFareOfPassTime.finalDiscountFare;
                bookingPassExtraTimeUsed = extraTime;

                const user = await User.findOne({ id: ride.userId });
                let currentBookingPass = user.currentBookingPassIds;
                const currentBookingPassIds = currentBookingPass.filter(item => item !== currentPlanInvoice.id)
                await User.update({ id: ride.userId }, { currentBookingPassIds: currentBookingPassIds });

                discountFareOfUsedPassTime = {
                    discountAmount: discountFareOfPassTime.discountAmount,
                    finalDiscountFare: finalFareWithDiscount
                }
            }
            ride.planInvoiceTrack.push(planInvoiceTrack);
            await RideBooking.update({ id: ride.id }, {
                planInvoiceId: currentPlanInvoice.id,
                planInvoiceTrack: ride.planInvoiceTrack
            });
        }
        //calculate fare for extra time
        let extraTimeOverWorkingHour = UtilService.getTimeDifference(todayEndTime, endDateTime, 'seconds');
        fareSummary.bookingPassExtraTimeUsed = extraTimeOverWorkingHour + bookingPassExtraTimeUsed;
        let totalFareOfExtraTime = await this.getPriceFromTime(
            fareData,
            extraTimeOverWorkingHour,
            ride.rideType);
        fareSummary.rideDiscountAmount = discountFareOfUsedPassTime.discountAmount;
        const finalFareWithDiscount = discountFareOfUsedPassTime.finalDiscountFare + totalFareOfExtraTime;

        const finalSummary = {
            fareSummary: fareSummary,
            finalFareWithDiscount: finalFareWithDiscount
        }
        return finalSummary;
    },

    async calculateChargewithDiscount(ride, currentPlanInvoice, fareSummary, passDiscountDetail) {
        const remainingTimeLimit = currentPlanInvoice.remainingTimeLimit - fareSummary.travelTime;
        const remainingTimeRoundFig = Math.floor(remainingTimeLimit / 60) * 60;
        await BookingPassService.updateTimeLimitInInvoice(currentPlanInvoice.id, remainingTimeRoundFig);

        const discountPrice = passDiscountDetail.rideDiscount / 100;
        const finalFareWithDiscount = UtilService.getFloat(fareSummary.subTotal - (fareSummary.subTotal * discountPrice));
        fareSummary.rideDiscountAmount = fareSummary.subTotal * discountPrice;

        let planInvoiceTrack = {
            userId: ride.userId,
            dateTime: UtilService.getTimeFromNow(),
            remark: 'Booking Pass is used for ride!',
            planInvoiceId: currentPlanInvoice.id,
            remainingTimeLimit: remainingTimeRoundFig
        };
        ride.planInvoiceTrack.push(planInvoiceTrack);
        await RideBooking.update({ id: ride.id }, {
            planInvoiceId: currentPlanInvoice.id,
            planInvoiceTrack: ride.planInvoiceTrack
        });
        const finalSummary = {
            fareSummary: fareSummary,
            finalFareWithDiscount: finalFareWithDiscount
        }
        return finalSummary;
    },
    async calculateChargewithExtraTime(ride, currentPlanInvoice, fareSummary, fareData, passDiscountDetail) {
        let extraTime = fareSummary.travelTime - currentPlanInvoice.remainingTimeLimit;

        await BookingPassService.updateTimeLimitInInvoice(currentPlanInvoice.id, 0);

        let planInvoiceTrack = {
            userId: ride.userId,
            dateTime: UtilService.getTimeFromNow(),
            remark: 'Booking Pass is used for ride with extra time!',
            planInvoiceId: currentPlanInvoice.id,
            remainingTimeLimit: 0
        };
        ride.planInvoiceTrack.push(planInvoiceTrack);
        await RideBooking.update({ id: ride.id }, {
            planInvoiceId: currentPlanInvoice.id,
            planInvoiceTrack: ride.planInvoiceTrack
        });

        //calculate fare for extra time
        const totalFareOfExtraTime = await this.getPriceFromTime(
            fareData,
            extraTime,
            ride.rideType);
        //calculate fare for time inwhich pass is used
        const discountFareOfUsedPassTime = await this.getDiscountPriceFromTime(
            fareData,
            currentPlanInvoice.remainingTimeLimit,
            ride.rideType,
            passDiscountDetail.rideDiscount);

        const finalFareWithDiscount = totalFareOfExtraTime + discountFareOfUsedPassTime.finalDiscountFare;
        fareSummary.bookingPassExtraTimeUsed = extraTime;
        fareSummary.rideDiscountAmount = discountFareOfUsedPassTime.discountAmount;

        const user = await User.findOne({ id: ride.userId });
        let currentBookingPass = user.currentBookingPassIds;
        const currentBookingPassIds = currentBookingPass.filter(item => item !== currentPlanInvoice.id)
        await User.update({ id: ride.userId }, { currentBookingPassIds: currentBookingPassIds });
        const finalSummary = {
            fareSummary: fareSummary,
            finalFareWithDiscount: finalFareWithDiscount
        }
        return finalSummary;
    },
    async calculateUnlockFeeswithDiscount(passDiscountDetail, fareSummary) {
        let unlockDiscount = passDiscountDetail.unlockDiscount / 100;
        fareSummary.unlockDiscountPercentage = passDiscountDetail.unlockDiscount;
        fareSummary.unlockDiscountAmount = fareSummary.unlockFees * unlockDiscount;
        const finalUnlockFareWithDiscount = UtilService.getFloat(fareSummary.unlockFees - (fareSummary.unlockFees * unlockDiscount));
        fareSummary.unlockFees = finalUnlockFareWithDiscount;

        return fareSummary;
    },
    async calculateFareForSubscriptionRide(ride, fareData, fareSummary) {
        let noChargeForRide = false;
        let currentPlanInvoice = await BookPlanService.getUserPlanInvoice(ride.planInvoiceId);
        let extraTakenTime = 0;
        let planInvoiceTrack;
        if (currentPlanInvoice.remainingTimeLimit > fareSummary.travelTime) {
            console.log('1493 @@@@', ride.id);
            noChargeForRide = true;
        } else {
            const user = await User.findOne({ id: ride.userId })
                .select(['currentBookingPlanInvoiceId', 'nextBookingPlanInvoiceId']);
            let nextPlanInvoice = await BookPlanService.getUserPlanInvoice(user.nextBookingPlanInvoiceId);
            if (
                nextPlanInvoice &&
                (nextPlanInvoice.remainingTimeLimit + currentPlanInvoice.remainingTimeLimit) > fareSummary.travelTime
            ) {
                await BookPlanService.makeNextPlanAsCurrent(user, true);
                console.log('1504 @@@@', ride.id);
                await BookPlanService.emptyTimeLimitInInvoice(currentPlanInvoice.id);
                planInvoiceTrack = {
                    userId: ride.userId,
                    dateTime: UtilService.getTimeFromNow(),
                    remark: 'Next plan is being used in stop ride',
                    planInvoiceId: nextPlanInvoice.id,
                    remainingTimeLimit: nextPlanInvoice.remainingTimeLimit
                };
                ride.planInvoiceTrack.push(planInvoiceTrack);
                await RideBooking.update({ id: ride.id }, {
                    planInvoiceId: nextPlanInvoice.id,
                    planInvoiceTrack: ride.planInvoiceTrack
                });
                noChargeForRide = true;
            } else {
                extraTakenTime = fareSummary.travelTime - currentPlanInvoice.remainingTimeLimit;
                console.log("1521 extraTakenTime", extraTakenTime, '@@@@ ', ride.id)
                if (nextPlanInvoice) {
                    await BookPlanService.makeNextPlanAsCurrent(user);
                    nextPlanInvoice = await BookPlanService.getUserPlanInvoice(nextPlanInvoice.id);
                    planInvoiceTrack = {
                        userId: ride.userId,
                        dateTime: UtilService.getTimeFromNow(),
                        remark: 'Next plan is being used. It does not have enough time-limit',
                        planInvoiceId: nextPlanInvoice.id,
                        remainingTimeLimit: nextPlanInvoice.remainingTimeLimit
                    };
                    ride.planInvoiceTrack.push(planInvoiceTrack);
                    extraTakenTime = extraTakenTime - nextPlanInvoice.remainingTimeLimit;
                    console.log("1534 extraTakenTime", extraTakenTime, '@@@@ ', ride.id)
                    // await BookPlanService.emptyTimeLimitInInvoice(currentPlanInvoice.id);
                    await BookPlanService.emptyTimeLimitInInvoice(nextPlanInvoice.id);
                    await User.update({ id: ride.userId }, { currentBookingPlanInvoiceId: null });
                    await RideBooking.update({ id: ride.id }, {
                        planInvoiceId: nextPlanInvoice.id,
                        planInvoiceTrack: ride.planInvoiceTrack
                    });
                    console.log('1542 @@@@', nextPlanInvoice.remainingTimeLimit, ', rideId - ', ride.id);
                }
                console.log('1544 @@@@', ride.id);
                await BookPlanService.emptyTimeLimitInInvoice(currentPlanInvoice.id);
                await User.update({ id: ride.userId }, { currentBookingPlanInvoiceId: null });
                fareSummary.bookPlanExtraTakenTime = extraTakenTime;
                console.log("1548 extraTakenTime", extraTakenTime, '@@@@ ', ride.id);
                let extraTakenTimeInMin = UtilService.getFloat(fareSummary.bookPlanExtraTakenTime / 60);
                fareSummary.time = this.calculateTimeFare(fareData, extraTakenTimeInMin, ride.rideType);
                fareSummary.subTotal = UtilService.getFloat(fareSummary.time);
                fareSummary.total = fareSummary.subTotal;
            }
        }
        if (noChargeForRide) {
            fareSummary.total = 0;
        }

        return fareSummary;
    },

    calculateFare(fareData, distance, time) {
        let cost = {
            distanceFare: 0,
            timeFare: 0,
            subTotal: 0,
            total: 0
        };
        cost.distanceFare = this.calculateDistanceFare(fareData, distance);
        cost.timeFare = this.calculateTimeFare(fareData, time);
        cost.subTotal = cost.distanceFare + cost.timeFare;
        cost.isBaseFareApplied = false;
        if (cost.subTotal < fareData.baseFare) {
            cost.subTotal = fareData.baseFare;
            cost.isBaseFareApplied = true;
        }
        let tax = this.calculateTax(cost.subTotal);
        cost.total = cost.subTotal + tax;

        return cost;
    },

    calculateTax(amount) {
        let taxPercentage = 0;

        return amount * taxPercentage;
    },

    calculateCancellationFare(ride, isSystemCancelled) {
        const fareData = ride.fareData;
        let fareSummary = {
            timeFareFreeLimit: fareData.timeFareFreeLimit,
            distanceFareFreeLimit: fareData.distanceFareFreeLimit,
            reserved: 0,
            paused: 0,
            late: 0,
            cancelled: 0,
            distance: 0,
            time: 0,
            subTotal: 0,
            reservedTime: 0,
            pausedTime: 0,
            lateTime: 0,
            travelDistance: 0,
            travelTime: 0,
            tax: 0,
            total: 0,
            bookPlanExtraTakenTime: 0,
            bookingPassExtraTimeUsed: 0,
        };
        fareSummary.reservedTime = UtilService.getTimeDifference(
            ride.reservedDateTime,
            UtilService.getTimeFromNow(),
            'seconds'
        );
        if (ride.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
            return fareSummary;
        }
        let reservedTimeInMinute = UtilService.getFloat(fareSummary.reservedTime / 60);
        fareSummary.reserved = this.calculateReservationCharge(
            reservedTimeInMinute,
            fareData
        );
        if (!isSystemCancelled && ride.reservedDateTime &&
            ride.currentRequestTry < ride.maxRequestTry
        ) {
            fareSummary.cancelled = fareData.cancellationFare;
        }

        fareSummary.subTotal = fareSummary.reserved + fareSummary.cancelled;
        let tax = 0;
        fareSummary.tax = tax; // calculate tax
        fareSummary.total = fareSummary.subTotal + fareSummary.tax;
        if (fareSummary.total < 0.5 && !sails.config.IS_WALLET_ENABLE) {
            fareSummary.total = 0;
        }

        if (ride.rideType === sails.config.RIDE_TYPE.SUBSCRIPTION) {
            fareSummary.total = 0;
        }

        return fareSummary;
    },

    calculateReservationCharge(time, fareData) {
        let cost = 0;
        let rideReserveTimeFreeLimit = 0;
        if (fareData.rideReserveTimeFreeLimit && fareData.rideReserveTimeFreeLimit > 0) {
            rideReserveTimeFreeLimit = fareData.rideReserveTimeLimit * fareData.rideReserveTimeFreeLimit;
            rideReserveTimeFreeLimit = UtilService.getFloat(rideReserveTimeFreeLimit / 100);
        }
        if (time > rideReserveTimeFreeLimit) {
            time -= rideReserveTimeFreeLimit;
            cost = time * fareData.rideReserveFare;
        }
        cost = UtilService.getFloat(cost);

        return cost;
    },

    calculateParkingFineFare(fareData) {
        if (!fareData.parkingFine) {
            return 0;
        }
        let cost = fareData.parkingFine;

        return cost;
    },

    calculateTimeFare(fareData, time, rideType = sails.config.RIDE_TYPE.DEFAULT) {
        if (fareData.timeFareFreeLimit >= time && rideType === sails.config.RIDE_TYPE.DEFAULT) {
            return 0;
        }
        if (!fareData.timeFare || fareData.timeFare <= 0) {
            return 0;
        }
        let chargeableTime = time;
        if (rideType === sails.config.RIDE_TYPE.DEFAULT) {
            chargeableTime -= fareData.timeFareFreeLimit;
        }
        let perXBaseMinute = fareData.perXBaseMinute ? fareData.perXBaseMinute : 1;
        chargeableTime = this.calculateOffsetTimePerXBaseMinutes(perXBaseMinute, chargeableTime, rideType);
        let cost = chargeableTime * fareData.timeFare;
        cost = UtilService.getFloat(cost);

        return cost;
    },

    calculateOffsetTimePerXBaseMinutes(perXBaseMinute, time, rideType) {
        if (!sails.config.PER_X_MINUTE_FARE_MODEL_ACTIVE || (rideType !== sails.config.RIDE_TYPE.DEFAULT && rideType !== sails.config.RIDE_TYPE.BOOKING_PASS)) {
            return time;
        }
        let baseMinuteMultiple;
        if (Number.isInteger(time)) {
            baseMinuteMultiple = Math.floor(time / perXBaseMinute);
        } else {
            baseMinuteMultiple = Math.floor(time / perXBaseMinute) + 1;
        }

        return baseMinuteMultiple;
    },

    calculateDistanceFare(fareData, distance) {
        if (fareData.distanceFareFreeLimit >= distance) {
            return 0;
        }
        if (!fareData.distanceFare || fareData.distanceFare <= 0) {
            return 0;
        }
        const chargeableDistance = distance - fareData.distanceFareFreeLimit;
        let cost = chargeableDistance * fareData.distanceFare;
        cost = UtilService.getFloat(cost);

        return cost;
    },

    async validateRideStartTime(ride) {
        return moment().isBefore(ride.reservedEndDateTime);
    },
    async isVehicleWithinNest(nestId, currentLocation, tag) {
        let matchedNest = await this.findNest(currentLocation, nestId);

        if (!matchedNest || !matchedNest[0]) {
            if (tag === 'start') {
                throw sails.config.message.CANT_START_RIDE_AT_THIS_LOCATION;
            } else {
                throw sails.config.message.CANT_STOP_RIDE_OUTSIDE_END_NEST;
            }
        }

        return true;
    },
    async isVehicleWithinBoundary(ride, stopLocation) {
        let franchiseeId;
        if (sails.config.IS_FRANCHISEE_ENABLED && ride.franchiseeId) {
            franchiseeId = ObjectId(ride.franchiseeId);
        }
        let zoneData = await this.findZoneDataForLocation(stopLocation, null, ride.vehicleType, franchiseeId);
        if (!zoneData || !zoneData[0]) {
            throw sails.config.message.CANT_STOP_RIDE;
        }

        return true;
    },

    async checkVehicleInsideRideZone(vehicle, ride) {
        let query = { _id: ObjectId(ride.zoneId) };
        let vehicleLocation = vehicle.currentLocation.coordinates;
        let zoneData = await this.findZoneDataForLocation(vehicleLocation, null, null, null, query);
        if (!zoneData || !zoneData[0]) {
            throw sails.config.message.CANT_STOP_RIDE;
        }

        return true;
    },

    async getRideResponse(rideId) {
        let ride = await RideBooking.findOne({ id: rideId })
            .populate('vehicleId')
            .populate('zoneId')
            .populate('endNest')
            .populate('planInvoiceId', { select: ['id', 'planName'] })
            .populate('dealerId', { select: ['firstName', 'lastName', 'name', 'emails', 'mobiles', 'uniqueIdentityNumber', 'inviteCode'] });
        // no need this field for mobile side, and need object if field is given
        ride.zoneId = await this.addSubZones(ride.zoneId);
        delete ride.vehicleId.nestId;

        return ride;
    },

    async addSubZones(zoneObj) {
        let subZones = [];
        if (sails.config.IS_NEST_ENABLED) {
            subZones = await Nest.find({
                zoneId: zoneObj.id,
                isDeleted: false,
                isActive: true,
                type: {
                    "!=": sails.config.FEEDER_NEST_TYPES,
                },
            });
        }
        zoneObj.subZones = subZones;

        return zoneObj;
    },

    getNewLocation(currentLocation, move) {
        const inc = 15;
        let lat;
        let lon;
        switch (move) {
            case 'up':
                lon = currentLocation[1];
                lat = currentLocation[0] + (0.03 * inc);
                break;
            case 'up-right':
                lon = currentLocation[1] + (0.03 * inc);
                lat = currentLocation[0] + (0.02 * inc);
                break;
            case 'down':
                lon = currentLocation[1] - (0.04 * inc);
                lat = currentLocation[0];
                break;
            case 'left':
                lat = currentLocation[0] - (0.03 * inc);
                lon = currentLocation[1];
                break;
            case 'right':
                lat = currentLocation[0] + (0.03 * inc);
                lon = currentLocation[1];
                break;
            default:
                break;
        }

        return [lat, lon];
    },

    createDummyPolygon(currentLocation) {
        let coordinates = [];
        const l1 = this.getNewLocation(currentLocation, 'up-right');
        const l2 = this.getNewLocation(l1, 'left');
        const l3 = this.getNewLocation(l2, 'down');
        const l4 = this.getNewLocation(l3, 'right');
        coordinates.push(l1, l2, l3, l4, l1);

        return coordinates;
    },

    async addDummyScooters(location, userId) {
        console.log('adding dummy scooters');
        const maxScooter = 10;
        const long = location[0];
        const lat = location[1];
        let scooters = [];
        let defaultMeter = 100;
        // let admin = await User.find({
        //     where: { id: userId },
        //     limit: 1,
        //     sort: 'id asc'
        // });
        // if (!admin || admin.length <= 0) {
        //     throw sails.config.message.USER_LIST_NOT_FOUND;
        // }
        // admin = admin[0];

        for (let i = 1; i <= maxScooter; i++) {
            const name = `Test ${UtilService.randomNumber(3) + 10}`;
            const number = UtilService.randomNumber(4);
            const imei = UtilService.randomNumber(15);
            let meter = defaultMeter * i;
            if (i % 2 === 0) {
                meter = -meter;
            }
            const newLong = this.getNewLong(lat, long, meter);
            const newLat = this.getNewLat(lat, meter);
            let battery = 90;
            // let battery = UtilService.randomNumber(2);
            // if (battery < 30) {
            //     battery += 30;
            // }
            // const manufacturer = await Master.findOne({ code: 'MANUFACTURER' });
            const manufacturerChild = await Master.findOne({ code: 'CORUSCATEIOT' });

            // const manufacturerChildren = await Master.find({ parentId: manufacturer.id });
            // let manufacturerIndex = i % 2;
            // let manufacturerChild = manufacturerChildren[manufacturerIndex];

            // if (!manufacturerChild) {
            //     manufacturerChild = manufacturerChildren[0];
            // }

            let scooter = {
                type: sails.config.VEHICLE_TYPE.SCOOTER,
                name: name,
                qrNumber: number,
                imei: imei,
                currentLocation: {
                    type: 'Point',
                    coordinates: [
                        newLong,
                        newLat
                    ]
                },
                manufacturer: manufacturerChild.id,
                // userId: userId,
                batteryLevel: battery,
                connectionStatus: true,
                lockStatus: true
            };
            scooters.push(scooter);
        }

        await Vehicle.createEach(scooters);
    },

    getNewLat(lat, meters) {
        // radius of the earth in kilometer
        let earth = 6378.137;
        let pi = Math.PI;
        // 1 meter in degree
        let m = (1 / ((2 * pi / 360) * earth)) / 1000;

        const newLat = lat + (meters * m);

        return newLat;
    },

    getNewLong(lat, long, meters) {
        // radius of the earth in kilometer
        let earth = 6378.137;
        let pi = Math.PI;
        let cos = Math.cos;
        // 1 meter in degree
        m = (1 / ((2 * pi / 360) * earth)) / 1000;

        let newLong = long + (meters * m) / cos(lat * (pi / 180));

        return newLong;
    },

    async updateRideSummary(bookedRide) {
        let vehicleSummary = await this.getVehicleSummary(bookedRide.vehicleId, bookedRide.vehicleType);
        // let userSummary = await this.getUserSummary(bookedRide.userId);
        let updateVehicleData = {};
        // let updateUserData = {};
        if (bookedRide.status === sails.config.RIDE_STATUS.RESERVED) {
            vehicleSummary.rideSummary.reserved += 1;
            vehicleSummary.rideSummary.booked += 1;
            // userSummary.rideSummary.reserved += 1;
            // userSummary.rideSummary.booked += 1;
        } else if (bookedRide.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
            if (rideBooking.reservedDateTime) {
                return; // already entry added
            }
            vehicleSummary.rideSummary.booked += 1;
            // userSummary.rideSummary.booked += 1;
        } else if (bookedRide.status === sails.config.RIDE_STATUS.COMPLETED && !bookedRide.isPaid) {
            vehicleSummary.rideSummary.completed += 1;
            // userSummary.rideSummary.completed += 1;
            if (bookedRide.fareSummary.reserved) {
                vehicleSummary.rideSummary.reservedTime += bookedRide.fareSummary.reservedTime;
                // userSummary.rideSummary.reservedTime += bookedRide.fareSummary.reservedTime;
            }

            if (bookedRide.fareSummary.paused) {
                vehicleSummary.rideSummary.pausedTime += bookedRide.fareSummary.pausedTime;
                // userSummary.rideSummary.pausedTime += bookedRide.fareSummary.pausedTime;
            }

            if (bookedRide.fareSummary.late) {
                vehicleSummary.rideSummary.lateTime += bookedRide.fareSummary.lateTime;
                // userSummary.rideSummary.lateTime += bookedRide.fareSummary.lateTime;
            }

            vehicleSummary.rideSummary.distance += bookedRide.fareSummary.travelDistance;
            // userSummary.rideSummary.distance += bookedRide.fareSummary.travelDistance;
            vehicleSummary.rideSummary.time += bookedRide.fareSummary.travelTime;
            // userSummary.rideSummary.time += bookedRide.fareSummary.travelTime;
        } else if (bookedRide.status === sails.config.RIDE_STATUS.COMPLETED && bookedRide.isPaid) {
            if (bookedRide.fareSummary.reserved) {
                vehicleSummary.fareSummary.reserved += bookedRide.fareSummary.reserved;
                // userSummary.fareSummary.reserved += bookedRide.fareSummary.reserved;
            }

            if (bookedRide.fareSummary.paused) {
                vehicleSummary.fareSummary.paused += bookedRide.fareSummary.paused;
                // userSummary.fareSummary.paused += bookedRide.fareSummary.paused;
            }

            if (bookedRide.fareSummary.late) {
                vehicleSummary.fareSummary.late += bookedRide.fareSummary.late;
                // userSummary.fareSummary.late += bookedRide.fareSummary.late;
            }
            vehicleSummary.fareSummary.distance += bookedRide.fareSummary.distance;
            vehicleSummary.fareSummary.time += bookedRide.fareSummary.time;
            vehicleSummary.fareSummary.subTotal += bookedRide.fareSummary.subTotal;
            vehicleSummary.fareSummary.tax += bookedRide.fareSummary.tax;
            vehicleSummary.fareSummary.total += bookedRide.fareSummary.total;
            vehicleSummary.fareSummary.promoCodeAmount += bookedRide.promoCodeAmount;

            // userSummary.fareSummary.distance += bookedRide.fareSummary.distance;
            // userSummary.fareSummary.time += bookedRide.fareSummary.time;
            // userSummary.fareSummary.subTotal += bookedRide.fareSummary.subTotal;
            // userSummary.fareSummary.tax += bookedRide.fareSummary.tax;
            // userSummary.fareSummary.total += bookedRide.fareSummary.total;
            // userSummary.fareSummary.promoCodeAmount += bookedRide.promoCodeAmount;

            updateVehicleData.fareSummary = vehicleSummary.fareSummary;
            // updateUserData.fareSummary = userSummary.fareSummary;
        } else if (bookedRide.status === sails.config.RIDE_STATUS.CANCELLED) {
            vehicleSummary.rideSummary.cancelled += 1;
            // userSummary.rideSummary.cancelled += 1;
            if (bookedRide.fareSummary) {
                vehicleSummary.fareSummary.cancelled = bookedRide.fareSummary.cancelled;
                // userSummary.fareSummary.cancelled = bookedRide.fareSummary.cancelled;
                updateVehicleData.fareSummary = vehicleSummary.fareSummary;
                // updateUserData.fareSummary = userSummary.fareSummary;
            }
        }
        updateVehicleData.rideSummary = vehicleSummary.rideSummary;
        // updateUserData.rideSummary = userSummary.rideSummary;
        await VehicleSummary.update({ id: vehicleSummary.id }, updateVehicleData);
        // await User.update({ id: userSummary.id }, updateUserData);
    },

    async getVehicleSummary(vehicleId, vehicleType) {
        let vehicleSummary = await VehicleSummary.findOne({ vehicleId: vehicleId });
        if (!vehicleSummary || !vehicleSummary.id) {
            const summaryData = {
                vehicleId: vehicleId,
                rideSummary: {
                    reserved: 0,
                    paused: 0,
                    late: 0,
                    booked: 0,
                    cancelled: 0,
                    completed: 0,
                    pausedTime: 0,
                    lateTime: 0,
                    distance: 0,
                    time: 0
                },
                fareSummary: {
                    reserved: 0,
                    paused: 0,
                    cancelled: 0,
                    late: 0,
                    completed: 0,
                    distance: 0,
                    time: 0,
                    promoCode: 0,
                    subTotal: 0,
                    total: 0
                },
                vehicleType: vehicleType
            };
            vehicleSummary = await VehicleSummary.create(summaryData).fetch();
        }

        return vehicleSummary;
    },

    async getUserSummary(userId) {
        let user = await User.findOne({ id: userId });
        if (user && !user.rideSummary) {
            const summaryData = {
                rideSummary: {
                    reserved: 0,
                    paused: 0,
                    late: 0,
                    booked: 0,
                    cancelled: 0,
                    completed: 0,
                    pausedTime: 0,
                    lateTime: 0,
                    distance: 0,
                    time: 0
                },
                fareSummary: {
                    reserved: 0,
                    paused: 0,
                    cancelled: 0,
                    late: 0,
                    completed: 0,
                    distance: 0,
                    time: 0,
                    total: 0
                }
            };
            user = await User.update({ id: user.id }, summaryData).fetch();
            user = user[0];
        }

        return {
            id: user.id,
            rideSummary: user.rideSummary,
            fareSummary: user.fareSummary
        };
    },

    async getRatings(rideIds) {
        let ratings = [];
        if (rideIds && rideIds.length) {
            ratings = await Rating.find({ rideId: rideIds });
        }

        return ratings;
    },

    async getDispute(rideIds, userId) {
        let disputes = [];
        if (rideIds && rideIds.length) {
            disputes = await RideComplaintDispute.find({ rideId: rideIds, userId: userId }).sort('createdAt DESC');
        }

        return disputes;
    },

    async paymentSummary(rideIds, userId) {
        let payments = [];
        if (rideIds && rideIds.length) {
            payments = await TransactionLog.find({ rideId: rideIds, transactionBy: userId }).sort('createdAt DESC');
        }

        return payments;
    },

    async sendZimoNotificationToAdmin(reqData, imei) {
        let ioBit = this.getBinaryNumber(reqData.io);
        let rfBit = this.getBinaryNumber(reqData.rf);

        // ioBit - iot check, battery check
        let iotCheck = ioBit.substring(3, 4) !== '1';
        let batteryCheck = ioBit.substring(4, 5) !== '1';

        if (iotCheck) {
            let notification = {
                ...sails.config.NOTIFICATION.IOT_NOTIFICATION.CRITICAL_EVENTS,
                message: 'IOT is not in good condition.'
            };
            this.sendIOTNotification(imei, notification);
        }
        if (batteryCheck) {
            const notification = {
                ...sails.config.NOTIFICATION.IOT_NOTIFICATION.CRITICAL_EVENTS,
                message: 'Battery is not in good condition.'
            };
            this.sendIOTNotification(imei, notification);
        }

        let vehicleUAMovement = rfBit.substring(0, 1) === '1';
        let vehicleBuzOnKickStand = rfBit.substring(3, 4) === '1';

        if (vehicleUAMovement) {
            const notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.UNAUTHORIZED_MOVEMENT;
            this.sendIOTNotification(imei, notification);
        }
        if (vehicleBuzOnKickStand) {
            const notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.BUZZER;
            this.sendIOTNotification(imei, notification);
        }
    },

    getBinaryNumber(number) {
        let str = number.toString(2);
        str = str.split('').reverse().join('');

        return str;
    },

    async sendIOTNotification(imei, data) {
        /**
         * imei - It's an imei number of vehicle.
         * data Object will be looked like
         * 
         *  {    
         *      type:1,
         *      message:'Notification Message',
         *      sendInterval:5    
         *  }
         * 
         *  where sendInterval's value is provided in minutes.
         */
        if (!imei || !data) {
            return true;
        }
        let vehicle = await this.getVehicle(imei);
        let notificationObj = {
            title: data.message,
            vehicleId: vehicle.id,
            status: sails.config.NOTIFICATION.STATUS.SEND,
            type: data.type,
            vehicleType: vehicle.type
        }
        if (data.priority) {
            notificationObj.priority = data.priority;
        }

        await NotificationService.sendIotNotification(notificationObj, data.sendInterval, vehicle.franchiseeId, vehicle.dealerId);
    },

    async findAndUpdateRide(vehicleId, lockStatus) {
        let rideStatus = [
            sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
            sails.config.RIDE_STATUS.ON_GOING
        ];
        let ride = await RideBooking.findOne({
            vehicleId: vehicleId,
            status: rideStatus
        });
        // console.log("Founded Ride => ", ride);
        if (!ride || !ride.id) {
            return true;
        }
        let updateRideData = {
            status: 0
        };
        if (lockStatus === false) {
            // unlocked
            if (ride.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
                console.log("*********************************************");
                console.log("Starting the Ride");
                console.log("*********************************************");
                await this.startRide(ride, updateRideData);
            } else if (ride.status === sails.config.RIDE_STATUS.ON_GOING) {
                console.log("*********************************************");
                console.log("Resume the Ride");
                console.log("*********************************************");
                await this.rideResumed(ride, updateRideData);
            }
        } else if (ride.status === sails.config.RIDE_STATUS.ON_GOING) {
            // locked
            await this.ridePaused(ride, updateRideData);
        }
    },

    async getVehicle(imei) {
        let vehicle;
        try {
            vehicle = await RedisDBService.getData(imei);
        } catch (e) {
            console.log('RideBooking Service : getVehicle : can not get data from redis', e);
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

    async checkRideOutsideZone(ride, imei, coordinates) {
        if (!ride && !(ride.status === sails.config.RIDE_STATUS.ON_GOING)) {
            return true;
        }
        try {
            await this.isVehicleWithinBoundary(ride, coordinates);

            return false;
        } catch (e) {
            const notification = sails.config.NOTIFICATION.IOT_NOTIFICATION.OUTSIDE_ZONE;
            await this.sendIOTNotification(imei, notification);

            return true;
        }
    },

    // no use
    // async getRideFromVehicleId(vehicleId) {
    //     let ride = await RideBooking
    //         .find({
    //             where: { vehicleId: vehicleId },
    //             sort: 'iotRideId desc',
    //             limit: 1
    //         })
    //         .populate('vehicleId');

    //     return ride[0];
    // },

    async checkWalletMinAmountForRide(userWalletAmount = 0) {
        let walletConfig = await WalletService.getWalletConfig();
        if (walletConfig.isWalletEnable && walletConfig.minWalletAmountForRide > 0 &&
            userWalletAmount < walletConfig.minWalletAmountForRide
        ) {
            let customError = {
                code: 'PRIVATE_RIDE_ERROR',
                message: `It seems that your wallet balance is low. It is required to have at least ${walletConfig.minWalletAmountForRide + sails.config.CURRENCY_SYM} in your wallet.`,
                status: 401
            };

            throw customError;
        }
    },

    async updateDisconnectedVehicle(imei) {
        if (!imei) {
            return false;
        }
        let currentTime = await UtilService.getTimeFromNow();
        let vehicle = await Vehicle.update(
            { imei: imei },
            {
                connectionStatus: false,
                lastConnectedDateTime: currentTime,
                lastConnectionCheckDateTime: currentTime
            }
        ).fetch();
        let connectedStatus = sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.VEHICLE_DISCONNECTED;
        await notification.sendConnectionNotification(vehicle[0], connectedStatus);
    },

    async markVehicleDisconnected(id) {
        if (!id) {
            return false;
        }
        let currentTime = await UtilService.getTimeFromNow();
        let vehicle = await Vehicle.update(
            { id: id },
            {
                connectionStatus: false,
                lastConnectedDateTime: currentTime,
                lastConnectionCheckDateTime: currentTime
            }
        ).fetch();

        let connectedStatus = sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.VEHICLE_DISCONNECTED;
        await notification.sendConnectionNotification(vehicle[0], connectedStatus);

        return vehicle;
    },
    async passCommandToPerformToIotService(command, vehicle, params) {
        await IotService.commandToPerform(command, vehicle, params);
    },
    async checkIsSubscriptionRideFlow(bookPlanFeatureActive, currentBookPlanInvoice, timeToCheck = 0, nextPlanExist = false) {
        if (!bookPlanFeatureActive || !currentBookPlanInvoice) {
            console.log('2234 *** checkIsSubscriptionRideFlow')
            return false;
        }
        let isSubscriptionRideFlow = false;
        const timeNow = UtilService.getTimeFromNow();
        const expirationTimeDiff = UtilService.getTimeDifference(
            currentBookPlanInvoice.expirationEndDateTime,
            timeNow
        );
        console.log("2243 expirationTimeDiff ****", expirationTimeDiff);
        console.log("currentBookPlanInvoice.remainingTimeLimit", currentBookPlanInvoice && currentBookPlanInvoice.remainingTimeLimit);
        let haveEnoughTimeLimit = currentBookPlanInvoice && currentBookPlanInvoice.remainingTimeLimit > timeToCheck;
        if (
            (haveEnoughTimeLimit || nextPlanExist) &&
            expirationTimeDiff < 0
        ) {
            isSubscriptionRideFlow = true;
        }

        return isSubscriptionRideFlow;
    },
    async checkIsBookingPassRideFlow(bookPassFeatureActive, currentBookPlanInvoice, timeToCheck = 0, userId) {
        if (!bookPassFeatureActive || !currentBookPlanInvoice) {
            console.log('2234 *** bookPassFeature  inActive')
            return false;
        }
        let isBookingPassRideFlow = false;
        let haveEnoughTimeLimit = currentBookPlanInvoice && currentBookPlanInvoice.remainingTimeLimit > timeToCheck;

        const timeNow = UtilService.getTimeFromNow();
        let isTimeBeforeExpirePlan = true;
        if (currentBookPlanInvoice.expirationEndDateTime) {
            isTimeBeforeExpirePlan = UtilService.isBeforeTime(timeNow, currentBookPlanInvoice.expirationEndDateTime)
        }

        let isrideInWorkingHour = UtilService.checkTimeBetweenWorkingHour(timeNow, sails.config.START_WORKING_TIME, sails.config.END_WORKING_TIME);
        let allRideUsed = await this.checkAllRideUsed(currentBookPlanInvoice, userId)
        console.log('object :>> ', haveEnoughTimeLimit && !allRideUsed && isrideInWorkingHour && isTimeBeforeExpirePlan);
        if (haveEnoughTimeLimit && !allRideUsed && isrideInWorkingHour && isTimeBeforeExpirePlan) {
            isBookingPassRideFlow = true;
        }

        return isBookingPassRideFlow;
    },

    async checkIsPrivateRide(vehicle, user) {
        let mVehicle = JSON.parse(JSON.stringify(vehicle));
        let query = {};
        zoneFound = false;
        if (mVehicle.dealerId && user.dealerId && mVehicle.dealerId === user.dealerId
            && mVehicle.fleetType.findIndex(type => type == sails.config.USER.FLEET_TYPE.PRIVATE) >= 0) {
            query.dealerId = ObjectId(mVehicle.dealerId);
            query.fleetType = sails.config.USER.FLEET_TYPE.PRIVATE;
            mVehicle.franchiseeId = null;
            let zoneData = await this.findZoneDataForLocation(
                mVehicle.currentLocation.coordinates,
                null,
                mVehicle.type,
                mVehicle.franchiseeId,
                query
            );
            if (zoneData && zoneData[0]) {
                zoneFound = true;
                return true;
            }
        }
        if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE &&
            vehicle.franchiseeId && user.franchiseeId && vehicle.franchiseeId === user.franchiseeId &&
            vehicle.fleetType.findIndex(type => type == sails.config.USER.FLEET_TYPE.PRIVATE) >= 0) {
            query.franchiseeId = ObjectId(vehicle.franchiseeId);
            query.fleetType = sails.config.USER.FLEET_TYPE.PRIVATE;
            let zoneData = await this.findZoneDataForLocation(
                vehicle.currentLocation.coordinates,
                null,
                vehicle.type,
                vehicle.franchiseeId,
                query
            );
            console.log("2921 ----- ")
            if (zoneData && zoneData[0]) {
                console.log("2923 ----- ")
                zoneFound = true;
                return true;
            }
        }
        if (!zoneFound) {
            if (sails.config.DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.STRIPE &&
                (!user.cards || _.size(user.cards) === 0)) {
                throw sails.config.message.CARD_NOT_ADDED;
            }
            let freeRide = await this.checkFreeReferralCodeBenefit(user.id);
            if (!freeRide || freeRide.benefit !== sails.config.REFERRAL.BENEFIT.FREE_AMOUNT) {
                await this.checkWalletMinAmountForRide(user.walletAmount);
            }
        }

        return false;
    },

    async findCircleTypeNest(query, coordinates) {
        let newQuery = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    distanceField: 'distance',
                    distanceMultiplier: 0.001,
                    spherical: true
                }
            },
            {
                $redact: {
                    $cond: {
                        if: { $lt: ['$distance', '$currentLocation.radius'] },
                        then: '$$KEEP',
                        else: '$$PRUNE'
                    }
                }
            },
            {
                $match: query
            }
        ];
        let matchedNest = await CommonService.runAggregateQuery(
            newQuery,
            'nest'
        )

        return matchedNest;
    },
    async findNest(currentLocation, nestId = null, nestType = null) {
        let query = {
            isActive: true,
            isDeleted: false
        };
        if (nestId) {
            query._id = ObjectId(nestId);
        }
        if (nestType) {
            query.type = nestType;
        }
        let matchedNests = [];
        if (sails.config.HAS_POLYGON_NEST && sails.config.IS_NEST_ENABLED) {
            matchedNests = await this.findPolygonTypeNest(query, currentLocation);
        }
        if (sails.config.HAS_CIRCLE_NEST && sails.config.IS_NEST_ENABLED) {
            let circleZones = await this.findCircleTypeNest(query, currentLocation);
            matchedNests = matchedNests.concat(circleZones);
        }

        return matchedNests;
    },
    async findPolygonTypeNest(query, coordinates) {
        let newQuery = {
            ...query,
            currentLocation: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    }
                }
            }
        };

        let matchedNests = await CommonService.runFindNativeQuery(newQuery, 'nest');

        return matchedNests;
    },

    async passCommandToPerformToIotService(command, vehicle, params) {
        let response = await IotService.commandToPerform(command, vehicle, params);
        return response;
    },

    async checkAllRideUsed(planInvoice, userId) {
        if (planInvoice && planInvoice.planData && !planInvoice.planData.maxRidePerDay) {
            return false;
        }
        let filter = {
            planInvoiceId: planInvoice.id,
            rideType: sails.config.RIDE_TYPE.BOOKING_PASS,
            userId: userId,
            createdAt: {
                ">=": UtilService.getStartOfTheDay(),
                "<=": UtilService.getEndOfTheDay(),
            },
        }
        let ridersCount = await RideBooking
            .count(filter)
            .meta({ enableExperimentalDeepTargets: true });

        let passData = await BookingPass.findOne({ id: planInvoice.planId });
        if (passData.maxRidePerDay > ridersCount) {
            return false;
        }
        return true;
    },
    async checkFreeReferralCodeBenefit(userId) {
        const referralBenefit = await ReferralBenefit.find({
            invitedUserId: userId,
            status: {
                in: [
                    sails.config.REFERRAL.STATUS.PENDING,
                    sails.config.REFERRAL.AVAILABLE
                ]
            },
            isDeleted: false
        }).meta({ enableExperimentalDeepTargets: true });
        let userFirstRide = await RideBooking.find({ userId: userId, status: sails.config.RIDE_STATUS.COMPLETED });
        if (userFirstRide && userFirstRide.length <= 0) {
            let referralSetting = await ReferralSetting.findOne({
                isDeleted: false,
                isActive: true
            });
            if (!referralSetting) {
                referralSetting = await ReferralSetting.findOne({
                    isDefault: true,
                    isDeleted: false,
                    isActive: true
                });
            }
            if (referralSetting.invitedUserBenefitValue && referralSetting.invitedUserBenefitValue > 0) {
                let benefit = sails.config.REFERRAL.BENEFIT.FREE_AMOUNT;
                let status = sails.config.REFERRAL.STATUS.USED;
                let referralBenefitAmount = await ReferralBenefit.find({
                    invitedUserId: userId,
                    benefit: benefit,
                    status: status,
                    isDeleted: false
                });
                referralBenefitAmount = referralBenefitAmount ? referralBenefitAmount[0] : referralBenefitAmount;
                return referralBenefitAmount;
            } else {
                return false;
            }
        }
        if (referralBenefit && referralBenefit.length > 0) {

            return referralBenefit[0];
        }

        return false;
    },
    async addBenefitToReferralUser(userId, referralBenefit) {
        let user = await User.findOne({ id: userId });
        let referredUser = await User.findOne({
            senderReferralCode: user.referralCode,
            isDeleted: false,
            isActive: true
        });
        if (referredUser) {
            let benefitToReferralUser;
            let benefitType;
            let addWallet = referredUser.walletAmount;
            let isWalletBenefit = false;
            let referralSetting = await ReferralSetting.findOne({
                isDeleted: false,
                isActive: true
            });
            if (!referralSetting) {
                referralSetting = await ReferralSetting.findOne({
                    isDefault: true,
                    isDeleted: false,
                    isActive: true
                });
            }
            if (referralSetting.referralUserBenefitValue > 0) {
                let message = `Congratulation you have received a referral benefit from ${referredUser.name}.`;
                if (referralSetting.referralUserBenefitType === sails.config.REFERRAL.BENEFIT.FREE_RIDE) {
                    benefitToReferralUser = referralSetting.referralUserBenefitValue;
                    benefitType = sails.config.REFERRAL.BENEFIT.FREE_RIDE;
                    message = `Congratulation you earned ${referralSetting.referralUserBenefitValue} free ride as a benefit of sharing referral code.`
                    if (referredUser.name) {
                        message = `Congratulation you have received ${referralSetting.referralUserBenefitValue} free ride from ${referredUser.name}.`
                    }
                } else if (referralSetting.referralUserBenefitType === sails.config.REFERRAL.BENEFIT.FREE_MINUTES) {
                    benefitToReferralUser = referralSetting.referralUserBenefitValue;
                    benefitType = sails.config.REFERRAL.BENEFIT.FREE_MINUTES;
                    message = `Congratulation you earned ${referralSetting.referralUserBenefitValue} free ride minutes as a benefit of sharing referral code.`
                    if (referredUser.name) {
                        message = `Congratulation you have received ${referralSetting.referralUserBenefitValue} free ride minutes from ${referredUser.name}.`
                    }
                }
                if (referralSetting.referralUserBenefitType === sails.config.REFERRAL.BENEFIT.FREE_AMOUNT) {
                    benefitToReferralUser = referralSetting.referralUserBenefitValue;
                    benefitType = sails.config.REFERRAL.BENEFIT.FREE_AMOUNT;
                    isWalletBenefit = true;
                    addWallet = UtilService.getFloat(benefitToReferralUser);
                }
                if (isWalletBenefit) {
                    await UserService.addAmountToWalletAndCreateTransaction(addWallet, referredUser.id);
                    message = `Congratulation you earned ${referralSetting.referralUserBenefitValue} in your wallet as a benefit of sharing referral code.`
                    if (referredUser.name) {
                        message = `Congratulation you have received ${sails.config.CURRENCY_SYM}${referralSetting.referralUserBenefitValue} free rewards from ${referredUser.name}.`
                    }
                }
                let addReferralObj = {
                    referralUserId: referredUser.id,
                    userId: referredUser.id,
                    invitedUserId: userId,
                    amount: benefitToReferralUser,
                    benefit: benefitType,
                    type: user.referralType,
                    status: isWalletBenefit ? sails.config.REFERRAL.STATUS.USED : sails.config.REFERRAL.STATUS.AVAILABLE,
                    statusTrack: [{
                        status: isWalletBenefit ? sails.config.REFERRAL.STATUS.USED : sails.config.REFERRAL.STATUS.AVAILABLE,
                        dateTime: moment().toISOString(),
                        remark: isWalletBenefit ? sails.config.REFERRAL.REMARK.CREDIT_WALLET_DONE : sails.config.REFERRAL.REMARK.AVAILABLE
                    }]
                }
                await ReferralBenefit.create(addReferralObj).fetch();
                //Send Notification
                let playerIds = [];
                if (referredUser.androidPlayerId) {
                    playerIds = playerIds.concat(ride.userId.androidPlayerId);
                }
                if (referredUser.iosPlayerId) {
                    playerIds = playerIds.concat(ride.userId.iosPlayerId);
                }
                console.log("-------------------Notification-------------------");
                console.log(message);
                await NotificationService
                    .sendPushNotification({
                        playerIds: playerIds,
                        content: message,
                        language: referredUser.preferredLang
                    });
                if (referralBenefit) {
                    let userReferralBenefit = await ReferralBenefit.findOne({ id: referralBenefit.id });
                    if (userReferralBenefit) {
                        if (userReferralBenefit.benefit != sails.config.REFERRAL.BENEFIT.FREE_AMOUNT) {
                            let statusTrack = userReferralBenefit.statusTrack.push({
                                status: sails.config.REFERRAL.STATUS.USED,
                                dateTime: moment().toISOString(),
                                remark: sails.config.REFERRAL.REMARK.USED
                            })
                            let updateReferralObj = {
                                status: sails.config.REFERRAL.STATUS.USED,
                                statusTrack: statusTrack
                            }
                            await ReferralBenefit.update({ id: referralBenefit.id }).set(updateReferralObj).fetch();
                        }
                    }
                }
            }
        }
    },
    async addRideIntoRideArray(vehicle, userId) {
        let ridesArr = sails.config.RIDES_ARRAY;
        let obj = {
            vehicleId: vehicle.id,
            qrNumber: vehicle.qrNumber,
            imei: vehicle.imei,
            userId: userId
        }
        if (ridesArr.length > 0) {
            let alreadyBook = ridesArr.find((el) => { return el.vehicleId === vehicle.id })
            if (alreadyBook) {
                throw sails.config.message.ALREADY_RESERVED_RIDE;
            }
        }
        sails.config.RIDES_ARRAY.push(obj);
        console.log('add :>> ', sails.config.RIDES_ARRAY);
    },
    async removeRidefromRideArray(vehicleId) {
        sails.config.RIDES_ARRAY = sails.config.RIDES_ARRAY.filter((el) => { return el.vehicleId !== vehicleId });
        console.log('remove :>> ', sails.config.RIDES_ARRAY);
    },
    async exportExcelData(filter) {
        let selectFields = ['userId', 'vehicleId', 'createdAt', 'startDateTime', 'endDateTime', 'rideNumber', 'totalTime', 'totalKm', 'totalFare', 'fareSummary', 'franchiseeId', 'startLocation', 'endLocation'];
        let recordsList = await RideBooking.find(filter)
            .select(selectFields)
            .populate('userId', { select: ['name', 'emails', 'mobiles'] })
            .populate('vehicleId', { select: ['name', 'registerId'] })
            .populate('zoneId', { select: ['name'] })
            .populate('franchiseeId', { select: ['name'] })
            .meta({ enableExperimentalDeepTargets: true })
        console.log('recordsList.length :>> ', recordsList.length);
        if (!recordsList.length) {
            return recordsList;
        }
        let ridesData = [];

        let currencySymbol = sails.config.CURRENCY_SYM;

        let riderIds = _.map(recordsList, 'id');
        let ratingData = await rating.getRideRating(riderIds);
        for (let record of recordsList) {
            let obj = {};
            obj.date = record.createdAt ? moment(record.createdAt).format(`DD/MM/YYYY`) : '-';
            obj.vehicleId = `${record.vehicleId.name} - (${record.vehicleId.registerId})`;

            let userId = record.userId;
            obj.riderName = userId.name || 'Guest User';

            obj.mobile = '-';
            obj.email = '-';
            if (userId && userId.mobiles) {
                let primaryMobile = UtilService.getPrimaryValue(userId.mobiles, 'mobile');
                let countryCode = UtilService.getPrimaryValue(userId.mobiles, 'countryCode');
                obj.mobile = countryCode + ' ' + primaryMobile;
            }
            if (userId && userId.emails) {
                let primaryEmail = UtilService.getPrimaryEmail(userId.emails);
                obj.email = primaryEmail;
            }

            obj.zoneName = record.zoneId.name;
            obj.rideNumber = record.rideNumber;

            obj.startTime = record.startDateTime ? moment(record.startDateTime).format(`DD/MM/YYYY HH:mm:ss`) : '-';
            obj.endTime = record.startDateTime && record.endDateTime ? moment(record.endDateTime).format(`DD/MM/YYYY HH:mm:ss`) : '-';

            obj.startLocationLat = record.startLocation && record.startLocation.coordinates ? record.startLocation.coordinates[1] : '-';
            obj.startLocationLong = record.startLocation && record.startLocation.coordinates ? record.startLocation.coordinates[0] : '-';

            obj.endLocationLat = record.endLocation && record.endLocation.coordinates ? record.endLocation.coordinates[1] : '-';
            obj.endLocationLong = record.endLocation && record.endLocation.coordinates ? record.endLocation.coordinates[0] : '-';
            // ?
            // ?
            obj.totalKm = record.totalKm;
            obj.totalTime = record.totalTime ? moment.utc(record.totalTime * 1000).format('HH:mm:ss') : '-';

            obj.totalCost = `${currencySymbol} ${record.totalFare}`;

            if (record.fareSummary) {
                obj.totalFare = record.fareSummary.subTotal ? `${currencySymbol} ${record.fareSummary.subTotal}` : 0; // ?
                obj.unlockFees = record.fareSummary.unlockFees ? `${currencySymbol} ${record.fareSummary.unlockFees}` : 0;
                obj.pausedTime = record.fareSummary.pausedTime ? moment.utc(record.fareSummary.pausedTime * 1000).format('HH:mm:ss') : '-';
                obj.pausedCharge = record.fareSummary.paused ? `${currencySymbol} ${record.fareSummary.paused}` : 0;
                obj.reservedTime = record.fareSummary.reservedTime ? moment.utc(record.fareSummary.reservedTime * 1000).format('HH:mm:ss') : '-';
                obj.reservedCharge = record.fareSummary.reserved ? `${currencySymbol} ${record.fareSummary.reserved}` : 0;
                obj.cancelledCharge = record.fareSummary.cancelled ? `${currencySymbol} ${record.fareSummary.cancelled}` : 0;
            } else {
                obj.totalFare = 0;
                obj.unlockFees = 0;
                obj.pausedTime = '-';
                obj.pausedCharge = 0;
                obj.reservedTime = '-';
                obj.reservedCharge = 0;
                obj.cancelledCharge = 0;
            }

            obj.rating = '-';
            let rating = _.find(ratingData, { rideId: record.id });
            if (rating) {
                obj.rating = rating.rating;
            }
            ridesData.push(obj);
        };
        return ridesData;
    },

    async allRideStop(params) {
        let obj = {
            status: [
                sails.config.RIDE_STATUS.RESERVED,
                sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                sails.config.RIDE_STATUS.ON_GOING
            ]
        };
        if (params.ids) {
            obj.vehicleId = params.ids;
        }

        let rides = await RideBooking.find(obj);
        console.log('rides :>> ', rides.length);

        for (let ride of rides) {

            if (ride.status === sails.config.RIDE_STATUS.ON_GOING) {
                await this.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);
            } else {
                await this.cancelRide(ride, null, sails.config.IS_AUTO_DEDUCT, true);
            }
        }
        return;
    },

    async stopeRideOnDeActiveVehicle(params) {
        let vehicleFilter = {
            or: [{ lockStatus: false },
            { isRideCompleted: false }
            ]
        }
        if (params && params.vehicleIds) {
            vehicleFilter.id = params.vehicleIds
        }
        let vehicles = await Vehicle.find(vehicleFilter);
        if (vehicles && vehicles.length > 0) {
            for (let vehicle of vehicles) {
                if (!vehicle) {
                    continue;
                }
                if (vehicle.isRideCompleted && !vehicle.lockStatus) {
                    console.log('vehicle.lockStatus', vehicle.lockStatus);
                    try {
                        let iotVehicle = await this.getVehicleForIOT(vehicle.id);
                        let response = await IotService.lockUnlock("lock", iotVehicle);
                        if (!response.isRequested) {
                            await this.markVehicleDisconnected(vehicle.id);
                        }
                    } catch (e) {
                        sails.log.error('Stop.', e);
                    }

                } else if (!vehicle.isRideCompleted) {
                    try {
                        await this.allRideStop({ ids: [vehicle.id] });
                    } catch (e) {
                        sails.log.error('Stop.', e);
                    }
                }
            }
        }
    },

    async getUserWalletBalanceForRide(userId) {
        console.log('in availableWalletAmount');
        let user = await User.findOne({ id: userId }).select('walletAmount');
        let walletAmount = user.walletAmount || 0;
        if (sails.config.BALANCE_AMOUNT_FOR_RIDE) {
            walletAmount += sails.config.BALANCE_AMOUNT_FOR_RIDE;
        }

        return walletAmount;
    },
    async getAvailableMinutes(ride, walletAmount) {
        let fareData = ride.fareData;
        let availableMinutes = fareData.timeFareFreeLimit;

        if (!fareData.timeFare || fareData.timeFare <= 0) {
            return 0;
        }
        console.log('fareData.perXBaseMinute', fareData.perXBaseMinute);
        let perXBaseMinute = fareData.perXBaseMinute ? fareData.perXBaseMinute : 1;
        console.log('perXBaseMinute', perXBaseMinute);
        console.log('fareData.timeFare', fareData.timeFare);
        let perMinuteTimeFare = fareData.timeFare / perXBaseMinute;
        let isBookingPass = ride.rideType === sails.config.RIDE_TYPE.BOOKING_PASS;
        if (isBookingPass) {
            let currentBookPlanInvoice = await PlanInvoice.findOne({ id: ride.planInvoiceId });
            let vehicleTypePass = await BookingPassService.getPlanPriceDetails(currentBookPlanInvoice.planData, ride.vehicleType);
            if (vehicleTypePass && vehicleTypePass.rideDiscount === 100) {
                return 0;
            }
            if (vehicleTypePass.rideDiscount > 0) {
                perMinuteTimeFare = UtilService.getDiscountedValue(perMinuteTimeFare, getDiscountedValue);
            }
        }
        console.log('perMinuteTimeFare', perMinuteTimeFare);
        availableMinutes += (walletAmount / perMinuteTimeFare);
        // when counting fare, initial 1 minute is counted, so we add 1 minute static to solve that issue.
        availableMinutes += 1;
        availableMinutes = Math.round(availableMinutes);
        console.log('availableMinutes', availableMinutes);

        return availableMinutes;
    },
    getAvailableKM(ride, walletAmount) {
        let fareData = ride.fareData;
        let availableKM = fareData.distanceFareFreeLimit;

        if (!fareData.distanceFare || fareData.distanceFare <= 0) {
            return 0;
        }
        availableKM += (walletAmount / fareData.distanceFare);

        return availableKM;
    },

    async getRideLimitData(ride) {
        console.log('in getRideLimitData');
        let rideDataToUpdate = {
            maxRideTime: 0,
            maxKm: 0
        };
        console.log('before availableWalletAmount');
        let availableWalletAmount = await this.getUserWalletBalanceForRide(ride.userId);
        console.log('after availableWalletAmount', availableWalletAmount);
        // check status
        // -> On_GOING
        // -> isReserved -> calculate ReserveCharge and store it
        // update ride end time
        // check ride is resumed or paused
        // pause hoy to update end pause time (Admin or wallet limit whatever is less)
        // resume ride, update ride end time and km
        let fareSummary = await this.calculateFareForRide(ride);
        console.log('fareSummary.total', fareSummary.total);
        if (fareSummary.total > 0) {
            availableWalletAmount -= fareSummary.total;
        }
        rideDataToUpdate.maxRideTime = await this.getAvailableMinutes(ride, availableWalletAmount);
        rideDataToUpdate.maxKm = this.getAvailableKM(ride, availableWalletAmount);
        console.log('rideDataToUpdate', rideDataToUpdate);

        return rideDataToUpdate;
    },

    async getPauseTimeLimit(ride) {
        let fareData = ride.fareData;
        let pauseTimeLimit = fareData.pauseTimeLimit;
        if (!sails.config.IS_RIDE_END_AFTER_INSUFFICIENT_WALLET_BALANCE || !fareData.ridePauseFare) {
            pauseTimeLimit *= 60;

            return pauseTimeLimit;
        }
        let availableWalletAmount = await this.getUserWalletBalanceForRide(ride.userId);
        let fareSummary = await this.calculateFareForRide(ride);
        if (fareSummary.total > 0) {
            availableWalletAmount -= fareSummary.total;
        }
        let pauseLimitWithBalance = Math.round(availableWalletAmount / fareData.ridePauseFare);
        // return whichever limit is less
        console.log(`pauseLimitWithBalance = ${pauseLimitWithBalance}, pauseTimeLimit = ${pauseTimeLimit}`);
        if (pauseLimitWithBalance > pauseTimeLimit) {
            pauseLimitWithBalance = pauseTimeLimit;
        }
        // convert into seconds
        pauseLimitWithBalance *= 60;

        return pauseLimitWithBalance;
    },

    async updateKMForRide(rideId, meters) {
        let totalKM = await RedisDBService.getData(`ride-${rideId}`);
        let meterToKM = meters / 1000;
        if (totalKM) {
            totalKM = Number(totalKM);
            totalKM += meterToKM;
        } else {
            totalKM = meterToKM;
        }
        await RedisDBService.setData(`ride-${rideId}`, totalKM);
    },

    async beforeCreate(rideBooking, cb) {
        const SeriesGeneratorService = require('./seriesGenerator');
        let seriesParams = {};
        seriesParams = { type: sails.config.SERIES_GENERATOR.TYPE.RIDE_SERIES, franchiseeId: rideBooking.franchiseeId };
        let query = [
            {
                $group: {
                    _id: '',
                    total: { $sum: '$totalEntry' }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: '$total'
                }

            }
        ];
        let totalEntry = await CommonService.runAggregateQuery(query, 'seriesGenerator');

        let series = await SeriesGeneratorService.nextSeriesGenerate(seriesParams);
        rideBooking.rideNumber = series.series;
        rideBooking.iotRideId = totalEntry[0].total + 1;

        cb(null, rideBooking);
    },

    afterCreate: async function (options) {
        let bookedRide = options.records;
        // send email verification link
        await this.updateRideSummary(bookedRide);

        // send mobile verification otp && link
        // await UserService.sendMobileVerificationLink(user);
    },
    afterUpdate: async function () {
    }
};

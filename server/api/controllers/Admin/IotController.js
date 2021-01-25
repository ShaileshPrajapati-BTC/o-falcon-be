const IotService = require(`${sails.config.appPath}/api/services/iot`);
const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);

module.exports = {
    async stopRide(req, res) {
        try {
            const fields = [
                'rideId'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);

            let ride = await RideBooking.findOne({ id: params.rideId });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }

            if (ride.status === sails.config.RIDE_STATUS.RESERVED) {
                throw sails.config.message.RIDE_NOT_STARTED;
            }

            if (ride.status === sails.config.RIDE_STATUS.COMPLETED) {
                throw sails.config.message.RIDE_ALREADY_STOPPED;
            }
            let response = {};
            if (ride.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
                response = await RideBookingService.cancelRide(ride, null, sails.config.IS_AUTO_DEDUCT, true);
            } else {
                response = await RideBookingService.stopRide(ride, null, sails.config.IS_AUTO_DEDUCT, null, true);
            }

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    async stopRideForceFully(req, res) {
        try {
            const fields = [
                'rideId'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);

            let ride = await RideBooking.findOne({ id: params.rideId });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }

            if (ride.status === sails.config.RIDE_STATUS.RESERVED) {
                throw sails.config.message.RIDE_NOT_STARTED;
            }

            if (ride.status === sails.config.RIDE_STATUS.COMPLETED) {
                throw sails.config.message.RIDE_ALREADY_STOPPED;
            }
            let rideResponse = {};
            rideResponse = await RideBookingService.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);

            return res.ok(rideResponse, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    async lockUnlock(req, res) {
        try {
            const fields = [
                'command',
                'vehicleId'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            let vehicle = await RideBookingService.getVehicleForIOT(params.vehicleId);

            let response = await IotService.lockUnlock(params.command, vehicle, params.iotRideId);
            if (!response.isRequested) {
                await RideBookingService.markVehicleDisconnected(vehicle.id);
                throw {
                    status: 401,
                    code: 'UNPROCESSABLE_ENTITY',
                    message: response.message
                };
            }
            if (params.command === 'lock') {
                return res.ok(response, sails.config.message.VEHICLE_LOCK_REQUEST_SENT);
            }

            return res.ok(response, sails.config.message.VEHICLE_UNLOCK_REQUEST_SENT);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    async commandToPerform(req, res) {
        try {
            const fields = [
                'command',
                'vehicleId'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            let vehicle = await RideBookingService.getVehicleForIOTFromDB(params.vehicleId);
            let commandsToBeSave = sails.config.IOT_COMMANDS_AND_KEYS_FOR_FILTER_CALLBACK_DATA;
            let updateVehicleObj = {};
            let keyToUpdate;
            for (let data of commandsToBeSave) {
                if (data.command == params.command) {
                    keyToUpdate = data.key;
                    if (!vehicle[keyToUpdate] || !vehicle[keyToUpdate].actualValue) {
                        vehicle[keyToUpdate] = {};
                        vehicle[keyToUpdate].actualValue = null;
                    }
                    let updateObj = {
                        requestedValue: params.value,
                        status: sails.config.SET_IOT_COMMAND_STATUS.pending,
                        actualValue: vehicle[keyToUpdate].actualValue
                    }
                    updateVehicleObj[keyToUpdate] = updateObj;

                    break;
                }
            }
            if (keyToUpdate) {
                await Vehicle.update({ id: params.vehicleId }, updateVehicleObj);
            }
            let response = await IotService.commandToPerform(params.command, vehicle, params);
            if (!response.isRequested) {
                if (vehicle.connectionStatus && params.command !== 'track') {
                    await RideBookingService.markVehicleDisconnected(vehicle.id);
                }
                throw {
                    status: 401,
                    code: 'UNPROCESSABLE_ENTITY',
                    message: response.message
                };
            }

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    }
};

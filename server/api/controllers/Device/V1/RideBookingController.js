const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);
const RatingService = require(`${sails.config.appPath}/api/services/rating`);
const rideComplaintDisputeService = require(`${sails.config.appPath}/api/services/rideComplaintDispute`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const BookPlanService = require(`${sails.config.appPath}/api/services/bookPlan`);
const BookingPassService = require(`${sails.config.appPath}/api/services/bookingPass`);
const IotService = require('../../../services/iot');

const moment = require('moment');

module.exports = {

    findNearbyScooters: async (req, res) => {
        try {
            const fields = [
                'currentLocation'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const language = req.headers.language;
            let matchedScooter;
            if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
                matchedScooter = await RideBookingService.findNearestNestScooters(params);
            } else {
                matchedScooter = await RideBookingService.findMatchedScooters(params, req.user);
            }
            // add fare data
            if (sails.config.IS_USE_FARE_DATA_API) {
                for (let key in matchedScooter) {
                    matchedScooter[key].id = matchedScooter[key]._id.toString()
                }
            } else {
                matchedScooter = await RideBookingService.addFareData(
                    params.currentLocation,
                    matchedScooter
                );
            }
            const response = {
                count: matchedScooter.length,
                list: matchedScooter
            };

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    calculateFare: async (req, res) => {
        try {
            const fields = [
                'from',
                'to',
                'distance',
                'time'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const fareData = await RideBookingService.getFare(params);

            return res.ok(fareData, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    reserveRide: async (req, res) => {
        try {
            const fields = [
                'vehicleId',
                // 'zoneId'
            ];
            const params = req.allParams();
            let operationalHoursData = await operationalHours.checkIsOperationalHoursCLose();
            if (operationalHoursData.isTimeClose) {
                let message = _.clone(sails.config.message.OPERATIONAL_HOURS_CLOSED);
                if (operationalHoursData.startDateTime && operationalHoursData.endDateTime) {
                    let timezone = sails.config.DEFAULT_TIME_ZONE;
                    message.message = message.message + `Please come back on ${moment(operationalHoursData.startDateTime).tz(timezone).format('dddd,MMMM D,YYYY')} between ${moment(operationalHoursData.startDateTime).tz(timezone).format("hh:mm a")} and ${moment(operationalHoursData.endDateTime).tz(timezone).format("hh:mm a")}`
                }
                throw message;
            }
            if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
                fields.push('tripType');
                if (params.tripType && params.tripType !== sails.config.TRIP_TYPE.ROUND_TRIP) {
                    fields.push('endNest');
                }
            }
            commonValidator.checkRequiredParams(fields, params);
            // check user has reserved any vehicle or not.
            const loggedInUser = req.user;
            await RideBookingService.checkPendingPayment(loggedInUser.id);
            const bookPlanFeatureActive = sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE;
            const bookingPassFeature = sails.config.IS_BOOKING_PASS_FEATURE_ACTIVE;

            let currentBookPlanInvoice;
            let vehicle = await Vehicle.findOne({ id: params.vehicleId });
            if (bookingPassFeature) {
                currentBookPlanInvoice = await BookingPassService.getUserCurrentPass(loggedInUser.id, vehicle)
            } else {
                currentBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                    loggedInUser.currentBookingPlanInvoiceId
                );
            }
            console.log("currentBookPlanInvoice-----------", currentBookPlanInvoice)

            let reserveTimeLimit = sails.config.RIDE_RESERVE_TIME_LIMIT;
            let nextPlanExist = loggedInUser.nextBookingPlanInvoiceId !== null;
            let isSubscriptionRideFlow = await RideBookingService.checkIsSubscriptionRideFlow(
                bookPlanFeatureActive,
                currentBookPlanInvoice,
                reserveTimeLimit * 60,
                nextPlanExist
            );
            let isBookingPassRideFlow = await RideBookingService.checkIsBookingPassRideFlow(
                bookingPassFeature,
                currentBookPlanInvoice,
                reserveTimeLimit * 60,
                loggedInUser.id
            );

            console.log("85 isBookingPassRideFlow", isBookingPassRideFlow)
            // lease will also come in condition
            if (!isSubscriptionRideFlow) {
                await RideBookingService.checkWalletMinAmountForRide(loggedInUser.walletAmount, vehicle);
            }

            await RideBookingService.validateReserveRide(loggedInUser.id);

            if (params.isClusteringEnable && params.currentLocation) {
                await RideBookingService.isRiderInsideRadius(
                    params.currentLocation, params.vehicleId
                );
            }
            // check vehicle is available.
            await RideBookingService.checkVehicleAvailability(vehicle);
            // check vehical is in zone

            let currentTime = UtilService.getTimeFromNow();
            let statusTrack = {
                userId: loggedInUser.id,
                dateTime: currentTime,
                remark: 'User reserved ride',
                status: sails.config.RIDE_STATUS.RESERVED
            };
            const zone = await RideBookingService.findZoneForVehicle(vehicle, loggedInUser);
            const zoneId = zone._id.toString();
            let reservedEndDateTime = UtilService.addTime(reserveTimeLimit);
            let fareData = await RideBookingService.getFareDataForRide(zoneId, vehicle.type);
            let dataObj = {
                userId: loggedInUser.id,
                vehicleId: vehicle.id,
                zoneId: zoneId,
                status: sails.config.RIDE_STATUS.RESERVED,
                reservedDateTime: currentTime,
                reservedEndDateTime: reservedEndDateTime,
                statusTrack: [statusTrack],
                fareData: fareData,
                vehicleType: vehicle.type,
                addedBy: loggedInUser.id
                // estimateEndLocation: params.toLocation,
                // estimateKm: params.totalKm,
                // estimateTime: params.totalTime,
            };
            if (vehicle.dealerId) {
                dataObj.dealerId = vehicle.dealerId;
            }
            if (isSubscriptionRideFlow || isBookingPassRideFlow) {
                let planInvoiceTrack = {
                    userId: loggedInUser.id,
                    dateTime: currentTime,
                    remark: 'Current plan is being used in reserve ride',
                    planInvoiceId: currentBookPlanInvoice.id,
                    remainingTimeLimit: currentBookPlanInvoice.remainingTimeLimit
                };
                dataObj.planInvoiceTrack = [planInvoiceTrack];
                dataObj.rideType = isSubscriptionRideFlow ? sails.config.RIDE_TYPE.SUBSCRIPTION : sails.config.RIDE_TYPE.BOOKING_PASS;
                dataObj.planInvoiceId = currentBookPlanInvoice.id;
            }

            if (sails.config.IS_FRANCHISEE_ENABLED && vehicle.franchiseeId) {
                dataObj.franchiseeId = vehicle.franchiseeId;
            }
            if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
                dataObj.tripType = params.tripType;
                dataObj.startNest = vehicle.nestId;
                if (params.tripType === sails.config.TRIP_TYPE.ROUND_TRIP) {
                    dataObj.endNest = dataObj.startNest;
                } else {
                    dataObj.endNest = params.endNest;
                }
            }
            // let fareOptions = {
            //     distance: dataObj.estimateKm,
            //     time: dataObj.estimateTime,
            //     zoneId: zoneId
            // };
            // const fareData = await RideBookingService.getFareForZone(fareOptions);
            // dataObj.estimateFare = fareData.total;
            await RideBookingService.addRideIntoRideArray(vehicle, loggedInUser.id);

            let ride = await RideBooking.create(dataObj).fetch();
            await Vehicle.update({ id: vehicle.id }, {
                isAvailable: false,
                isRideCompleted: false
            });
            await RideBookingService.removeRidefromRideArray(params.vehicleId);
            let response = await RideBookingService.getRideResponse(ride.id);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    startRide: async (req, res) => {
        try {
            const fields = [
                'qrNumber'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            console.log('params.qrNumber', params.qrNumber);
            if (params.qrNumber.startsWith('http://download.jimicloud.com/webDown/mibike?no=')) {
                params.qrNumber = params.qrNumber.substr(48);
            }
            let operationalHoursData = await operationalHours.checkIsOperationalHoursCLose();
            if (operationalHoursData.isTimeClose) {
                let message = _.clone(sails.config.message.OPERATIONAL_HOURS_CLOSED);
                if (operationalHoursData.startDateTime && operationalHoursData.endDateTime) {
                    let timezone = sails.config.DEFAULT_TIME_ZONE;
                    message.message = message.message + `Please come back on ${moment(operationalHoursData.startDateTime).tz(timezone).format('dddd,MMMM D,YYYY')} between ${moment(operationalHoursData.startDateTime).tz(timezone).format("hh:mm a")} and ${moment(operationalHoursData.endDateTime).tz(timezone).format("hh:mm a")}`
                }
                throw message;
            }
            // check vehicle is available.
            let vehicle = await Vehicle.findOne({ qrNumber: params.qrNumber });
            if (!vehicle) {
                throw sails.config.message.SCOOTER_NOT_FOUND;
            }
            if (vehicle.isTaskCreated) {
                return res.ok({}, sails.config.message.VEHICLE_NOT_AVAILABLE);
            }
            const loggedInUser = req.user;

            await RideBookingService.checkPendingPayment(loggedInUser.id);

            const bookPlanFeatureActive = sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE;
            const bookingPassFeature = sails.config.IS_BOOKING_PASS_FEATURE_ACTIVE;

            let currentBookPlanInvoice;
            if (bookingPassFeature) {
                currentBookPlanInvoice = await BookingPassService.getUserCurrentPass(loggedInUser.id, vehicle)
            } else {
                currentBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                    loggedInUser.currentBookingPlanInvoiceId
                );
            }
            console.log("currentBookPlanInvoice-----------", currentBookPlanInvoice)

            let nextPlanExist = loggedInUser.nextBookingPlanInvoiceId !== null;
            let isSubscriptionRideFlow = await RideBookingService.checkIsSubscriptionRideFlow(
                bookPlanFeatureActive,
                currentBookPlanInvoice,
                sails.config.BOOK_PLAN_MIN_TIME_LIMIT_TO_CHECK,
                nextPlanExist
            );
            let isBookingPassRideFlow = await RideBookingService.checkIsBookingPassRideFlow(
                bookingPassFeature,
                currentBookPlanInvoice,
                sails.config.BOOK_PLAN_MIN_TIME_LIMIT_TO_CHECK,
                loggedInUser.id
            );
            let isPrivateRide;
            try {
                isPrivateRide = await RideBookingService.checkIsPrivateRide(vehicle, loggedInUser) || false;
            } catch (e) {
                console.log('error in ee', e);
                let isFreeRidePass = false;
                let vehicleTypePass = {};
                console.log('currentBookPlanInvoice sm', currentBookPlanInvoice);
                if (isBookingPassRideFlow && currentBookPlanInvoice.planData && currentBookPlanInvoice.planData.vehicleTypes) {
                    console.log('currentBookPlanInvoice sm 2', currentBookPlanInvoice);
                    vehicleTypePass = await BookingPassService.getPlanPriceDetails(currentBookPlanInvoice.planData, currentBookPlanInvoice.vehicleType);
                    console.log('vehicleTypePass sm', vehicleTypePass);
                    if (vehicleTypePass && vehicleTypePass.rideDiscount === 100 && vehicleTypePass.unlockDiscount === 100) {
                        isFreeRidePass = true;
                    }

                }
                if (!isFreeRidePass) {
                    throw e;
                }
            }
            console.log("85 isBookingPassRideFlow", isBookingPassRideFlow)
            // lease will also come in condition
            // if (!isSubscriptionRideFlow) {
            //     await RideBookingService.checkWalletMinAmountForRide(loggedInUser.walletAmount);
            // }
            if (params.currentLocation) {
                await RideBookingService.isRiderInsideUnlockRadius(
                    params.currentLocation,
                    vehicle.id
                );
            }
            await RideBookingService.checkLocationIsInsideNoRideArea(vehicle.currentLocation.coordinates);
            if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
                await RideBookingService.isVehicleWithinNest(
                    vehicle.nestId,
                    params.currentLocation,
                    'start'
                );
            }
            let zone = await RideBookingService.findZoneForVehicle(vehicle, loggedInUser);
            let currentRide = await RideBookingService.checkForActiveRide(loggedInUser.id);
            let isReservedRide = false;
            if (currentRide && (
                currentRide.status === sails.config.RIDE_STATUS.RESERVED ||
                currentRide.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED
            )) {
                isReservedRide = true;
                await RideBookingService.checkReservationTimeExpired(currentRide);
                if (currentRide.vehicleId !== vehicle.id) {
                    throw sails.config.message.RESERVED_OTHER_VEHICLE;
                }
            }
            let vehicleError;
            let isErrorOccuredInReservedRide = false;
            try {
                await RideBookingService.checkVehicleAvailability(vehicle, isReservedRide);
            } catch (e) {
                console.log('e', e);
                vehicleError = e;
                isErrorOccuredInReservedRide = true;
                if (!isReservedRide) {
                    throw vehicleError;
                }
            }
            if (!vehicle.maxSpeedLimit ||
                !vehicle.maxSpeedLimit.actualValue ||
                !vehicle.maxSpeedLimit.requestedValue ||
                vehicle.maxSpeedLimit.actualValue != vehicle.lastSpeedLimit ||
                vehicle.maxSpeedLimit.requestedValue != vehicle.lastSpeedLimit) {
                let vehicleForIOT = await RideBookingService.getVehicleForIOT(vehicle.id);
                if (!vehicleForIOT.lastSpeedLimit) {
                    vehicleForIOT.lastSpeedLimit = sails.config.DEFAULT_VEHICLE_SPEED_LIMIT;
                }
                await IotService.commandToPerform('setMaxSpeed', vehicleForIOT, { value: vehicleForIOT.lastSpeedLimit });
            }

            let statusTrack = {
                userId: loggedInUser.id,
                dateTime: UtilService.getTimeFromNow(),
                remark: 'User requested for unlock scooter',
                status: sails.config.RIDE_STATUS.UNLOCK_REQUESTED
            };
            let ride;
            let planInvoiceTrack = {
                userId: loggedInUser.id,
                dateTime: UtilService.getTimeFromNow(),
                remark: 'Current plan is being used in start ride',
                planInvoiceId: currentBookPlanInvoice ? currentBookPlanInvoice.id : null,
                remainingTimeLimit: currentBookPlanInvoice ? currentBookPlanInvoice.remainingTimeLimit : 0
            };
            if (isReservedRide) {
                currentRide.statusTrack.push(statusTrack);
                let updateObj = {
                    status: sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                    statusTrack: currentRide.statusTrack,
                    startDateTime: UtilService.getTimeFromNow(),
                    startLocation: vehicle.currentLocation,
                    updatedBy: loggedInUser.id
                };
                if (currentRide.rideType === sails.config.RIDE_TYPE.SUBSCRIPTION ||
                    currentRide.rideType === sails.config.RIDE_TYPE.BOOKING_PASS) {
                    currentRide.planInvoiceTrack.push(planInvoiceTrack);
                    updateObj.planInvoiceTrack = currentRide.planInvoiceTrack;
                }
                if (isPrivateRide) {
                    updateObj.isPrivateRide = true;
                }
                ride = await RideBooking.update({ id: currentRide.id }, updateObj).fetch();
                ride = ride[0];
            } else {
                let field = [];
                if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
                    field.push('tripType');
                    if (params.tripType && params.tripType !== sails.config.TRIP_TYPE.ROUND_TRIP) {
                        field.push('endNest');
                    }
                    commonValidator.checkRequiredParams(field, params);
                }
                // get zone fore fare info               
                const zoneId = zone._id.toString();
                let fareData = await RideBookingService.getFareDataForRide(zoneId, vehicle.type);
                let dataObj = {
                    userId: loggedInUser.id,
                    vehicleId: vehicle.id,
                    zoneId: zoneId,
                    status: sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                    statusTrack: [statusTrack],
                    startDateTime: UtilService.getTimeFromNow(),
                    startLocation: vehicle.currentLocation,
                    fareData: fareData,
                    vehicleType: vehicle.type,
                    addedBy: loggedInUser.id,
                    isPrivateRide: isPrivateRide
                };
                await RideBookingService.addRideIntoRideArray(vehicle, loggedInUser.id);

                if (sails.config.IS_FRANCHISEE_ENABLED && vehicle.franchiseeId) {
                    dataObj.franchiseeId = vehicle.franchiseeId;
                }
                if (vehicle.dealerId) {
                    dataObj.dealerId = vehicle.dealerId;
                }
                if (isSubscriptionRideFlow || isBookingPassRideFlow) {
                    dataObj.planInvoiceTrack = [planInvoiceTrack];
                    dataObj.rideType = isSubscriptionRideFlow ? sails.config.RIDE_TYPE.SUBSCRIPTION : sails.config.RIDE_TYPE.BOOKING_PASS;
                    dataObj.planInvoiceId = currentBookPlanInvoice.id;
                }
                if (sails.config.IS_NEST_TO_NEST_RIDE_ENABLED) {
                    dataObj.tripType = params.tripType;
                    dataObj.startNest = vehicle.nestId;
                    if (params.tripType === sails.config.TRIP_TYPE.ROUND_TRIP) {
                        dataObj.endNest = dataObj.startNest;
                    } else {
                        dataObj.endNest = params.endNest;
                    }
                }
                await Vehicle.update({ id: vehicle.id }, {
                    isAvailable: false,
                    isRideCompleted: false,
                    updatedBy: loggedInUser.id
                });
                ride = await RideBooking.create(dataObj).fetch();
                await RideBookingService.removeRidefromRideArray(vehicle.id);
            }
            if (sails.config.DEDUCT_ON_START_RIDE && !isSubscriptionRideFlow && !isErrorOccuredInReservedRide) {
                const zoneId = zone._id.toString();
                let fareData = await RideBookingService.getFareDataForRide(zoneId, ride.vehicleType);
                const rideDeposit = fareData.rideDeposit || 0;
                const chargeObj = await PaymentService.chargeCustomerForRideDeposit(
                    ride,
                    rideDeposit
                );
                if (!chargeObj.flag) {
                    await RideBookingService.rideDepositPaymentFail(ride, chargeObj);
                }
            }
            let isStartCommandSent = true;
            if (!isErrorOccuredInReservedRide) {
                try {
                    await RideBookingService.requestLockUnlockScooter('start', ride);
                } catch (e) {
                    console.log('e');
                    isStartCommandSent = false;
                }
                if (!isStartCommandSent && !isReservedRide) {
                    // delete ride and make scooter available
                    await RideBookingService.handleTempRide(ride);
                    throw sails.config.message.SCOOTER_NOT_CONNECTED;
                }
            }
            let response = await RideBookingService.getRideResponse(ride.id);
            if (!isStartCommandSent) {
                response.error = sails.config.message.SCOOTER_DISCONNECTED_WHILE_RIDE;
            }
            if (isErrorOccuredInReservedRide) {
                response.error = vehicleError;
            }

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    pauseRide: async (req, res) => {
        try {
            const fields = [
                'rideId'
                // 'currentLocation'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);

            let ride = await RideBooking.findOne({ id: params.rideId });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            if (ride.currentNestType && ride.currentNestType == sails.config.NEST_TYPE.NO_PARKING) {
                throw sails.config.message.CANT_PAUSE_RIDE_IN_NO_PARKING_ZONE;
            }
            if (ride.currentNestType && ride.currentNestType == sails.config.NEST_TYPE.NON_RIDE) {
                throw sails.config.message.CANT_PAUSE_RIDE_IN_NON_RIDE_ZONE;
            }
            if (sails.config.PAUSE_RIDE_LIMIT_ENABLED && ride.ridePausedCount && ride.ridePausedCount >= sails.config.PAUSE_RIDE_LIMIT) {
                throw sails.config.message.EXCEEDED_MAX_PAUSE_RIDE_LIMIT;
            }
            if (ride.rideType === sails.config.RIDE_TYPE.SUBSCRIPTION ||
                ride.rideType === sails.config.RIDE_TYPE.BOOKING_PASS) {
                throw sails.config.message.CANT_PAUSE_BOOK_PLAN_RIDE;
            }
            if (ride.vehicleType === sails.config.VEHICLE_TYPE.BICYCLE) {
                throw sails.config.message.CANT_PAUSE_BICYCLE;
            }
            if (ride.status !== sails.config.RIDE_STATUS.ON_GOING) {
                throw sails.config.message.RIDE_IS_NOT_STARTED;
            }
            if (ride.isPaused) {
                throw sails.config.message.RIDE_IS_ALREADY_PAUSED;
            }
            if (ride.isRequested) {
                const response = await RideBookingService.getRideResponse(ride.id);

                return res.ok(response, sails.config.message.OK);
            }
            const loggedInUser = req.user;
            let statusTrack = {
                userId: loggedInUser.id,
                dateTime: UtilService.getTimeFromNow(),
                remark: 'User requested for pause ride'
            };
            ride.statusTrack.push(statusTrack);
            await RideBooking.update(
                { id: ride.id },
                { statusTrack: ride.statusTrack, updatedBy: loggedInUser.id }
            );
            console.log('in puse ride=>');
            // console.log(JSON.stringify(ride));
            await RideBookingService.requestLockUnlockScooter('lock', ride);

            const response = await RideBookingService.getRideResponse(ride.id);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    resumeRide: async (req, res) => {
        try {
            const fields = [
                'rideId'
                // 'currentLocation'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);

            let ride = await RideBooking.findOne({ id: params.rideId });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            if (ride.rideType === sails.config.RIDE_TYPE.SUBSCRIPTION) {
                throw sails.config.message.CANT_RESUME_BOOK_PLAN_RIDE;
            }
            if (ride.vehicleType !== sails.config.VEHICLE_TYPE.BICYCLE && !ride.isPaused) {
                throw sails.config.message.RIDE_IS_NOT_PAUSED;
            }
            if (ride.isRequested) {
                const response = await RideBookingService.getRideResponse(ride.id);

                return res.ok(response, sails.config.message.OK);
            }
            const loggedInUser = req.user;

            let statusTrack = {
                userId: loggedInUser.id,
                dateTime: UtilService.getTimeFromNow(),
                remark: 'User requested for resume ride'
            };
            ride.statusTrack.push(statusTrack);

            await RideBooking.update(
                { id: ride.id },
                { statusTrack: ride.statusTrack, updatedBy: loggedInUser.id }
            );
            await RideBookingService.requestLockUnlockScooter('unlock', ride);

            const response = await RideBookingService.getRideResponse(ride.id);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    stopRide: async (req, res) => {
        try {
            const fields = [
                'rideId'
                // 'currentLocation'
            ];

            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);

            let ride = await RideBooking.findOne({ id: params.rideId });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            if (ride.currentNestType && ride.currentNestType == sails.config.NEST_TYPE.NO_PARKING) {
                throw sails.config.message.CANT_STOP_RIDE_IN_NO_PARKING_ZONE;
            }
            if (ride.currentNestType && ride.currentNestType == sails.config.NEST_TYPE.NON_RIDE) {
                throw sails.config.message.CANT_STOP_RIDE_IN_NON_RIDE_ZONE;
            }
            if (ride.status === sails.config.RIDE_STATUS.RESERVED) {
                throw sails.config.message.RIDE_NOT_STARTED;
            }

            if (ride.status === sails.config.RIDE_STATUS.COMPLETED) {
                throw sails.config.message.RIDE_ALREADY_STOPPED;
            }
            const loggedInUser = req.user;
            const rideDataResponse = await RideBookingService.stopRide(
                ride,
                loggedInUser.id,
                params.isAutoDeduct,
                params.scooterImage,
                false,
                false
            );
            let vehicle = await Vehicle.findOne({ id: ride.vehicleId })
                .populate('manufacturer');
            let manufacturerCode = vehicle.manufacturer.code;

            if (rideDataResponse.isPaid) {
                rideData = await RideBookingService.getRideResponse(ride.id);
                let response = {
                    ride: rideData,
                    paymentData: rideDataResponse.chargeData
                };

                return res.ok(response, sails.config.message.RIDE_REQUEST_CHARGE_SUCCESS);
            } else if (!rideDataResponse.isPaid && params.isAutoDeduct &&
                sails.config.STOP_RIDE_FROM_IOT.indexOf(manufacturerCode) === -1
            ) {
                return res.ok(rideDataResponse.chargeData, sails.config.message.RIDE_REQUEST_CHARGE_FAILED);
            }

            return res.ok(rideDataResponse, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    cancelRide: async (req, res) => {
        try {
            const fields = [
                'rideId'
                // 'currentLocation'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);

            let ride = await RideBooking.findOne({ id: params.rideId });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            let cancelRideStatus = [
                sails.config.RIDE_STATUS.RESERVED,
                sails.config.RIDE_STATUS.UNLOCK_REQUESTED
            ];
            if (cancelRideStatus.indexOf(ride.status) === -1) {
                throw sails.config.message.CANT_CANCEL_RIDE;
            }

            const loggedInUser = req.user;
            let rideData = await RideBookingService.cancelRide(ride, loggedInUser.id, sails.config.IS_AUTO_DEDUCT);

            const response = await RideBookingService.getRideResponse(rideData.id);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    rideList: async (req, res) => {
        try {
            const params = req.allParams();
            const loggedInUser = req.user;
            const userId = loggedInUser.id;
            // const customerId = '5cd921b50489e427ea43c1ee';
            let filter = await common.getFilter(params);
            if (!filter.where) {
                filter.where = {};
            }
            filter.where.userId = userId;
            filter.where.status = [
                sails.config.RIDE_STATUS.COMPLETED,
                sails.config.RIDE_STATUS.CANCELLED
            ];
            const rides = await RideBooking.find(filter)
                .populate('vehicleId')
                .populate('planInvoiceId', { select: ['id', 'planName'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name', 'emails', 'mobiles', 'uniqueIdentityNumber', 'inviteCode'] });

            if (rides && rides.length > 0) {
                // get rating for each ride
                let rideIds = _.compact(_.map(rides, 'id'));
                let ratings = await RideBookingService.getRatings(rideIds);
                let disputes = await RideBookingService.getDispute(rideIds, userId);
                let payments = await RideBookingService.paymentSummary(rideIds, userId);

                for (let key in rides) {
                    if (!rides[key]) {
                        continue;
                    }
                    rides[key].rating = _.find(ratings, { rideId: rides[key].id }) || null;
                    rides[key].disputes = _.filter(disputes, { rideId: rides[key].id }) || null;
                    rides[key].payments = _.filter(payments, { rideId: rides[key].id }) || null;
                    rides[key].zoneId = null;
                }
            }
            let response = { list: rides };
            let countFilter = await common.removePagination(filter);
            response.count = await RideBooking.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    makePayment: async (req, res) => {
        try {
            const fields = [
                'rideId'
            ];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const loggedInUser = req.user;
            const ride = await RideBooking.findOne({
                id: params.rideId,
                userId: loggedInUser.id
            });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            if (ride.isPaid) {
                throw sails.config.message.RIDE_ALREADY_PAID;
            }

            if (params.ratings && _.size(params.ratings)) {
                params.to = ride.vehicleId;
                let ratings = await RatingService.upsertRating({
                    loginUser: loggedInUser,
                    params: params
                });
                if (!ratings) {
                    throw sails.config.message.CANT_ADD_RATING;
                }
            }

            if (params.reportProblem && params.reportProblem.actionQuestionnaireId) {
                let complainParams = params.reportProblem;
                complainParams.loginUser = loggedInUser;
                complainParams.userType = loggedInUser.type;
                let reportProblem = await rideComplaintDisputeService.create(complainParams);
                if (!reportProblem) {
                    throw sails.config.message.CANT_ADD_REPORT_PROBLEM;
                }
            }
            let chargeObj = await PaymentService.chargeCustomerForRide(ride);
            if (chargeObj.flag) {
                rideData = await RideBookingService.getRideResponse(ride.id);
                let response = {
                    ride: rideData,
                    paymentData: chargeObj.data
                };

                return res.ok(response, sails.config.message.RIDE_REQUEST_CHARGE_SUCCESS);
            }
            let errMsgObj = JSON.parse(JSON.stringify(sails.config.message.RIDE_REQUEST_CHARGE_FAILED));
            if (chargeObj && chargeObj.data && chargeObj.data.errorData &&
                chargeObj.data.errorMessage
            ) {
                errMsgObj.message += ` due to ${chargeObj.data.errorMessage}`;
            } else if (chargeObj && chargeObj.data && chargeObj.data.message) {
                errMsgObj.message += ` due to ${chargeObj.data.message}`;
            }
            console.log('PaymentFailed', chargeObj);

            return res.ok(chargeObj.data, errMsgObj);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    getFareData: async (req, res) => {
        try {
            const fields = [
                'vehicleId'
            ];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            let vehicle = await Vehicle.findOne({ id: params.vehicleId });
            if (!vehicle) {
                throw sails.config.message.VEHICLE_NOT_FOUND;
            }
            if (!vehicle.currentLocation) {
                throw sails.config.message.VEHICLE_EMPTY_CURRENT_LOCATION;
            }
            let coordinates = vehicle.currentLocation.coordinates;
            let matchedScooter = [vehicle];
            // let matchedScooter = await RideBookingService.findMatchedScooters({
            //     currentLocation: coordinates
            // }, req.user);
            matchedScooter = await RideBookingService.addFareData(
                coordinates,
                matchedScooter
            );
            // matchedScooter = _.filter(matchedScooter, scooter => {
            //     return String(scooter._id) == params.vehicleId
            // });
            if (matchedScooter.length === 0) {
                return res.ok({ fareData: {}, zone: { subZones: [] } }, sails.config.message.OK);
            }
            let zoneData = matchedScooter[0].zone ? matchedScooter[0].zone : {};
            if (!sails.config.IS_USE_FARE_DATA_API) {
                zoneData = _.omit(zoneData, ['boundary', 'statusTrack']);
            }

            let fareData = {};
            let subZones = [];
            if (zoneData && zoneData._id) {
                let zoneId = String(zoneData._id);
                fareData = matchedScooter[0].fareData ? matchedScooter[0].fareData : {};
                // fareData = await FareManagement.findOne({
                //     zoneId: zoneId,
                //     vehicleType: vehicle.type
                // });
                if (sails.config.IS_NEST_ENABLED) {
                    subZones = await Nest.find({
                        zoneId: zoneId,
                        isDeleted: false
                    });
                }
                zoneData.subZones = subZones;
            }

            let response = { zone: zoneData, fareData: fareData };

            return res.ok(response, sails.config.message.OK);
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
            let vehicle = await RideBookingService.getVehicleForIOT(params.vehicleId);
            let response = await RideBookingService.passCommandToPerformToIotService(params.command, vehicle, params);
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
            let msg;
            switch (params.command) {
                case 'bootOpen':
                    msg = sails.config.message.BOOT_OPEN_COMMAND_SEND;
                    break;
                case 'alarmOn':
                    msg = sails.config.message.ALARM_COMMAND_SEND;
                    break;
                default:
                    msg = sails.config.message.OK;
            }

            return res.ok(response, msg);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    }

};
const modelName = 'ridebooking';
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const RatingService = require(`${sails.config.appPath}/api/services/rating`);
const RidebookingService = require(`${sails.config.appPath}/api/services/rideBooking`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
let moment = require('moment');

module.exports = {

    async paginate(req, res) {
        try {
            // get filter
            let response = {
                list: [],
                count: 0
            };
            let params = req.allParams();
            let loggedInUser = req.user;
            // if (sails.config.USER.ADMIN_USERS.includes(loggedInUser.type)) {
            //     params.filter.dealerId = null;
            // }
            let filter = await common.getFilter(params);
            response.list = await RideBooking.find(filter)
                .populate('userId', { select: ['firstName', 'lastName', 'name'] })
                .populate('vehicleId', { select: ['name', 'registerId', 'batteryLevel', 'currentLocation', 'qrNumber', 'speed'] })
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('zoneId', { select: ['name'] })
                .meta({ enableExperimentalDeepTargets: true });
            if (!response.list.length) {
                return res.ok(response, sails.config.message.LIST_NOT_FOUND);
            }

            let riderIds = _.map(response.list, 'id');
            let ratingData = await RatingService.getRideRating(riderIds)
            let recordsList = response.list;
            for (let recordKey in recordsList) {
                if (!recordsList[recordKey]) {
                    continue;
                }
                let rating = _.find(ratingData, { rideId: recordsList[recordKey].id });
                if (rating) {
                    recordsList[recordKey].rating = rating.rating;
                }
            }
            response.list = recordsList;

            // count
            let countFilter = await common.removePagination(filter);
            response.count = await RideBooking.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK, modelName);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    chargeCustomerForRide: async (req, res) => {
        try {
            const fields = [
                'rideId'
            ];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const ride = await RideBooking.findOne({ id: params.rideId });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            if (ride.isPaid) {
                throw sails.config.message.RIDE_ALREADY_PAID;
            }
            let chargeObj = await PaymentService.chargeCustomerForRide(ride);
            if (chargeObj.flag) {
                rideData = await RideBooking.findOne({ id: ride.id });
                let response = {
                    ride: rideData,
                    paymentData: chargeObj.data
                };

                return res.ok(response, sails.config.message.RIDE_REQUEST_CHARGE_SUCCESS);
            }
            let message = sails.config.message.RIDE_REQUEST_CHARGE_FAILED;
            if (chargeObj.data.errorData.errorMessage && chargeObj.data.errorData.errorMessage != '') {
                message = {
                    ...message,
                    message: chargeObj.data.errorMessage
                }
            }

            return res.ok(chargeObj.data, message);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },
    async exportRides(req, res) {
        try {
            let params = req.allParams();
            console.log('params :>> ', params.filter);
            let filter = params.filter;

            const recordsList = await RidebookingService.exportExcelData(filter);
            let response = { list: recordsList };

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getRideLocationData(req, res) {
        try {
            const fields = [
                'rideId'
            ];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const locationData = await RideLocationTrack.findOne({ rideId: params.rideId });
            if (!locationData || !locationData.id) {
                throw sails.config.message.RIDE_LOCATION_DATA_NOT_FOUND;
            }

            return res.ok(locationData, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
}
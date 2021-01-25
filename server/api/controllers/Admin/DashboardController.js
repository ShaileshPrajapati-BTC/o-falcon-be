let DashboardService = require(`${sails.config.appPath}/api/services/dashboard`);
let moment = require('moment');
let moment_tz = require('moment-timezone');

module.exports = {

    async getRideSummary(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.getRideSummary(params, req.user);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getStatistics(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.getStatisticsSummary(params, req.user);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }

    },

    async getScooterStatistics(req, res) {
        try {
            let params = req.allParams();

            let data = await DashboardService.getScooterStatistics(params, req.user);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getBookingHabits(req, res) {
        try {
            let params = req.allParams();
            let response = {};

            let filter = { select: ['startDateTime', 'totalFare'], where: {} };
            if (params.filter) {
                if (params.filter.vehicleType) {
                    filter.where.vehicleType = params.filter.vehicleType;
                }
                if (params.filter.zoneId) {
                    filter.where.zoneId = params.filter.zoneId;
                }
                if (params.filter.franchiseeId) {
                    filter.where.franchiseeId = params.filter.franchiseeId;
                }
                if(params.filter && params.filter.franchiseeId === null){
                    filter.where.franchiseeId = null;
                }
                if (params.filter.dealerId) {
                    delete filter.where.franchiseeId;
                    filter.where.dealerId = params.filter.dealerId;
                }
                let isSuperAdminOrFranchisee = req.user && (req.user.type === sails.config.USER.TYPE.FRANCHISEE ||
                    sails.config.USER.ADMIN_USERS.includes(req.user.type));
                if (isSuperAdminOrFranchisee) {
                    if ('dealerId' in params.filter && params.filter.dealerId === null) {
                        filter.where.dealerId = null;
                    } else if (!('dealerId' in params.filter) && params.filter.franchiseeId) {
                        // all - franchisee and dealer
                        delete filter.where.franchiseeId;
                        let franchiseeDealers = await User.find({
                            type: sails.config.USER.TYPE.DEALER,
                            franchiseeId: params.filter.franchiseeId
                        }).select(['id']);
                        let dealerIds = _.map(franchiseeDealers, dealer => dealer.id);
                        filter.where.or = [
                            { franchiseeId: params.filter.franchiseeId },
                            { dealerId: dealerIds }
                        ];
                    }
                }
            }
            
            if (params.startDate && params.endDate) {
                filter.where.createdAt = {
                    '>=': params.startDate,
                    '<=': params.endDate
                };
            }
            let rides = await RideBooking.find(filter);
            let condtionData = {
                high: 0,
                avarage: 0,
                low: 0
            };
            let setting = {
                bookingHabitsRideLimit: sails.config.BOOKING_HABITS_RIDE_LIMIT
            };
            if (setting && setting.bookingHabitsRideLimit) {
                condtionData = setting.bookingHabitsRideLimit;
            }
            _.each(rides, (ride) => {
                // get ride day
                if (ride.startDateTime && ride.startDateTime !== '') {
                    let rideDay = moment_tz(ride.startDateTime).tz(params.timezone).day();
                    
                    let rideHour = moment_tz(ride.startDateTime).tz(params.timezone).hour();
                   
                    // find day exists
                    let dayExists = response[rideDay];
                    if (dayExists && _.size(dayExists)) {
                        // find if slot exists or not
                        let existsSlot = dayExists[rideHour];
                        if (existsSlot && _.size(existsSlot)) {
                            response[rideDay][rideHour].totalRides += 1;
                            response[rideDay][rideHour].revenue += ride.totalFare;
                        } else {
                            response[rideDay][rideHour] = {};
                            response[rideDay][rideHour].totalRides = 1;
                            response[rideDay][rideHour].revenue = ride.totalFare;
                        }


                    } else {
                        response[rideDay] = {};
                        response[rideDay][rideHour] = {};
                        response[rideDay][rideHour].totalRides = 1;
                        response[rideDay][rideHour].revenue = ride.totalFare;

                    }
                }

            });

            _.each(response, (days) => {
                _.each(days, (slot) => {
                    if (slot && _.size(slot)) {
                        if (slot.totalRides >= condtionData.high) {
                            slot.isHigh = true;
                        } else if (slot.totalRides < condtionData.high && slot.totalRides >= condtionData.average) {
                            slot.isAverage = true;
                        } else {
                            slot.isLow = true;
                        }
                    }
                });
            });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getChartData(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.getChartData(params, req.user);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getVehicleData(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.getVehicleData(params);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getFranchiseeSummary(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.getFranchiseeSummary(params);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async exportRideSummary(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.exportRideSummary(params, req.user);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async exportTotalRiderSummary(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.exportTotalRiderAndRevenueSummary(params, req.user, 1);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async exportTotalRevenueSummary(req, res) {
        try {
            let params = req.allParams();
            let data = await DashboardService.exportTotalRiderAndRevenueSummary(params, req.user, 2);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};

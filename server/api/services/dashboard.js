const CommonService = require('./common');

const ObjectId = require('mongodb').ObjectID;
module.exports = {

    getStatusWiseCount(rideSummary, status) {
        let totalRide = 0;
        let ride = _.find(rideSummary, { _id: status });

        if (ride && ride.total) {
            totalRide = ride.total;
        }

        return totalRide;

    },

    async getRideSummary(params, loggedInUser) {
        let where = {};
        if (params.startDate && params.endDate) {
            where.createdAt = {
                $gte: params.startDate,
                $lte: params.endDate
            };
        }
        if (params.filter && params.filter.vehicleType) {
            where.vehicleType = { $in: params.filter.vehicleType };
        }
        if (params.filter && params.filter.franchiseeId) {
            where.franchiseeId = ObjectId(params.filter.franchiseeId);
        }
        if (params.filter && params.filter.dealerId) {
            where.dealerId = ObjectId(params.filter.dealerId);
            // where.franchiseeId = null;
        }
        if (params.filter && params.filter.franchiseeId === null) {
            where.franchiseeId = null;
        }
        let isSuperAdminOrFranchisee = loggedInUser && (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE || 
            sails.config.USER.ADMIN_USERS.includes(loggedInUser.type));
        if (isSuperAdminOrFranchisee) {
            if ('dealerId' in params.filter && params.filter.dealerId === null) {
                where.dealerId = null;
            } else if (!('dealerId' in params.filter) && params.filter.franchiseeId) {
                // all - franchisee and dealer
                delete where.franchiseeId;
                let dealerIds = await this.getDealerIdsByFranchiseeId(params.filter.franchiseeId);
                where.$or = [
                    { franchiseeId: ObjectId(params.filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ]
            }
        }
        // if (!_.isEmpty(params.viewFilter)) {
        //     for (let key in params.viewFilter) {
        //         where[key] = params.viewFilter[key];
        //     }
        // }
        let query = [{ $match: where }, {
            $group: {
                _id: '$status',
                total: { $sum: 1 },
                totalFare: { $sum: '$totalFare' },
                totalFranchiseeCommission: { $sum: '$franchiseeCommission' }
            }
        }];

        let data = {
            compltedRides: 0,
            ongoingRides: 0,
            cancelledRides: 0,
            reservedRides: 0,
            totalFare: 0,
            totalCommission: 0
        };
        let rideSummary = await CommonService.runAggregateQuery(query, 'RideBooking');
        if (rideSummary && rideSummary.length) {
            _.each(rideSummary, (summary) => {
                data.totalFare += summary.totalFare || 0;
                data.totalCommission += summary.totalFranchiseeCommission || 0;
                data.reservedRides = this.getStatusWiseCount(rideSummary, sails.config.RIDE_STATUS.RESERVED);
                data.unlockRequested = this.getStatusWiseCount(rideSummary, sails.config.RIDE_STATUS.UNLOCK_REQUESTED);
                data.ongoingRides = this.getStatusWiseCount(rideSummary, sails.config.RIDE_STATUS.ON_GOING);
                data.cancelledRides = this.getStatusWiseCount(rideSummary, sails.config.RIDE_STATUS.CANCELLED);
                data.compltedRides = this.getStatusWiseCount(rideSummary, sails.config.RIDE_STATUS.COMPLETED);
            });
        }

        return data;

    },

    async getStatisticsDataForVehicleSummary(where) {
        let query = [{ $match: where }, {
            $group: {
                _id: '$status',
                total: { $sum: 1 },
                totalFare: { $sum: '$totalFare' },
            }
        }];

        let data = {
            totalRide: 0,
            totalCancelledRide: 0,
        };
        let rideSummary = await CommonService.runAggregateQuery(query, 'RideBooking');
        _.forEach(rideSummary, summary => {
            data.totalRide += summary.total;
        })
        if (rideSummary && rideSummary.length) {
            data.totalCancelledRide = this.getStatusWiseCount(rideSummary, sails.config.RIDE_STATUS.CANCELLED);
        }

        return data;
    },

    async getStatisticsSummary(params, loggedInUser) {
        let data = {
            totalRide: 0,
            totalCancelledRide: 0,
            totalOpenDispute: 0,
            openTicket: 0
        };

        let where = {};
       
        let countFilter = {
            status: [
                sails.config.COMPLIANT_DISPUTE.TYPE.PROBLEM,
                sails.config.COMPLIANT_DISPUTE.STATUS.IN_PROCESS
            ],
            userType: sails.config.USER.TYPE.CUSTOMER
        };
        let openTicketStatusFilter = [sails.config.COMPLIANT_DISPUTE.STATUS.SUBMITTED, sails.config.COMPLIANT_DISPUTE.STATUS.IN_PROCESS];
        let openTicketCountFilter = {
            userType: sails.config.USER.TYPE.FRANCHISEE,
            status: openTicketStatusFilter
        };
        if (params.filter && params.filter.vehicleType) {
            where.vehicleType = { $in: params.filter.vehicleType };
            countFilter.vehicleType = params.filter.vehicleType;
        }
        if (params.filter && params.filter.franchiseeId) {
            where.franchiseeId = ObjectId(params.filter.franchiseeId);
            countFilter.franchiseeId = params.filter.franchiseeId;
            openTicketCountFilter.franchiseeId = params.filter.franchiseeId
        }
        if(params.filter && params.filter.franchiseeId === null){
            where.franchiseeId = null;
            countFilter.franchiseeId = null;
            openTicketCountFilter.franchiseeId = null
        }
        if (params.filter && params.filter.dealerId) {
            where.dealerId = ObjectId(params.filter.dealerId);
            countFilter.dealerId = params.filter.dealerId;
            openTicketCountFilter.dealerId = params.filter.dealerId
            openTicketCountFilter.userType = sails.config.USER.TYPE.DEALER;
            // where.franchiseeId = null;
        }
        let isSuperAdminOrFranchisee = loggedInUser && (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE ||
            sails.config.USER.ADMIN_USERS.includes(loggedInUser.type));
        if (isSuperAdminOrFranchisee) {
            if ('dealerId' in params.filter && params.filter.dealerId === null) {
                where.dealerId = null;
            } else if (!('dealerId' in params.filter) && params.filter.franchiseeId) {
                // all - franchisee and dealer
                delete where.franchiseeId;
                let dealerIds = await this.getDealerIdsByFranchiseeId(params.filter.franchiseeId);
                where.$or = [
                    { franchiseeId: ObjectId(params.filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ]
            }
        }

        if(params.startDate){
            where.createdAt = {'$gte': params.startDate};
            openTicketCountFilter.createdAt = params.startDate;
            countFilter.createdAt = params.startDate;


        }

        /* let query = [{ $match: where }, {
            $group: {
                _id: 1,
                totalRide: { $sum: '$rideSummary.booked' },
                totalCancelledRide: { $sum: '$rideSummary.cancelled' }
            }
        }];
        let summary = await CommonService.runAggregateQuery(query, 'VehicleSummary');
        if (summary && summary.length) {
            let record = _.first(summary);
            _.each(data, (v, k) => {
                data[k] = record[k];
            });

        } */
        let vehicleSummaryData = await this.getStatisticsDataForVehicleSummary(where);
        data.totalRide = vehicleSummaryData.totalRide || 0;
        data.totalCancelledRide = vehicleSummaryData.totalCancelledRide || 0;
        const groupByField = {
            _id: { $substr: ['$createdAt', 0, 10] },
            value: { $sum: '$totalFare' }
        };
        let revenue = await CommonService.getChartDataByQuery(groupByField, 'RideBooking', null, null, where);
        data.totalFare = revenue.total;
        data.totalOpenDispute = await RideComplaintDispute.count(countFilter);
        data.openTicket = await RideComplaintDispute.count(openTicketCountFilter);

        return data;
    },

    async getScooterStatistics(params, loggedInUser) {
        let data = {
            highlyUsed: 0,
            avarageUsed: 0,
            unused: 0,
            totalScooter: 0,
            activeScooter: 0,
            totalUser: 0,
            activeUser: 0
        };


        let condtionData = {
            high: 0,
            avarage: 0,
            low: 0,
            unused: 0
        };

        let setting = {
            scooterUsedLimit: sails.config.SCOOTER_USED_LIMIT
        };
        if (setting && setting.scooterUsedLimit) {
            condtionData = setting.scooterUsedLimit;
        }

        let where = {};
        let vehicleFilter = {};
        if (params.filter && params.filter.vehicleType) {
            where.vehicleType = { $in: params.filter.vehicleType };
            vehicleFilter.type = { $in: params.filter.vehicleType };
        }
        if (params.filter && params.filter.franchiseeId) {
            where.franchiseeId = ObjectId(params.filter.franchiseeId);
            vehicleFilter.franchiseeId = ObjectId(params.filter.franchiseeId);
        }
        if (params.filter && params.filter.franchiseeId === null) {
            where.franchiseeId = null;
            vehicleFilter.franchiseeId = null
        }
        if (params.filter && params.filter.dealerId) {
            where.dealerId = ObjectId(params.filter.dealerId);
            vehicleFilter.dealerId = ObjectId(params.filter.dealerId);
        }
        let isSuperAdminOrFranchisee = loggedInUser && (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE ||
            sails.config.USER.ADMIN_USERS.includes(loggedInUser.type));
        if (isSuperAdminOrFranchisee) {
            if ('dealerId' in params.filter && params.filter.dealerId === null) {
                vehicleFilter.dealerId = null;
                where.dealerId = null;
            } else if (!('dealerId' in params.filter) && params.filter.franchiseeId) {
                // all - franchisee and dealer
                delete vehicleFilter.franchiseeId;
                delete where.franchiseeId;
                let dealerIds = await this.getDealerIdsByFranchiseeId(params.filter.franchiseeId);
                vehicleFilter.$or = [
                    { franchiseeId: ObjectId(params.filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ]
                where.$or = [
                    { franchiseeId: ObjectId(params.filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ]
            }
        }
        let query = [{ $match: where }, {
            $group: {
                _id: 1,
                highlyUsed: {
                    $sum: {
                        $cond: [
                            { $gte: ['$fareSummary.travelTime', condtionData.high] },
                            1,
                            0
                        ]
                    }
                },
                avarageUsed: {
                    $sum: {
                        $cond: [{
                            $and: [
                                { $gte: ['$fareSummary.travelTime', condtionData.average] },
                                { $lte: ['$fareSummary.travelTime', condtionData.high] }
                            ]
                        },
                            1,
                            0
                        ]
                    }
                }
            }
        }];

        let summary = await CommonService.runAggregateQuery(query, 'RideBooking');
        if (summary && summary.length) {
            let record = _.first(summary);
            data.highlyUsed = record.highlyUsed;
            data.avarageUsed = record.avarageUsed;
        }

        // let get detail from vehicle
        let vehicleQuery = [{ $match: vehicleFilter }, {
            $group: {
                _id: 1,
                totalScooter: { $sum: 1 },
                unused: {
                    $sum: {
                        $cond: [{
                            $or: [
                                { $eq: ['$lastUsed', ''] },
                                { $eq: ['$lastUsed', null] }
                            ]
                        }, 1, 0]
                    }
                },
                activeScooter: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
            }
        }];
        let vehicelSummary = await CommonService.runAggregateQuery(vehicleQuery, 'Vehicle');
        if (vehicelSummary && vehicelSummary.length) {
            let record = _.first(vehicelSummary);
            data.unused = record.unused;
            data.totalScooter = record.totalScooter;
            data.activeScooter = record.activeScooter;
        }

        let totalUserFilter = { type: sails.config.USER.TYPE.CUSTOMER };
        let activeUserFilter = { type: sails.config.USER.TYPE.CUSTOMER, isActive: true };
        if (params.filter && params.filter.dealerId) {
            totalUserFilter.dealerId = params.filter.dealerId;
            activeUserFilter.dealerId = params.filter.dealerId;
        }
        data.totalUser = await User.count(totalUserFilter);
        data.activeUser = await User.count(activeUserFilter);

        return data;
    },

    async getChartData({ startDate, endDate, newStartDate , filter }, loggedInUser) {
        let data = [];
        const groupByCount = {
            _id: { $substr: ['$createdAt', 0, 10] },
            value: { $sum: 1 }
        };

        const groupByField = {
            _id: { $substr: ['$createdAt', 0, 10] },
            value: { $sum: '$totalFare' },
            value2: { $sum: '$franchiseeCommission' }
        };
        let match = {};
        let userMatch = {
            type: sails.config.USER.TYPE.CUSTOMER
        };
        if (filter && filter.vehicleType) {
            match.vehicleType = { $in: filter.vehicleType };
        }
        if (filter && filter.franchiseeId) {
            match.franchiseeId = ObjectId(filter.franchiseeId);
            userMatch.franchiseeId = ObjectId(filter.franchiseeId);
            userMatch.dealerId = null;
        }
        if(filter && filter.franchiseeId === null){
            match.franchiseeId = null;
            userMatch.franchiseeId = null;
        }
        if (filter && filter.dealerId) {
            match.dealerId = ObjectId(filter.dealerId);
            // match.franchiseeId = null;
            userMatch.dealerId = ObjectId(filter.dealerId);
            // userMatch.franchiseeId = null;
        }
        let isSuperAdminOrFranchisee = loggedInUser && (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE ||
            sails.config.USER.ADMIN_USERS.includes(loggedInUser.type));
        if (isSuperAdminOrFranchisee) {
            if ('dealerId' in filter && filter.dealerId === null) {
                match.dealerId = null;
                userMatch.dealerId = null;
            } else if (!('dealerId' in filter) && filter.franchiseeId) {
                // all - franchisee and dealer
                delete userMatch.franchiseeId;
                let dealerIds = await this.getDealerIdsByFranchiseeId(filter.franchiseeId);

                delete match.franchiseeId;
                match.$or = [
                    { franchiseeId: ObjectId(filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ];
                userMatch.$or = [
                    { franchiseeId: ObjectId(filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ]
            }
        }
        
        let user = await CommonService.getChartDataByQuery(groupByCount, 'User', startDate, endDate, userMatch);
        user.text = 'Total Rider';
        user.code = 'user';
        data.push(user);

        let ride = await CommonService.getChartDataByQuery(groupByCount, 'RideBooking', newStartDate ? newStartDate : startDate, endDate, match);
        ride.text = 'Total Rides';
        ride.code = 'ride';
        data.push(ride);

        let revenue = await CommonService.getChartDataByQuery(groupByField, 'RideBooking', newStartDate ? newStartDate : startDate , endDate, match);
        revenue.text = 'Total Revenue';
        revenue.code = 'revenue';
        revenue.isPrice = true;
        data.push(revenue);

        return data;
    },

    async getVehicleData(params) {
        let filter = {
            currentLocation: { '!=': null }
        };
        if (params.filter && params.filter.vehicleType) {
            filter.type = params.filter.vehicleType;
        }
        if (params.filter && params.filter.franchiseeId) {
            filter.franchiseeId = params.filter.franchiseeId;
        }
        let vehicles = await Vehicle.find(filter);
        let activeRides = await RideBooking
            .find({
                status: [
                    sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                    sails.config.RIDE_STATUS.ON_GOING
                ]
            })
            .populate('userId', { select: ['name'] });
        if (activeRides && activeRides.length > 0) {
            for (let activeRide of activeRides) {
                let vehicleIndex = _.findIndex(vehicles, { id: activeRide.vehicleId });
                if (vehicles[vehicleIndex]) {
                    vehicles[vehicleIndex].activeRide = activeRide;
                }
            }
        }

        return vehicles;
    },

    async getFranchiseeSummary(params) {
        let matchFilter = {};
        let filter = params.filter;
        let totalRideFilter = { vehicleType: filter.vehicleType, franchiseeId: filter.franchiseeId };
        let totalVehicleFilter = { type: filter.vehicleType, franchiseeId: filter.franchiseeId };
        if (params.filter && params.filter.vehicleType) {
            matchFilter.vehicleType = { $in: filter.vehicleType };
        }
        if(filter && filter.franchiseeId === null){
            matchFilter.franchiseeId = null;
        }
        if (filter && filter.franchiseeId) {
            let dealerIds = await this.getDealerIdsByFranchiseeId(filter.franchiseeId);
            matchFilter.$or = [
                { franchiseeId: ObjectId(filter.franchiseeId) },
                { dealerId: { $in: dealerIds } }
            ];
            delete totalRideFilter.franchiseeId;
            dealerIdsWithoutObjectIds = await this.getDealerIdsByFranchiseeId(filter.franchiseeId, false);
            totalRideFilter.or = [
                { franchiseeId: filter.franchiseeId },
                { dealerId: dealerIdsWithoutObjectIds }
            ];
            delete totalVehicleFilter.franchiseeId;
            totalVehicleFilter.or = [
                { franchiseeId: filter.franchiseeId },
                { dealerId: dealerIdsWithoutObjectIds }
            ];
        }


        let data = {
            franchisee: 0,
            totalRide: 0,
            totalRevenue: 0,
            totalVehicle: 0
        };

        const rideDataGroup = {
            _id: null,
            value: { $sum: '$totalFare' },
        };
        let rideData = await CommonService.getChartDataByQuery(rideDataGroup, 'RideBooking', null, null, matchFilter);
        data.totalRevenue = rideData.data[0] ? rideData.data[0].value : 0;

        if (filter.franchiseeId) {
            data.franchisee = 1;
        } else {
            data.franchisee = await User.count({ type: sails.config.USER.TYPE.FRANCHISEE, franchiseeId: filter.franchiseeId });
        }
        data.totalRide = await RideBooking.count(totalRideFilter);
        data.totalVehicle = await Vehicle.count(totalVehicleFilter);

        return data;
    },

    async getDealerIdsByFranchiseeId(franchiseeId, withObjectId = true) {
        let franchiseeDealers = await User.find({
            type: sails.config.USER.TYPE.DEALER,
            franchiseeId: franchiseeId
        }).select(['id']);
        let dealerIds = _.map(franchiseeDealers, dealer => withObjectId ? ObjectId(dealer.id) : dealer.id);

        return dealerIds;
    },

    async exportRideSummary(params, loggedInUser) {
        let where = {};
        if (params.startDate && params.endDate) {
            where.createdAt = {
                $gte: params.startDate,
                $lte: params.endDate
            };
        }
        if (params.filter && params.filter.vehicleType) {
            where.vehicleType = { $in: params.filter.vehicleType };
        }
        if (params.filter && params.filter.franchiseeId) {
            where.franchiseeId = ObjectId(params.filter.franchiseeId);
        }
        if (params.filter && params.filter.dealerId) {
            where.dealerId = ObjectId(params.filter.dealerId);
            // where.franchiseeId = null;
        }
        if (params.filter && params.filter.franchiseeId === null) {
            where.franchiseeId = null;
        }
        let isSuperAdminOrFranchisee = loggedInUser && (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE || 
            sails.config.USER.ADMIN_USERS.includes(loggedInUser.type));
        if (isSuperAdminOrFranchisee) {
            if ('dealerId' in params.filter && params.filter.dealerId === null) {
                where.dealerId = null;
            } else if (!('dealerId' in params.filter) && params.filter.franchiseeId) {
                // all - franchisee and dealer
                delete where.franchiseeId;
                let dealerIds = await this.getDealerIdsByFranchiseeId(params.filter.franchiseeId);
                where.$or = [
                    { franchiseeId: ObjectId(params.filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ]
            }
        }
        let query = [
            {
                $match: where
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId'
                }
            },
            {
                $unwind: "$userId"
            },
            {
                $lookup: {
                    from: 'Vehicle',
                    localField: 'vehicleId',
                    foreignField: '_id',
                    as: 'vehicleId'
                }
            },
            {
                $unwind: "$vehicleId"
            },
            {
                $lookup: {
                    from: 'Zone',
                    localField: 'zoneId',
                    foreignField: '_id',
                    as: 'zoneId'
                }
            },
            {
                $unwind: "$zoneId"
            },
            {
                $project: {
                    // "lastPayment": { $ifNull: ["$lastPayment", {}] },
                    "_id": 0,
                    RideId: "$rideNumber",
                    Status: "$status",
                    Name: "$userId.name",
                    StartDateTime: "$startDateTime",
                    EndDateTime: "$endDateTime",
                    TotalFare: "$totalFare",
                    ReservationTime: "$reservedDateTime",
                    VehicleId: "$vehicleId.registerId",
                    VehicleType: "$vehicleId.type",
                    // VehicleLastLocation: "$vehicleId.lastLocation",
                    ZoneName: "$zoneId.name",
                    PaymentStatus: "$isPaid",
                    // "_id.franchiseeId": "$_id.franchiseeId._id"
                }
            },
        ];
        // if (sails.config.IS_FRANCHISEE_ENABLED) {
        //     query.push(
        //         {
        //             $lookup: {
        //                 from: 'User',
        //                 localField: 'franchiseeId',
        //                 foreignField: '_id',
        //                 as: 'franchiseeId'
        //             }
        //         },
        //         {
        //             $unwind: "$franchiseeId"
        //         }
        //     );
        // }
        // if (sails.config.CLIENT_FEATURE_ACTIVE) {
        //     query.push(
        //         {
        //             $lookup: {
        //                 from: 'User',
        //                 localField: 'dealerId',
        //                 foreignField: '_id',
        //                 as: 'dealerId'
        //             }
        //         },
        //         {
        //             $unwind: "$dealerId"
        //         }
        //     );
        // }

        let rideSummary = await CommonService.runAggregateQuery(query, 'RideBooking');

        return rideSummary;

    },

    async exportTotalRiderAndRevenueSummary({ startDate, endDate, filter }, loggedInUser, index) {
        let match = {};
        let userMatch = {
            type: sails.config.USER.TYPE.CUSTOMER
        };
        if (filter && filter.vehicleType) {
            match.vehicleType = { $in: filter.vehicleType };
        }
        if (filter && filter.franchiseeId) {
            match.franchiseeId = ObjectId(filter.franchiseeId);
            userMatch.franchiseeId = ObjectId(filter.franchiseeId);
            userMatch.dealerId = null;
        }
        if(filter && filter.franchiseeId === null){
            match.franchiseeId = null;
            userMatch.franchiseeId = null;
        }
        if (filter && filter.dealerId) {
            match.dealerId = ObjectId(filter.dealerId);
            // match.franchiseeId = null;
            userMatch.dealerId = ObjectId(filter.dealerId);
            // userMatch.franchiseeId = null;
        }
        let isSuperAdminOrFranchisee = loggedInUser && (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE ||
            sails.config.USER.ADMIN_USERS.includes(loggedInUser.type));
        if (isSuperAdminOrFranchisee) {
            if ('dealerId' in filter && filter.dealerId === null) {
                match.dealerId = null;
                userMatch.dealerId = null;
            } else if (!('dealerId' in filter) && filter.franchiseeId) {
                // all - franchisee and dealer
                delete userMatch.franchiseeId;
                let dealerIds = await this.getDealerIdsByFranchiseeId(filter.franchiseeId);

                delete match.franchiseeId;
                match.$or = [
                    { franchiseeId: ObjectId(filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ];
                userMatch.$or = [
                    { franchiseeId: ObjectId(filter.franchiseeId) },
                    { dealerId: { $in: dealerIds } }
                ]
            }
        }
        if (index === 1) {
            let user = await CommonService.exportChartDataByQuery(null, 'User', startDate, endDate, userMatch, 1);
            return user;
        } else if (index === 2) {
            let revenue = await CommonService.exportChartDataByQuery(null, 'RideBooking', startDate, endDate, match, 2);
            return revenue;
        }
    },
};


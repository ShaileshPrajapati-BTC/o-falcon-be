const ObjectId = require('mongodb').ObjectID;
let CommonService = require(`./common`);
let NestService = require(`./nest`);
const moment = require('moment');
const RedisDBService = require('./redisDB');

module.exports = {

    async getChartData({ startDate, endDate, vehicleId }) {
        let data = [];

        const groupByCount = {
            _id: { $substr: ['$createdAt', 0, 10] },
            value: { $sum: 1 }
        };

        const groupByField = {
            _id: { $substr: ['$createdAt', 0, 10] },
            value: { $sum: '$totalFare' }
        };
        let match = { vehicleId: ObjectId(vehicleId) };

        let ride = await CommonService.getChartDataByQuery(groupByCount, 'RideBooking', startDate, endDate, match);
        ride.text = 'Total Rides';
        ride.code = 'ride';
        data.push(ride);
        match.status = sails.config.RIDE_STATUS.COMPLETED;
        let revenue = await CommonService.getChartDataByQuery(groupByField, 'RideBooking', startDate, endDate, match);
        revenue.text = 'Total Revenue';
        revenue.code = 'revenue';
        revenue.isPrice = true;
        data.push(revenue);

        return data;
    },
    async getVehicleSummaryByUserId(userId, params) {
        let data = {
            unused: 0,
            totalScooter: 0,
            activeScooter: 0
        };
        let vehicleFilter = {
            userId: ObjectId(userId)
        };
        if (params.filter && params.filter.vehicleType) {
            vehicleFilter.type = { $in: params.filter.vehicleType };
        }
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
        let vehicleSummary = await CommonService.runAggregateQuery(vehicleQuery, 'Vehicle');
        if (vehicleSummary && vehicleSummary.length) {
            let record = _.first(vehicleSummary);
            data.unused = record.unused;
            data.totalScooter = record.totalScooter;
            data.activeScooter = record.activeScooter;
        }

        return data;
    },
    async assignVehicle(franchiseeId, userId, vehicleIds) {
        let assignedVehicles = await Vehicle.update({
            id: vehicleIds,
            // userId: userId,
            franchiseeId: null
        }).set({ franchiseeId: franchiseeId }).fetch();
        let operationType = sails.config.ASSIGN_VEHICLE_OPERATION_TYPE.assigned;
        await this.addVehicleAssignOperationLog(vehicleIds, userId, franchiseeId, operationType);

        return assignedVehicles;
    },
    async retainVehicle(franchiseeId, userId, vehicleIds) {
        let retainedVehicle = await Vehicle.update({
            id: vehicleIds,
            // userId: userId,
            franchiseeId: franchiseeId
        }).set({
            franchiseeId: null,
            dealerId: null,
            franchiseeRentStartDate: '',
            dealerRentStartDate: ''
        }).fetch();
        let operationType = sails.config.ASSIGN_VEHICLE_OPERATION_TYPE.retained;
        await this.addVehicleAssignOperationLog(vehicleIds, userId, franchiseeId, operationType);

        return retainedVehicle;
    },
    async addVehicleAssignOperationLog(vehicleIds, userId, franchiseeId, operationType, userType = sails.config.USER.TYPE.FRANCHISEE) {
        let assignLog = [];
        for (let vehicleId of vehicleIds) {
            assignLog.push({
                vehicleId: vehicleId,
                assignerId: userId,
                referenceId: franchiseeId,
                operationType: operationType,
                userType: userType
            });
        }

        await AssignRetainVehicleLog.createEach(assignLog);
    },
    async assignVehicleToDealer(params, userId) {
        let paramsToUpdate = {
            franchiseeId: params.updateFilter.franchiseeId,
            dealerId: params.dealerId,
            fleetType: params.fleetType
        }
        params.updateFilter.id = params.vehicleIds;
        params.updateFilter.dealerId = null;
        let assignedVehicles = await Vehicle.update(params.updateFilter).set(paramsToUpdate).fetch();
        if (assignedVehicles && assignedVehicles.length) {
            let operationType = sails.config.ASSIGN_VEHICLE_OPERATION_TYPE.assigned;
            const dealerType = sails.config.USER.TYPE.DEALER;
            await this.addVehicleAssignOperationLog(params.vehicleIds, userId, params.dealerId, operationType, dealerType);

            return assignedVehicles;
        }

        return false;
    },
    async retainVehicleToDealer(params, userId) {
        params.updateFilter.id = params.vehicleIds;
        params.updateFilter.dealerId = params.dealerId;
        let updateParams = {
            dealerId: null,
            dealerRentStartDate: ''
        };
        let retainedVehicle = await Vehicle.update(params.updateFilter).set(updateParams).fetch();
        let operationType = sails.config.ASSIGN_VEHICLE_OPERATION_TYPE.retained;
        if (retainedVehicle && retainedVehicle.length) {
            const dealerType = sails.config.USER.TYPE.DEALER;
            await this.addVehicleAssignOperationLog(params.vehicleIds, userId, params.dealerId, operationType, dealerType);

            return retainedVehicle;
        }

        return false;
    },
    async beforeCreate(vehicle, cb) {
        const SeriesGeneratorService = require('./seriesGenerator');
        let series = await SeriesGeneratorService.nextSeriesGenerate(
            { type: sails.config.SERIES_GENERATOR.TYPE.VEHICLE_SERIES }
        );
        vehicle.registerId = series.series;

        cb(null, vehicle);
    },
    async addNestTrack(vehicleList, nestId, userId, remark, rideId) {
        let nestTrackObj = [];
        for (let vehicle of vehicleList) {
            nestTrackObj.push({
                vehicleId: vehicle.id,
                nestId: nestId,
                previousNestId: vehicle.nestId,
                transferBy: userId,
                transferDate: moment().toISOString(),
                remark: remark,
                rideId: rideId ? rideId : null
            });
        }

        await NestTrack.createEach(nestTrackObj);
    },

    async assignOrRetainVehicleToNest(vehicleIds, nestId, userId, remark) {

        let filter = {
            id: vehicleIds,
            isRideCompleted: true,
            isAvailable: true
        };
        let vehicleList = await Vehicle.find(filter);

        if (!vehicleList.length) {
            return vehicleList;
        };

        await this.addNestTrack(vehicleList, nestId, userId, remark);

        let assignedVehicles = await Vehicle
            .update({ id: vehicleIds })
            .set({ nestId: nestId })
            .fetch();

        if (nestId === null) {
            let nestData = {};
            for (let vehicle of vehicleList) {
                if (nestData[vehicle.nestId]) {
                    nestData[vehicle.nestId] += 1;
                } else {
                    nestData[vehicle.nestId] = 1;
                }
            }
            for (let key in nestData) {
                let count = -1 * nestData[key];
                await CommonService.runNativeQuery({ _id: ObjectId(key) }, { $inc: { totalVehicles: count } }, 'nest');
                await NestService.setNestCapacity(key);
            }
        } else {
            await CommonService.runNativeQuery({ _id: ObjectId(nestId) }, { $inc: { totalVehicles: vehicleIds.length } }, 'nest');
            await NestService.setNestCapacity(nestId);
        }

        return assignedVehicles;
    },
    async updateDataInRedisByImei(imei, data) {
        let isUpdateData = false;
        let vehicle = await RedisDBService.getData(imei);
        if (!vehicle) {
            return true;
        }
        for (let key in vehicle) {
            if (data[key]) {
                isUpdateData = true;
                if (key === 'currentLocation') {
                    if (!vehicle[key] || !vehicle[key].coordinates) {
                        vehicle[key] = {
                            type: 'Point',
                            coordinates: []
                        };
                    }
                    vehicle[key].coordinates[0] = data[key].coordinates[0];
                    vehicle[key].coordinates[1] = data[key].coordinates[1];
                } else if (key === 'lastLocation') {
                    if (!vehicle[key] || !vehicle[key].coordinates) {
                        vehicle[key] = {
                            type: 'Point',
                            coordinates: []
                        };
                    }
                    vehicle[key].coordinates[0] = data[key].coordinates[0];
                    vehicle[key].coordinates[1] = data[key].coordinates[1];
                } else {
                    vehicle[key] = data[key];
                }
            }
        }
        if (isUpdateData) {
            await RedisDBService.setData(imei, vehicle);
        }
    },
    async updateDataInRedisById(id, data) {
        let isUpdateData = false;
        let vehicle = await RedisDBService.getData(id);
        if (!vehicle) {
            return true;
        }
        for (let key in vehicle) {
            if (data[key] && key !== 'manufacturer') {
                isUpdateData = true;
                vehicle[key] = data[key];
            }
        }
        if (data.manufacturer) {
            isUpdateData = true;
            vehicle.manufacturer = await Master.findOne({
                id: data.manufacturer.toString()
            }).select(['name', 'code']);
        }
        if (isUpdateData) {
            await RedisDBService.setData(id, vehicle);
        }

    },
    afterCreate: async function () {
    },
    afterUpdate: async function (data, cb) {
        await this.updateDataInRedisByImei(data.records.imei, data.modifier);
        await this.updateDataInRedisById(data.records.id, data.modifier);
    },
    afterDestroy: async function () {
    }
};

const modelName = 'vehicle';
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);
const VehicleService = require(`${sails.config.appPath}/api/services/vehicle`);
const IotService = require(`${sails.config.appPath}/api/services/iot`);
const CollectionExcelGeneratorService = require(sails.config.appPath + '/api/services/CollectionExcelGenerator');
var fs = require("fs");
var FileService = require(sails.config.appPath + '/api/services/FileService');


module.exports = {
    async add(req, res) {
        try {
            let params = req.allParams();
            // let modelName = 'vehicle';
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateCreateParams(option);
            if (!sails.config.IS_FRANCHISEE_ENABLED && params.franchiseeId) {
                delete params.franchiseeId;
            }
            let createdRecord = await sails.models[modelName].create(params).fetch();
            await notification.vehicleAddOrUpdate(createdRecord);
            if (createdRecord && createdRecord.imei) {
                await RideBookingService.geLocation(createdRecord.id);
            }

            return res.ok(createdRecord, sails.config.message.VEHICLE_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let recordsList = await Vehicle.find(filter)
                .populate('manufacturer', { select: ['name', 'multiLanguageData'] })
                .populate('lockManufacturer', { select: ['name', 'multiLanguageData'] })
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] })
                .populate('nestId', { select: ['name', 'capacity', 'totalVehicles'] })
                .meta({ enableExperimentalDeepTargets: true });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let vehicleIds = _.map(recordsList, 'id');
            let vehicleSummaries = await VehicleSummary.find({ vehicleId: vehicleIds });

            let lastBookedRideDetails = await RideBooking
                .find({ vehicleId: vehicleIds, status: [sails.config.RIDE_STATUS.UNLOCK_REQUESTED, sails.config.RIDE_STATUS.ON_GOING] })
                .populate('userId', { select: ['name', 'firstName', 'lastName'] });

            for (let recordKey in recordsList) {
                if (!recordsList[recordKey]) {
                    continue;
                }
                let vehicleSummary = _.find(vehicleSummaries, { vehicleId: recordsList[recordKey].id });
                recordsList[recordKey].vehicleRideSummary = {
                    status: 0,
                    speedLimit: 0,
                    totalKm: 0,
                    totalRide: 0,
                    currentRiderDetail: {}
                }
                if (vehicleSummary && vehicleSummary.id) {
                    recordsList[recordKey].vehicleRideSummary.totalKm = vehicleSummary.rideSummary && vehicleSummary.rideSummary.distance ? vehicleSummary.rideSummary.distance : 0;
                    recordsList[recordKey].vehicleRideSummary.totalRide = vehicleSummary.rideSummary && vehicleSummary.rideSummary.booked ? vehicleSummary.rideSummary.booked : 0;
                }

                let lastRide = _.find(lastBookedRideDetails, { vehicleId: recordsList[recordKey].id });
                if (lastRide) {
                    recordsList[recordKey].vehicleRideSummary.status = lastRide.status;
                    recordsList[recordKey].vehicleRideSummary.currentRiderDetail = lastRide;
                }
            }
            let response = { list: recordsList };

            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Vehicle.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK, modelName);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getUnassignedVehicle(req, res) {
        try {
            // get filter
            let params = req.allParams();
            if (!params) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let filter = await common.getFilter(params);
            let recordsList = await Vehicle.find(filter)
                .meta({ enableExperimentalDeepTargets: true });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Vehicle.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK, modelName);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            // get filter
            let params = req.allParams();
            // let modelName = 'vehicle';
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateUpdateParams(option);
            let vehicle = _.omit(params, 'id');
            if (!sails.config.IS_FRANCHISEE_ENABLED && vehicle.franchiseeId) {
                delete params.franchiseeId;
            }
            let updatedVehicle = await Vehicle
                .update({ id: params.id })
                .set(vehicle)
                .fetch();
            if (updatedVehicle) {
                await notification.vehicleAddOrUpdate(updatedVehicle[0], true);

                return res.ok(updatedVehicle[0], sails.config.message.VEHICLE_UPDATED, modelName);
            }

            return res.notFound({}, sails.config.message.VEHICLE_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            params.viewFilter.id = params.id;
            // find record
            let record = await Vehicle.findOne(params.viewFilter);
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK, modelName);
            }

            return res.ok({}, sails.config.message.VEHICLE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async detailView(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            params.viewFilter.id = params.id;
            // find record
            let record = await Vehicle.findOne(params.viewFilter)
                .populate('manufacturer', { select: ['name', 'code', 'multiLanguageData'] })
                .populate('addedBy', { select: ['firstName', 'lastName', 'name'] })
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] });
            // return record
            if (record && record.id) {
                let onGoingRide = await RideBooking.findOne({
                    status: [
                        sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                        sails.config.RIDE_STATUS.ON_GOING
                    ],
                    vehicleId: record.id
                });
                record.onGoingRide = onGoingRide;
                record.vehicleSummary = await VehicleSummary.findOne({ vehicleId: record.id });

                return res.ok(record, sails.config.message.OK, modelName);
            }

            return res.ok({}, sails.config.message.VEHICLE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async getChartData(req, res) {
        try {
            let params = req.allParams();
            let data = await VehicleService.getChartData(params);

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getConnectionStatus(req, res) {
        try {
            let params = req.allParams();
            let vehicles = await Vehicle.find({ isActive: true, imei: { '!=': '' } })
                .populate('manufacturer');
            if (!vehicles.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let data = [];
            let currentTime = UtilService.getTimeFromNow();
            for (let vehicle of vehicles) {
                if (!vehicle || !vehicle.imei) {
                    continue;
                }

                let connectionStatusData = await IotService.sendRequestToServer(
                    vehicle.manufacturer.code,
                    'connectionStatus',
                    vehicle
                );
                let updateObj = {
                    connectionStatus: Boolean(connectionStatusData.status), // to convert boolean
                    lastConnectionCheckDateTime: currentTime,
                    updatedBy: params.updatedBy
                }
                if (updateObj.connectionStatus) {
                    updateObj.lastConnectedDateTime = currentTime;
                }
                await Vehicle.update({ id: vehicle.id }, updateObj);
                let vehicleData = await Vehicle.findOne({
                    where: { id: vehicle.id },
                    select: ['name', 'imei', 'qrNumber', 'imei', 'connectionStatus',
                        'lastConnectionCheckDateTime', 'lastConnectedDateTime']
                });
                data.push(vehicleData);
            }

            let response = { data };

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getLocationStatus(req, res) {
        try {
            let vehicles = await Vehicle.find({ isActive: true, imei: { '!=': '' } })
                .populate('manufacturer');
            if (!vehicles.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            for (let vehicle of vehicles) {
                if (!vehicle || !vehicle.imei) {
                    continue;
                }

                await IotService.sendRequestToServer(
                    vehicle.manufacturer.code,
                    'track',
                    vehicle
                );
            }

            let response = {};

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async demoVehicleExcel(req, res) {
        let params = req.allParams();
        console.log('params----------------------', params);
        try {
            params.data = {
                'Name': '',
                'IMEI': '',
                'QR Number': '',
                'Type': '',
                'Manufacturer': '',
                'Mac Address': '',
                'Lock Manufacturer': '',
                'Charger Plug': '',
                'Charger Power': ''
            };
            let response = await CollectionExcelGeneratorService.demoVehicleExcel(params);
            return res.ok(response);
        } catch (e) {
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async importVehicle(req, res) {
        let params = req.allParams();

        try {
            // get filter
            if (!params) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            var filename = req.file('file')._files[0].stream.filename;
            var file = req.file('file');
            file.upload(
                { dirname: require('path').resolve(sails.config.appPath, 'assets/files'), saveAs: function (__newFileStream, cb) { cb(null, filename); } }
                , async function (err, uploadedFiles) {
                    if (err) {
                        throw new Error(err);
                    } else {
                        let readExcel = await CollectionExcelGeneratorService.importVehicleExcel(uploadedFiles[0].fd);
                        if (uploadedFiles && uploadedFiles.length) {
                            if (FileService.getFileSize('assets/files/' + uploadedFiles[0].filename) > 0) {
                                let isUnlinkFromAssets = await fs.unlinkSync('assets/files/' + uploadedFiles[0].filename);
                            }
                        }
                        if (readExcel && !readExcel.length || typeof readExcel[0] === 'string') {
                            return res.ok(readExcel, sails.config.message.VEHICLE_FAILED_CREATED);
                        }

                        return res.ok(readExcel, sails.config.message.VEHICLE_CREATED);
                    }
                });
        } catch (e) {
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async vehicleDetailIotLogTrack(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let record = await Vehicle.findOne({ id: params.id }).select(['imei']);
            if (record && record.id) {
                let IOTLogTrack = await IOTCommandCallbackTrack.find({
                    where: {
                        imei: record.imei,
                    },
                    limit: 10,
                    sort: 'createdAt DESC'
                })
                record.IOTLogTrack = IOTLogTrack;
                record.IOTLogTrackCount = await IOTCommandCallbackTrack.count({ imei: record.imei })
                    .meta({ enableExperimentalDeepTargets: true });

                return res.ok(record, sails.config.message.OK, modelName);
            }

            return res.ok({}, sails.config.message.VEHICLE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async vehicleDetailLastRides(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let record = await Vehicle.findOne({ id: params.id }).select(['id']);
            if (record && record.id) {
                record.lastRides = await RideBooking
                    .find({
                        where: {
                            vehicleId: record.id,
                            status: sails.config.RIDE_STATUS.COMPLETED
                        },
                        limit: 3,
                        sort: 'id desc'
                    })
                    .populate('userId', { select: ['firstName', 'lastName', 'name'] })
                    .populate('vehicleId', { select: ['name', 'registerId', 'batteryLevel'] })
                    .meta({ enableExperimentalDeepTargets: true });

                return res.ok(record, sails.config.message.OK, modelName);
            }

            return res.ok({}, sails.config.message.VEHICLE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async activeDeactive(req, res) {
        let params = req.allParams();
        try {
            // get filter

            if (!params.ids || !_.has(params, 'isActive')) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);

            }
            console.log('   P A R A M S   ', params);
            let updatedVehicle = await Vehicle.update({ id: params.ids })
                .set({ isActive: params.isActive, updatedBy: params.updatedBy })
                .fetch();
                
            if (updatedVehicle) {
                if(!params.isActive){
                    await RideBookingService.stopeRideOnDeActiveVehicle({vehicleIds : params.ids});    
                }
                return res.ok(updatedVehicle, sails.config.message.VEHICLE_UPDATED);
            }

            return res.notFound({}, sails.config.message.VEHICLE_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async allActiveDeactive(req, res) {
        let params = req.allParams();
        try {
            // get filter

            if (!_.has(params, 'isActive')) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);

            }
            console.log('   P A R A M S   ', params);
            let updatedVehicle = await Vehicle.update({})
                .set({ isActive: params.isActive, updatedBy: params.updatedBy })
                .fetch();
            if (updatedVehicle) {
                if(!params.isActive){
                    params.ids = _.map(updatedVehicle, 'id');
                    await RideBookingService.stopeRideOnDeActiveVehicle({vehicleIds : params.ids});    
                }
                return res.ok(updatedVehicle, sails.config.message.VEHICLE_UPDATED);

            }

            return res.notFound({}, sails.config.message.VEHICLE_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async allRideStop(req, res) {
        let params = req.allParams();
        try {
            // get filter
            let obj = {
                status: [
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
                let response = {};
                if (ride.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
                    response = await RideBookingService.cancelRide(ride, null, sails.config.IS_AUTO_DEDUCT, true);
                } else {
                    response = await RideBookingService.stopRideForceFully(ride, null, sails.config.IS_AUTO_DEDUCT, true);
                }
            }
            return res.ok({}, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
};
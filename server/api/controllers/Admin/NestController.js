const modelName = "nest";

const NestService = require(`${sails.config.appPath}/api/services/nest`);
const VehicleService = require(`${sails.config.appPath}/api/services/vehicle`);
const TaskService = require(`${sails.config.appPath}/api/services/task`);
const GeoService = require(`${sails.config.appPath}/api/services/geoService`);


module.exports = {
    async paginate(req, res) {
        try {
            let params = req.allParams();
            if (!params || !params.filter) {
                params = { filter: {} };
            }
            params.filter.isDeleted = false;
            // get filter
            let filter = await common.getFilter(params);
            let recordsList = await Nest.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let nestList = await Nest.find(filter.where);
            if (!nestList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = { list: recordsList, nestList: nestList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Nest.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async add(req, res) {
        try {
            let params = req.allParams();
            let createdRecord;
            if (
                !params.currentLocation ||
                !params.currentLocation.coordinates
            ) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let option = {
                params: params,
                modelName: modelName,
            };
            await commonValidator.validateCreateParams(option);
            if (params.currentLocation.shapeType !== sails.config.SHAPE_TYPE.CIRCLE) {
                await GeoService.intersectNest(params.currentLocation.coordinates);
                await GeoService.validateNestWithinZone(params.currentLocation.coordinates);
            }
            // await NestService.checkNestInsideZone(
            //     params.currentLocation,
            //     "5e9e862d2a7b7827c46944c9" || params.zoneId
            // );
            createdRecord = await sails.models[modelName]
                .create(params)
                .fetch();
            if (createdRecord.currentLocation.type === 'Polygon' && !sails.config.HAS_POLYGON_NEST) {
                sails.config.HAS_POLYGON_NEST = true;
            } else if (createdRecord.currentLocation.type === 'Point' && !sails.config.HAS_CIRCLE_NEST) {
                sails.config.HAS_CIRCLE_NEST = true;
            }
            // return res.notFound({}, sails.config.message.NEST_NOT_FOUND);
            return res.ok(createdRecord, sails.config.message.NEST_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName,
            };
            await commonValidator.validateUpdateParams(option);
            let paramsToUpdate = _.omit(params, "id");
            if (params.currentLocation.shapeType !== sails.config.SHAPE_TYPE.CIRCLE) {
                await GeoService.intersectNest(params.currentLocation.coordinates, params.id);
                await GeoService.validateNestWithinZone(params.currentLocation.coordinates);
            }
            // todo-den
            let updatedRecord = await Nest.update({
                id: params.id,
            }).set(paramsToUpdate, { updatedBy: params.updatedBy })
                .fetch();
            if (!updatedRecord || updatedRecord.length === 0) {
                return res.notFound({}, sails.config.message.NEST_NOT_FOUND);
            }

            return res.ok({}, sails.config.message.NEST_UPDATED);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // find record
            let record = await Nest.findOne({ id: params.id });
            // .populate('userId', { select: ['name'] });

            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.NEST_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let nest = await Nest.findOne({ id: params.id });
            if (!nest) {
                return res.notFound({}, sails.config.message.NEST_NOT_FOUND);
            }

            // todo:divya
            // method to implement: await NestService.canDeleteNest(params.id);
            // check if someone's task is IN PROGRESS for that nest

            let vehiclesToBeRetained = await Vehicle.find({
                nestId: params.id,
            }).select(["id"]);
            let vehicleIds = _.map(vehiclesToBeRetained, (record) => record.id);
            console.log("trying to delete -> vehicleIds", vehicleIds);
            await VehicleService.assignOrRetainVehicleToNest(
                vehicleIds,
                null,
                req.user.id,
                "Vehicle is Retain from the nest!"
            );
            await NestService.deleteNestTrackByNestId(params.id);
            await TaskService.deleteTasksByNestId(params.id);
            let deletedRecord = await NestService.deleteNestById(params.id);

            if (deletedRecord) {
                return res.ok(deletedRecord, sails.config.message.NEST_DELETED);
            }

            return res.notFound({}, sails.config.message.NEST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async assignVehicle(req, res) {
        try {
            let params = req.allParams();
            let fields = ["vehicleId", "nestId"];
            commonValidator.checkRequiredParams(fields, params);

            let nest = await Nest.findOne({ id: params.nestId });
            if (!nest.isNestCapacity) {
                return res.ok({}, sails.config.message.NEST_CAPACITY_OVER);
            }

            let vehicles = await VehicleService.assignOrRetainVehicleToNest(
                params.vehicleId,
                params.nestId,
                req.user.id,
                "Vehicle is Assign to the nest!"
            );
            if (!vehicles.length) {
                return res.ok(
                    vehicles,
                    sails.config.message.VEHICLE_NOT_AVAILABLE_TO_ASSIGN
                );
            }

            return res.ok(
                vehicles,
                sails.config.message.ASSIGN_VEHICLE_SUCCESS
            );
        } catch (error) {
            console.log(error);
            return res.serverError(null, error);
        }
    },

    async retainVehicle(req, res) {
        try {
            let params = req.allParams();
            let fields = ["vehicleId"];
            commonValidator.checkRequiredParams(fields, params);

            let vehicles = await VehicleService.assignOrRetainVehicleToNest(
                params.vehicleId,
                null,
                req.user.id,
                "Vehicle is Retain from the nest!"
            );
            if (!vehicles.length) {
                return res.ok(
                    vehicles,
                    sails.config.message.VEHICLE_NOT_AVAILABLE_TO_RETAIN
                );
            }

            return res.ok(
                vehicles,
                sails.config.message.RETAIN_VEHICLE_SUCCESS
            );
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
};

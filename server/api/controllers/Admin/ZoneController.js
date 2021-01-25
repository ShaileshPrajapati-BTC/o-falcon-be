const modelName = 'Zone';
const ZoneService = require(`${sails.config.appPath}/api/services/zone`);
const GeoService = require(`${sails.config.appPath}/api/services/geoService`);

module.exports = {
    async add(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            let createdRecord;
            if (!params.vehicleTypes.length) {
                return res.badRequest(null, sails.config.message.IS_REQUIRED);
            }
            if (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE) {
                params.franchiseeId = loggedInUser.id;
            }
            if (loggedInUser.type === sails.config.USER.TYPE.DEALER) {
                params.dealerId = loggedInUser.id;
            }
            if (params.dealerId || (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE && params.franchiseeId)) {
                if (!params.fleetType) {
                    params.fleetType = sails.config.USER.FLEET_TYPE.GENERAL;
                }
            }
            if ((!sails.config.IS_FRANCHISEE_ENABLED && params.franchiseeId) || params.franchiseeId == '') {
                delete params.franchiseeId;
            }
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateCreateParams(option);
            if (
                params.boundary.shapeType !== sails.config.SHAPE_TYPE.CIRCLE &&
                !sails.config.IS_FRANCHISEE_ENABLED
            ) {
                await GeoService.intersectZone(params.boundary.coordinates);
            }
            createdRecord = await Zone.create(params).fetch();
            if (createdRecord.boundary.type === 'Polygon' && !sails.config.HAS_POLYGON_ZONE) {
                sails.config.HAS_POLYGON_ZONE = true;
            } else if (createdRecord.boundary.type === 'Point' && !sails.config.HAS_CIRCLE_ZONE) {
                sails.config.HAS_CIRCLE_ZONE = true;
            }
            let fareData = [];
            for (let vehicleType of params.vehicleTypes) {
                let fareObj = {
                    vehicleType: vehicleType,
                    zoneId: createdRecord.id
                }
                fareObj.statusTrack = ZoneService.getStatusTrack(req.user.id, fareObj);
                fareData.push(fareObj);
            }
            await FareManagement.createEach(fareData);

            return res.ok(createdRecord, sails.config.message.ZONE_CREATED);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let loggedInUser = req.user;
            if (!params.filter) {
                params.filter = {};
            }
            if (sails.config.USER.ADMIN_USERS.includes(loggedInUser.type)) {
                params.filter.dealerId = null;
            }
            params.filter.isDeleted = false;

            let filter = await common.getFilter(params);
            let recordsList = await Zone.find(filter)
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] })
                .meta({ enableExperimentalDeepTargets: true });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let statusTracks = _.map(recordsList, 'statusTrack');
            statusTracks = _.compact(statusTracks);
            statusTracks = _.uniq(statusTracks);
            statusTracks = _.flatten(statusTracks);

            let users = await User.find({
                where: { type: { "!=": sails.config.USER.TYPE.CUSTOMER } },
                select: ['name']
            });
            for (let recordKey in recordsList) {
                if (!recordsList[recordKey]) {
                    continue;
                }
                for (let trackKey in recordsList[recordKey].statusTrack) {
                    if (!recordsList[recordKey].statusTrack[trackKey]) {
                        continue;
                    }
                    let user = _.find(users, { id: recordsList[recordKey].statusTrack[trackKey].userId });
                    recordsList[recordKey].statusTrack[trackKey].user = user;
                }
            }
            let zoneIds = _.map(recordsList, 'id');
            let nestArr = [];
            if (sails.config.IS_NEST_ENABLED) {
                zoneIds.map(async (id) => {
                    let nestList = await Nest.find({ zoneId: id, isDeleted: false });
                    nestList.map(nest => {
                        nestArr.push(nest);
                    })
                })
            }

            let response = { list: recordsList, nestList: nestArr };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Zone.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });
            response.zones = await Zone.find(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateUpdateParams(option);

            // params.fleetType = params.fleetType ? [params.fleetType] : [sails.config.USER.FLEET_TYPE.PRIVATE];
            let paramsToUpdate = _.omit(params, 'id');
            params.viewFilter.id = params.id;
            let record = await Zone.findOne(params.viewFilter);
            if (!record && !record.id) {
                return res.ok({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
            }
            if (!sails.config.IS_FRANCHISEE_ENABLED && paramsToUpdate.franchiseeId) {
                delete paramsToUpdate.franchiseeId;
            }
            if (
                params.boundary &&
                params.boundary.coordinates &&
                params.boundary.coordinates !== record.boundary.coordinates &&
                params.boundary.shapeType !== sails.config.SHAPE_TYPE.CIRCLE &&
                !sails.config.IS_FRANCHISEE_ENABLED
            ) {
                await GeoService.intersectZone(params.boundary.coordinates, record.id);
                if (sails.config.IS_NEST_ENABLED) {
                    await GeoService.checkNestData(params.boundary.coordinates, record);
                }
            } else {
                delete params.boundary;
            }

            params.updateFilter.id = params.id;
            let updatedRecord = await Zone
                .update(params.updateFilter)
                .set(paramsToUpdate, { updatedBy: params.updatedBy })
                .fetch();
            if (!updatedRecord || !updatedRecord.length) {
                return res.notFound({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
            }
            updatedRecord = updatedRecord[0];
            let createNewFare = [];
            for (let vehicleType of sails.config.IOT_VEHICLE_TYPE) {
                let fareCreateObj = {
                    vehicleType: vehicleType,
                    zoneId: params.id,
                }
                fareCreateObj.statusTrack = ZoneService.getStatusTrack(req.user.id, fareCreateObj);
                let fare = await FareManagement.findOne({ zoneId: updatedRecord.id, vehicleType: vehicleType });
                if (!fare) {
                    if (updatedRecord.vehicleTypes.findIndex(type => type == vehicleType) > -1) {
                        createNewFare.push(fareCreateObj);
                    }
                } else {
                    if (updatedRecord.vehicleTypes.findIndex(type => type == vehicleType) < 0) {
                        await FareManagement.update({ id: fare.id }).set({
                            isDeleted: true,
                            statusTrack: ZoneService.getStatusTrack(req.user.id, { isDeleted: true }, fare)
                        });
                    } else if (fare.isDeleted) {
                        await FareManagement.update({ id: fare.id }).set({
                            isDeleted: false,
                            statusTrack: ZoneService.getStatusTrack(req.user.id, { isDeleted: false }, fare)
                        });
                    }
                }
            }
            if (createNewFare && createNewFare.length) {
                await FareManagement.createEach(createNewFare);
            }

            return res.ok(updatedRecord, sails.config.message.ZONE_UPDATED, modelName);
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
            // find record
            params.viewFilter.id = params.id;
            let record = await Zone.findOne(params.viewFilter)
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] });
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK, modelName);
            }

            return res.ok({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    // async setIsDefault(req, res) {
    //     try {
    //         // get filter
    //         let params = req.allParams();
    //         let existingDefaultRecord = await Zone
    //             .findOne({ id: params.id, isDefault: true });
    //         if (existingDefaultRecord && existingDefaultRecord.id) {
    //             await Zone.update(
    //                 { id: existingDefaultRecord.id },
    //                 { isDefault: false }
    //             ).fetch();
    //         }

    //         let updatedRecord = await Zone
    //             .update({ id: params.id }, { isDefault: true, updatedBy: params.updatedBy })
    //             .fetch();
    //         if (updatedRecord) {
    //             return res.ok(updatedRecord[0],
    //                 sails.config.message.ZONE_AND_FARE_MANAGEMENT_UPDATED, modelName
    //             );
    //         }

    //         return res.notFound({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
    //     } catch (err) {
    //         console.log(err);

    //         return res.serverError(null, err);
    //     }
    // },

    async zoneList(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            let filter = {};
            // if (params.franchiseeId) {
            //     filter.franchiseeId = params.franchiseeId;
            // }
            filter = params.viewFilter;
            if (sails.config.USER.ADMIN_USERS.includes(loggedInUser.type)) {
                filter.dealerId = null;
            }
            // if ('franchiseeId' in params && params.franchiseeId === null) {
            //     filter.franchiseeId = null;
            // }
            filter.isDeleted = false;
            let recordsList = await Zone.find(filter)
                .select(['id', 'name', 'isActive'])
                .sort('isActive desc')
                .meta({ enableExperimentalDeepTargets: true });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            return res.ok(recordsList, sails.config.message.OK);
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

            let zone = await Zone.findOne({ id: params.id });
            if (!zone) {
                return res.notFound({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
            }
            if (sails.config.IS_NEST_ENABLED) {
                await ZoneService.deleteZoneRelatedNests(params.id, req.user.id);
            }

            let deletedRecord = await Zone.update({ id: params.id }, {
                isDeleted: true
            }).fetch();

            if (deletedRecord && deletedRecord.length) {
                await FareManagement.update({ zoneId: params.id }).set({
                    isDeleted: true,
                    statusTrack: ZoneService.getStatusTrack(req.user.id, { isDeleted: true })
                });

                return res.ok(deletedRecord[0], sails.config.message.ZONE_DELETED);
            }

            return res.notFound({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

};

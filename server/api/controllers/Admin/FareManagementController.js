const modelName = "FareManagement";
const ZoneService = require(`${sails.config.appPath}/api/services/zone`);

// const ZoneService = require(`${sails.config.appPath}/api/services/zone`);

module.exports = {
    async add(req, res) {
        try {
            let params = req.allParams();
            let createdRecord;
            if (!params.vehicleType) {
                return res.badRequest(null, sails.config.message.IS_REQUIRED);
            }
            for (let vehicleType of params.vehicleType) {
                let zoneData = params;
                zoneData.vehicleType = vehicleType;
                zoneData = JSON.parse(JSON.stringify(zoneData));
                let option = {
                    params: zoneData,
                    modelName: modelName,
                };
                await commonValidator.validateCreateParams(option);
                zoneData.statusTrack = ZoneService.getStatusTrack(
                    req.user.id,
                    zoneData
                );
                createdRecord = await sails.models[modelName]
                    .create(zoneData)
                    .fetch();
            }
            if (
                createdRecord.boundary.type === "Polygon" &&
                !sails.config.HAS_POLYGON_ZONE
            ) {
                sails.config.HAS_POLYGON_ZONE = true;
            } else if (
                createdRecord.boundary.type === "Point" &&
                !sails.config.HAS_CIRCLE_ZONE
            ) {
                sails.config.HAS_CIRCLE_ZONE = true;
            }

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
                params.filter = { isDeleted: false };
            }
            if (params.viewFilter && params.viewFilter.dealerId) {
                params.filter.dealerId = params.viewFilter.dealerId;
            }
            if (params.viewFilter && params.viewFilter.franchiseeId) {
                params.filter.franchiseeId = params.viewFilter.franchiseeId;
            }
            if (sails.config.USER.ADMIN_USERS.includes(loggedInUser.type)) {
                params.filter.dealerId = null;
            }
            params.filter.isDeleted = false;
            params.filter.vehicleTypes = 3;
            let filter = await common.getFilter(params);
            let recordsList = await Zone.find(filter).select(['name']);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            await Promise.all(
                _.map(recordsList, async (record) => {
                    let fares = await FareManagement.find({
                        vehicleType:3,
                        zoneId: record.id,
                        isDeleted: false
                    });
                    let statusTracks = _.map(fares, "statusTrack");
                    statusTracks = _.compact(statusTracks);
                    statusTracks = _.uniq(statusTracks);
                    statusTracks = _.flatten(statusTracks);

                    let users = await User.find({
                        where: {
                            type: { "!=": sails.config.USER.TYPE.CUSTOMER },
                        },
                        select: ["name"],
                    });
                    for (let recordKey in fares) {
                        if (!fares[recordKey]) {
                            continue;
                        }
                        for (let trackKey in fares[recordKey].statusTrack) {
                            if (!fares[recordKey].statusTrack[trackKey]) {
                                continue;
                            }
                            let user = _.find(users, {
                                id:
                                    fares[recordKey].statusTrack[trackKey]
                                        .userId,
                            });
                            fares[recordKey].statusTrack[trackKey].user = user;
                        }
                    }
                    record.fares = fares;
                })
            );

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Zone.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });

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
                modelName: modelName,
            };
            await commonValidator.validateUpdateParams(option);
            let paramsToUpdate = _.omit(params, "id");
            let record = await FareManagement.findOne({ id: params.id });

            paramsToUpdate.statusTrack = ZoneService.getStatusTrack(
                req.user.id,
                paramsToUpdate,
                record
            );
            let updatedRecord = await FareManagement.update({ id: params.id })
                .set(paramsToUpdate, { updatedBy: params.updatedBy })
                .fetch();
            if (updatedRecord) {
                return res.ok(
                    updatedRecord[0],
                    sails.config.message.ZONE_UPDATED
                );
            }

            return res.notFound({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
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
            let fareObj = await FareManagement.findOne({ id: params.id }).select(['zoneId']);
            let record = await Zone.findOne({ id: fareObj.zoneId }).select(['name']);
            let fares = await FareManagement.find({
                zoneId: fareObj.zoneId,
            });
            let statusTracks = _.map(fares, "statusTrack");
            statusTracks = _.compact(statusTracks);
            statusTracks = _.uniq(statusTracks);
            statusTracks = _.flatten(statusTracks);

            let users = await User.find({
                where: {
                    type: { "!=": sails.config.USER.TYPE.CUSTOMER },
                },
                select: ["name"],
            });
            for (let recordKey in fares) {
                if (!fares[recordKey]) {
                    continue;
                }
                for (let trackKey in fares[recordKey].statusTrack) {
                    if (!fares[recordKey].statusTrack[trackKey]) {
                        continue;
                    }
                    let user = _.find(users, {
                        id: fares[recordKey].statusTrack[trackKey].userId,
                    });
                    fares[recordKey].statusTrack[trackKey].user = user;
                }
            }
            record.fares = fares;
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async zoneList(req, res) {
        try {
            // .populate('userId', { select: ['name'] })
            let recordsList = await FareManagement.find({
                isDeleted: false,
            })
                .select(["id", "name", "isActive"])
                .sort("isActive desc")
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

            let zone = await FareManagement.findOne({ id: params.id });
            if (!zone) {
                return res.notFound(
                    {},
                    sails.config.message.ZONE_RECORD_NOT_FOUND
                );
            }
            if (sails.config.IS_NEST_ENABLED) {
                await ZoneService.deleteZoneRelatedNests(params.id, req.user.id);
            }

            let deletedRecord = await FareManagement.update(
                { id: params.id },
                {
                    isDeleted: true,
                }
            ).fetch();

            if (deletedRecord) {
                return res.ok(
                    deletedRecord,
                    sails.config.message.ZONE_AND_FARE_MANAGEMENT_DELETED
                );
            }

            return res.notFound({}, sails.config.message.ZONE_RECORD_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },
};

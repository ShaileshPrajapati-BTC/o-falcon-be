const CommonService = require('./common');
const moment = require('moment');
const UtilService = require("./util");
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    async setNestCapacity(nestId) {
        let nest = await Nest.findOne({ id: nestId });

        if (nest) {
            if (nest.capacity <= nest.totalVehicles) {
                await Nest.update({ id: nestId }, { isNestCapacity: false });
            } else if (nest.capacity >= nest.totalVehicles) {
                await Nest.update({ id: nestId }, { isNestCapacity: true });
            }
        }
    },

    async deleteNestTrackByNestId(nestId) {
        try {
            let deletedNestTracks = await NestTrack.update(
                {
                    or: [{ nestId: nestId }, { previousNestId: nestId }],
                    isDeleted: false,
                },
                {
                    isDeleted: true,
                }
            ).fetch();
            if (deletedNestTracks && deletedNestTracks.length >= 0) {
                console.log("deleted nestTrack count ", deletedNestTracks.length);
            }
        } catch (e) {
            console.log("error deleting nestTracks - ", e);
        }
    },

    async deleteNestById(nestId) {
        let deletedRecord = await Nest.update(
            { id: nestId, isDeleted: false },
            {
                isDeleted: true,
            }
        ).fetch();
        if (deletedRecord) {
            return deletedRecord;
        }
        return null;
    },

    async findNearestNest(params, limit) {
        try {
            let matchParams = {
                isDeleted: false,
                isActive: true,
                isClaimed: false
            };

            if (params.type) {
                matchParams.type = { $in: params.type };
            }
            if (params.capacity) {
                matchParams.capacity = { $gte: params.capacity };
            }
            if (params.totalVehicles) {
                matchParams.totalVehicles = { $lte: params.capacity };
            }
            if (params.isClaimed) {
                matchParams.isClaimed = params.isClaimed;
            }
            if (params.isClaimedBy) {
                matchParams.isClaimedBy = ObjectId(params.isClaimedBy);
            }
            let query = [];
            query.push(
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: params.currentLocation
                        },
                        distanceField: 'distance',
                        distanceMultiplier: 0.001,
                        spherical: true
                    }
                },
                {
                    $redact: {
                        $cond: {
                            if: { $lt: ['$distance', sails.config.NEST_BASIC_RADIUS] },
                            then: '$$KEEP',
                            else: '$$PRUNE'
                        }
                    }
                },
                {
                    $match: matchParams
                },
                {
                    $group: {
                        _id: null,
                        list: {
                            $push: "$$ROOT",
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                { $sort: { distance: 1 } },
                { $limit: limit ? limit : 5 }
            );
            let matchedNest = await CommonService.runAggregateQuery(
                query,
                'nest'
            );
            if (!matchedNest || !matchedNest.length) {
                return false;
            }
            delete matchedNest[0]._id;
            for (let nest of matchedNest[0].list) {
                nest['id'] = (nest['_id']).toString();
                delete nest['_id'];
                nest['zoneId'] = (nest['zoneId']).toString();
                nest['addedBy'] = (nest['addedBy']).toString();
                if (nest['updatedBy']) {
                    nest['updatedBy'] = (nest['updatedBy']).toString();
                }
            }
            matchedNest = { list: matchedNest[0].list, count: matchedNest[0].count };

            return matchedNest;
        } catch (e) {
            throw new Error(e);
        }
    },

    async claimNest(params) {
        let response = { data: {} }
        if (!params || !params.nestId) {
            return Object.assign({}, response, sails.config.message.BAD_REQUEST);
        }
        let checkAlreadyClaimNest = await Nest.findOne({ isClaimed: true, isClaimedBy: params.userId });
        if (checkAlreadyClaimNest) {
            return Object.assign({}, response, sails.config.message.USER_ALREADY_CLAIM_NEST);
        }
        let nest = await Nest.findOne({
            where: {
                id: params.nestId,
                isActive: true,
                capacity: { '>=': 0 },
                isNestCapacity: true,
                isDeleted: false
            }
        });

        let taskType = [];

        let userTask = await Task.find({
            where: {
                taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                isAssigned: true,
                assignedTo: params.userId,
                isDeleted: false
            }
        });
        if (!userTask || !userTask.length > 0) {
            return Object.assign({}, response, sails.config.message.CLAIM_NEST_TASK_NOT_FOUND);
        }

        if (!nest) {
            return Object.assign({}, response, sails.config.message.NEST_NOT_FOUND);
        }
        let checkNest = await this.checkCorrectNest(nest.type, params.userId);
        console.log("checkNest-----------------------", checkNest);
        if (checkNest.status !== 200) {
            return Object.assign({}, response, checkNest);
        }
        if (nest.isClaimed) {
            return Object.assign({}, response, sails.config.message.NEST_ALREADY_CLAIMED);
        }
        if (nest.capacity <= nest.totalVehicles) {
            return Object.assign({}, response, sails.config.message.NEST_CAPACITY_OVER);
        }
        let date = moment().toISOString();
        let updateObj = {
            isClaimed: true,
            isClaimedBy: params.userId,
            nestClaimTimeValue: sails.config.NEST_CLAIM_TIME,
            nestClaimTimeType: sails.config.NEST_CLAIM_TIME_TYPES[sails.config.NEST_CLAIM_TIME_TYPE],
            claimStartDateTime: date,
            claimEndDateTime: UtilService.minutesToAddDate(date, sails.config.NEST_CLAIM_TIME)
        };

        let updatedNest = await Nest.update({ id: params.nestId }).set(updateObj).fetch();

        if (updatedNest && updatedNest.length) {
            await socketEvents.nestAlreadyClaimed({ id: updatedNest[0].id });
            response.data = updatedNest[0];

            return Object.assign({}, response, sails.config.message.CLAIM_NEST_SUCCESS);
        }

        return Object.assign({}, sails.config.message.CLAIM_NEST_FAIL);
    },

    async releaseNest(params) {
        let response = { data: {} }
        if (!params || !params.nestId) {
            return Object.assign({}, response, sails.config.message.BAD_REQUEST);
        }

        let nest = await Nest.findOne({
            where: {
                id: params.nestId,
                isActive: true,
                isClaimed: true,
                isDeleted: false
            }
        });

        if (!nest) {
            return Object.assign({}, response, sails.config.message.NEST_NOT_FOUND);
        }

        let updateObj = {
            isClaimed: false,
            isClaimedBy: null,
            nestClaimTimeValue: 0,
            nestClaimTimeType: sails.config.NEST_CLAIM_TIME_TYPES[sails.config.NEST_CLAIM_TIME_TYPE]
        };

        let updatedNest = await Nest.update({ id: params.nestId }).set(updateObj).fetch();

        if (updatedNest && updatedNest.length) {

            response.data = updatedNest[0];
            return Object.assign({}, response, sails.config.message.RELEASE_NEST_SUCCESS);
        }

        return Object.assign({}, sails.config.message.RELEASE_NEST_FAIL);
    },

    async cancelClaimedNest(params) {
        let response = { data: {} }
        if (!params || !params.nestId) {
            return Object.assign({}, response, sails.config.message.BAD_REQUEST);
        }

        let nest = await Nest.findOne({ id: params.nestId });
        if (!nest) {
            return Object.assign({}, response, sails.config.message.NEST_NOT_FOUND);
        }

        if (nest.isClaimedBy !== params.userId) {
            return Object.assign({}, response, sails.config.message.UNAUTHORIZED_NEST);
        }

        let updatedNest = await Nest.update({ id: params.nestId })
            .set({
                isClaimed: false,
                isClaimedBy: null,
                nestClaimTimeValue: 0
            }).fetch();
        if (updatedNest && updatedNest.length) {
            response.data = updatedNest[0];
            return Object.assign({}, response, sails.config.message.CANCEL_CLAIM_NEST_SUCCESS);
        }

        return Object.assign({}, response, sails.config.message.CANCEL_CLAIM_NEST_FAIL);
    },

    async checkVehicleInNest(currentLocation, params) {
        let matchParams = {
            isDeleted: false,
            isActive: true,
        };
        if (params.isClaimedBy) {
            matchParams.isClaimed = true;
            matchParams.isClaimedBy = ObjectId(params.isClaimedBy);
        }
        let query = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: currentLocation
                    },
                    distanceField: 'distance',
                }
            },
            {
                $redact: {
                    $cond: {
                        if: { $lt: ['$distance', '$currentLocation.radius'] },
                        then: '$$KEEP',
                        else: '$$PRUNE'
                    }
                }
            },
            {
                $match: matchParams
            }
        ];
        let matchedNest = await common.runAggregateQuery(query, 'nest');
        if (!matchedNest || !matchedNest.length > 0) {
            return false;
        }

        matchedNest = matchedNest[0];
        matchedNest['id'] = (matchedNest['_id']).toString();
        delete matchedNest['_id'];
        matchedNest['zoneId'] = (matchedNest['zoneId']).toString();
        matchedNest['addedBy'] = (matchedNest['addedBy']).toString();
        if (matchedNest['updatedBy']) {
            matchedNest['updatedBy'] = (matchedNest['updatedBy']).toString();
        }
        matchedNest['isClaimedBy'] = (matchedNest['isClaimedBy']).toString();

        return matchedNest;
    },

    async checkCorrectNest(type, userId) {
        let allTask = await Task.find({
            where: {
                taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                isAssigned: true,
                assignedTo: userId,
                isDeleted: false
            }
        });
        let isRepair = false;
        let isRider = false;
        if (allTask && allTask.length > 0) {
            for (let task of allTask) {
                if (
                    sails.config.TASK.TASK_TYPE.LEVEL_1.MOVE === task.taskType ||
                    sails.config.TASK.TASK_TYPE.LEVEL_2.CHARGE === task.taskType
                ) {
                    isRider = true;
                } else if (sails.config.TASK.TASK_TYPE.LEVEL_1.DAMAGE_MOVE === task.taskType ||
                    sails.config.TASK.TASK_TYPE.LEVEL_2.DAMAGE_CHARGE === task.taskType
                ) {
                    isRepair = true;
                }
            }
        }
        console.log("isRider--------------------------", isRider);
        console.log("isRepair--------------------------", isRepair);
        if (isRepair && isRider) {

            return { status: 200 };
        }
        if ((isRepair) && (type !== sails.config.NEST_TYPE.REPAIR)) {
            console.log("------------------1. Please select Repair Nest------------------");
            return Object.assign({}, sails.config.message.CLAIM_REPAIR_NEST);
        } else if ((isRider) && (type !== sails.config.NEST_TYPE.RIDER)) {
            console.log("------------------2. Please select Rider Nest------------------");
            return Object.assign({}, sails.config.message.CLAIM_RIDER_NEST);
        }

        return { status: 200 };
    },

    async userClaimedNest(userId) {
        let tasks = await Task.find({
            taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
            isDeleted: false,
            isAssigned: true,
            assignedTo: userId
        });
        const currentClaimNest = await Nest.findOne({
            isClaimedBy: userId,
            isClaimed: true,
            isDeleted: false
        });

        let isRepair = false;
        let isRider = false;
        if (tasks && tasks.length > 0) {
            for (let task of tasks) {
                if (
                    sails.config.TASK.TASK_TYPE.LEVEL_1.MOVE === task.taskType ||
                    sails.config.TASK.TASK_TYPE.LEVEL_2.CHARGE === task.taskType
                ) {
                    isRider = true;
                } else if (sails.config.TASK.TASK_TYPE.LEVEL_1.DAMAGE_MOVE === task.taskType ||
                    sails.config.TASK.TASK_TYPE.LEVEL_2.DAMAGE_CHARGE === task.taskType
                ) {
                    isRepair = true;
                }

                if (isRepair && isRider) {

                    return currentClaimNest;
                } else {
                    if ((isRepair) && (type !== sails.config.NEST_TYPE.REPAIR)) {
                        if (currentClaimNest) {
                            await Nest.update({
                                id: currentClaimNest.id
                            }).set({
                                isClaimedBy: null,
                                isClaimed: false
                            }).fetch();
                        }
                        
                        return {};
                    } else if ((isRider) && (type !== sails.config.NEST_TYPE.RIDER)) {
                        if (currentClaimNest) {
                            await Nest.update({
                                id: currentClaimNest.id
                            }).set({
                                isClaimedBy: null,
                                isClaimed: false
                            }).fetch();
                        }

                        return {};
                    }
                }
            }
        } else {
            if (currentClaimNest) {
                await Nest.update({
                    id: currentClaimNest.id
                }).set({
                    isClaimedBy: null,
                    isClaimed: false
                }).fetch();

                return {};
            }

            return {};
        }



        return currentClaimNest;
    }
};

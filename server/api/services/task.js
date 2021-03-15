// const NotificationService = require("./notification");
const UtilService = require("./util");
const SocketEvents = require(`./socketEvents`);
const moment = require('moment');

const ObjectId = require("mongodb").ObjectID;

module.exports = {
    async autoCreateTaskForDamage(option) {
        try {
            let obj = {
                taskType: sails.config.TASK.TASK_TYPE.VEHICLE_REPAIR,
                taskHeading:
                    sails.config.TASK.TASK_HEADING[
                    sails.config.TASK.TASK_TYPE.VEHICLE_REPAIR
                    ],
                module: sails.config.modules.vehicle,
                referenceId: option.vehicleId,
                images: option.images,
            };

            let addTask = await Task.create(obj);
            if (addTask) {
                let vehicle = await Vehicle.findOne({ id: option.vehicleId });
                // let opt = {
                //     title: addTask.taskType,
                //     vehicleId: option.vehicleId,
                //     status: sails.config.NOTIFICATION.STATUS.SEND,
                //     type: sails.config.NOTIFICATION.ADMIN_ALERTS.DAMAGE,
                //     message: addTask.taskHeading + " Task has been Created for Car " +
                //         vehicle.name + ", Number plate is :" + vehicle.numberPlate + ". Please Assign Technician",
                //     notificationType: sails.config.NOTIFICATION.USER_TYPE.ADMIN,
                //     userId: option.user,
                //     vehicleType: vehicle.category
                // };
                // await Notification.create(opt).fetch();
                // await NotificationService.notifyAdmin({ data: opt.message });
            }
        } catch (e) {
            throw e;
        }
    },

    async dashboardUnassignedCount(params) {
        try {
            let matchParams = {
                isDeleted: false,
                assignedTo: { $exists: false },
            };

            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }
            let count = 0;
            //
            let match = [
                {
                    $match: matchParams,
                },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;
            let result = await DbService.aggregate("task", filter);
            if (result && result.length) {
                let resultCount = _.find(result, { _id: null });
                if (resultCount && resultCount.count) {
                    count = resultCount.count;
                }
            }

            return count;
        } catch (e) {
            throw e;
        }
    },

    async dashboardTotalTask(params) {
        try {
            let count = 0;

            let matchParams = { isDeleted: false };

            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }

            let match = [
                { $match: matchParams },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;

            let result = await DbService.aggregate("task", filter);
            if (result && result.length) {
                let resultCount = _.find(result, { _id: null });
                if (resultCount && resultCount.count) {
                    count = resultCount.count;
                }
            }

            return count;
        } catch (e) {
            throw e;
        }
    },

    async dashboardInProgressTask(params) {
        try {
            let count = 0;
            let matchParams = {
                isDeleted: false,
                taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
            };

            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }
            let match = [
                { $match: matchParams },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;
            let result = await DbService.aggregate("task", filter);
            if (result && result.length) {
                let resultCount = _.find(result, { _id: null });
                if (resultCount && resultCount.count) {
                    count = resultCount.count;
                }
            }

            return count;
        } catch (e) {
            throw e;
        }
    },

    async dashboardOverDueTask(params) {
        try {
            let matchParams = { isDeleted: false, isOverDue: true };

            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }
            let count = 0;

            let match = [
                { $match: matchParams },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;
            let result = await DbService.aggregate("task", filter);
            if (result && result.length) {
                let resultCount = _.find(result, { _id: null });
                if (resultCount && resultCount.count) {
                    count = resultCount.count;
                }
            }

            return count;
        } catch (e) {
            throw e;
        }
    },

    async dashboardTaskByUser(params) {
        try {
            //
            let matchParams = {
                isDeleted: false,
                assignedTo: { $exists: true },
            };

            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }
            let match = [
                { $match: matchParams },
                { $unwind: "$assignedTo" },
                {
                    $group: {
                        _id: "$assignedTo",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;
            let results = await DbService.aggregate("task", filter);
            if (results && results.length) {
                await Promise.all(
                    _.map(results, async function (result) {
                        result.name = "";
                        if (result && result._id) {
                            let user = await User.findOne({
                                where: { id: result._id.toString() },
                                select: ["firstName", "lastName"],
                            });
                            if (user && user.id) {
                                result.name =
                                    user.firstName + " " + user.lastName;
                            }
                        }
                    })
                );
            }

            return results;
        } catch (e) {
            throw e;
        }
    },

    async dashboardTaskByVehicle(params) {
        try {
            let matchParams = {
                isDeleted: false,
                module: sails.config.modules.vehicle,
                referenceId: { $exists: true },
            };
            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }
            let match = [
                { $match: matchParams },
                {
                    $group: {
                        _id: "$referenceId",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;
            let results = await DbService.aggregate("task", filter);

            if (results && results.length) {
                await Promise.all(
                    _.map(results, async function (result) {
                        result.name = "";
                        if (result && result._id) {
                            let vehicle = await Vehicle.findOne({
                                where: { id: result._id.toString() },
                                select: ["name"],
                            });
                            if (vehicle && vehicle.id) {
                                result.name = vehicle.name;
                            }
                        }
                    })
                );
            }

            return results;
        } catch (e) {
            throw e;
        }
    },

    async dashboardTaskByPriority(params) {
        try {
            let matchParams = { isDeleted: false };
            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }
            let match = [
                { $match: matchParams },
                {
                    $group: {
                        _id: "$priority",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;
            let results = await DbService.aggregate("task", filter);
            if (results && results.length) {
                _.each(results, function (result) {
                    result.name = result._id;
                });
            }
            return results;
        } catch (e) {
            throw e;
        }
    },

    async dashboardTaskByStatus(params) {
        try {
            let matchParams = { isDeleted: false };

            if (
                params.filter &&
                params.filter.dateRange &&
                params.filter.dateRange.from &&
                params.filter.dateRange.to
            ) {
                matchParams.createdAt = {
                    $gte: params.filter.dateRange.from,
                    $lte: params.filter.dateRange.to,
                };
            }
            let match = [
                { $match: matchParams },
                {
                    $group: {
                        _id: "$taskWorkFlow",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ];
            let filter = match;
            let results = await DbService.aggregate("task", filter);

            if (results && results.length) {
                _.each(results, function (result) {
                    result.name = _.invert(sails.config.TASK.WORK_FLOW)[
                        result._id
                    ];
                });
            }
            return results;
        } catch (e) {
            throw e;
        }
    },

    async taskByUser(params) {
        let matchParams = {
            assignedTo: ObjectId(params.userId),
            isDeleted: false,
        };
        if (params.taskType) {
            matchParams.taskType = params.taskType;
        }
        if (params.isOverDue) {
            matchParams.isOverDue = params.isOverDue;
        }
        if (params.taskWorkFlow) {
            matchParams.taskWorkFlow = params.taskWorkFlow;
        }
        if (params.level) {
            matchParams.level = { $in: params.level };
        }

        let match = [
            { $match: matchParams },
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
        ];
        let filter = match;
        let results = await DbService.aggregate("task", filter);
        if (results && results.length) {
            await Promise.all(
                _.map(results[0].list, async function (result) {
                    if (result.referenceId) {
                        let vehicle = await Vehicle.findOne({
                            where: { id: result.referenceId.toString() },
                            select: ["name", "batteryLevel", "markedAs"],
                        });
                        if (vehicle && vehicle.id) {
                            result.referenceId = vehicle;
                        }
                    }
                    return result;
                })
            );
        }

        return results;
    },

    addTime(taskTimeLimitType, taskTimeLimitValue) {
        const timeNow = UtilService.getTimeFromNow();
        let endDateTime;
        switch (taskTimeLimitType) {
            case sails.config.TASK_TIME_LIMIT_TYPE.MINUTES:
                endDateTime = UtilService.addTime(
                    taskTimeLimitValue,
                    timeNow,
                    "minutes"
                );
                break;
            case sails.config.TASK_TIME_LIMIT_TYPE.HOURS:
                endDateTime = UtilService.addTime(
                    taskTimeLimitValue,
                    timeNow,
                    "hours"
                );
                break;
            case sails.config.TASK_TIME_LIMIT_TYPE.DAYS:
                endDateTime = UtilService.addTime(
                    taskTimeLimitValue,
                    timeNow,
                    "days"
                );
                break;
        }

        return endDateTime;
    },

    async sendOverDueNotification(users) {
        let playerIds;
        for (let currentUser of users) {
            playerIds = [];
            // not adding null Ids in playerIds
            if (currentUser.androidPlayerId) {
                playerIds = playerIds.concat(currentUser.androidPlayerId);
            }
            if (currentUser.iosPlayerId) {
                playerIds = playerIds.concat(currentUser.iosPlayerId);
            }
            if (!playerIds.length) {
                continue;
            }
            let message = "Task Overdue!";
            await NotificationService.sendPushNotification({
                playerIds: playerIds,
                content: message,
            });
        }
    },

    async checkUserLevel(level) {
        return sails.config.TASK.LEVEL_STRING[level];
    },

    async taskTypeByLevel(level) {
        let taskType = [];
        for (var key in sails.config.TASK.TASK_TYPE[level]) {
            taskType.push(sails.config.TASK.TASK_TYPE[level][key]);
        }

        return taskType;
    },

    async deleteTasksByNestId(nestId) {
        try {
            let deletedTasks = await Task.update(
                {
                    nestId: nestId,
                    isDeleted: false
                },
                {
                    isDeleted: true,
                }
            ).fetch();
            if (deletedTasks && deletedTasks.length >= 0) {
                console.log("deleted tasksByNestId count ", deletedTasks.length);
            }
        } catch (e) {
            console.log("error deleting tasksByNestId - ", e);
        }
    },

    async userDashboardTask(params) {
        let matchParams = {
            assignedTo: null,
            isDeleted: false,
        };
        if (params.taskType) {
            matchParams.taskType = params.taskType;
        }
        if (params.isOverDue) {
            matchParams.isOverDue = params.isOverDue;
        }
        if (params.taskWorkFlow) {
            matchParams.taskWorkFlow = params.taskWorkFlow;
        }
        if (params.level) {
            matchParams.level = { $in: params.level };
        }
        if (params.priority) {
            matchParams.priority = params.priority
        }

        let match = [
            { $match: matchParams },
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
        ];
        let filter = match;
        let results = await DbService.aggregate("task", filter);
        if (results && results.length) {
            await Promise.all(
                _.map(results[0].list, async function (result) {
                    if (result.referenceId) {
                        let vehicle = await Vehicle.findOne({
                            where: { id: result.referenceId.toString() },
                            select: ["name", "batteryLevel", "markedAs"],
                        });
                        if (vehicle && vehicle.id) {
                            result.referenceId = vehicle;
                        }
                    }
                    return result;
                })
            );
        }

        return results;
    },

    async userLevelWiseTaskLevel(level) {
        let userLevel = [];
        if (level === sails.config.TASK.TASK_LEVEL.ONE) {
            userLevel = [sails.config.TASK.TASK_LEVEL.ONE];
        } else if (level === sails.config.TASK.TASK_LEVEL.TWO) {
            userLevel = [
                sails.config.TASK.TASK_LEVEL.ONE,
                sails.config.TASK.TASK_LEVEL.TWO
            ];
        } else if (level === sails.config.TASK.TASK_LEVEL.THREE) {
            userLevel = [
                sails.config.TASK.TASK_LEVEL.ONE,
                sails.config.TASK.TASK_LEVEL.TWO,
                sails.config.TASK.TASK_LEVEL.THREE
            ];
        }
        return userLevel;
    },

    async userTaskSummary(userId) {
        let taskSummary = {};
        let inProgressTask = await this.taskByUser({
            userId: userId,
            taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS
        });
        taskSummary.inProgressTotal = (inProgressTask && inProgressTask.length) ? inProgressTask[0].count : 0;
        let completedTask = await this.taskByUser({
            userId: userId,
            taskWorkFlow: sails.config.TASK.WORK_FLOW.COMPLETE
        });
        taskSummary.completedTotal = (completedTask && completedTask.length) ? completedTask[0].count : 0;
        let cancelledTask = await this.taskByUser({
            userId: userId,
            taskWorkFlow: sails.config.TASK.WORK_FLOW.CANCELLED
        });
        taskSummary.cancelledTotal = (cancelledTask && cancelledTask.length) ? cancelledTask[0].count : 0;

        let overdueTask = await this.taskByUser({
            userId: userId,
            isOverDue: true
        });
        taskSummary.overdueTotal = (overdueTask && overdueTask.length) ? overdueTask[0].count : 0;

        return taskSummary;
    },

    async filterFalcon(params, userId) {
        // params.filter.assignedTo = params.filter.assignedTo ? params.filter.assignedTo : null;
        params.filter.taskWorkFlow = sails.config.TASK.WORK_FLOW.OPEN;
        params.filter.isDeleted = false;
        let user = await User.findOne({ id: userId });
        let filter = await common.getFilter(params);
        delete filter.where.lastLocated;
        if (params.filter.lastRidden) {
            filter.where.lastRidden = {
                '<=': UtilService.minutesToSubtractDate(params.filter.lastRidden.from),
                '>=': UtilService.minutesToSubtractDate(params.filter.lastRidden.to)
            };
        }
        if (params.filter.incentiveAmount) {
            filter.where.incentiveAmount = {
                '>=': params.filter.incentiveAmount.from,
                '<=': params.filter.incentiveAmount.to
            };
        }
        if (params.filter.level || user.level) {
            let level = user.level ? user.level : params.filter.level;
            filter.where.level = await this.userLevelWiseTaskLevel(level);
        }
        console.log("filter--------------------", filter);
        let countFilter = await common.removePagination(filter);

        let recordsList = await Task.find(filter)
            .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
            .populate('addedBy', { select: ['id', 'name'] })
            .populate('completedBy', { select: ['id', 'name'] })
            // .populate('canceledBy', { select: ['id', 'name'] })
            .populate('referenceId', { select: ['id', 'name', 'batteryLevel', 'registerId', 'currentLocation', 'locationUpdatedAt'] })
            .populate('reportId', { select: ['id', 'reportNumber'] })
            .populate('assignedTo', { select: ['id', 'name', "type"] });

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
        let minusCount = 0;
        let newRecordList = [];
        delete params.filter.lastLocated;
        if (params.filter.lastLocated) {
            if (params.filter.lastLocated.to > 0) {
                let lastLocated = {
                    '<=': UtilService.minutesToSubtractDate(params.filter.lastLocated.from),
                    '>=': UtilService.minutesToSubtractDate(params.filter.lastLocated.to)
                };
                let vehicleIds = [];
                for (let vehicleData of recordsList) {
                    vehicleIds.push(vehicleData.id);
                }
                let vehicle = await Vehicle.findOne({
                    where: {
                        id: vehicleIds,
                        locationUpdatedAt: lastLocated,
                        isDeleted: false,
                    }
                });
                await Promise.all(_.map(recordsList, async (record, index) => {
                    if (vehicle && vehicle.id === recordsList[index].referenceId) {
                        newRecordList.push(record);
                    } else if (!vehicle) {
                        minusCount++;
                    }
                }));
            }
        }

        let response = { list: recordsList };

        response.count = await Task.count(countFilter);
        for (let key in recordsList) {
            if (recordsList[key].canceledBy && recordsList[key].canceledBy.length) {
                for (let cancelledTask of recordsList[key].canceledBy) {
                    if (cancelledTask.userId === userId) {
                        recordsList.splice([key], 1);
                        response.count = response.count - 1;
                    }
                }
            }
        }
        if (params.filter.lastLocated) {
            response = { list: newRecordList }
            if (minusCount > 0) {
                response.count = response.count - minusCount;
            } else if (minusCount === 0) {
                response.count = minusCount;
            }
        }
        let data = { data: response };
        return Object.assign({}, data, sails.config.message.OK);
    },

    async findFalconDetail(params) {
        // get filter
        try {
            if (!params.taskId) {
                return Object.assign({}, sails.config.message.BAD_REQUEST);
            }
            // find record
            let record = await Task.findOne({ id: params.taskId, isDeleted: false })
                .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
                .populate('assignedTo', { select: ['id', 'name', "type"] })
                .populate('addedBy', { select: ['id', 'name'] })
                .populate('completedBy', { select: ['id', 'name'] })
                // .populate('canceledBy', { select: ['id', 'name'] })
                .populate('referenceId', { select: ['id', 'name', 'batteryLevel', 'registerId', 'currentLocation', 'locationUpdatedAt'] })
                .populate('addedBy', { select: ['id', 'name'] });

            // return record
            if (record && record.id) {
                return Object.assign({}, { record }, sails.config.message.OK);
            }

            return Object.assign({}, sails.config.message.RECORD_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return Object.assign({}, error);
        }
    },

    async cancelAssignTask(params) {
        try {
            if (!params || !params.taskId) {
                return Object.assign({}, sails.config.message.BAD_REQUEST);
            }
            let task = await Task.findOne({ id: params.taskId, assignedTo: params.userId, isDeleted: false });

            if (!task) {
                return Object.assign({}, sails.config.message.TASK_NOT_FOUND);
            }

            let statusTrack = task.statusTrack;
            if (!statusTrack || !_.isArray(statusTrack)) {
                statusTrack = [];
            }

            let canceledBy = task.canceledBy;
            if (!canceledBy || !_.isArray(canceledBy)) {
                canceledBy = [];
            }
            let newCanceledBy = {
                userId: params.userId,
                datetime: UtilService.getTimeFromNow()
            }
            canceledBy.unshift(newCanceledBy);
            task.canceledBy = canceledBy;

            let newStatus = {
                before: task.taskWorkFlow,
                after: sails.config.TASK.WORK_FLOW.OPEN,
                remark: params.remark ? params.remark : sails.config.TASK.REMARK.CANCEL_TASK,
                dateTime: UtilService.getTimeFromNow(),
                userId: params.userId
            };
            statusTrack.unshift(newStatus);
            task.statusTrack = statusTrack;

            let updateObj = {
                taskWorkFlow: sails.config.TASK.WORK_FLOW.OPEN,
                statusTrack: task.statusTrack,
                isAssigned: false,
                assignedTo: null,
                updatedBy: params.userId,
                taskStartDateTime: "",
                taskEndDateTime: "",
                canceledBy: task.canceledBy
            };

            let updatedTask = await Task.update(
                { id: params.taskId },
                updateObj
            ).fetch();

            if (updatedTask && updatedTask.length) {
                await socketEvents.notifyCancelTask(updatedTask[0]);

                return Object.assign({}, updatedTask, sails.config.message.TASK_CANCEL);
            }
            return Object.assign({}, sails.config.message.TASK_CANCEL_FAIL);
        } catch (err) {
            console.log(err);

            return Object.assign({}, sails.config.message.SERVER_ERROR);
        }
    },

    async findTask(taskId) {
        let record = await Task.findOne({ id: taskId, isDeleted: false })
            .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
            .populate('addedBy', { select: ['id', 'name'] })
            .populate('completedBy', { select: ['id', 'name'] })
            // .populate('canceledBy', { select: ['id', 'name'] })
            .populate('referenceId', { select: ['id', 'name', 'batteryLevel', 'qrNumber', 'currentLocation'] })
            .populate('reportId', { select: ['id', 'reportNumber'] })
            .populate('assignedTo', { select: ['id', 'name', "type"] });

        return record;
    },

    async userInProgressTaskCount(countFilter, userId) {
        countFilter.taskWorkFlow = sails.config.TASK.WORK_FLOW.IN_PROGRESS;
        countFilter.assignedTo = userId;
        countFilter.isDeleted = false;
        if (
            countFilter["canceledBy.userId"] ||
            countFilter["canceledBy.datetime"] ||
            countFilter.canceledAt ||
            countFilter.completedAt ||
            countFilter.completedBy
        ) {
            delete countFilter["canceledBy.userId"];
            delete countFilter["canceledBy.datetime"];
            delete countFilter.completedAt;
            delete countFilter.canceledAt;
            delete countFilter.completedBy;
        }
        console.log("countFilter Capture--------------------", countFilter);

        let inProgressTaskCount = await Task.count(countFilter)
            .meta({ enableExperimentalDeepTargets: true });

        return inProgressTaskCount;
    },

    async userCompletedTaskCount(countFilter, userId, completedAt) {
        countFilter.taskWorkFlow = sails.config.TASK.WORK_FLOW.COMPLETE;
        countFilter.assignedTo = userId;
        countFilter.isDeleted = false;
        if (
            countFilter["canceledBy.userId"] ||
            countFilter["canceledBy.datetime"] ||
            countFilter.canceledAt ||
            countFilter.taskStartDateTime
        ) {
            delete countFilter["canceledBy.userId"];
            delete countFilter["canceledBy.datetime"];
            delete countFilter.canceledAt;
            delete countFilter.taskStartDateTime;
        }
        if (completedAt && completedAt.from && completedAt.to) {
            countFilter.completedAt = {
                '>=': completedAt.from,
                '<=': completedAt.to
            }
        }

        console.log("countFilter Release--------------------", countFilter);

        let completedTaskCount = await Task.count(countFilter)
            .meta({ enableExperimentalDeepTargets: true });

        return completedTaskCount;
    },

    async userCancelledTaskCount(countFilter, userId, canceledAt) {
        countFilter["canceledBy.userId"] = userId;
        delete countFilter.taskWorkFlow;
        delete countFilter.assignedTo;
        countFilter.isDeleted = false;
        if (countFilter.completedAt || countFilter.taskStartDateTime) {
            delete countFilter.completedAt;
            delete countFilter.taskStartDateTime;
        }
        if (canceledAt && canceledAt.from && canceledAt.to) {
            countFilter["canceledBy.datetime"] = {
                '>=': canceledAt.from,
                '<=': canceledAt.to
            };
        }
        console.log("countFilter Cancel--------------------", countFilter);
        let cancelledTaskCount = await Task.count(countFilter)
            .meta({ enableExperimentalDeepTargets: true });

        return cancelledTaskCount;
    }
};

const moment = require("moment");
const TaskService = require(`${sails.config.appPath}/api/services/task`);
const CommonService = require(`${sails.config.appPath}/api/services/common`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const SocketEvents = require(`${sails.config.appPath}/api/services/socketEvents`);
const NestService = require(`${sails.config.appPath}/api/services/nest`);

module.exports = {
    async captureVehicleToStartTask(req, res) {
        try {
            let loggedInUser = req.user;
            let params = req.allParams();
            console.log('*****************Feeder request for capture task*****************');
            console.log(params);
            if (!params || !params.qrNumber) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let vehicle = await Vehicle.findOne({
                qrNumber: params.qrNumber,
                isDeleted: false,
            });
            if (!vehicle) {
                return res.notFound({}, sails.config.message.VEHICLE_NOT_FOUND);
            }

            // Find falcon incomplete task
            let task = await Task.findOne({
                referenceId: vehicle.id,
                taskWorkFlow: sails.config.TASK.WORK_FLOW.OPEN,
                isDeleted: false,
                'canceledBy.userId': { "!=": loggedInUser.id }
            }).meta({ enableExperimentalDeepTargets: true });

            if (!task) {
                return res.notFound({}, sails.config.message.TASK_NOT_FOUND);
            }

            let statusTrack = task.statusTrack;
            if (!statusTrack || !_.isArray(statusTrack)) {
                statusTrack = [];
            }
            //Add status track
            let newStatus = {
                before: task.taskWorkFlow,
                after: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                remark: sails.config.TASK.REMARK.SCAN_VEHICLE,
                dateTime: moment().toISOString(),
                userId: loggedInUser.id,
            };
            statusTrack.unshift(newStatus);
            task.statusTrack = statusTrack;

            let captureTaskTrack = task.captureTaskTrack;
            if (!captureTaskTrack || !_.isArray(captureTaskTrack)) {
                captureTaskTrack = [];
            }
            let newCaptureStatus = {
                status: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                remark: sails.config.TASK.REMARK.SCAN_VEHICLE,
                dateTime: moment().toISOString(),
                userId: loggedInUser.id,
            };
            captureTaskTrack.unshift(newCaptureStatus);
            task.captureTaskTrack = captureTaskTrack;
            //Add Task status is in-progress
            //Set isAssigned tag is true
            const taskStartDateTime = UtilService.getTimeFromNow();
            const taskEndDateTime = TaskService.addTime(
                task.timeLimitType,
                task.timeLimitValue
            );
            let updateObj = {
                taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                statusTrack: task.statusTrack,
                isAssigned: true,
                assignedTo: loggedInUser.id,
                updatedBy: loggedInUser.id,
                taskStartDateTime: taskStartDateTime,
                taskEndDateTime: taskEndDateTime,
                captureTaskTrack: task.captureTaskTrack
            };
            let updatedTask = await Task.update({ id: task.id }, updateObj).fetch();
            if (updatedTask && updatedTask.length) {
                //Update vehicle with marked as capture.
                //todo:falcon If vehicle is capture then it is not available for ride
                let markedAs = { markedAs: sails.config.TASK.MARKED.CAPTURE };
                let updateVehicle = await Vehicle.update(
                    { id: vehicle.id },
                    markedAs
                ).fetch();
                updateVehicle = updateVehicle[0];
                await socketEvents.removeFalconFromMap({ id: updatedTask[0].id }, 'Captured falcon by other feeder.');
                console.log('*****************Capture task successfully*****************');
                console.log(updatedTask[0]);
                let taskDetails = await TaskService.findTask(updatedTask[0].id);
                return res.ok(taskDetails, sails.config.message.CAPTURE_VEHICLE);
            }
            console.log('*****************Capture task Fail*****************');


            return res.ok({}, sails.config.message.CAPTURE_VEHICLE_FAIL)
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async findTasks(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            params.overdue = false;
            if (loggedInUser.level === sails.config.TASK.TASK_LEVEL.ONE) {
                params.filter.level = loggedInUser.level; //Filter task by user level 1
            } else if (loggedInUser.level === sails.config.TASK.TASK_LEVEL.TWO) {
                params.filter.level = [
                    sails.config.TASK.TASK_LEVEL.ONE,
                    sails.config.TASK.TASK_LEVEL.TWO
                ]; //Filter task by user level 2
            }
            params.filter.isDeleted = false;
            let filter = await common.getFilter(params);
            let countFilter = await common.removePagination(filter);
            let recordsList = await Task.find(filter)
                .populate("nestId", {
                    select: ["name", "currentLocation", "capacity"],
                })
                .populate("referenceId", { select: ["name"] });

            let response = { list: recordsList };

            response.count = await Task.count(countFilter);

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async overdueTasksListOfFeeder(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            params.userId = loggedInUser.id;
            let list = {};

            let userLevel = await TaskService.checkUserLevel(loggedInUser.level);
            if (!userLevel) {
                return res.ok({}, sails.config.message.INVALID_USER_LEVEL);
            }


            //Damage task request
            params.taskType = sails.config.TASK.TASK_TYPE.LEVEL_1.DAMAGE;
            list.damage = [];
            let damage = await task.taskByUser(params);
            if (damage && damage.length) {
                delete damage[0]._id;
                list.damage = damage;
            }

            //Overdue task request
            delete params.taskType;
            params.isOverDue = true;
            list.falcon = [];
            let falcon = await task.taskByUser(params);
            if (falcon && falcon.length) {
                delete falcon[0]._id;
                list.falcon = falcon;
            }

            let response = list;

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async userReleaseTasksList(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            params.userId = loggedInUser.id;
            let list = {};
            let userLevel = await TaskService.checkUserLevel(loggedInUser.level);
            if (!userLevel) {
                return res.ok({}, sails.config.message.INVALID_USER_LEVEL);
            }


            //Charge task request
            params.taskType = sails.config.TASK.TASK_TYPE.LEVEL_2.CHARGE;
            list.charge = [];
            let charge = await task.taskByUser(params);
            if (charge && charge.length) {
                delete charge[0]._id;
                list.charge = charge;
            }

            //Move task request
            params.taskType = sails.config.TASK.TASK_TYPE.LEVEL_2.MOVE;
            list.move = [];
            let move = await task.taskByUser(params);
            if (move && move.length) {
                delete move[0]._id;
                list.move = move;
            }

            let response = list;

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async cancelAssignTask(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            console.log('*****************Feeder request for cancel task*****************');
            console.log(params);
            if (!params || !params.taskId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let task = await Task.findOne({ id: params.taskId, isDeleted: false });

            if (!task) {
                return res.ok({}, sails.config.message.TASK_NOT_FOUND);
            }

            let statusTrack = task.statusTrack;
            if (!statusTrack || !_.isArray(statusTrack)) {
                statusTrack = [];
            }

            let newStatus = {
                before: task.taskWorkFlow,
                after: sails.config.TASK.WORK_FLOW.OPEN,
                remark: params.remark ? params.remark : sails.config.TASK.REMARK.CANCEL_TASK,
                dateTime: UtilService.getTimeFromNow(),
                userId: loggedInUser.id
            };
            statusTrack.unshift(newStatus);
            task.statusTrack = statusTrack;

            let canceledBy = task.canceledBy;
            if (!canceledBy || !_.isArray(canceledBy)) {
                canceledBy = [];
            }
            let newCanceledBy = {
                userId: loggedInUser.id,
                datetime: UtilService.getTimeFromNow()
            }
            canceledBy.unshift(newCanceledBy);
            task.canceledBy = canceledBy;

            let updateObj = {
                taskWorkFlow: sails.config.TASK.WORK_FLOW.OPEN,
                statusTrack: task.statusTrack,
                isAssigned: false,
                assignedTo: null,
                updatedBy: loggedInUser.id,
                taskStartDateTime: "",
                taskEndDateTime: "",
                canceledBy: task.canceledBy
            };

            let updateTaskList = await Task.update(
                { id: params.taskId },
                updateObj
            ).fetch();

            if (updateTaskList && updateTaskList.length) {
                console.log("*****************Cancel Task Successfully*****************");
                console.log(updateTaskList[0]);
                await socketEvents.notifyCancelTask(updateTaskList[0]);
                let userTask = await Task.find({
                    assignedTo: loggedInUser.id,
                    taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                    isDeleted: false
                });
                let response = { task: updateTaskList, nest: {} }
                if (userTask.length === 0) {
                    let claimedNest = await Nest.findOne({ isClaimedBy: loggedInUser.id, isClaimed: true });
                    if (claimedNest) {
                        let cancelCurrentClaimedNest = await Nest.update({ id: claimedNest.id })
                            .set({ isClaimed: false, isClaimedBy: null }).fetch();
                        response.nest = cancelCurrentClaimedNest[0];
                    }
                }

                return res.ok(response, sails.config.message.TASK_CANCEL);
            }
            console.log("*****************Cancel Task Fail*****************");

            return res.ok(null, sails.config.message.TASK_CANCEL_FAIL);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async paginate(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        try {
            // params.filter.assignedTo = loggedInUser.id;
            params.filter.isDeleted = false;
            let filter = await common.getFilter(params);
            let countFilter = await common.removePagination(filter);

            let recordsList = await Task.find(filter)
                .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
                .populate('addedBy', { select: ['id', 'name'] })
                .populate('completedBy', { select: ['id', 'name'] })
                // .populate('canceledBy', { select: ['id', 'name'] })
                .populate('referenceId', { select: ['id', 'name'] })
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

            let response = { list: recordsList };

            response.count = await Task.count(countFilter);

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
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
            let record = await Task.findOne({ id: params.id, isDeleted: false })
                .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
                .populate('assignedTo', { select: ['id', 'name', "type"] })
                .populate('addedBy', { select: ['id', 'name'] })
                .populate('completedBy', { select: ['id', 'name'] })
                // .populate('canceledBy', { select: ['id', 'name'] })
                .populate('referenceId', { select: ['id', 'name'] })
                .populate('addedBy', { select: ['id', 'name'] });

            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async taskDashboard(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            let userLevel = await TaskService.checkUserLevel(loggedInUser.level);
            if (!userLevel) {
                return res.ok({}, sails.config.message.INVALID_USER_LEVEL);
            }
            let taskLevel = await TaskService.userLevelWiseTaskLevel(loggedInUser.level);
            let list = {};
            list.damageTask = [];
            params.taskType = params.taskType ? params.taskType : sails.config.TASK.TASK_TYPE.LEVEL_1.DAMAGE;
            let damageTask = await TaskService.userDashboardTask({ taskType: params.taskType, level: taskLevel });
            if (damageTask && damageTask.length) {
                delete damageTask[0]._id;
                list.damageTask = damageTask;
            }
            list.chargeTask = [];
            params.priority = params.priority ? params.priority : sails.config.TASK.PRIORITY.URGENT;
            let chargeTask = await TaskService.userDashboardTask({ priority: params.priority, level: taskLevel });
            if (chargeTask && chargeTask.length) {
                delete chargeTask[0]._id;
                list.chargeTask = chargeTask;
            }
            list.urgentTask = [];
            params.taskWorkFlow = params.taskWorkFlow ? params.taskWorkFlow : sails.config.TASK.WORK_FLOW.OPEN;
            let urgentTask = await TaskService.userDashboardTask({ taskWorkFlow: params.taskWorkFlow, level: taskLevel });
            if (urgentTask && urgentTask.length) {
                delete urgentTask[0]._id;
                list.urgentTask = urgentTask;
            }

            return res.ok(list, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async filterFalcon(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        try {
            params.filter.isDeleted = false;
            params.filter.assignedTo = params.filter.assignedTo ? params.filter.assignedTo : null;
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
            if (params.filter.level) {
                filter.where.level = await TaskService.userLevelWiseTaskLevel(params.filter.level);
            }
            let countFilter = await common.removePagination(filter);

            let recordsList = await Task.find(filter)
                .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
                .populate('addedBy', { select: ['id', 'name'] })
                .populate('completedBy', { select: ['id', 'name'] })
                // .populate('canceledBy', { select: ['id', 'name'] })
                .populate('referenceId', { select: ['id', 'name'] })
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
            if (params.filter.lastLocated) {
                let from = UtilService.minutesToSubtractDate(params.filter.lastLocated.from);
                console.log("from-------------------", from);
                let to = UtilService.minutesToSubtractDate(params.filter.lastLocated.to);
                console.log('to---------------------=======', to);
                let lastLocated = {
                    '<=': from,
                    '>=': to
                };
                let vehicleIds = [];
                for (let vehicleData of recordsList) {
                    vehicleIds.push(vehicleData.id);
                }
                let vehicle = await Vehicle.find({
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

            let response = { list: recordsList };

            response.count = await Task.count(countFilter);
            if (params.filter.lastLocated) {

                response = { list: newRecordList }
                if (minusCount > 0) {
                    response.count = response.count - minusCount;
                } else if (minusCount === 0) {
                    response.count = minusCount;
                }
            }
            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async myTask(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            params.filter.isDeleted = false;
            if (params.filter.taskWorkFlow !== sails.config.TASK.WORK_FLOW.CANCELLED) {
                params.filter.assignedTo = loggedInUser.id;
            }
            let userLevel = await TaskService.checkUserLevel(loggedInUser.level);
            if (!userLevel) {
                return res.ok({}, sails.config.message.INVALID_USER_LEVEL);
            }
            if (params.filter.taskWorkFlow === sails.config.TASK.WORK_FLOW.CANCELLED) {
                delete params.filter.taskWorkFlow;
                params.filter['canceledBy.userId'] = loggedInUser.id;
            }
            let filter = await common.getFilter(params);
            if (params.filter && params.filter.createdAt) {
                filter.where.createdAt = {
                    '>=': params.filter.createdAt.from,
                    '<=': params.filter.createdAt.to
                };
            }
            let canceledAt = {};
            if (params.filter && params.filter.canceledAt) {
                filter.where["canceledBy.datetime"] = {
                    '>=': params.filter.canceledAt.from,
                    '<=': params.filter.canceledAt.to
                };
                canceledAt = params.filter.canceledAt;
                delete filter.where.canceledAt;
            }
            if (params.filter && params.filter.taskStartDateTime) {
                filter.where.taskStartDateTime = {
                    '>=': params.filter.taskStartDateTime.from,
                    '<=': params.filter.taskStartDateTime.to
                };
            }
            let completedAt = {};
            if (params.filter && params.filter.completedAt) {
                filter.where.completedAt = {
                    '>=': params.filter.completedAt.from,
                    '<=': params.filter.completedAt.to
                };
                completedAt = params.filter.completedAt;
            }
            console.log("filter----------------------------", filter);
            let countFilter = await common.removePagination(filter);
            let recordsList = await Task.find(filter)
                .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
                .populate('addedBy', { select: ['id', 'name'] })
                .populate('completedBy', { select: ['id', 'name'] })
                .populate('referenceId', { select: ['id', 'name', 'qrNumber', 'batteryLevel'] })
                .populate('reportId', { select: ['id', 'reportNumber'] })
                .populate('assignedTo', { select: ['id', 'name', "type"] })
                .meta({ enableExperimentalDeepTargets: true });

            let statusTracks = _.map(recordsList, 'statusTrack');
            statusTracks = _.compact(statusTracks);
            statusTracks = _.uniq(statusTracks);
            statusTracks = _.flatten(statusTracks);

            let response = { list: recordsList };
            response.captureCount = await TaskService.userInProgressTaskCount(countFilter, loggedInUser.id);
            response.releaseCount = await TaskService.userCompletedTaskCount(countFilter, loggedInUser.id, completedAt);
            response.canceledCount = await TaskService.userCancelledTaskCount(countFilter, loggedInUser.id, canceledAt);

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async captureVehicleToReleaseTasks(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            console.log('*****************Feeder request for release task*****************');
            console.log(params);
            params.userId = loggedInUser.id;
            if (!params || !params.qrNumber || !params.currentLocation) {
                return res.ok({}, sails.config.message.BAD_REQUEST);
            }
            let vehicle = await Vehicle.findOne({
                qrNumber: params.qrNumber,
                isDeleted: false,
            });
            if (!vehicle) {
                return res.ok({}, sails.config.message.VEHICLE_NOT_FOUND);
            }

            let nest = await NestService.checkVehicleInNest(params.currentLocation, {
                isDeleted: false,
                isClaimed: true,
                isClaimedBy: loggedInUser.id,
            });
            console.log('----------Near Nest-----------', nest);
            if (!nest) {
                return res.ok({}, sails.config.message.NEST_NOT_FOUND);
            }
            // nest = nest.list[0];
            // Find falcon incomplete task
            let task = await Task.findOne({
                referenceId: vehicle.id,
                taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                isDeleted: false
            });

            if (!task) {
                return res.ok({}, sails.config.message.TASK_NOT_FOUND);
            }

            if (nest.capacity <= nest.totalVehicles) {
                return res.ok({}, sails.config.message.NEST_CAPACITY_OVER);
            }
            if (
                (task.taskType === sails.config.TASK.TASK_TYPE.LEVEL_1.DAMAGE_MOVE
                    || task.taskType === sails.config.TASK.TASK_TYPE.LEVEL_2.DAMAGE_CHARGE)
                && nest.type !== sails.config.NEST_TYPE.REPAIR
            ) {
                return res.ok({}, sails.config.message.RELEASE_VEHICLE_RIDER_NEST_FAIL);
            } else if (
                (task.taskType === sails.config.TASK.TASK_TYPE.LEVEL_1.MOVE
                    || task.taskType === sails.config.TASK.TASK_TYPE.LEVEL_2.CHARGE)
                && nest.type !== sails.config.NEST_TYPE.RIDER
            ) {
                return res.ok({}, sails.config.message.RELEASE_VEHICLE_REPAIR_NEST_FAIL);
            }

            let statusTrack = task.statusTrack;
            if (!statusTrack || !_.isArray(statusTrack)) {
                statusTrack = [];
            }
            //Add status track
            let newStatus = {
                before: task.taskWorkFlow,
                after: sails.config.TASK.WORK_FLOW.COMPLETE,
                remark: sails.config.TASK.REMARK.SCAN_VEHICLE_RELEASE,
                dateTime: moment().toISOString(),
                userId: loggedInUser.id,
            };
            statusTrack.unshift(newStatus);
            task.statusTrack = statusTrack;

            let updateObj = {
                taskWorkFlow: sails.config.TASK.WORK_FLOW.COMPLETE,
                statusTrack: task.statusTrack,
                updatedBy: loggedInUser.id,
                completedAt: moment().toISOString(),
                completedBy: loggedInUser.id,
                nestId: nest.id,
                images: params.images
            };
            let updatedTask = await Task.update({ id: task.id }, updateObj).fetch();
            if (updatedTask || updatedTask.length) {

                let updateVehicle = await Vehicle.update(
                    { id: vehicle.id },
                    {
                        markedAs: sails.config.TASK.MARKED.RELEASED,
                        isTaskCreated: false
                    }
                ).fetch();

                if (updateVehicle || updateVehicle.length) {
                    updateVehicle = updateVehicle[0];
                    let taskDetails = await TaskService.findTask(updatedTask[0].id);
                    let capturedTaskCount = await Task.count({
                        taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                        assignedTo: params.userId,
                        isAssigned: true,
                        isDeleted: false
                    });
                    let updatedNest = await Nest.update({ id: nest.id }).set({ totalVehicles: nest.totalVehicles + 1 }).fetch();
                    let isReleaseMoreFalcon = false;
                    let isNestCapacity = true;
                    if (capturedTaskCount > 0) {
                        isReleaseMoreFalcon = true;
                        if (updatedNest[0].capacity <= updatedNest[0].totalVehicles) {
                            await Nest.update({ id: nest.id }).set({
                                isClaimed: false,
                                isClaimedBy: null,
                                nestClaimTimeValue: 0
                            }).fetch();
                            isNestCapacity = false;
                        }
                        let allTask = await Task.find({
                            where: {
                                taskWorkFlow: sails.config.TASK.WORK_FLOW.IN_PROGRESS,
                                isAssigned: true,
                                assignedTo: params.userId,
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
                        if (isRepair && isRider) {

                            isReleaseMoreFalcon = true;
                        }
                        if ((isRepair) && (nest.type !== sails.config.NEST_TYPE.REPAIR)) {
                            console.log("------------------1. Please select Repair Nest------------------");
                            isReleaseMoreFalcon = false;
                        } else if ((isRider) && (nest.type !== sails.config.NEST_TYPE.RIDER)) {
                            console.log("------------------2. Please select Rider Nest------------------");
                            isReleaseMoreFalcon = false;
                        }
                        // if (nest.capacity > nest.totalVehicles || nest.totalVehicles < capturedTaskCount) {
                        //     return res.ok(updatedTask[0], sails.config.message.RELEASE_MORE_FALCON);
                        // }

                        // return res.ok(updatedTask[0], sails.config.message.NEST_CAPACITY_OVER);
                    }
                    console.log('*****************Feeder release task successfully*****************');
                    console.log(taskDetails);

                    return res.ok({ taskDetails, isReleaseMoreFalcon, isNestCapacity }, sails.config.message.RELEASE_FALCON_SUCCESS);
                }
            }
            console.log('*****************Feeder release task failed*****************');

            return res.ok({}, sails.config.message.RELEASE_FALCON_FAIL);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

};

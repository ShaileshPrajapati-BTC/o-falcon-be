const UtilService = require(`${sails.config.appPath}/api/services/util`);
const ReportService = require(`${sails.config.appPath}/api/services/report`);
const SocketEvents = require(`${sails.config.appPath}/api/services/socketEvents`);
const TaskService = require(`${sails.config.appPath}/api/services/task`);
const moment = require('moment');
const modelName = 'Task';

module.exports = {

    async create(req, res) {
        try {
            let loggedInUser = req.user;
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName,
            };
            await commonValidator.validateCreateParams(option);
            let alreadyOngoingTaskForVehicle = await Task.find({
                where: {
                    referenceId: params.referenceId,
                    taskWorkFlow: {
                        '!=': [
                            sails.config.TASK.WORK_FLOW.COMPLETE,
                            sails.config.TASK.WORK_FLOW.CANCELLED
                        ]
                    },
                    isDeleted: false
                }
            });

            if (alreadyOngoingTaskForVehicle && alreadyOngoingTaskForVehicle.length) {
                return res.ok({}, sails.config.message.DUPLICATE_TASK);
            }
            let vehicle = await Vehicle.findOne({ id: params.referenceId, isDeleted: false });
            if (!vehicle) {
                return res.ok({}, sails.config.message.VEHICLE_NOT_FOUND);
            }
            params.lastLocated = vehicle.locationUpdatedAt;
            let rideBooking = await RideBooking.find({ vehicleId: params.referenceId })
                .sort([{ createdAt: 'DESC' }]);
            if (rideBooking && rideBooking.length) {
                rideBooking = _.first(rideBooking);
                params.lastRidden = rideBooking.endDateTime;
            }
            if (!params.taskWorkFlow) {
                params.taskWorkFlow = sails.config.TASK.WORK_FLOW.OPEN;
            }
            params.addedBy = loggedInUser.id;
            params.addedAt = moment().toISOString();
            const SeriesGeneratorService = require(`${sails.config.appPath}/api/services/seriesGenerator`);
            let series = await SeriesGeneratorService.nextSeriesGenerate(
                { type: sails.config.SERIES_GENERATOR.TYPE.TASK_SERIES }
            );
            params.taskNumber = series.series;

            let newStatus = [{
                before: 0,
                after: params.taskWorkFlow,
                remark: 'New Task Created.',
                dateTime: UtilService.getTimeFromNow(),
                userId: req.user.id
            }];
            params.statusTrack = newStatus;
            params.canceledBy = [];

            let createdRecord = await Task.create(params).fetch();
            if (params.reportId) {
                await ReportService.changeReportStatus(
                    sails.config.REPORT.STATUS.TASK_CREATED,
                    params.reportId,
                    loggedInUser.id
                );
            }
            await Vehicle.update({ id: params.referenceId }).set({ isTaskCreated: true }).fetch();
            let newCreatedTask = await TaskService.findTask(createdRecord.id);
            if (newCreatedTask) {
                await socketEvents.notifyNewCreatedFalcon(newCreatedTask);
            }

            return res.ok(createdRecord, sails.config.message.TASK_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async paginate(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        try {
            params.filter.isDeleted = false;
            if (params.filter.taskWorkFlow === sails.config.TASK.WORK_FLOW.CANCELLED) {
                delete params.filter.taskWorkFlow;
                delete params.assignedTo;
                params.filter['canceledBy.userId'] = loggedInUser.id;
            }
            let filter = await common.getFilter(params);

            let countFilter = await common.removePagination(filter);
            let recordsList = await Task.find(filter)
                .populate('nestId', { select: ['name', 'currentLocation', 'capacity'] })
                .populate('addedBy', { select: ['id', 'name'] })
                .populate('completedBy', { select: ['id', 'name'] })
                // .populate('canceledBy', { select: ['id', 'name'] })
                .populate('referenceId', { select: ['id', 'name'] })
                .populate('reportId', { select: ['id', 'reportNumber'] })
                .populate('assignedTo', { select: ['id', 'name', "type"] })
                .meta({ enableExperimentalDeepTargets: true });

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
                if (recordsList[recordKey].canceledBy && recordsList[recordKey].canceledBy.length > 0) {
                    if (recordsList[recordKey].canceledBy && recordsList[recordKey].canceledBy.length) {
                        for (let canceledByUser of recordsList[recordKey].canceledBy) {
                            if (canceledByUser.userId) {
                                let user = _.find(users, { id: canceledByUser.userId });
                                canceledByUser.userId = { id: user.id, name: user.name }
                            }
                        }
                    }
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

            response.count = await Task.count(countFilter).meta({ enableExperimentalDeepTargets: true });

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

            let users = await User.find({
                where: { type: { "!=": sails.config.USER.TYPE.CUSTOMER } },
                select: ['name']
            });
            if (record.canceledBy && record.canceledBy.length) {
                for (let canceledByUser of record.canceledBy) {
                    if (canceledByUser.userId) {
                        let user = _.find(users, { id: canceledByUser.userId });
                        canceledByUser.userId = { id: user.id, name: user.name }
                    }
                }
            }

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


    async update(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateUpdateParams(option);
            let task = await Task.findOne({ id: params.id, isDeleted: false });
            if (!task || task.isDeleted) {
                return res.notFound({}, sails.config.message.TASK_LIST_NOT_FOUND);
            }
            const loggedInUser = req.user;
            params.updatedBy = loggedInUser.id;

            let data = _.omit(params, 'id');
            let updatedRecord = await Task
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord[0], sails.config.message.TASK_UPDATED);
            }

            return res.notFound({}, sails.config.message.TASK_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        try {
            // Find single task
            let task = await Task.findOne({ id: params.id, isDeleted: false });
            if (!task || task.isDeleted) {
                return res.notFound({}, sails.config.message.TASK_LIST_NOT_FOUND);
            }

            let data = {};
            data.isDeleted = true;
            data.deletedBy = loggedInUser.id;
            data.deletedAt = moment().toISOString();
            let updatedRecord = await Task
                .update({ id: params.id })
                .set(data)
                .fetch();

            if (updatedRecord && updatedRecord.length) {
                if (task.reportId) {
                    await ReportService.changeReportStatus(
                        sails.config.REPORT.STATUS.SUBMITTED,
                        task.reportId,
                        loggedInUser.id
                    );
                }
                await Vehicle.update({ id: updatedRecord[0].referenceId }).set({ isTaskCreated: false }).fetch();

                return res.ok({}, sails.config.message.TASK_DELETED);
            }

            return res.notFound({}, sails.config.message.TASK_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async updateStatus(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let task = await Task.findOne({ id: params.id, isDeleted: false });
            if (!task || task.isDeleted) {
                return res.notFound({}, sails.config.message.TASK_LIST_NOT_FOUND);
            }
            let paramsToUpdate = _.omit(params, "id");

            let statusTrack = task.statusTrack;
            if (!statusTrack || !_.isArray(statusTrack)) {
                statusTrack = [];
            }

            let newStatus = {
                before: task.taskWorkFlow,
                after: params.taskWorkFlow,
                remark: params.remark,
                dateTime: UtilService.getTimeFromNow(),
                userId: req.user.id
            };
            statusTrack.unshift(newStatus);
            paramsToUpdate.statusTrack = statusTrack;
            let reportStatus;
            let changeVehicleTaskStatus = true;
            if (params.taskWorkFlow === sails.config.TASK.WORK_FLOW.COMPLETE) {
                paramsToUpdate.completedBy = loggedInUser.id;
                paramsToUpdate.completedAt = moment().toISOString();
                reportStatus = sails.config.REPORT.STATUS.RESOLVED;
                changeVehicleTaskStatus = false;
            } else if (params.taskWorkFlow === sails.config.TASK.WORK_FLOW.CANCELLED) {
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
                paramsToUpdate.canceledBy = task.canceledBy;
                paramsToUpdate.canceledAt = moment().toISOString();
                reportStatus = sails.config.REPORT.STATUS.CANCELED;
                changeVehicleTaskStatus = false;
            } else if (
                params.taskWorkFlow === sails.config.TASK.WORK_FLOW.OPEN ||
                params.taskWorkFlow === sails.config.TASK.WORK_FLOW.IN_PROGRESS
            ) {
                reportStatus = sails.config.REPORT.STATUS.TASK_CREATED
            }

            let updatedTask = await Task.update(
                { id: params.id },
                paramsToUpdate
            ).fetch();

            if (updatedTask && updatedTask.length) {
                if (task.reportId) {
                    await ReportService.changeReportStatus(
                        reportStatus,
                        task.reportId,
                        loggedInUser.id
                    );
                }
                if (updatedTask[0].taskWorkFlow === sails.config.TASK.WORK_FLOW.OPEN) {
                    await socketEvents.notifyNewCreatedFalcon(updatedTask[0]);
                } else if (updatedTask[0].taskWorkFlow === sails.config.TASK.WORK_FLOW.COMPLETE) {
                    await socketEvents.removeFalconFromMap(updatedTask[0], 'Task completed by admin.');
                } else if (updatedTask[0].taskWorkFlow === sails.config.TASK.WORK_FLOW.CANCELLED) {
                    await socketEvents.removeFalconFromMap(updatedTask[0], 'Task cancelled by admin.');
                }
                if (!changeVehicleTaskStatus) {
                    await Vehicle.update({ id: updatedTask[0].referenceId }).set({ isTaskCreated: changeVehicleTaskStatus }).fetch();
                }

                return res.ok(updatedTask[0], sails.config.message.TASK_UPDATED);
            }
            return res.ok(null, sails.config.message.FAILED_UPDATE_STATUS);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async taskSummary(req, res) {
        try {
            let params = req.allParams();
            let unassignedCount, totalTask, totalInProgressTask, overDueTask, taskByPriority, taskByStatus, recentAddedTask;
            [unassignedCount, totalTask, totalInProgressTask, overDueTask, taskByPriority, taskByStatus, recentAddedTask] = await Promise.all([
                task.dashboardUnassignedCount(params),
                task.dashboardTotalTask(params),
                task.dashboardInProgressTask(params),
                task.dashboardOverDueTask(params),
                task.dashboardTaskByPriority(params),
                task.dashboardTaskByStatus(params),
                // task.recentAddedTask(params)
            ]);

            return res.ok({ unassignedCount, totalTask, totalInProgressTask, overDueTask, taskByPriority, taskByStatus, recentAddedTask });
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async taskByUser(req, res) {
        try {
            let params = req.allParams();
            let taskByUser;
            [taskByUser] = await Promise.all([
                task.dashboardTaskByUser(params),
            ]);
            return res.ok({ taskByUser });
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async taskByVehicle(req, res) {
        try {
            let params = req.allParams();
            let taskByVehicle;
            [taskByVehicle] = await Promise.all([
                task.dashboardTaskByVehicle(params),
            ]);
            return res.ok({ taskByVehicle });
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async dashboard(req, res) {
        try {
            let params = req.allParams();
            let unassignedCount, totalTask, totalInProgressTask, overDueTask, taskByUser, taskByPriority, taskByVehicle, taskByStatus, recentAddedTask;
            [unassignedCount, totalTask, totalInProgressTask, overDueTask, taskByUser, taskByPriority, taskByVehicle, taskByStatus, recentAddedTask] = await Promise.all([
                task.dashboardUnassignedCount(params),
                task.dashboardTotalTask(params),
                task.dashboardInProgressTask(params),
                task.dashboardOverDueTask(params),
                task.dashboardTaskByUser(params),
                task.dashboardTaskByPriority(params),
                task.dashboardTaskByVehicle(params),
                task.dashboardTaskByStatus(params),
                // task.recentAddedTask(params)
            ])
            return res.ok({ unassignedCount, totalTask, totalInProgressTask, overDueTask, taskByUser, taskByPriority, taskByVehicle, taskByStatus, recentAddedTask })
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
}
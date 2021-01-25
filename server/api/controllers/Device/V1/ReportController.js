const UtilService = require(`${sails.config.appPath}/api/services/util`);
const moment = require('moment');

module.exports = {
    async create(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            if (!params || !params.vehicleId || !params.categoryId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let reportVehicle = await Report.find({
                vehicleId: params.vehicleId, status: {
                    '!=': [
                        sails.config.REPORT.STATUS.CANCELED,
                        sails.config.REPORT.STATUS.RESOLVED
                    ]
                }
            });
            if (reportVehicle || reportVehicle.length) {
                return res.ok({}, sails.config.message.REPORT_DUPLICATE);
            }
            let alreadyOngoingTaskForVehicle = await Task.find({
                referenceId: params.referenceId,
                taskWorkFlow: [
                    sails.config.TASK.WORK_FLOW.OPEN,
                    sails.config.TASK.WORK_FLOW.IN_PROGRESS
                ],
                isDeleted: false
            });
            if (alreadyOngoingTaskForVehicle && alreadyOngoingTaskForVehicle.length) {
                return res.ok({}, sails.config.message.DUPLICATE_TASK);
            }
            params.addedBy = loggedInUser.id;
            params.userId = loggedInUser.id;
            params.userType = loggedInUser.type;
            params.addedAt = moment().toISOString();
            const SeriesGeneratorService = require(`${sails.config.appPath}/api/services/seriesGenerator`);
            let series = await SeriesGeneratorService.nextSeriesGenerate(
                { type: sails.config.SERIES_GENERATOR.TYPE.REPORT_SERIES }
            );
            params.reportNumber = series.series;
            params.status = sails.config.REPORT.STATUS.SUBMITTED;
            let newStatus = [{
                before: 0,
                after: params.status,
                remark: 'New Report Created.',
                dateTime: UtilService.getTimeFromNow(),
                userId: req.user.id
            }];
            params.statusTrack = newStatus;
            let createdRecord = await Report.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.REPORT_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async captureVehicleToAddReport(req, res) {
        try {
            let params = req.allParams();
            if (!params || !params.qrNumber) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let vehicle = await Vehicle.findOne({ qrNumber: params.qrNumber, isDeleted: false });
            if (!vehicle) {
                return res.notFound({}, sails.config.message.VEHICLE_NOT_FOUND);
            }

            return res.ok(vehicle, sails.config.message.VEHICLE_VERIFIED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getReportForm(req, res) {
        try {
            let params = req.allParams();
            if (!params || !params.categoryId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let reportForm = await ReportFormSetting.findOne({ categoryId: params.categoryId, isDeleted: false });
            if (!reportForm) {
                return res.ok({}, sails.config.message.REPORT_FORM_NOT_FOUND);
            }

            return res.ok(reportForm, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async paginate(req, res) {
        try {
            let params = req.allParams();
            let filter = await common.getFilter(params);
            filter.where.userId = req.user.id;
            let tickets = await Report.find(filter);
            if (!tickets) {

                throw sails.config.message.DAMAGE_REPORT_NOT_FOUND;
            }
            let countFilter = await common.removePagination(filter);
            let count = await Report.count(countFilter);
            let response = { list: tickets, count: count };

            return res.ok(response);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                throw sails.config.message.BAD_REQUEST;
            }
            let report = _.omit(params, ['id', 'status', 'statusTrack']);
            let updatedReport = await Report
                .update({ id: params.id })
                .set(report)
                .fetch();
            if (updatedReport && updatedReport.length) {

                return res.ok(updatedReport[0]);
            }

            return res.notFound({}, sails.config.message.DAMAGE_REPORT_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }

}
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
            let loggedInUser = req.user;
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
    }

}
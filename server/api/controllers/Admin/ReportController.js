const moment = require('moment');
const modelName = 'Report';
const UtilService = require(`${sails.config.appPath}/api/services/util`);

module.exports = {

    async paginate(req, res) {
        let params = req.allParams();
        try {
            let filter = await common.getFilter(params);
            let countFilter = await common.removePagination(filter);

            let recordsList = await Report.find(filter)
                .populate('categoryId', { select: ['name', 'code'] })
                .populate('subCategoryId', { select: ['name', 'code', 'parentId'] })
                .populate('addedBy', { select: ['name'] })
                .populate('taskId', { select: ['id', 'taskNumber'] })
                .populate('vehicleId', { select: ['name'] });

            recordsList = await Promise.all(_.map(recordsList, async (report) => {
                report['vehicleIssue'] = [];
                if (report.categoryId && sails.config.REPORT.ISSUE_TYPE[report.categoryId.code]) {
                    await _.map(report.issueType, async (issue) => {
                        let issueType = report.categoryId.code;
                        report.vehicleIssue.push(sails.config.REPORT.ISSUE_TYPE_STRING[issueType][issue]);
                    })
                }
                return report;
            }));
            let response = { list: recordsList };

            response.count = await Report.count(countFilter);

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
            let record = await Report.findOne({ id: params.id })
                .populate('categoryId', { select: ['name', 'code'] })
                .populate('subCategoryId', { select: ['name', 'code', 'parentId'] })
                .populate('addedBy', { select: ['name'] })
                .populate('vehicleId', { select: ['name'] });;

            recordsList = await Promise.all(_.map([record], async (report) => {
                report['vehicleIssue'] = [];
                if (sails.config.REPORT.ISSUE_TYPE[report.categoryId.code]) {
                    await _.map(report.issueType, async (issue) => {
                        let issueType = report.categoryId.code;
                        report.vehicleIssue.push(sails.config.REPORT.ISSUE_TYPE_STRING[issueType][issue]);
                    })
                }
                return report;
            }));
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
            let params = req.allParams();
            // get filter
            if (!params.id && !params.taskId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let report = await Report.findOne({ id: params.id });
            if (!report || report.isDeleted) {
                return res.notFound({}, sails.config.message.REPORT_LIST_NOT_FOUND);
            }
            let data = _.omit(params, 'id');
            let updatedRecord = await Report
                .update({ id: params.id })
                .set(data)
                .fetch();

            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord[0], sails.config.message.REPORT_UPDATED);
            }

            return res.ok({}, sails.config.message.REPORT_LIST_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async updateStatus(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let paramsToUpdate = _.omit(params, "id");
            let report = await Report.findOne({ id: params.id });
            if (!report || report.isDeleted) {
                return res.notFound({}, sails.config.message.REPORT_LIST_NOT_FOUND);
            }
            let statusTrack = report.statusTrack;
            if (!statusTrack || !_.isArray(statusTrack)) {
                statusTrack = [];
            }
            let newStatus = {
                before: report.status,
                after: params.status,
                remark: params.remark,
                dateTime: UtilService.getTimeFromNow(),
                userId: req.user.id
            };
            statusTrack.unshift(newStatus);
            paramsToUpdate.status = params.status;
            paramsToUpdate.statusTrack = statusTrack;
            let updatedRecord = await Report
                .update({ id: params.id }, paramsToUpdate)
                .fetch();

            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord[0], sails.config.message.REPORT_UPDATED);
            }

            return res.ok({}, sails.config.message.FAILED_UPDATE_STATUS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
}
const UtilService = require("./util");

module.exports = {
    async changeReportStatus(status, reportId, userId) {
        let paramsReport = {};
        let record = await Report.findOne({ id: reportId });
        let statusTrack = record.statusTrack;
        if (!statusTrack || !_.isArray(statusTrack)) {
            statusTrack = [];
        }
        let statusString = sails.config.REPORT.STATUS_STRING[status];
        statusString = statusString.replace("_", " ");
        statusString = statusString.toLowerCase();
        statusString = statusString.replace("task", "");
        let newStatus = {
            before: record.status,
            after: status,
            remark: `Report task ${statusString}.`,
            dateTime: UtilService.getTimeFromNow(),
            userId: userId
        };
        statusTrack.unshift(newStatus);
        paramsReport.status = status;
        paramsReport.statusTrack = statusTrack;
        await Report.update({ id: task.reportId })
            .set(paramsReport)
            .fetch();
    }
}
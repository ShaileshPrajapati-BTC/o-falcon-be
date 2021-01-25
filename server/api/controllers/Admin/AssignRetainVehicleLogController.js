const UtilService = require(`${sails.config.appPath}/api/services/util`);

module.exports = {
    async getLogs(req, res) {
        try {
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let logs = await AssignRetainVehicleLog.find(filter)
                .populate("referenceId", { select: ["name", "type"] })
                .populate("assignerId", { select: ["name", "type"] })
                .sort([{ createdAt: "DESC" }]);

            if (!logs.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            return res.ok(logs, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
};

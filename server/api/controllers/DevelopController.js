let IOTService = require(sails.config.appPath + "/api/services/iot");
module.exports = {
    test: async function (req, res) {
        await IOTService.getNewToken()
        console.log("done");
        return res.ok({}, sails.config.message.OK)
    }
};
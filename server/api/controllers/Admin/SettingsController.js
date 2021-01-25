/**
 * Common Controller Template
 *
 * @description :: Server-side logic for generating common Template for API.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ProjectSetupConfigService = require(`${sails.config.appPath}/api/services/projectSetupConfig`);
module.exports = {

    async get(req, res) {
        let params = req.allParams();
        try {
            const fields = ['type'];
            commonValidator.checkRequiredParams(fields, params);
            // get setting
            let setings = await Settings.findOne({ type: params.type });

            return res.ok(setings, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();
            // required params check

            // update
            let paramsToUpdate = _.omit(params, 'id');
            let updatedRecord = await Settings.update({ type: params.type })
                .set(paramsToUpdate)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                await ProjectSetupConfigService.buildSettingConfig();

                return res.ok(_.first(updatedRecord), sails.config.message.SETTING_RECORD_UPDATED);
            }

            return res.notFound({}, sails.config.message.RECORD_LIST_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }

};

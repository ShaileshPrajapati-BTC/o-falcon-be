const moment = require('moment');
const modelName = 'Nest';
const ObjectId = require('mongodb').ObjectID;
const NestService = require(`${sails.config.appPath}/api/services/nest`);

module.exports = {
    async nestList(req, res) {
        try {
            let params = req.allParams();

            let filter = { type: sails.config.NEST_TYPE.RIDER }
            if (params && params.nestId) {
                filter.id = { '!=': params.nestId }
            }
            let recordsList = await Nest.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = { list: recordsList };
            response.count = recordsList.length;

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async view(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // find record
            let record = await Nest.findOne({ id: params.id, isDeleted: false });

            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.NEST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
}
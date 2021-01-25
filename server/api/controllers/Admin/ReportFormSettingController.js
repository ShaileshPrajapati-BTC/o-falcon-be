const moment = require('moment');
const modelName = 'ReportFormSetting';

module.exports = {
    async create(req, res) {
        try {
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName
            };
            const loggedInUser = req.user;
            await commonValidator.validateCreateParams(option);

            let isExist = await ReportFormSetting.findOne({ categoryId: params.categoryId });
            if (isExist) {
                return res.ok({}, sails.config.message.REPORT_FORM_DUPLICATE);
            }

            params.addedBy = loggedInUser.id;
            params.addedAt = moment().toISOString();
            let createdRecord = await ReportFormSetting.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.REPORT_FORM_SETTING_CREATED);
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
            const loggedInUser = req.user;
            params.updatedBy = loggedInUser.id;

            let data = _.omit(params, 'id');
            let updatedRecord = await ReportFormSetting
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord[0], sails.config.message.REPORT_FORM_SETTING_UPDATED);
            }

            return res.notFound({}, sails.config.message.REPORT_FORM_SETTING_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        try {
            // Find single report form
            let reportForm = await ReportFormSetting.findOne({ id: params.id });
            if (!reportForm) {
                return res.notFound({}, sails.config.message.REPORT_FORM_SETTING_NOT_FOUND);
            }
            const loggedInUser = req.user;

            await ReportFormSetting
                .destroy({ id: params.id });

            return res.ok({}, sails.config.message.REPORT_FORM_SETTING_DELETE);

        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async paginate(req, res) {
        let params = req.allParams();
        try {
            let filter = await common.getFilter(params);
            let countFilter = await common.removePagination(filter);

            let recordsList = await ReportFormSetting.find(filter)
                .populate('categoryId', { select: ['name', 'parentId'] });
            let response = { list: recordsList };

            response.count = await ReportFormSetting.count(countFilter);

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
            let record = await ReportFormSetting.findOne({ id: params.id });

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
}
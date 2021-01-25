const moment = require('moment');
const modelName = 'TaskFormSetting';

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
            let isExist = await TaskFormSetting.findOne({ level: params.level, taskType: params.taskType, isDeleted: false });
            if (isExist) {
                return res.ok({}, sails.config.message.TASK_FORM_DUPLICATE);
            }
            params.addedBy = loggedInUser.id;
            params.addedAt = moment().toISOString();
            let createdRecord = await TaskFormSetting.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.TASK_FORM_SETTING_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getTaskForm(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.level && !params.taskType) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            delete params.updateFilter;
            delete params.deleteFilter;
            delete params.viewFilter;

            let record = await TaskFormSetting.findOne(params);
            if (!record) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            return res.ok(record, sails.config.message.OK);
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
            let updatedRecord = await TaskFormSetting
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord[0], sails.config.message.TASK_FORM_SETTING_UPDATED);
            }

            return res.notFound({}, sails.config.message.TASK_FORM_SETTING_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        try {
            // Find single task
            let taskForm = await TaskFormSetting.findOne({ id: params.id });
            if (!taskForm || taskForm.isDeleted) {
                return res.notFound({}, sails.config.message.TASK_FORM_SETTING_LIST_NOT_FOUND);
            }
            let task = await Task.find({
                where: {
                    taskWorkFlow: { '!=': [sails.config.TASK.WORK_FLOW.COMPLETE, sails.config.TASK.WORK_FLOW.CANCELLED] },
                    taskType: taskForm.taskType,
                    isDeleted: false
                }
            });
            if (task && task.length) {
                return res.ok({}, sails.config.message.LEVEL_TASK_FORM_NOT_COMPLETE);
            }
            const loggedInUser = req.user;
            let data = {};
            data.isDeleted = true;
            data.deletedBy = loggedInUser.id;
            data.deletedAt = moment().toISOString();
            let updatedRecord = await TaskFormSetting
                .update({ id: params.id })
                .set(data)
                .fetch();

            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord[0], sails.config.message.TASK_FORM_SETTING_DELETE);
            }

            return res.notFound({}, sails.config.message.TASK_FORM_SETTING_LIST_NOT_FOUND);
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

            let recordsList = await TaskFormSetting.find(filter);
            let response = { list: recordsList };

            response.count = await TaskFormSetting.count(countFilter);

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
            let record = await TaskFormSetting.findOne({ id: params.id });

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
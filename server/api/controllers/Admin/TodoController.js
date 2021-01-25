const modelName = 'todo';

module.exports = {

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let recordsList = await Todo.find(filter)
                .populate('status', { select: ['name'] })
                .populate('completedBy', { select: ['firstName', 'lastName'] })
                .populate('parentToDoId', { select: ['title', 'description'] })
                .populate('addedBy', { select: ['firstName', 'lastName'] });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            
            for (key in recordsList) {
                if (recordsList[key].referenceId) {
                    let referenceIdData = await common.getReference(recordsList[key].referenceId, recordsList[key].module);               
                    recordsList[key].referenceId = referenceIdData;
                }                
            }
            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Todo.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async add(req, res) {
        try {
            let params = req.allParams();

            let option = {
                params: params,
                modelName: modelName
            };
            if (params.attachment && _.size(params.attachment) > 0) {
                params.attachment = await common.addUUID(params.attachment);
            }

            if (params.assignedTo && _.size(params.assignedTo) > 0) {
                params.assignedTo = await common.addUUID(params.assignedTo);
            }
            const loggedInUser = req.user;
            params.completedBy = loggedInUser.id;
            await commonValidator.validateCreateParams(option);
            let createdRecord = await Todo.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.TODO_CREATED);
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

            if (params.attachment && _.size(params.attachment) > 0) {
                params.attachment = await common.addUUID(params.attachment);
            }

            if (params.assignedTo && _.size(params.assignedTo) > 0) {
                params.assignedTo = await common.addUUID(params.assignedTo);
            }
            let data = _.omit(params, 'id');
            let updatedRecord = await Todo
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord[0], sails.config.message.TODO_UPDATED);
            }

            return res.notFound({}, sails.config.message.TODO_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            // find record
            let record = await Todo.findOne({ id: params.id })
                .populate('status', { select: ['name'] })        
                .populate('completedBy', { select: ['firstName', 'lastName'] })
                .populate('parentToDoId', { select: ['title', 'description'] })
                .populate('addedBy', { select: ['firstName', 'lastName'] });
            // return record
            if (record.referenceId) {
                let referenceIdData = await common.getReference(record.referenceId, record.module);               
                record.referenceId = referenceIdData;
            }
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.TODO_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        try {            
            // create todo
            let todo = await Todo.findOne({ id: params.id });
            if (!todo || todo.isDeleted) {
                return res.notFound({}, sails.config.message.TODO_LIST_NOT_FOUND);
            }
            const loggedInUser = req.user;
            let data = {};
            data.isDeleted = true;
            data.deletedBy = loggedInUser.id;
            data.deletedAt = new Date();
            let updatedTodo = await Todo
                .update({ id: params.id })
                .set(data)
                .fetch();

            if (updatedTodo && updatedTodo.length) {
                return res.ok(updatedTodo[0], sails.config.message.TODO_DELETED);
            }

            return res.notFound({}, sails.config.message.TODO_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
}
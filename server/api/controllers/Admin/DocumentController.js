const modelName = 'document';
const DocumentService = require(`${sails.config.appPath}/api/services/document`);

module.exports = {

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            delete params.filter.franchiseeId;
            delete params.filter.dealerId;
            let filter = await common.getFilter(params);
            let recordsList = await Document.find(filter)
                .populate('type', { select: ['name', 'code'] });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            for (key in recordsList) {
                if (recordsList[key].referenceId) {
                    let referenceIdData = await common.getActivityLogReference(recordsList[key].referenceId, recordsList[key].module);
                    recordsList[key].referenceId = referenceIdData;
                }
            }
            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Document.count(countFilter)
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
            if (!params || (!params.type && !params.name) || !params.path) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            await commonValidator.validateCreateParams(option);

            // Check duplicate document.
            let message = await DocumentService.checkDuplication(params);
            if (_.isObject(message)) {
                return res.badRequest({}, message);
            }

            let createdRecord = await Document.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.DOCUMENT_CREATED);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            let loginUser = req.user;
            // get filter
            let params = req.allParams();
            if (!params || (!params.type && !params.name) || !params.path) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // Check duplicate document.
            let message = await DocumentService.checkDuplication(params);
            if (_.isObject(message)) {
                return res.badRequest({}, message);
            }

            let option = {
                params: params,
                modelName: modelName,
                updatedBy: loginUser.id
            };
            await commonValidator.validateUpdateParams(option);

            let data = _.omit(params, 'id');
            let updatedRecord = await Document
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length > 0) {
                return res.ok(updatedRecord[0], sails.config.message.DOCUMENT_UPDATED);
            }

            return res.notFound({}, sails.config.message.DOCUMENT_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            let loginUser = req.user;
            // find record
            let recordsList = await Document.find({ id: params.id, isDeleted: false })
                .populate('type', { select: ['name', 'code'] });
            // return record
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.DOCUMENT_NOT_FOUND);
            }
            for (key in recordsList) {
                if (recordsList[key].referenceId) {
                    let referenceIdData = await common.getActivityLogReference(recordsList[key].referenceId, recordsList[key].module);
                    recordsList[key].referenceId = referenceIdData;
                }
            }
            let response = { list: recordsList };

            if (response) {
                return res.ok(response, sails.config.message.OK);
            }

            // return res.ok({}, sails.config.message.DOCUMENT_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let document = await Document.findOne({ id: params.id });
            if (!document || document.isDeleted) {
                return res.notFound({}, sails.config.message.DOCUMENT_LIST_NOT_FOUND);
            }

            // Document is approved then soft delete document.
            if (document.status === sails.config.DOCUMENT.STATUS.APPROVED) {
                const loggedInUser = req.user;
                let data = {};
                data.isDeleted = true;
                data.deletedBy = loggedInUser.id;
                data.deletedAt = new Date();
                let updatedDocument = await Document
                    .update({ id: params.id })
                    .set(data)
                    .fetch();

                if (updatedDocument && updatedDocument.length > 0) {
                    return res.ok({}, sails.config.message.DOCUMENT_DELETED);
                }
            } else {
                let deleteDocument = await Document.destroy({ id: params.id }).fetch();
                if (deleteDocument && deleteDocument.length > 0) {
                    params.paths = [document.path];
                    let removeFile = await DocumentService.removeFiles(params);
                    if (removeFile.isDeleted) {
                        return res.ok({}, sails.config.message.DOCUMENT_DELETED);
                    }
                    return res.notFound({}, removeFile);
                }
            }

            return res.notFound({}, sails.config.message.DOCUMENT_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
}

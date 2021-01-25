const modelName = 'procedure';

module.exports = {

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            filter.sort = 'sequence asc';
            let recordsList = await Procedure.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await Procedure.count(countFilter)
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
            let lastSequence = await Procedure.find({
                where: {},
                limit: 1,
                sort: 'sequence desc'
            });
            let newSequence = 1;
            if (lastSequence[0] && lastSequence[0].sequence) {
                newSequence = lastSequence[0].sequence + 1;
            }
            params.sequence = newSequence;
            await commonValidator.validateCreateParams(option);
            let createdRecord = await Procedure.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.PROCEDURE_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            // get filter
            let params = req.allParams();
            // let modelName = 'vehicle';
            let option = {
                params: params,
                modelName: modelName
            };
            await commonValidator.validateUpdateParams(option);
            let data = _.omit(params, 'id');
            let updatedRecord = await Procedure
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length > 0) {
                return res.ok(updatedRecord[0], sails.config.message.PROCEDURE_UPDATED);
            }

            return res.notFound({}, sails.config.message.PROCEDURE_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
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
            let record = await Procedure.findOne({ id: params.id });
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.PROCEDURE_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async bulkSequenceUpdate(req, res) {
        const params = req.allParams();
        let updatedData = [];

        try {
            if (!params || !params.sequences || !params.sequences.length) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let filter = { id: { in: _.map(params.sequences, 'id') } };
            let records = await Procedure.find(filter);
            if (records && records.length) {
                for (let record of records) {
                    const findSequence = _.find(params.sequences, { id: record.id });
                    if (findSequence) {
                        record.sequence = findSequence.sequence;
                        record.updatedBy = params.updatedBy;
                        let response = await Procedure
                            .update({ id: record.id })
                            .set(record)
                            .fetch();
                        updatedData.push(_.first(response));
                    }
                }

                return res.ok(updatedData, sails.config.message.OK);
            }

            return res.serverError(null, sails.config.message.NOT_FOUND);
        } catch (err) {
            console.log('err', err);

            return res.serverError(null, err);
        }
    }
};

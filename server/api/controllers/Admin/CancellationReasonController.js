const modelName = 'cancellationreason';
const isFranchisee = sails.config.USER.TYPE.FRANCHISEE;
const isDealer = sails.config.USER.TYPE.DEALER;

module.exports = {

    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            if (req.user.type === isFranchisee || req.user.type === isDealer) {
                params.filter.addedBy = req.user.id;
            } else {
                params.filter.addedBy = null;
            }
            let filter = await common.getFilter(params);
            filter.sort = 'sequence asc';
            let recordsList = await CancellationReason.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await CancellationReason.count(countFilter)
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
            if (req.user.type === isFranchisee || req.user.type === isDealer) {
                params.addedBy = req.user.id;
            } else {
                params.addedBy = null;
            }
            let option = {
                params: params,
                modelName: modelName
            };
            let lastSequence = await CancellationReason.find({
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
            let createdRecord = await CancellationReason.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.CANCELLATION_REASON_CREATED);
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
            let updatedRecord = await CancellationReason
                .update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length > 0) {
                return res.ok(updatedRecord[0], sails.config.message.CANCELLATION_REASON_UPDATED);
            }

            return res.notFound({}, sails.config.message.CANCELLATION_REASON_NOT_FOUND);
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
            let record = await CancellationReason.findOne({ id: params.id });
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.CANCELLATION_REASON_NOT_FOUND);
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
            let records = await CancellationReason.find(filter);
            if (records && records.length) {
                for (let record of records) {
                    const findSequence = _.find(params.sequences, { id: record.id });
                    if (findSequence) {
                        record.sequence = findSequence.sequence;
                        let response = await CancellationReason
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

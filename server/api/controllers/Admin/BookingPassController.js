const modelName = "bookingpass";

module.exports = {
    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let recordsList = await BookingPass.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await BookingPass.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async add(req, res) {
        try {
            let params = req.allParams();
            const fields = [
                "name",
                "code",
                "description",
                "passType",
                "vehicleTypes",
                "limitType",
                "limitValue",
            ];
            commonValidator.checkRequiredParams(fields, params);

            let option = {
                params: params,
                modelName: modelName,
            };

            await commonValidator.validateCreateParams(option);
            let createdRecord = await BookingPass.create(params).fetch();

            return res.ok(
                createdRecord,
                sails.config.message.BOOKING_PASS_CREATED
            );
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();
            let option = {
                params: params,
                modelName: modelName,
            };
            await commonValidator.validateUpdateParams(option);
            let oldRecord = await BookingPass.findOne({ id: params.id });
            let data = _.omit(params, "id");
            let updatedRecord = await BookingPass.update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length > 0) {
                return res.ok(
                    updatedRecord[0],
                    sails.config.message.BOOKING_PASS_UPDATED
                );
            }

            return res.notFound({}, sails.config.message.BOOKING_PASS_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let record = await BookingPass.findOne({ id: params.id });
            if (!record || !record.id || record.isDeleted) {
                return res.ok({}, sails.config.message.BOOKING_PASS_NOT_FOUND);
            }

            return res.ok(record, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

};

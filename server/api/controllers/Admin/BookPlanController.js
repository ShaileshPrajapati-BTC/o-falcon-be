const modelName = "bookplan";
const BookPlanService = require(`${sails.config.appPath}/api/services/bookPlan`);

module.exports = {
    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            let recordsList = await BookPlan.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await BookPlan.count(countFilter).meta({
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
                "description",
                "limitType",
                "limitValue",
                "startDateTimeToBuy",
                "endDateTimeToBuy",
                "isRenewable",
                "price",
                "planType",
                "planValue",
            ];
            commonValidator.checkRequiredParams(fields, params);

            if (params.isTrialPlan) {
                params.price = 0;
            }

            let option = {
                params: params,
                modelName: modelName,
            };

            await commonValidator.validateCreateParams(option);
            let createdRecord = await BookPlan.create(params).fetch();

            return res.ok(
                createdRecord,
                sails.config.message.BOOK_PLAN_CREATED
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
            let oldRecord = await BookPlan.findOne({ id: params.id });
            let data = _.omit(params, "id");
            let updatedRecord = await BookPlan.update({ id: params.id })
                .set(data)
                .fetch();
            if (updatedRecord && updatedRecord.length > 0) {
                await BookPlanService.updateRenewableStatus(
                    oldRecord.isRenewable,
                    updatedRecord[0].isRenewable,
                    oldRecord.id
                );

                return res.ok(
                    updatedRecord[0],
                    sails.config.message.BOOK_PLAN_UPDATED
                );
            }

            return res.notFound({}, sails.config.message.BOOK_PLAN_NOT_FOUND);
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

            let record = await BookPlan.findOne({ id: params.id });
            if (!record || !record.id || record.isDeleted) {
                return res.ok({}, sails.config.message.BOOK_PLAN_NOT_FOUND);
            }

            return res.ok(record, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async userActivePlans(req, res) {
        try {
            let params = req.allParams();
            // id: User's ID whose current plan you want to see
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            const user = await User.findOne({ id: params.id }).select([
                "currentBookingPlanInvoiceId",
                "nextBookingPlanInvoiceId",
            ]);
            let currentBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                user.currentBookingPlanInvoiceId
            );
            let nextBookPlanInvoice = await BookPlanService.getUserPlanInvoice(
                user.nextBookingPlanInvoiceId
            );

            let response = {};
            response.currentPlan = currentBookPlanInvoice;
            response.nextPlan = nextBookPlanInvoice;

            return res.ok(response, sails.config.message.OK);
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
            let plan = await BookPlan.findOne({ id: params.id });
            if (!plan || plan.isDeleted) {
                return res.notFound(
                    {},
                    sails.config.message.BOOK_PLAN_NOT_FOUND
                );
            }
            await BookPlanService.checkCanDeletePlan(plan.id);
            let updatedPlan = await BookPlan.update({ id: params.id })
                .set({ isDeleted: true, updatedBy: params.updatedBy })
                .fetch();

            if (updatedPlan) {
                return res.ok(
                    updatedPlan,
                    sails.config.message.BOOK_PLAN_DELETED
                );
            }

            return res.notFound({}, sails.config.message.BOOK_PLAN_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },
};

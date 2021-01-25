const moment = require('moment');
const modelName = 'ReportCategory';

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
            params.addedBy = loggedInUser.id;
            params.addedAt = moment().toISOString();
            let createdRecord = await ReportCategory.create(params).fetch();

            return res.ok(createdRecord, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async paginate(req, res){
        let params = req.allParams();
        try {
            let filter = await common.getFilter(params);
            let countFilter = await common.removePagination(filter);

            let recordsList = await ReportCategory.find(filter);

            let response = { list: recordsList };
            response.count = await ReportCategory.count(countFilter);

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async getCategory(req, res){
        let params = req.allParams();
        try {
            let filter = await common.getFilter(params);

            let recordsList = await ReportCategory.find(filter);
            let subCategoryArr = [];
            let category = [];
            await Promise.all(
                _.map(recordsList, async (rec) => {
                    if(rec.parentId){
                        subCategoryArr.push(rec);
                    }
                    if (!rec.parentId) {
                        rec.subCategory = await Promise.all(
                            _.map(subCategoryArr, async (subCategory) => {
                                if(rec.id === subCategory.parentId){
                                    return subCategory;
                                }
                            })
                        );
                        category.push(rec);
                    }
                })
            );

            let response = { list: category };

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
}
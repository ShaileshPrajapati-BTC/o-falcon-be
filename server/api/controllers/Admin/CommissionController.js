const CommissionService = require(`${sails.config.appPath}/api/services/commissionService`);
const CommonService = require(`${sails.config.appPath}/api/services/common`);

module.exports = {
    async updateAllCommissionSettings(req, res) {
        try {
            const params = req.allParams();
            const fields = ['commissionType'];
            commonValidator.checkRequiredParams(fields, params);
            let data = CommissionService.validateCommissionValues(params.commissionType, params.commissionAmount, params.commissionPercentage);
            params.commissionAmount = data.amount;
            params.commissionPercentage = data.percentage;
            await CommissionService.updateCommissionInSettings(params, req.user.id);
            await CommissionService.updateCommissionOfAllFranchisee(params, req.user.id);

            return res.ok(null, sails.config.message.UPDATE_ALL_COMMISSION_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async updateCommissionOfFranchisee(req, res) {
        try {
            const params = req.allParams();
            const fields = ['type', 'franchiseeId'];
            commonValidator.checkRequiredParams(fields, params);
            let data = CommissionService.validateCommissionValues(params.type, params.amount, params.percentage);
            params.amount = data.amount;
            params.percentage = data.percentage;
            await CommissionService.updateCommissionOfFranchisee(params, req.user.id);

            res.ok(null, sails.config.message.UPDATE_COMMISSION_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async paginate(req, res) {
        try {
            let params = req.allParams();
            let filter = await CommonService.getFilter(params);
            let countFilter = await CommonService.removePagination(filter);
            let commissions = await Commission.find(filter).populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] });
            if (!commissions.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let statusTracks = _.map(commissions, 'track');
            statusTracks = _.compact(statusTracks);
            statusTracks = _.uniq(statusTracks);
            statusTracks = _.flatten(statusTracks);
            let userIds = _.map(statusTracks, e => {
                return e.userId.toString();
            });

            let users = await User.find({
                where: { id: userIds },
                select: ['name']
            });
            for (let recordKey in commissions) {
                if (!commissions[recordKey]) {
                    continue;
                }
                for (let trackKey in commissions[recordKey].track) {
                    if (!commissions[recordKey].track[trackKey]) {
                        continue;
                    }
                    let user = _.find(users, { id: commissions[recordKey].track[trackKey].userId.toString() });
                    commissions[recordKey].track[trackKey].user = user;
                }
            }

            let response = { list: commissions };
            response.count = await Commission.count(countFilter).meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async getUnpaidCommission(req, res) {
        try {
            let params = req.allParams();
            const fields = ['franchiseeId'];
            commonValidator.checkRequiredParams(fields, params);
            let response = await CommissionService.getUnpaidCommission(params.franchiseeId);

            return res.ok(response, sails.config.message.GET_UNPAID_COMMISSION_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async getCommissionListOfAllFranchisee(req, res) {
        try {
            let params = req.allParams();
            const fields = ['limit', 'page'];
            commonValidator.checkRequiredParams(fields, params);
            let sort = CommonService.generateSortingOptionForAggregateQuery(params.sort);
            let searchKeyword = null;
            if (params.search && params.search.keyword) {
                searchKeyword = params.search.keyword;
            }
            let list = await CommissionService.getTotalCommissionList(params.page, params.limit, sort, searchKeyword);
            if (!list.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let query = [
                {
                    $match: {
                        franchiseeId: { $ne: null }
                    }
                },
                {
                    $lookup: {
                        from: 'User',
                        localField: 'franchiseeId',
                        foreignField: '_id',
                        as: 'franchiseeId'
                    }
                },
                {
                    $unwind: "$franchiseeId"
                }
            ];

            // TODO-OPTIMIZE: in $lookup franchisee, project only $name field, not whole User object
            if (searchKeyword) {
                // searchKeyword = searchKeyword.split('').join('%'); // for advance search
                query.push({
                    $match: {
                        "franchiseeId.name": {
                            $regex: new RegExp("^" + _.escapeRegExp(`%${searchKeyword}%`).replace(/^%/, ".*").replace(/([^\\])%/g, "$1.*").replace(/\\%/g, "%") + "$"),
                            $options: "i"
                        }
                    }
                });
            }
            query.push(
                {
                    $group: {
                        _id: { franchiseeId: "$franchiseeId" }
                    }
                },
                {
                    $count: 'count'
                }
            );
            let response = {
                list: list
            };
            let count = await CommonService.runAggregateQuery(query, 'rideBooking');
            if (count && count.length > 0) {
                response.count = count[0].count;
            }

            return res.ok(response, sails.config.message.GET_FRANCHISEE_COMMISSION_DETAIL);
        } catch (error) {
            console.log(error);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
};
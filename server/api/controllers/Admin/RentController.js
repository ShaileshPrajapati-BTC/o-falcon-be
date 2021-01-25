const RentService = require(`${sails.config.appPath}/api/services/rent`);
const CommonService = require(`${sails.config.appPath}/api/services/common`);

module.exports = {
    async updateDefaultRent(req, res) {
        try {
            let params = req.allParams();
            params = RentService.getUpdatedParams(req.user.type, params);
            const fields = ["vehicleRentAmount", "userType"];
            commonValidator.checkRequiredParams(fields, params);
            await RentService.updateDefaultRentInSettings(params);

            return res.ok({}, sails.config.message.UPDATE_DEFAULT_RENT_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async updateUserRent(req, res) {
        try {
            const params = req.allParams();
            const fields = ["vehicleRentAmount", "referenceId"];
            commonValidator.checkRequiredParams(fields, params);
            let updatedFranchiseeObj = await RentService.updateUserRent(
                params,
                req.user.id
            );

            res.ok(
                updatedFranchiseeObj,
                sails.config.message.UPDATE_RENT_SUCCESS
            );
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async paginate(req, res) {
        try {
            let params = req.allParams();
            if (!params.filter) {
                params.filter = {};
            }
            let tempParam = RentService.getUpdatedParams(req.user.type);
            params.filter.userType = tempParam.userType;
            params.filter.parentId = req.user.id;
            delete params.filter.referenceId;
            let searchFilter = { search: params.search };
            delete params.search;
            let searchedUsers = [];
            if (searchFilter.search) {
                let userSearchFilter = await CommonService.getFilter(searchFilter);
                searchedUsers = await User
                    .find(userSearchFilter)
                    .select(['id'])
                let searchedUsersIdsArray = _.map(
                    searchedUsers,
                    (user) => user.id
                );
                params.filter.referenceId = searchedUsersIdsArray;
            }
            let filter = await CommonService.getFilter(params);
            let countFilter = await CommonService.removePagination(filter);
            let rents = await Rent.find(filter).populate("referenceId", {
                select: ["firstName", "lastName", "name"],
            });
            if (!rents.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let statusTracks = _.map(rents, "track");
            statusTracks = _.compact(statusTracks);
            statusTracks = _.uniq(statusTracks);
            statusTracks = _.flatten(statusTracks);
            let userIds = _.map(statusTracks, (e) => {
                return e.userId.toString();
            });

            let users = await User.find({
                where: { id: userIds },
                select: ["name"],
            });
            for (let recordKey in rents) {
                if (!rents[recordKey]) {
                    continue;
                }
                for (let trackKey in rents[recordKey].track) {
                    if (!rents[recordKey].track[trackKey]) {
                        continue;
                    }
                    let user = _.find(users, {
                        id: rents[recordKey].track[trackKey].userId.toString(),
                    });
                    rents[recordKey].track[trackKey].user = user;
                }
            }

            let response = { list: rents };
            response.count = await Rent.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async getRent(req, res) {
        let params = req.allParams();
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let userRent = await Rent.findOne({ referenceId: params.id, })
                .populate("referenceId", { select: ["firstName", "lastName", "name"] })
                .populate("parentId", { select: ["firstName", "lastName", "name"] });

            if (!userRent) {
                return res.notFound({}, sails.config.message.NOT_FOUND);
            }
            let statusTracks = userRent.track;
            statusTracks = _.compact(statusTracks);
            statusTracks = _.uniq(statusTracks);
            statusTracks = _.flatten(statusTracks);
            let userIds = _.map(statusTracks, (e) => {
                return e.userId.toString();
            });
            let users = await User.find({
                where: { id: userIds },
                select: ["name"],
            });

            for (let index in statusTracks) {
                let user = _.find(users, {
                    id: userRent.track[index].userId.toString(),
                });
                userRent.track[index].user = user;
            }

            return res.ok(userRent, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
};

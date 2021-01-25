/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require("lodash");
const bcrypt = require("bcrypt-nodejs");
const uuid = require("uuid");
const moment = require("moment");

const CommonService = require(`${sails.config.appPath}/api/services/common`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const UserService = require(`${sails.config.appPath}/api/services/user`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const KycService = require(`${sails.config.appPath}/api/services/kyc`);
const TaskService = require(`${sails.config.appPath}/api/services/task`);

module.exports = {
    /**
     *  user list
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async paginate(req, res) {
        let params = req.allParams();
        let loginUser = req.user;
        if (!params) {
            params = {};
        }
        params.type = sails.config.USER.TYPE.FEEDER;
        try {
            let filter = await CommonService.getFilter(params);
            let countFilter = await CommonService.removePagination(filter);
            let users = await User.find(filter)
                .populate("parentId", { select: ["name"] })
                .populate("customerId", { select: ["name"] })
                .meta({ enableExperimentalDeepTargets: true });
            users = await Promise.all(_.map(users, async (feeder) => {
                feeder.taskSummery = await TaskService.userTaskSummary(feeder.id);
                return feeder;
            }));
            let response = { list: users };

            response.count = await User.count(countFilter).meta({
                enableExperimentalDeepTargets: true,
            });

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     *  user view
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async view(req, res) {
        let params = req.allParams();
        try {
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // create user
            let user = await User.findOne({ id: params.id })
                .populate("customerId", { select: ["name"] });
            if (user) {
                user.taskSummery = await TaskService.userTaskSummary(user.id);
                return res.ok(user, sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     *  user list
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async update(req, res) {
        let params = req.allParams();
        try {
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // duplicate
            let message = await UserService.checkDuplicationForDevice(params);
            if (_.isObject(message)) {
                return res.badRequest({}, message);
            }

            // const requestedUser = await User.findOne({ id: params.id });
            let user = _.omit(params, "id");
            let updatedUser = await User.update({ id: params.id })
                .set(user)
                .fetch();
            if (updatedUser) {
                return res.ok(updatedUser, sails.config.message.USER_UPDATED);
            }

            return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async delete(req, res) {
        let params = req.allParams();
        try {
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            // create user
            let user = await User.findOne({ id: params.id });
            if (!user || user.isDeleted) {
                return res.notFound(
                    {},
                    sails.config.message.USER_LIST_NOT_FOUND
                );
            }
            let updatedUser = await User.update({ id: params.id })
                .set({ isDeleted: true, updatedBy: params.updatedBy })
                .fetch();

            if (updatedUser) {
                return res.ok(updatedUser, sails.config.message.USER_DELETED);
            }

            return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
};

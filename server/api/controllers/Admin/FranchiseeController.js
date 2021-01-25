/**
 * UserController
 *
 * @description :: Server-side logic for managing partner users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs');
const uuid = require('uuid');
const moment = require('moment');

const CommonService = require(`${sails.config.appPath}/api/services/common`);
const FranchiseeService = require(`${sails.config.appPath}/api/services/franchiseeService`);
const CommissionService = require(`${sails.config.appPath}/api/services/commissionService`);
const UserService = require(`${sails.config.appPath}/api/services/user`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const VehicleService = require(`${sails.config.appPath}/api/services/vehicle`);
const EmailService = require(`${sails.config.appPath}/api/services/email`);
const RentService = require(`${sails.config.appPath}/api/services/rent`);

module.exports = {
    /**
     * create user with unique params
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async register(req, res) {
        let params = req.allParams();

        try {
            // required params check

            // ************* todo: changes for required params
            const fields = ['firstName', 'emails', 'seriesCode', 'uniqueIdentityNumber'];
            commonValidator.checkRequiredParams(fields, params);
            if (params.seriesCode.trim() == '') {
                throw sails.config.message.GIVE_UNIQUE_SERIES_CODE;
            }

            let seriesGenerator = await SeriesGenerator.findOne({ postfix: params.seriesCode });
            if (seriesGenerator) {
                throw sails.config.message.GIVE_UNIQUE_SERIES_CODE;
            }

            // type -> FRANCHISEE
            params.type = sails.config.USER.TYPE.FRANCHISEE;
            if (params.emails && _.size(params.emails) > 0) {
                _.each(params.emails, (email) => {
                    if (!email.id) {
                        email.id = uuid();
                        email.isVerified = true;
                    }
                });
            }
            if (params.mobiles && _.size(params.mobiles) > 0) {
                _.each(params.mobiles, (mobile) => {
                    if (!mobile.id) {
                        mobile.id = uuid();
                        mobile.isVerified = true;
                    }
                });
            }
            let message = await UserService.checkDuplication(params);
            if (_.isObject(message)) {
                return res.badRequest({}, message);
            }
            if (params.addresses && _.size(params.addresses) > 0) {
                _.each(params.addresses, (address) => {
                    if (!address.id) {
                        address.id = uuid();
                    }
                });
            }
            if (!params.password) {
                params.password = UtilService.randomString(6);
            }
            let passwordForEmail = params.password;

            let user = await User.create(params).fetch();
            if (user) {
                await FranchiseeService.addFranchiseeRideSeries(user.seriesCode, user.id);
                await FranchiseeService.createStaticPage(user.id);
                await FranchiseeService.createContactUs(user.id);
                await CommissionService.addDefaultCommission(user.id, req.user.id);
                await RentService.addDefaultRent(user.id, req.user.id, sails.config.USER.TYPE.FRANCHISEE);
                /** STRIPE ACCOUNT CREATE **/
                let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                let mail_obj = {
                    subject: `Welcome to ${sails.config.PROJECT_NAME}`,
                    to: primaryEmail,
                    template: 'franchiseeWelcomeEmail',
                    data: {
                        name: user.name || '-',
                        email: primaryEmail || '-',
                        username: primaryEmail || '-',
                        password: passwordForEmail
                    },
                    language: user.preferredLang
                };
                EmailService.send(mail_obj);
                // const token = Cipher.createToken(user);
                // await User.update({ id: user.id }, { loginToken: `JWT ${token}` });

                return res.ok(user, sails.config.message.USER_REGISTERED);
            }

            return res.serverError({}, sails.config.message.USER_REGISTER_FAILED);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    /**
     *  user list
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async paginate(req, res) {
        let params = req.allParams();
        try {
            let filter = await CommonService.getFilter(params);
            // type -> FRANCHISEE
            filter.where.type = sails.config.USER.TYPE.FRANCHISEE;
            let countFilter = await CommonService.removePagination(filter);

            let users = await User
                .find(filter)
                .populate('parentId', { select: ['name'] })
                .meta({ enableExperimentalDeepTargets: true });
            let roles = _.compact(_.uniq(_.flattenDeep(_.map(users, 'roles'))));
            if (roles && roles.length) {
                let groupRoles = await Roles.find({ where: { id: { in: roles } } });
                if (groupRoles && groupRoles.length) {
                    _.forEach(users, (user) => {
                        if (user.roles && user.roles.length) {
                            user.roles = _.map(user.roles, (role) => {
                                role = _.find(groupRoles, { id: role });

                                return _.pick(role, ['id', 'title']);
                            });
                        }
                    });
                }
            }
            if (sails.config.IS_MASK == true) {
                for (let key in users) {
                    let primaryMobile = UtilService.getPrimaryValue(users[key].mobiles, 'mobile');
                    let primaryEmail = UtilService.getPrimaryEmail(users[key].emails);
                    _.each(users[key].mobiles, (mobile) => {
                        mobile.mobile = CommonService.phoneNoMasking(primaryMobile);
                    });
                    _.each(users[key].emails, (email) => {
                        email.email = CommonService.emailMasking(primaryEmail);
                    })
                };
            }

            // Binding vehicle summary for each user
            await Promise.all(_.map(users, async (user) => {
                user.vehicleSummary = await VehicleService.getVehicleSummaryByUserId(user.id, params);
                let assignedVehicleCount = await Vehicle.count({ franchiseeId: user.id });
                let rideCount = await RideBooking.count({ franchiseeId: user.id });
                user.assignedVehicleCount = assignedVehicleCount;
                user.rideCount = rideCount;
            }));
            let response = { list: users };

            response.count = await User
                .count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

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
            let users = await User.findOne({ id: params.id });
            if (users) {
                if (sails.config.IS_MASK === true) {
                    let primaryMobile = UtilService.getPrimaryValue(users.mobiles, 'mobile');
                    users.mobiles[0].mobile = CommonService.phoneNoMasking(primaryMobile);
                    let primaryEmail = UtilService.getPrimaryEmail(users.emails);
                    users.emails[0].email = CommonService.emailMasking(primaryEmail);
                }
                const userSummary = await UserService.getUserSummary(params.id);
                users.rideSummary = userSummary.rideSummary;
                users.fareSummary = userSummary.fareSummary;

                // Binding vehicle summary for each user
                users.vehicleSummary = await VehicleService.getVehicleSummaryByUserId(params.id, params);

                return res.ok(users, sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async getVehicleOfFranchisee(req, res) {
        try {
            let params = req.allParams();
            const fields = ['franchiseeId'];
            commonValidator.checkRequiredParams(fields, params);
            let filter = await common.getFilter(params);

            let vehicles = await Vehicle.find(filter);

            return res.ok(vehicles, sails.config.message.OK);
        } catch (error) {
            console.log(error)

            return res.serverError(null, error);
        }
    },

    async assignVehicle(req, res) {
        try {
            let params = req.allParams();
            let fields = ['franchiseeId', 'vehicleIds'];
            commonValidator.checkRequiredParams(fields, params);
            let vehicles = await VehicleService.assignVehicle(params.franchiseeId, req.user.id, params.vehicleIds);
            let vehicleDataToUpdate = {};
            if (params.rentStartDate) {
                vehicleDataToUpdate.franchiseeRentStartDate = params.rentStartDate;
            }
            if (params.fleetType) {
                vehicleDataToUpdate.fleetType = params.fleetType;
            }
            if (vehicleDataToUpdate && (vehicleDataToUpdate.franchiseeRentStartDate || vehicleDataToUpdate.fleetType)) {
                await Vehicle.update({ id: params.vehicleIds }, vehicleDataToUpdate);
            }

            return res.ok(vehicles, sails.config.message.ASSIGN_VEHICLE_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async retainVehicle(req, res) {
        try {
            let params = req.allParams();
            let fields = ['franchiseeId', 'vehicleIds'];
            commonValidator.checkRequiredParams(fields, params);
            let vehicles = await VehicleService.retainVehicle(params.franchiseeId, req.user.id, params.vehicleIds);

            return res.ok(vehicles, sails.config.message.RETAIN_VEHICLE_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};

/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs');
const uuid = require('uuid');
const moment = require('moment');

const CommonService = require(`${sails.config.appPath}/api/services/common`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const UserService = require(`${sails.config.appPath}/api/services/user`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const LocationService = require(`${sails.config.appPath}/api/services/location`);
const KycService = require(`${sails.config.appPath}/api/services/kyc`);

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
            if (!params || !params.firstName || !params.type || !params.emails) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
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
            // create user
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
            if (req.user.type === sails.config.USER.TYPE.FRANCHISEE) {
                if (params.type != sails.config.USER.TYPE.STAFF) {
                    throw sails.config.message.FRANCHISEE_ADD_ONLY_STAFF;
                }
                params.franchiseeId = req.user.id;
            }
            if (req.user.type === sails.config.USER.TYPE.DEALER) {
                params.dealerId = req.user.id;
                if (params.type == sails.config.USER.TYPE.CUSTOMER) {
                    if (!params.fleetType) {
                        params.fleetType = sails.config.USER.FLEET_TYPE.PRIVATE;
                    } else {
                        if (params.fleetType == sails.config.USER.FLEET_TYPE.GENERAL) {
                            delete params.fleetType;
                            delete params.dealerId;
                        }
                    }
                    if (params.fleetType && params.fleetType == sails.config.USER.FLEET_TYPE.PRIVATE) {
                        params.addedDealers = [
                            {
                                dealerId: params.dealerId,
                                fleetType: params.fleetType
                            }
                        ];
                    }
                }

            }
            // params.password = await new Promise((resolve, reject) => {
            //     bcrypt.genSalt(10, (err, salt) => {
            //         console.log('err', err);
            //         bcrypt.hash(params.password, salt, () => { },
            //             (err, hash) => {
            //                 if (err) {
            //                     reject(new Error(err));
            //                 }
            //                 resolve(hash);
            //             });
            //     });
            // });
            // params.regMedium = sails.config.DEVICE_TYPE.ADMIN;
            let passwordForEmail = params.password;
            let user = await User.create(params).fetch();
            if (user) {
                /** STRIPE ACCOUNT CREATE **/
                if (user.type !== sails.config.USER.TYPE.CUSTOMER && sails.config.IS_SEND_EMAIL_TO_NEW_USERS) {
                    await UserService.sendEmailToNewUser(user, passwordForEmail);
                }
                if (user.type === sails.config.USER.TYPE.CUSTOMER) {
                    await PaymentService.createCustomer(user);
                    await UserService.creditNewCustomerForWallet(user.id);
                }
                // const token = Cipher.createToken(user);
                // await User.update({ id: user.id }, { loginToken: `JWT ${token}` });

                return res.ok(user, sails.config.message.USER_REGISTERED);
            }

            return res.serverError({}, sails.config.message.USER_REGISTER_FAILED);
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
    async paginate(req, res) {
        let params = req.allParams();
        let loginUser = req.user;
        try {
            let filter = await CommonService.getFilter(params);
            let countFilter = await CommonService.removePagination(filter);
            if (loginUser.type !== sails.config.USER.TYPE.SUPER_ADMIN && filter.where
                && filter.where.type !== sails.config.USER.TYPE.CUSTOMER) {
                filter.where.parentId = loginUser.id;
            }
            if (loginUser.type === sails.config.USER.TYPE.ADMIN &&
                filter.where.type === sails.config.USER.TYPE.STAFF) {
                let subAdminFilter = _.cloneDeep(filter);
                subAdminFilter.where.type = sails.config.USER.TYPE.SUB_ADMIN;
                subAdminFilter.select = ["name"];
                let subAdminUsers = await User.find(subAdminFilter);
                let subAdminUserIds = _.map(subAdminUsers, "id");
                let arr = [loginUser.id, ...subAdminUserIds];
                filter.where.parentId = { in: arr }
            }
            if (loginUser.type === sails.config.USER.TYPE.FRANCHISEE) {
                delete filter.where.parentId;
            }
            //Super admin and partner not able to see dealers rider.
            if (loginUser.type === sails.config.USER.TYPE.SUPER_ADMIN
                || loginUser.type === sails.config.USER.TYPE.FRANCHISEE) {
                filter.where.dealerId = null;
            }
            if (loginUser.type === sails.config.USER.TYPE.DEALER) {
                if (filter.where.type === sails.config.USER.TYPE.CUSTOMER) {
                    delete filter.where.dealerId;
                    filter.where["addedDealers.dealerId"] = loginUser.id;
                }
            }
            let users = await User
                .find(filter)
                .populate('parentId', { select: ['name'] })
                .populate('feederId', { select: ['name'] })
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
            await Promise.all(_.map(users, async (user) => {
                let userSummary = await UserService.getUserSummary(user.id);
                user.rideSummary = userSummary.rideSummary;
                user.fareSummary = userSummary.fareSummary;
            }));
            if (sails.config.IS_MASK == true) {
                for (key in users) {
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
            if (!params.viewFilter) {
                params.viewFilter = {};
            }
            params.viewFilter.id = params.id;
            if (params.viewFilter.franchiseeId === params.viewFilter.id) {
                delete params.viewFilter.franchiseeId;
            }

            let users = await User.findOne({ id: params.id })
                .populate('feederId', { select: ['name'] });
            if (users) {
                // if (users.type === sails.config.USER.TYPE.FRANCHISEE) {
                //     users = await LocationService.bindLocations(users);
                // }
                if (sails.config.IS_MASK === true) {
                    let primaryMobile = UtilService.getPrimaryValue(users.mobiles, 'mobile');
                    users.mobiles[0].mobile = CommonService.phoneNoMasking(primaryMobile);
                    let primaryEmail = UtilService.getPrimaryEmail(users.emails);
                    users.emails[0].email = CommonService.emailMasking(primaryEmail);
                }
                const userSummary = await UserService.getUserSummary(params.id);
                users.rideSummary = userSummary.rideSummary;
                users.fareSummary = userSummary.fareSummary;
                if (sails.config.IS_REFERRAL_ENABLE) {
                    if (users.senderReferralCode) {
                        let invitedUsers = await UserService.invitedUserList(users);
                        users.invitedUsers = invitedUsers.list;
                        users.invitedUsersCount = invitedUsers.count;
                    }
                }

                return res.ok(users, sails.config.message.OK);
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
            let message = await UserService.checkDuplication(params);
            if (_.isObject(message)) {
                return res.badRequest({}, message);
            }
            message = await UserService.checkForInviteCodeDuplication(params);
            if (_.isObject(message)) {
                return res.badRequest({}, message);
            }

            const requestedUser = await User.findOne({ id: params.id });
            const sameType = requestedUser.type === params.type;
            if (requestedUser && params.type && !sameType) {
                await UserService.checkIsParent(params.id);
            }
            if (req.user.type == sails.config.USER.TYPE.DEALER) {
                if (params.fleetType && params.fleetType == sails.config.USER.FLEET_TYPE.GENERAL) {
                    params.addedDealers = requestedUser.addedDealers.filter(dealer => dealer.dealerId != req.user.id);
                    if (!params.addedDealers.length) {
                        params.dealerId = null;
                    } else {
                        if (params.dealerId && requestedUser.dealerId == req.user.id) {
                            params.dealerId = params.addedDealers[0].dealerId;
                        }
                    }
                }
            }
            // create user
            /* let user = await User.findOne({id: params.id});
            if (!user) return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND)*/
            params.updateFilter.id = params.id;
            let user = _.omit(params, 'id');
            let updatedUser = await User.update({ id: params.id }).set(user)
                .fetch();
            if (updatedUser && updatedUser.length) {
                if (sails.config.IS_MASK == true) {
                    for (key in updatedUser) {
                        let primaryMobile = UtilService.getPrimaryValue(updatedUser[key].mobiles, 'mobile');
                        let primaryEmail = UtilService.getPrimaryEmail(updatedUser[key].emails);
                        _.each(updatedUser[key].mobiles, (mobile) => {
                            mobile.mobile = CommonService.phoneNoMasking(primaryMobile);
                        });
                        _.each(updatedUser[key].emails, (email) => {
                            email.email = CommonService.emailMasking(primaryEmail);
                        })
                    };
                }
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
            if (req.user.type === sails.common.USER.TYPE.SUPER_ADMIN) {
                params.deleteFilter.dealerId = null;
            }
            // create user
            let user = await User.findOne({ id: params.id });
            if (!user || user.isDeleted) {
                return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);
            }
            params.deleteFilter.id = params.id;
            let updatedUser = await User
                .update(params.deleteFilter)
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

    /**
     * @desc : change password
     * @param req
     * {
     *   "id":"",
     *   "oldPassword":"",
     *   "newPassword":""
     * }
     * @param res
     * @returns {Promise.<*>}
     */
    async resetPassword(req, res) {
        const params = req.allParams();
        try {

            if (!params || !params.id || !params.newPassword) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let user = await User.findOne({ id: params.id });
            if (user && user.id) {


                params.newPassword = await new Promise((resolve, reject) => {
                    bcrypt.genSalt(10, (err, salt) => {
                        console.log('err', err);
                        bcrypt.hash(params.newPassword, salt, () => {
                        }, (err, hash) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                resolve(hash);
                            }
                        });
                    });
                });
                params.updateFilter.id = params.id;
                let updatedUser = await User.update(
                    params.updateFilter,
                    { password: params.newPassword, updatedBy: params.updatedBy }
                ).fetch();

                if (updatedUser && updatedUser.length) {
                    return res.ok(_.pick(user, ['id', 'type', 'name', 'userName']),
                        sails.config.message.USER_PASSWORD_RESET
                    );
                }

                return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);

            }

            return res.notFound(null, sails.config.message.NOT_FOUND);

        } catch (err) {
            console.log('err', err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    /**
     *  Patient List
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async patientList(req, res) {
        let params = req.allParams();
        try {
            // console.log('req.user', req.user);
            let filter = await CommonService.getFilter(params);
            if (!filter.where) {
                filter.where = {};
            }
            parentClienteleIds = filter.where['parentClientele.id'] || [];
            filter.where.type = sails.config.USER.TYPE.HOME.HOME_AREA.PATIENT;
            console.log('filter');
            console.log(parentClienteleIds);
            console.log(filter);
            console.log('filter');
            let countFilter = await CommonService.removePagination(filter);
            let users = await User
                .find(filter)
                .populate('patientInfoId')
                .meta({ enableExperimentalDeepTargets: true });
            console.log('users');
            console.log(users.length);
            console.log('users');
            wardIds = [];
            _.each(users, (user) => {
                if (user.patientInfoId && user.patientInfoId.nhWardId &&
                    wardIds.indexOf(user.patientInfoId.nhWardId) < 0
                ) {
                    wardIds.push(user.patientInfoId.nhWardId);
                }
            });

            const clienteles = await Clientele.find({
                where: { krollId: wardIds },
                select: ['name', 'krollId']
            });

            const chartType = 4;

            _.each(users, (user) => {
                if (user.patientInfoId && user.patientInfoId.nhWardId) {
                    user.patientInfoId.nhWardId =
                        _.find(clienteles, { krollId: user.patientInfoId.nhWardId });
                }
                if (user.patientInfoId && user.patientInfoId.chart) {
                    user.patientInfoId.chart = _.orderBy(user.patientInfoId.chart, 'date', 'desc');
                    let chartInfo = _.find(user.patientInfoId.chart, { chartType: chartType });
                    if (chartInfo && user.dob) {
                        chartInfo.weight = chartInfo.value1;

                        let creatinine = chartInfo.value2;
                        let creatinineClearance = 140;
                        const age = moment().diff(moment(user.dob, 'DD-MM-YYYY'), 'years');
                        creatinineClearance -= age;
                        creatinineClearance *= chartInfo.weight;

                        let divideCC = 72 * (creatinine * 0.011312217194570135);
                        creatinineClearance /= divideCC;

                        if (user.gender === sails.config.USER.GENDER_TYPE.FEMALE) {
                            creatinineClearance *= 0.85;
                        }

                        chartInfo.creatinine = creatinine;
                        chartInfo.creatinineClearance = Math.round(creatinineClearance);
                    }
                    user.chartInfo = chartInfo;
                }
            });

            const userCount = await User
                .count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            let homeAreas = [];

            // if (userCount > 0) {
            let homeAreaFilter = {
                type: sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN,
                isActive: true
            };
            const loggedInUser = req.user;
            let userClienteleId = loggedInUser.parentClientele[0] &&
                loggedInUser.parentClientele[0].id;
            console.log('userClienteleId', userClienteleId);
            if (userClienteleId) {
                if (loggedInUser.type === sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN) {
                    homeAreaFilter.parentId = userClienteleId;
                } else if (loggedInUser.type === sails.config.USER.TYPE.HOME.ADMIN) {
                    homeAreaFilter.parentId = userClienteleId;
                } else if (loggedInUser.type === sails.config.USER.TYPE.PHARMACY.ADMIN) {
                    homeAreaFilter.pharmacyId = userClienteleId;
                }
            }
            // if (parentClienteleIds && parentClienteleIds.length > 0) {
            //     homeAreaFilter['parentClientele.id'] = parentClienteleIds;
            // }
            console.log('homeAreaFilter');
            console.log(homeAreaFilter);
            console.log('homeAreaFilter');
            homeAreas = await Clientele.find({
                where: homeAreaFilter,
                select: ['name']
            });
            // }

            return res.ok(
                { list: users, count: userCount, homeAreas: homeAreas },
                sails.config.message.OK
            );
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async AssignDoctorToHomeArea(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.id || !params.homeAreaId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let doctor = await User.findOne({ id: params.id });
            if (doctor) {
                if (doctor.parentClientele && _.size(doctor.parentClientele) > 0) {
                    // check if already  assign
                    let index = _.findIndex(doctor.parentClientele, { id: params.homeAreaId });
                    if (params.isRemove) {
                        if (index >= 0) {
                            doctor.parentClientele.splice(index, 1);
                        }
                    } else if (index < 0) {
                        doctor.parentClientele.push({ id: params.homeAreaId });
                    }
                } else {
                    doctor.parentClientele = [{ id: params.homeAreaId }];
                }
                if (params.email) {
                    if (doctor.emails && _.size(doctor.emails) > 0) {
                        // check if already  exists
                        let index = _.findIndex(doctor.emails, { email: params.email });
                        if (index < 0) {
                            doctor.emails.push({ email: params.email });
                        }
                    } else {
                        doctor.emails = [{ email: params.email, isPrimary: true }];
                    }
                }
                if (params.mobile) {
                    if (doctor.mobiles && _.size(doctor.mobiles) > 0) {
                        // check if already  exists
                        let index = _.findIndex(doctor.mobiles, { mobile: params.mobile });
                        if (index < 0) {
                            doctor.mobiles.push({ mobile: params.mobile });
                        }
                    } else {
                        doctor.mobiles = [{ mobile: params.mobile, isPrimary: true }];
                    }
                }
                let paramsToUpdate = {
                    parentClientele: doctor.parentClientele,
                    emails: doctor.emails,
                    mobiles: doctor.mobiles,
                    updatedBy: params.updatedBy
                };
                let updatedDoctor = await User.update({ id: params.id }, paramsToUpdate).fetch();
                if (updatedDoctor && _.size(updatedDoctor) > 0) {
                    if (params.isRemove) {
                        return res.ok(
                            _.first(updatedDoctor),
                            sails.config.message.ASSIGNED_DOCTOR_REMOVE
                        );
                    }

                    return res.ok(_.first(updatedDoctor), sails.config.message.DOCTOR_ASSIGNED);
                }

                return res.ok({}, sails.config.message.USER_NOT_FOUND);

            }

            return res.ok({}, sails.config.message.USER_NOT_FOUND);


        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async approveDocuments(req, res) {
        const params = req.allParams();
        try {
            if (!params.userId || !params.documentTypes ||
                !params.documentTypes.length || !params.approvedStatus
            ) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let user = await User.findOne({ id: params.userId });
            if (!user) {
                return res.badRequest(null, sails.config.message.USER_NOT_FOUND);
            }
            let updateObj = user.documents;
            for (let docType of params.documentTypes) {
                updateObj[docType].isApproved = params.approvedStatus;
            }
            let allDocumentsApproved = true;
            for (let docType of Object.keys(updateObj)) {
                if (!updateObj[docType].isApproved) {
                    allDocumentsApproved = false;
                }
            }
            const updatedUser = await User.update(
                { id: user.id },
                {
                    documents: updateObj,
                    isDocApproved: allDocumentsApproved,
                    updatedBy: params.updatedBy
                }
            ).fetch();

            if (updatedUser) {
                return res.ok(updatedUser, sails.config.message.DOCUMENTS_UPDATED);
            }

            return res.ok({}, sails.config.message.USER_NOT_FOUND);

        } catch (e) {
            console.log(e);
        }
    },

    async activeDeactive(req, res) {
        let params = req.allParams();
        try {
            // get filter

            if (!params.ids || !_.has(params, 'isActive')) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);

            }
            console.log('   P A R A M S   ', params);
            let updatedUser = await User.update({ id: params.ids })
                .set({ isActive: params.isActive, updatedBy: params.updatedBy })
                .fetch();
            if (updatedUser) {
                return res.ok(updatedUser, sails.config.message.USER_UPDATED);

            }

            return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     *  assign roles to multiple users
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async assignRoleToMultipleUser(req, res) {
        let params = req.allParams();
        let success = [];
        try {
            // get filter
            if (!params.ids || !params.roles) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            await Promise.all(_.map(params.ids, async (id) => {
                let paramsToUpdate = { roles: params.roles, updatedBy: params.updatedBy };
                params.updateFilter.id = id;
                let updatedUser = await User.update(params.updateFilter).set(paramsToUpdate).fetch();
                if (updatedUser && updatedUser.length) {
                    success.push(id);
                }

                return id;
            }));
            if (success && success.length) {
                return res.ok(success, { message: sails.config.message.ROLES_ASSIGN_SUCCESSFULLY });
            }

            return res.ok(null, { message: sails.config.message.FAILED_TO_ASSIGN_ROLES });

        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async userList(req, res) {
        let params = req.allParams();
        try {
            let filter = await CommonService.getFilter(params);

            let users = await User
                .find(filter)
                .select(['id', 'name']);
            let response = { list: users };

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async franchiseeList(req, res) {
        let params = req.allParams();
        if (!params.filter) {
            params.filter = {};
        }
        params.filter.type = sails.config.USER.TYPE.FRANCHISEE;
        params.filter.isDeleted = false;
        params.filter.isActive = true;
        const addOwnUser = params.filter.addOwnUser || false;
        delete params.filter.addOwnUser;
        try {
            let filter = await CommonService.getFilter(params);

            let users = await User
                .find(filter)
                .select(['id', 'name']);

            let extraUser = { id: null, name: sails.config.OWN_USERNAME_FOR_FRANCHISEE_LIST || 'Admin' }
            let newUsersArray = [extraUser].concat(users);
            let response = {
                list: addOwnUser ? newUsersArray : users
            };

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async getCityOpration(req, res) {
        let params = req.allParams();
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let users = await User.findOne({ id: params.id }).select(['id', 'createdAt', 'updatedAt', 'name', 'franchiseeCountryId', 'franchiseeStateId', 'franchiseeCityId', 'franchiseeId']);;
            if (users) {
                users = await LocationService.bindLocations(users);
            }
            let response = {
                list: users
            };

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async planInvoiceList(req, res) {
        let params = req.allParams();
        try {
            if (!params.filter.userId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let filter = await common.getFilter(params);
            filter.sort = 'createdAt desc';
            let recordsList = await PlanInvoice.find(filter)
                .populate('planId');
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await PlanInvoice.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async dealerList(req, res) {
        let params = req.allParams();
        if (!params.filter) {
            params.filter = {};
        }
        params.filter.type = sails.config.USER.TYPE.DEALER;
        params.filter.isDeleted = false;
        params.filter.isActive = true;
        const addOwnUser = params.filter.addOwnUser || false;
        delete params.filter.addOwnUser;
        try {
            let filter = await CommonService.getFilter(params);

            let users = await User
                .find(filter)
                .select(['id', 'name']);

            let extraUser = { id: null, name: sails.config.OWN_USERNAME_FOR_DEALER_LIST || 'Admin' }
            let newUsersArray = [extraUser].concat(users);
            let response = {
                list: addOwnUser ? newUsersArray : users
            };

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async drivingLicenseNumberVerification(req, res) {
        let params = req.allParams();
        console.log("params----------------", params);
        try {
            if (!params || !params.userId || !params.number || !params.dob) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let user = await User.findOne({ id: params.userId });

            if (user.documents.drivingLicence.numberStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED) {
                return res.ok({}, sails.config.message.DL_NUMBER_ALREADY_VERIFIED);
            }

            let isAlreadyExist = await User.findOne({
                where: {
                    id: { '!=': params.userId },
                    "documents.drivingLicence.number": params.number
                }
            }).meta({ enableExperimentalDeepTargets: true });

            if (isAlreadyExist) {
                return res.ok({}, sails.config.message.DRIVING_LICENCE_FORM_DUPLICATE);
            }

            let dlNumberCount = (user.drivingLicenceNumberCount || 0) + 1;

            let updatedUser = await User.update({ id: user.id }).set({
                drivingLicenceNumberCount: dlNumberCount
            })

            const kycVerificationFeatureActive = sails.config.KYC_AUTHENTICATION;
            let verifyDocumentNumber = {};
            let numberStatus = user.documents.drivingLicence.numberStatus ? user.documents.drivingLicence.numberStatus : 0;
            let message = sails.config.message.DRIVING_LICENCE_VERIFIED;
            await Promise.all(_.map([user], async (user) => {
                let oldLicenseNumber = user.documents.drivingLicence.number;
                if (!user.documents
                    || oldLicenseNumber !== params.number
                    || user.documents.drivingLicence.numberStatus !== sails.config.USER.DOCUMENT.STATUS.APPROVED
                ) {
                    // paramsToUpdate.drivingLicence.number = params.number;
                    verifyDocumentNumber = await KycService.verifyDrivingLicenceNumber(params, kycVerificationFeatureActive);
                    console.log("verifyDocumentNumber-----------------", verifyDocumentNumber);
                    if (verifyDocumentNumber && verifyDocumentNumber.status === 1) {
                        user.documents.drivingLicence.numberStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                    }

                    if ((verifyDocumentNumber && verifyDocumentNumber.status === 0)
                        || !verifyDocumentNumber
                    ) {
                        numberStatus = sails.config.USER.DOCUMENT.STATUS.REJECTED;
                        message = sails.config.message.DRIVING_LICENCE_FAILED;
                    }
                }
            }));
            let updateObj = user.documents;
            let dl = 'drivingLicence';
            updateObj[dl].number = params.number;
            updateObj[dl].numberStatus = numberStatus;
            let statusTrack = {
                dateTime: moment().toISOString(),
                status: numberStatus,
                count: dlNumberCount
            }
            console.log("updateObj-------------------------------", updateObj);
            updatedUser = await User.update({ id: params.userId }).set(
                {
                    documents: updateObj,
                    drivingLicenceNumberStatusTrack: statusTrack
                }
            ).fetch();

            if (updatedUser && updatedUser.length) {
                return res.ok(updatedUser[0], message);
            }

            return res.ok({}, sails.config.message.DRIVING_LICENCE_VERIFIED_FAILED);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async drivingLicenseImageVerification(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.userId || !params.path || !params.backPath) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let user = await User.findOne({ id: params.userId });

            if (user.documents.drivingLicence.imageStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED) {
                return res.ok({}, sails.config.message.DL_IMAGE_ALREADY_VERIFIED);
            }

            let dlImageCount = (user.drivingLicenceImageCount || 0) + 1;

            let updatedUser = await User.update({ id: user.id }).set({
                drivingLicenceImageCount: dlImageCount
            })

            const kycVerificationFeatureActive = sails.config.KYC_AUTHENTICATION;
            let verifyDocumentImage = {};
            let imageStatus = user.documents.drivingLicence.imageStatus ? user.documents.drivingLicence.imageStatus : 0;
            let message = sails.config.message.DRIVING_LICENCE_VERIFIED;
            await Promise.all(_.map([user], async (user) => {
                let oldPath = user.documents.drivingLicence.path;
                let oldBackPath = user.documents.drivingLicence.backPath;
                if (!user.documents
                    || oldPath !== params.path
                    || oldBackPath !== params.backPath
                    || user.documents.drivingLicence.imageStatus !== sails.config.USER.DOCUMENT.STATUS.APPROVED
                ) {
                    verifyDocumentImage = await KycService.verifyDocumentImage(params, kycVerificationFeatureActive);
                    console.log("verifyDocumentImage-----------------", verifyDocumentImage);
                    if (!verifyDocumentImage) {
                        return res.ok({}, sails.config.message.DRIVING_LICENCE_FAILED);
                    }
                    if (verifyDocumentImage.status === 0) {
                        imageStatus = sails.config.USER.DOCUMENT.STATUS.REJECTED;
                        message = sails.config.message.DRIVING_LICENCE_FAILED;
                    }

                    if (verifyDocumentImage.status === 1) {
                        imageStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                    }
                }
            }));
            let updateObj = user.documents;
            let dl = 'drivingLicence';
            updateObj[dl].path = params.path;
            updateObj[dl].backPath = params.backPath;
            updateObj[dl].imageStatus = imageStatus;
            updateObj[dl].isApproved = true;
            let statusTrack = {
                dateTime: moment().toISOString(),
                status: imageStatus,
                count: dlImageCount
            }
            console.log("updateObj-------------------------------", updateObj);
            updatedUser = await User.update({ id: params.userId }).set({
                documents: updateObj,
                drivingLicenceImageStatusTrack: statusTrack
            }).fetch();
            if (updatedUser && updatedUser.length) {
                return res.ok(updatedUser[0], message);
            }

            return res.ok({}, sails.config.message.DRIVING_LICENCE_VERIFIED_FAILED);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async selfieVerification(req, res) {
        let params = req.allParams();
        try {
            if (!params || !params.userId || !params.path || !params.selfie) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let user = await User.findOne({ id: params.userId });

            if (user.documents.drivingLicence.selfieStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED) {
                return res.ok({}, sails.config.message.SELFIE_ALREADY_VERIFIED);
            }

            let dlSelfieCount = (user.drivingLicenceSelfieCount || 0) + 1;

            let updatedUser = await User.update({ id: user.id }).set({
                drivingLicenceSelfieCount: dlSelfieCount
            })

            const kycVerificationFeatureActive = sails.config.KYC_AUTHENTICATION;
            let verifySelfie = {};
            let selfieData = {};
            let selfieStatus = user.documents.drivingLicence.selfieStatus ? user.documents.drivingLicence.selfieStatus : 0;
            let message = sails.config.message.SELFIE_VERIFIED;
            await Promise.all(_.map([user], async (user) => {
                let oldSelfie = user.documents.drivingLicence.selfie;
                if (!user.documents
                    || oldSelfie !== params.selfie
                    || user.documents.drivingLicence.selfieStatus !== sails.config.USER.DOCUMENT.STATUS.APPROVED
                ) {
                    verifySelfie = await KycService.faceVerification(params, kycVerificationFeatureActive);
                    console.log("verifySelfie-----------------", verifySelfie);
                    if (!verifySelfie) {
                        return res.ok({}, sails.config.message.SELFIE_VERIFICATION_FAILED);
                    }
                    if (verifySelfie.status === 0) {
                        selfieStatus = sails.config.USER.DOCUMENT.STATUS.REJECTED;
                        message = sails.config.message.SELFIE_VERIFICATION_FAILED;
                    }

                    if (verifySelfie.status === 1) {
                        selfieStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                        if (verifySelfie.msg) {
                            selfieData.isMatch = verifySelfie.msg.is_match;
                            selfieData.matchScore = UtilService.floatToPercentage(verifySelfie.msg.match_score);
                            selfieData.faceLiveness = verifySelfie.msg.face_liveness
                        }
                    }

                }
            }));
            let updateObj = user.documents;
            let dl = 'drivingLicence';
            updateObj[dl].selfie = params.selfie;
            updateObj[dl].selfieStatus = selfieStatus;
            updateObj[dl].isApproved = true;
            let statusTrack = {
                dateTime: moment().toISOString(),
                status: selfieStatus,
                count: dlSelfieCount
            }
            console.log("updateObj-------------------------------", updateObj);
            updatedUser = await User.update({ id: params.userId }).set({
                documents: updateObj,
                drivingLicenceSelfieStatusTrack: statusTrack
            }).fetch();
            if (updatedUser && updatedUser.length) {
                return res.ok(updatedUser[0], message);
            }


            return res.ok({}, sails.config.message.DRIVING_LICENCE_VERIFIED_FAILED);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async addDummyDocuments(req, res) {
        try {
            let params = req.allParams();
            let userData = await User.findOne({ id: params.id });
            let updateObj = {};
            if (!userData.dob) {
                if (params.dob) {
                    updateObj.dob = params.dob;
                } else {
                    updateObj.dob = '06-07-85';
                }
            }
            if ((userData.documents && userData.documents.drivingLicence && params.isReplaceDocument) || !userData.documents || !userData.documents.drivingLicence) {
                updateObj.documents = {
                    "drivingLicence": {
                        "documentType": 2,
                        "isApproved": true,
                        "name": params.name || 'Test Card Data',
                        "path": "images/75ded.jpg",
                        "title": ""
                    }
                };
            }
            await User.update({ id: params.id }).set(updateObj);

            return res.ok();
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async addReferralCode(req, res) {
        try {
            let params = req.allParams();
            let users = await User.find({
                senderReferralCode: "",
                referralLink: ""
            });
            console.log("user----------------------", users.length);
            let totalUser = 0;
            if (sails.config.IS_REFERRAL_ENABLE) {
                await Promise.all(_.map(users, async (user) => {
                    totalUser = UtilService.getFloat(totalUser) + UtilService.getFloat(1);
                    console.log("user----------------------", user.id);
                    let senderReferralCode = UtilService.randomReferralCode(6);
                    let referralLink = '';
                    if (senderReferralCode) {
                        referralLink = await UserService.invitationFirebaseUrl(senderReferralCode);
                        console.log("referralLink----------------------", referralLink);
                        if (referralLink) {
                            referralLink = referralLink;
                            let updateObj = {
                                senderReferralCode: senderReferralCode,
                                referralLink: referralLink
                            }
                            await User.update({ id: user.id }, updateObj);
                        }
                    }
                }));
            }
            console.log("-------------------------totalUser", totalUser);
            if (users.length === totalUser) {
                return res.ok({}, sails.config.message.OK);
            }
            return res.ok({}, sails.config.message.REFERRAL_CODE_CREATE_FAILED);
        } catch (error) {
            console.log("Add referral code and referral link fail!", error)
            return res.serverError(null, error);
        }
    },

    async exportUsers(req, res) {
        try {
            let params = req.allParams();
            let filter = params.filter;


            let userData = [];
            let recordsList = await User.find(filter);
            if (!recordsList.length) {
                return userData;
            }
       
            for (let record of recordsList) {
                let obj = {};
                obj.RiderName = record.name;
               
                obj.Mobiles = UtilService.getPrimaryValue(record.mobiles, 'mobile');
                obj.Emails = UtilService.getPrimaryValue(record.emails, 'email');
                obj.SignUpDate = record.createdAt;
                obj.isActive = true;
                obj.Dob = record.dob;

                userData.push(obj);
            };
        
            let response = { list: userData };
            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
};

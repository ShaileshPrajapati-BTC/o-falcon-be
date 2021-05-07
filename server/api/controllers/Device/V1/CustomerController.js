/* eslint-disable max-lines-per-function */
const UserService = require(`${sails.config.appPath}/api/services/user`);

const moment = require('moment');
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
// const RatingSummaryService = require(sails.config.appPath + '/api/services/ratingSummary');
const _ = require('lodash');
const uuid = require('uuid');
const ObjectId = require('mongodb').ObjectID;
const Cipher = require(`${sails.config.appPath}/api/services/cipher`);
const KycService = require(`${sails.config.appPath}/api/services/kyc`);
const CommonService = require(`${sails.config.appPath}/api/services/common`);

module.exports = {
    async register(req, res) {
        let params = req.allParams();
        params.type = params.type || sails.config.USER.TYPE.CUSTOMER;
        let savedParams = JSON.parse(JSON.stringify(params));
        let option = { params: params };
        const language = this.req.headers.language || 'en-US';
        try {
            // required params check
            let loginByOtp = sails.config.IS_MASTER_AUTH_FLOW; // false means loginByPassword
            console.log('loginByOtp - ', loginByOtp);
            const defaultLoginType = sails.config.USER_DEFAULT_LOGIN_TYPE;
            const isMobileParamRequired = defaultLoginType === sails.config.USER_LOGIN_TYPE_MOBILE;
            // isMobileParamRequired = false -> means email required
            if (!params || !params.firstName ||
                (isMobileParamRequired && !params.mobile) ||
                (!isMobileParamRequired && !params.email) ||
                (!loginByOtp && !params.password)
            ) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            if (params.email) {
                params.emails = [
                    {
                        id: uuid(),
                        email: params.email.toLowerCase(),
                        isPrimary: true,
                        isVerified: false
                    }
                ];
                delete params.email;
            }
            let customerMobile = params.mobile;
            if (params.mobile) {
                params.mobiles = [
                    {
                        id: uuid(),
                        mobile: params.mobile,
                        countryCode: params.countryCode || sails.config.COUNTRY_CODE,
                        isPrimary: true,
                        isVerified: false
                    }
                ];
                delete params.mobile;
            }
            // create user
            let message = await UserService.checkDuplicationForDevice(params);
            if (_.isObject(message)) {
                return res.badRequest({}, message);
            }
            if (params.address) {
                params.addresses = [];
                params.address.id = uuid();
                params.address.isPrimary = true;
                params.addresses.push(params.address);
            }

            if (params.inviteCode) {
                const inviteCode = params.inviteCode;
                let referralUser = await User.findOne({
                    inviteCode: inviteCode,
                    type: { "!=": sails.config.USER.TYPE.CUSTOMER }
                });
                if (!referralUser) {
                    return res.ok({}, sails.config.message.DEALER_CODE_FAILED);
                }
                // Add private feet type to rider
                if (referralUser.type === sails.config.USER.TYPE.DEALER) {
                    // Add dealer id to rider
                    params.fleetType = sails.config.USER.FLEET_TYPE.PRIVATE;
                    params.dealerId = referralUser.id;
                    params.addedDealers = [
                        {
                            dealerId: params.dealerId,
                            fleetType: params.fleetType
                        }
                    ];

                }
                if (referralUser.type === sails.config.USER.TYPE.FRANCHISEE) {
                    // Add dealer id to rider
                    params.fleetType = sails.config.USER.FLEET_TYPE.PRIVATE;
                    params.franchiseeId = referralUser.id;
                    params.addedFranchisees = [
                        {
                            franchiseeId: params.franchiseeId,
                            fleetType: params.fleetType
                        }
                    ];
                }
            }

            if (loginByOtp) {
                console.log('loginByOtp -> savedParams ---- ', savedParams);
                let guestUserRes = await UserService.createOrUpdateGuestUser(savedParams, language);
                return res.ok({ token: { jwt: null }, user: guestUserRes.user }, guestUserRes.message);
            }
            delete params.inviteCode;
            if (sails.config.IS_REFERRAL_ENABLE) {
                if (params.referralCode) {
                    params.referralType = sails.config.REFERRAL.TYPE.URL;
                    delete params.referralCode;
                }
                params.senderReferralCode = UtilService.randomReferralCode(6);
            }
            let user = await User.create(option.params).fetch();

            if (user) {
                if (sails.config.IS_REFERRAL_ENABLE) {
                    user = await UserService.referralCodeGenerateAndAddBenefit(params, user);
                }
                if (sails.config.IS_REFERRAL_ENABLE) {
                    let referralLink = await UserService.invitationFirebaseUrl(user.senderReferralCode);
                    if (referralLink) {
                        user.referralLink = referralLink;
                    }
                }
                // let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                await UserService.createCustomerAndCreditWallet(user);
                const token = Cipher.createToken(user);
                await User.update({ id: user.id }, { loginToken: `JWT ${token}`, updatedBy: user.id, referralLink: user.referralLink });

                const isMobileVerificationRequired = sails.config.USER_IS_MOBILE_VERIFICATION_REQUIRED;
                const isEmailVerificationRequired = sails.config.USER_IS_EMAIL_VERIFICATION_REQUIRED;
                let responseMessage = sails.config.message.USER_REGISTER_SUCCESS;
                if (isMobileVerificationRequired) {
                    responseMessage = sails.config.message.MOBILE_VERIFICATION;
                } else if (isEmailVerificationRequired) {
                    responseMessage = sails.config.message.EMAIL_VERIFICATION_OTP;
                }
                return res.ok({ token: { jwt: token }, user: user }, responseMessage);
            }

            return res.serverError({}, sails.config.message.USER_REGISTER_FAILED);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async paginate(req, res) {
        let params = req.allParams();
        try {
            // get filter
            let filter = await userService.getFilter(params);
            // det user
            let users = await userService.getUsers(filter);
            if (users && users.list && users.list.length) {
                return res.ok(users, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.USER_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async view(req, res) {
        let params = req.allParams();
        try {
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            // create user
            let user = await User.findOne({ id: params.id });

            if (user) {
                // user.overallRating = await RatingSummaryService.getReferenceIdWiseRatings({ referenceId: user.id });
                // user.ratingReviews = await RatingSummaryService.getRatingReviews({
                //     userId: params.id,
                //     userType: user.type,
                //     limit: 1,
                //     sort: "createdAt DESC"
                // });

                if (sails.config.IS_REFERRAL_ENABLE) {
                    if (users.senderReferralCode) {
                        let invitedUsers = await UserService.invitedUserList(users);
                        users.invitedUsers = invitedUsers.list;
                        users.invitedUsersCount = invitedUsers.count;
                    }
                }

                return res.ok(user, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.USER_NOT_FOUND);

        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async update(req, res) {
        let params = req.allParams();
        try {
            params.id = req.user.id;
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            params.type = sails.config.USER.TYPE.CUSTOMER;
            if (sails.config.IS_REFERRAL_ENABLE) {
                if (params.referralCode) {
                    let referredUser = await User.findOne({
                        senderReferralCode: params.referralCode,
                        isDeleted: false
                    })
                    if (!referredUser) {
                        return res.ok(null, sails.config.message.REFERRAL_CODE_FAIL);
                    }
                }
                await User.update({
                    id: params.id
                }).set({ isReferralBenefitAdd: false });
                if (params.referralCode) {
                    params.isReferralBenefitAdd = true;
                }
            }
            // duplicate
            let obj = {
                id: params.id,
                emails: [],
                mobiles: []
            };
            if (params.emails && _.size(params.emails)) {
                _.each(params.emails, (email) => {
                    if (!email.id) {
                        obj.emails.push(_.clone(email));
                        email.id = uuid();
                    }
                });
            }
            if (params.mobiles && typeof params.mobiles === 'string') {
                params.mobiles = [
                    {
                        id: uuid(),
                        mobile: params.mobiles,
                        countryCode: params.countryCode || sails.config.COUNTRY_CODE,
                        isPrimary: true,
                        isVerified: false,
                        isoCode: params.isoCode
                    }
                ];
            }
            if (params.mobiles && _.size(params.mobiles)) {
                _.each(params.mobiles, (mobile) => {
                    if (!mobile.id) {
                        obj.mobiles.push(_.clone(mobile));
                        mobile.id = uuid();
                    }
                });
            }
            if (params.addresses && _.size(params.addresses)) {
                _.each(params.addresses, (a) => {
                    if (!a.id) {
                        a.id = uuid();
                    }
                });
            }
            let message = await UserService.checkDuplicationForDevice(params);
            if (_.isObject(message)) {
                return res.ok({}, message);
            }

            let referralUser;
            let isFranchiseeInviteCode;
            console.log("update -> params", params)
            if (typeof params.inviteCode == 'string') {
                let userData = await User.findOne({ id: params.id });
                if (params.inviteCode == '') {
                    console.log("266 ---------")
                    if (userData.dealerId) {
                        params.dealerId = null;
                        if (userData.addedDealers.length) {
                            params.addedDealers = userData.addedDealers.filter(dealer => dealer.dealerId != userData.dealerId);
                        }
                        params.addedFranchisees = [];
                    }
                    if (userData.franchiseeId) {
                        params.franchiseeId = null;
                        if (userData.addedFranchisees.length) {
                            params.addedFranchisees = userData.addedFranchisees.filter(franchisee => franchisee.franchiseeId != userData.franchiseeId);
                        }
                        params.addedDealers = [];
                    }
                } else {
                    const inviteCode = params.inviteCode;
                    referralUser = await User.findOne({
                        inviteCode: inviteCode,
                        type: { "!=": sails.config.USER.TYPE.CUSTOMER }
                    });
                    console.log("279 ---------")
                    if (!referralUser) {
                        return res.ok({}, sails.config.message.DEALER_CODE_FAILED);
                    }
                    isFranchiseeInviteCode = referralUser.type === sails.config.USER.TYPE.FRANCHISEE;
                    // Add private feet type to rider
                    params.fleetType = sails.config.USER.FLEET_TYPE.PRIVATE;
                    if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE && isFranchiseeInviteCode) {
                        params.franchiseeId = referralUser.id;
                        params.dealerId = null;
                        let franchiseeFound = userData.addedFranchisees &&
                            userData.addedFranchisees.find(franchisee => franchisee.franchiseeId == params.franchiseeId);
                        if (!franchiseeFound) {
                            console.log("303 ---------")
                            params.addedFranchisees = userData.addedFranchisees || [];
                            params.addedFranchisees.push({
                                franchiseeId: params.franchiseeId,
                                fleetType: params.fleetType
                            });
                        }
                    } else {
                        // Add dealer id to rider
                        params.dealerId = referralUser.id;
                        params.franchiseeId = null;
                        let findDealer = userData.addedDealers.find(dealer => dealer.dealerId == params.dealerId);
                        if (!findDealer) {
                            console.log("315 ---------")
                            params.addedDealers = userData.addedDealers;
                            params.addedDealers.push({
                                dealerId: params.dealerId,
                                fleetType: params.fleetType
                            });
                        }
                    }
                }
            }
            let user = _.omit(params, 'id', 'inviteCode');
            console.log("update -> user", user)
            let updatedUser = await User.update({
                id: params.id,
                type: sails.config.USER.TYPE.CUSTOMER
            }).set(user)
                .fetch();
            if (updatedUser) {
                updatedUser = updatedUser[0];
                if (updatedUser.firstName) {
                    await UserService.makeUserNonGuestUser(updatedUser);
                }
                if (sails.config.IS_REFERRAL_ENABLE) {
                    console.log("-----------------------------sails.config.IS_REFERRAL_ENABLE", sails.config.IS_REFERRAL_ENABLE);
                    let referralType = sails.config.REFERRAL.TYPE.CODE;
                    await UserService.referralCodeGenerateAndAddBenefit(params, updatedUser, referralType);
                }
                if (referralUser) {
                    referralUser = _.omit(referralUser, ['accessPermission'])
                    if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE && isFranchiseeInviteCode) {
                        updatedUser.franchiseeId = referralUser;
                    } else {
                        updatedUser.dealerId = referralUser;
                    }
                }

                return res.ok(updatedUser, sails.config.message.PROFILE_UPDATED);
            }

            return res.ok({}, sails.config.message.USER_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async login(req, res) {
        const isMasterAuthFlow = sails.config.IS_MASTER_AUTH_FLOW;
        req.options.userType = sails.config.USER.TYPE.CUSTOMER;
        let deviceType = Number(req.headers.devicetype);
        const language = req.headers.language || 'en-US';
        if (isMasterAuthFlow) {
            let params = req.allParams();
            let loginType = params.loginType;
            try {
                if (!params || !params.username || !loginType) {
                    return res.serverError(null, sails.config.message.BAD_REQUEST);
                }
                params.username = params.username.toString().toLowerCase();
                params.username = UtilService.trimFirstZeroes(params.username);
                let filter = {
                    where: {
                        isDeleted: false,
                        or: [{ 'emails.email': params.username }, { 'mobiles.mobile': params.username }],
                        type: sails.config.USER.TYPE.CUSTOMER
                    }
                };
                let isUserRegistered = true;
                let user = await User.findOne(filter).meta({ enableExperimentalDeepTargets: true });
                if (!user) {
                    console.log('!user -> createCustomer');
                    user = await UserService.createCustomer(params, loginType);
                    isUserRegistered = false;
                } else if (!user.isActive) {
                    throw sails.config.message.USER_NOT_ACTIVE;
                } else if (user.isRegisteredFirstTime) {
                    await User.update({ id: user.id }, { isRegisteredFirstTime: false });
                }
                let response = await UserService.sendLoginOtp(user, loginType, isUserRegistered, deviceType, language);

                if (response && response.user && response.user.currentBookingPassIds) {
                    delete response.user.currentBookingPassIds;
                }
                return res.ok({ token: { jwt: '' }, user: response.user }, response.message);
            } catch (err) {
                console.log(err);

                return res.serverError(null, err || sails.config.message.SERVER_ERROR);
            }
        } else {
            auth.login(req, res);
        }
    },
    async logout(req, res) {
        try {
            await auth.logout(req);

            // req.logout is passportjs function to clear user information.
            // see http://passportjs.org/docs
            return res.ok(null, sails.config.message.LOGOUT);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async sync(req, res) {
        let params = req.allParams();
        if (!params || !params.lastSyncDate) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        let loggedInUser = req.user;
        try {
            let obj = await UserService.sync(loggedInUser.id, params.lastSyncDate);

            return res.ok(obj, sails.config.message.SYNC_SUCCESSFUL);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async serviceSync(req, res) {
        let params = req.allParams();
        if (!params || !params.lastSyncDate) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {

            let services = await Service.find({ isDeleted: false, updatedAt: { '>=': new Date(params.lastSyncDate) } });
            let rateCards = await RateCard.find({ serviceId: _.map(services, 'id') });
            if (services && _.size(services) > 0) {
                _.each(services, (s) => {
                    let filterRateCards = _.filter(rateCards, (rc) => {
                        return rc.serviceId === s.id;
                    });
                    s.rateCards = [];
                    if (filterRateCards) {

                        _.each(filterRateCards, (rateCard) => {
                            s.rateCards.push({
                                level: rateCard.level,
                                amount: rateCard.amount
                            });
                        });
                    }
                });
                let deletedServices = await DeleteSync.find({
                    where: {
                        module: sails.config.modules.service,
                        updatedAt: { '<=': new Date(params.lastSyncDate) }
                    },
                    select: ['recordId']
                });
                deletedServices = _.map(deletedServices, 'recordId');

                return res.ok({
                    lastSyncDate: new Date(),
                    list: services,
                    deleted: deletedServices
                }, sails.config.message.OK);
            }

            return res.ok({}, sails.config.message.LIST_NOT_FOUND);

        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async socialAuth(req, res) {
        let params = req.allParams();
        params.type = sails.config.USER.TYPE.CUSTOMER;
        if (!params || (!params.facebookAuthId && !params.googleAuthId && !params.appleAuthId)) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let response = await UserService.socialAuth({ profile: params });
            if (response.flag) {
                if (response.register && response.user) {
                    // let primaryEmail = UtilService.getPrimaryEmail(response.user.emails);
                    // let message = await UserService.checkDuplication(response.user);
                    // if (_.isObject(message)) {
                    //     return res.badRequest({}, message);
                    // }
                    await PaymentService.createCustomer(response.user);
                    if (sails.config.IS_MASTER_AUTH_FLOW) {
                        await UserService.creditNewCustomerForWallet(response.user.id);
                    }
                }

                return res.ok(response, sails.config.message.LOGIN);
            }

            return res.badRequest(null, response);
        } catch (e) {
            console.log('e', e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async notificationIdentifierUpsert(req, res) {
        let playerId = req.headers.playerid;
        let deviceType = req.headers.devicetype;
        let loginUser = req.user;
        if (!playerId || !deviceType) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let response = await UserService.notificationIdentifierUpsert({ playerId, deviceType, loginUser });
            if (response) {
                return res.ok({}, response);
            }

            return res.serverError(null, sails.config.message.SERVER_ERROR);

        } catch (e) {
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async validateResetPasswordOtp(req, res) {
        const params = req.allParams();
        try {
            if (!params || !params.otp) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let user = await User.findOne({
                'resetPasswordLink.code': params.otp
            })
                .meta({ enableExperimentalDeepTargets: true });

            if (!user || !user.resetPasswordLink.expireTime) {
                return res.ok(false, sails.config.message.INVALID_OTP);
            }

            // link expire
            if (moment(new Date()).isAfter(moment(user.resetPasswordLink.expireTime))) {
                return res.ok(false, sails.config.message.RESET_PASSWORD_LINK_EXPIRE);
            }

            return res.ok({}, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    // auth
    async resetPassword(req, res) {
        const params = req.allParams();
        try {
            if (!await auth.validateResetPasswordParams(params)) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let user = await User.findOne({ 'resetPasswordLink.code': params.token }).meta({ enableExperimentalDeepTargets: true });
            if (user && user.resetPasswordLink.expireTime) {
                if (moment(new Date()).isAfter(moment(user.resetPasswordLink.expireTime))) {// link expire
                    return res.ok(false, sails.config.message.RESET_PASSWORD_LINK_EXPIRE);
                }
            } else {
                // invalid token
                return res.ok(false, sails.config.message.RESET_PASSWORD_LINK_EXPIRE);
            }
            let response = await UserService.resetPassword(user, params.newPassword);
            if (response && response.flag) {
                return res.ok(response, sails.config.message.USER_PASSWORD_RESET);
            } else if (response.message) {
                return res.serverError(null, response.message);
            }

            return res.serverError(null, sails.config.message.SERVER_ERROR);

        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async passwordUpdateByUser(req, res) {
        const params = req.allParams();
        if (!params || !params.newPassword || !params.currentPassword) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let user = await User.findOne({ id: req.user.id });
            let response = await UserService.resetUserPassword(user, params.newPassword, params.currentPassword);

            if (response && response.flag) {
                return res.ok({}, response.message);
            }

            return res.badRequest(null, response.message);

        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async forgotPassword(req, res) {
        const params = req.allParams();
        try {

            if (!params.email) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            params.email = params.email.toString().toLowerCase();
            let user = await User.findOne({
                type: sails.config.USER.TYPE.CUSTOMER,
                or: [
                    { 'emails.email': params.email }
                ]
            }).meta({ enableExperimentalDeepTargets: true });
            if (user) {
                let message = await UserService.sendResetPasswordEmail(user);
                if (message) {
                    return res.ok({}, sails.config.message.RESET_PASSWORD_LINK);
                }

                return res.serverError({}, sails.config.message.SERVER_ERROR);
            }

            return res.notFound({}, sails.config.message.EMAIL_NOT_REGISTERED);
        } catch (err) {
            console.log(err);

            return res.serverError({}, sails.config.message.SERVER_ERROR);
        }
    },

    async verifyEmail(req, res) {
        const params = req.allParams();
        if (!params || !params.token) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let response = await UserService.verifyEmail(params);

            return res.view('message', {
                message: response.message,
                _layoutFile: ''
            });
        } catch (err) {
            return res.view('message', {
                message: sails.config.message.SOMETHING_WENT_WRONG,
                _layoutFile: ''
            });
        }
    },

    async verifyMobile(req, res) {
        const params = req.allParams();
        if (!params || !params.token || !params.mobile) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let response = await UserService.verifyMobile(params);
            let user = response.user;
            if (user) {
                const token = Cipher.createToken(user);
                user = await User.update({ id: user.id }, { loginToken: `JWT ${token}`, updatedBy: user.id }).fetch();
                return res.ok({ token: { jwt: token }, user: user[0] }, response.message);
            }
            return res.ok(response.message);
        } catch (err) {
            console.log(err);
            return res.serverError({}, err);
        }
    },
    async emailVerification(req, res) {
        let params = req.allParams();
        if (!params || !params.email) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            params.email = params.email.toString().toLowerCase();
            let user = await User.findOne({
                'emails.email': params.email,
                type: sails.config.USER.TYPE.CUSTOMER
            }).meta({ enableExperimentalDeepTargets: true });
            if (!user) {
                return res.ok({}, sails.config.message.USER_NOT_FOUND);
            }
            let isVerified = _.find(user.emails, { isVerified: true });
            if (isVerified) {
                return res.ok({}, sails.config.message.EMAIL_ALREADY_VERIFIED);
            }
            await UserService.sendEmailVerification(user, params.email);

            return res.ok({}, sails.config.message.EMAIL_VERIFICATION);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async mobileVerificationLink(req, res) {
        let params = req.allParams();
        if (!params || !params.mobile) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        const language = req.headers.language || 'en-US';
        try {
            let user = await User.findOne({
                'mobiles.mobile': params.mobile,
                type: sails.config.USER.TYPE.CUSTOMER
            }).meta({ enableExperimentalDeepTargets: true });
            let guestUser = await GuestUser.findOne({
                'mobiles.mobile': params.mobile
            }).meta({ enableExperimentalDeepTargets: true });
            if (!user && guestUser) {
                console.log('inside -> !user && guestUser');
                let guestUserRes = await UserService.createOrUpdateGuestUser(params, language);
                return res.ok({}, guestUserRes.message);
            }
            if (!user) {
                return res.ok({}, sails.config.message.USER_NOT_FOUND);
            }
            let isVerified = _.find(user.mobiles, { isVerified: true });
            if (isVerified) {
                return res.ok({}, sails.config.message.MOBILE_ALREADY_VERIFIED);
            }
            await UserService.sendMobileVerificationLink(user, params.mobile);

            return res.ok({}, sails.config.message.MOBILE_VERIFICATION);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async checkSocialAuth(req, res) {
        try {
            let params = req.allParams();
            if (!params.email && !params.facebookAuthId && !params.googleAuthId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let where = {
                type: sails.config.USER.TYPE.CUSTOMER
            };
            if (params.email) {// if user already exist logged him in
                params.email = params.email.toLowerCase();
                where['emails.email'] = params.email;
            } else if (params.facebookAuthId) {
                where.facebookAuthId = params.facebookAuthId;
            } else if (params.googleAuthId) {
                where.googleAuthId = params.googleAuthId;
            }
            let user = await User.findOne(where).meta({ enableExperimentalDeepTargets: true });
            if (!user) {
                return res.ok({ isRegistered: false }, sails.config.message.OK);
            }
            let updateSocialId = {};
            updateSocialId.updatedBy = user.id;
            if (params.facebookAuthId) {
                updateSocialId.facebookAuthId = params.facebookAuthId;
                updateSocialId.updatedBy = user.id;
            } else if (params.googleAuthId) {
                updateSocialId.googleAuthId = params.googleAuthId;
                updateSocialId.updatedBy = user.id;
            }
            let userDetail = await User.update({ id: user.id }).set(updateSocialId)
                .fetch();
            if (userDetail && _.size(userDetail)) {
                userDetail = userDetail[0];
            }
            const token = Cipher.createToken(userDetail);

            await User.update({ id: userDetail.id }, { loginToken: `JWT ${token}`, updatedBy: user.id });
            let response = { isRegistered: true, token: { jwt: token }, user: userDetail };

            return res.ok(response, sails.config.message.OK);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async customerSummary(req, res) {
        try {
            let loggedInUser = req.user;
            let response = await UserService.getUserSummary(loggedInUser.id);

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async sendLoginOtp(req, res) {
        // let params = req.allParams();
        // if (!params || (defaultLoginTypeIsMobile && !params.mobile)) {
        //     return res.badRequest(null, sails.config.message.BAD_REQUEST);
        // }
        try {
            await UserService.sendLoginOtp(user);
            let responseMessage;
            const defaultLoginType = sails.config.USER_DEFAULT_LOGIN_TYPE;
            if (defaultLoginType === sails.config.USER_LOGIN_TYPE_MOBILE) {
                responseMessage = sails.config.message.MOBILE_VERIFICATION;
            } else if (defaultLoginType === sails.config.USER_LOGIN_TYPE_EMAIL) {
                responseMessage = sails.config.message.EMAIL_VERIFICATION_OTP;
            }
            return res.ok({}, responseMessage);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async verifyMasterLogin(req, res) {
        const params = req.allParams();
        if (!params || !params.token || !params.username) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let response = await UserService.verifyMasterLogin(params);
            let user = response.user;
            if (user) {
                const token = Cipher.createToken(user);
                await User.update({ id: user.id }, { loginToken: `JWT ${token}`, updatedBy: user.id }).fetch();
                user = await User.findOne({ id: user.id })
                    .populate('dealerId')
                    .populate('franchiseeId');

                if (user && user.currentBookingPassIds) {
                    delete user.currentBookingPassIds;
                }
                return res.ok({ token: { jwt: token }, user: user }, response.message);
            }
            return res.ok(response.message);
        } catch (err) {
            console.log(err);
            return res.serverError({}, err);
        }
    },
    async verifyDrivingLicence(req, res) {
        const params = req.allParams();
        if (!params || !params.number || !params.dob || !params.path || !params.backPath || !params.selfie) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        console.log('params----------------', params);
        try {
            let loggedInUser = req.user;

            let user = await User.findOne({ id: loggedInUser.id });

            let dlNumberCount = (user.drivingLicenceNumberCount || 0) + 1;
            let dlSelfieCount = (user.drivingLicenceSelfieCount || 0) + 1;

            let updatedUser = await User.update({ id: user.id }).set({
                drivingLicenceNumberCount: dlNumberCount,
            })

            let paramsToUpdate = {
                drivingLicence: {
                    path: '',
                    backPath: '',
                    imageStatus: 0,
                    number: '',
                    numberStatus: 0,
                    isApproved: '',
                    selfie: '',
                    selfieStatus: 0
                }
            }
            if (user.documents && user.documents.drivingLicence) {
                paramsToUpdate.drivingLicence.path = user.documents.drivingLicence.path;
                paramsToUpdate.drivingLicence.backPath = user.documents.drivingLicence.backPath;
                paramsToUpdate.drivingLicence.imageStatus = user.documents.drivingLicence.imageStatus;
                paramsToUpdate.drivingLicence.number = user.documents.drivingLicence.number;
                paramsToUpdate.drivingLicence.numberStatus = user.documents.drivingLicence.numberStatus;
                paramsToUpdate.drivingLicence.selfie = user.documents.drivingLicence.selfie;
                paramsToUpdate.drivingLicence.selfieStatus = user.documents.drivingLicence.selfieStatus;
                // Driving license status
                let isVerified = user.documents.drivingLicence.isApproved ? true : false;

                // Driving license is approved then return message
                if (user.documents.drivingLicence.numberStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED
                    && user.documents.drivingLicence.imageStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED
                    && user.documents.drivingLicence.selfieStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED
                ) {
                    if (isVerified) {
                        return res.ok({}, sails.config.message.DRIVING_LICENCE_ALREADY_VERIFIED);
                    }
                }
            }

            let message = sails.config.message.DRIVING_LICENCE_VERIFIED;

            // User verify driving license using testing driving license number
            if (sails.config.KYC_TESTING_DRIVING_LICENSE_ACTIVE &&
                params.number === sails.config.TEST_DRIVING_LICENSE_NUMBER) {
                paramsToUpdate.drivingLicence.number = params.number;
                paramsToUpdate.drivingLicence.numberStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                paramsToUpdate.drivingLicence.isApproved = true;
                paramsToUpdate.drivingLicence.path = params.path;
                paramsToUpdate.drivingLicence.backPath = params.backPath;
                paramsToUpdate.drivingLicence.imageStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                paramsToUpdate.drivingLicence.selfie = params.selfie;
                paramsToUpdate.drivingLicence.selfieStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;

                updatedUser = await User.update(
                    { id: user.id },
                    {
                        documents: paramsToUpdate
                    }
                ).fetch();

                return res.ok(updatedUser[0], message);
            }

            let isAlreadyExist = await User.findOne({
                where: {
                    id: { '!=': loggedInUser.id },
                    "documents.drivingLicence.number": params.number
                }
            }).meta({ enableExperimentalDeepTargets: true });

            if (isAlreadyExist) {
                return res.ok({}, sails.config.message.DRIVING_LICENCE_FORM_DUPLICATE);
            }

            const kycVerificationFeatureActive = sails.config.KYC_AUTHENTICATION;
            let verifyDocumentNumber = {};
            let verifyDocumentImage = {};
            let verifySelfie = {};

            message = sails.config.message.DRIVING_LICENCE_VERIFIED_FAILED
            await Promise.all(_.map([user], async (user) => {
                let oldLicenseNumber = paramsToUpdate.drivingLicence.number;
                if (!user.documents
                    || oldLicenseNumber !== params.number
                    || paramsToUpdate.drivingLicence.numberStatus !== sails.config.USER.DOCUMENT.STATUS.APPROVED
                ) {
                    paramsToUpdate.drivingLicence.number = params.number;
                    verifyDocumentNumber = await KycService.verifyDrivingLicenceNumber(params, kycVerificationFeatureActive);
                    console.log("verifyDocumentNumber-----------------", verifyDocumentNumber);
                    if (verifyDocumentNumber && verifyDocumentNumber.status === 1) {
                        paramsToUpdate.drivingLicence.numberStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                    }

                    if ((verifyDocumentNumber && verifyDocumentNumber.status === 0)
                        || !verifyDocumentNumber
                    ) {
                        paramsToUpdate.drivingLicence.numberStatus = sails.config.USER.DOCUMENT.STATUS.REJECTED;
                        message = sails.config.message.DRIVING_LICENCE_FAILED;
                    }
                }

            }));

            paramsToUpdate.drivingLicence.isApproved = false;
            if (paramsToUpdate.drivingLicence.numberStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED
                // && paramsToUpdate.drivingLicence.imageStatus === sails.config.USER.DOCUMENT.STATUS.APPROVED
            ) {
                paramsToUpdate.drivingLicence.isApproved = true;
            }
            let statusTrack = {
                dateTime: moment().toISOString(),
                status: paramsToUpdate.drivingLicence.numberStatus,
                count: dlNumberCount
            }
            paramsToUpdate.drivingLicence.path = params.path;
            paramsToUpdate.drivingLicence.backPath = params.backPath;
            paramsToUpdate.drivingLicence.selfie = params.selfie;
            paramsToUpdate.drivingLicence.imageStatus = paramsToUpdate.drivingLicence.imageStatus;
            updatedUser = await User.update(
                { id: user.id },
                {
                    documents: paramsToUpdate,
                    dob: params.dob,
                    drivingLicenceNumberStatusTrack: statusTrack
                }
            ).fetch();
            updatedUser = updatedUser[0]
            if (updatedUser) {
                if (updatedUser.documents.drivingLicence.isApproved) {
                    res.ok(updatedUser, sails.config.message.DRIVING_LICENCE_VERIFIED);
                } else {
                    res.ok(updatedUser, message);
                }

            } else {
                res.ok({}, sails.config.message.DRIVING_LICENCE_VERIFIED_FAILED);
            }


            try {
                console.log("------------Request Verify Driving License Image-----------");
                let oldPath = paramsToUpdate.drivingLicence.path;
                let oldBackPath = paramsToUpdate.drivingLicence.backPath;
                if (!user.documents
                    || oldPath !== params.path
                    || oldBackPath !== params.backPath
                    || paramsToUpdate.drivingLicence.imageStatus !== sails.config.USER.DOCUMENT.STATUS.APPROVED
                ) {
                    let dlImageCount = (user.drivingLicenceImageCount || 0) + 1;

                    await User.update({ id: user.id }).set({
                        drivingLicenceImageCount: dlImageCount,
                    })
                    paramsToUpdate.drivingLicence.path = params.path;
                    paramsToUpdate.drivingLicence.backPath = params.backPath;
                    verifyDocumentImage = await KycService.verifyDocumentImage(params, kycVerificationFeatureActive);
                    console.log("verifyDocumentImage-----------------", verifyDocumentImage);
                    if (!verifyDocumentImage || verifyDocumentImage.status === 0) {
                        paramsToUpdate.drivingLicence.imageStatus = sails.config.USER.DOCUMENT.STATUS.REJECTED;
                    }

                    if (verifyDocumentImage.status === 1) {
                        paramsToUpdate.drivingLicence.imageStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                    }

                    let imageStatusTrack = {
                        dateTime: moment().toISOString(),
                        status: paramsToUpdate.drivingLicence.imageStatus,
                        count: dlImageCount
                    }
                    await User.update(
                        { id: user.id },
                        {
                            documents: paramsToUpdate,
                            dob: params.dob,
                            drivingLicenceImageStatusTrack: imageStatusTrack
                        }
                    ).fetch();
                }
                console.log("------------Request Verify Driving License Selfie-----------");

                let oldSelfie = paramsToUpdate.drivingLicence.selfie;
                let selfieData = {};
                if (!user.documents
                    || oldSelfie !== params.selfie
                    || paramsToUpdate.drivingLicence.selfieStatus !== sails.config.USER.DOCUMENT.STATUS.APPROVED
                ) {
                    let dlSelfieCount = (user.drivingLicenceSelfieCount || 0) + 1;

                    await User.update({ id: user.id }).set({
                        drivingLicenceSelfieCount: dlSelfieCount
                    })
                    paramsToUpdate.drivingLicence.selfie = params.selfie;
                    params.userId = loggedInUser.id;
                    verifySelfie = await KycService.faceVerification(params, kycVerificationFeatureActive);
                    console.log("verifySelfie-----------------", verifySelfie);
                    if (!verifySelfie || verifySelfie.status === 0) {
                        paramsToUpdate.drivingLicence.selfieStatus = sails.config.USER.DOCUMENT.STATUS.REJECTED;
                    }

                    if (verifySelfie.status === 1) {
                        paramsToUpdate.drivingLicence.selfieStatus = sails.config.USER.DOCUMENT.STATUS.APPROVED;
                        if (verifySelfie.msg) {
                            selfieData.isMatch = verifySelfie.msg.is_match;
                            selfieData.matchScore = UtilService.floatToPercentage(verifySelfie.msg.match_score);
                            selfieData.faceLiveness = verifySelfie.msg.face_liveness
                        }
                    }

                    let selfieStatusTrack = {
                        dateTime: moment().toISOString(),
                        status: paramsToUpdate.drivingLicence.selfieStatus,
                        count: dlSelfieCount
                    }
                    paramsToUpdate.drivingLicence.selfie = params.selfie;
                    await User.update(
                        { id: user.id },
                        {
                            documents: paramsToUpdate,
                            drivingLicenceSelfieStatusTrack: selfieStatusTrack,
                            selfieVerificationDetails: selfieData
                        }
                    ).fetch();
                }
            } catch (error) {
                console.log('error----------------------', error);
            }

        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async sendUpdateReverificationOtp(req, res) {
        try {
            let params = req.allParams();
            const fields = ['updatedField', 'value'];
            await commonValidator.checkRequiredParams(fields, params);
            await UserService.sendUpdateReverificationOtp(req.user, params.updatedField, params.value);

            return res.ok({}, sails.config.message.OTP_SENT);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async verifyUpdateUserOtp(req, res) {
        try {
            let params = req.allParams();
            const fields = ['token', 'updatedField'];
            await commonValidator.checkRequiredParams(fields, params);

            await UserService.verifyUpdateUserOtp(req.user, params.token, params.updatedField);

            return res.ok({}, sails.config.message.OTP_VERIFIED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async locationUpdate(req, res) {
        try {
            let params = req.allParams();

            await DeviceLocationTrack.create(params);

            return res.ok({}, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getProjectConfig(req, res) {
        try {
            let data = await CommonService.getMobileConfig();
            let response = { isSystemEnableLanguage: data.isSystemEnableLanguage }
            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};

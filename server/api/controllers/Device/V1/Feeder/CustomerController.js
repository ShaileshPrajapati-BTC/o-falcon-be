/* eslint-disable max-lines-per-function */
const UserService = require(`${sails.config.appPath}/api/services/user`);
const moment = require('moment');
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const _ = require('lodash');
const uuid = require('uuid');
const Cipher = require(`${sails.config.appPath}/api/services/cipher`);
// const ObjectId = require('mongodb').ObjectID;
// const UtilService = require(`${sails.config.appPath}/api/services/util`);
// const CommonService = require(`${sails.config.appPath}/api/services/common`);

module.exports = {
    async update(req, res) {
        let params = req.allParams();
        try {
            params.id = req.user.id;
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            params.type = sails.config.USER.TYPE.FEEDER;
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
                        isVerified: false
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
            let user = _.omit(params, 'id');
            let updatedUser = await User.update({
                id: params.id,
                type: sails.config.USER.TYPE.FEEDER,
                referralLink: params.referralLink ? params.referralLink : ""
            }).set(user)
                .fetch();
            if (updatedUser) {
                updatedUser = updatedUser[0];
                if (
                    updatedUser.firstName
                    && updatedUser.lastName
                    && (updatedUser.emails && updatedUser.emails[0].email)
                    && (updatedUser.mobiles && updatedUser.mobiles[0].mobile)
                    && updatedUser.qatarLicenceId
                    && updatedUser.feederCompanyName
                ) {
                    await UserService.makeUserNonGuestUser(req.user);
                }
                if (sails.config.IS_REFERRAL_ENABLE) {
                    console.log("-----------------------------sails.config.IS_REFERRAL_ENABLE", sails.config.IS_REFERRAL_ENABLE);
                    let referralType = sails.config.REFERRAL.TYPE.CODE;
                    await UserService.referralCodeGenerateAndAddBenefit(params, updatedUser, referralType);
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
        req.options.userType = sails.config.USER.TYPE.FEEDER;
        let deviceType = Number(req.headers.devicetype);
        const language = req.headers.language || 'en-US';
        if (isMasterAuthFlow) {
            let params = req.allParams();
            params.type = sails.config.USER.TYPE.FEEDER;
            let loginType = params.loginType;
            try {
                if (!params || !params.username || !loginType) {
                    return res.serverError(null, sails.config.message.BAD_REQUEST);
                }
                params.username = params.username.toString().toLowerCase();
                let filter = {
                    where: {
                        isDeleted: false,
                        or: [{ 'emails.email': params.username }, { 'mobiles.mobile': params.username }],
                        type: sails.config.USER.TYPE.FEEDER
                    }
                };
                let isUserRegistered = true;
                let user = await User.findOne(filter).meta({ enableExperimentalDeepTargets: true });
                if (!user) {
                    console.log('!user -> createFeeder');
                    user = await UserService.createFeeder(params, loginType);
                    isUserRegistered = false;
                } else if (!user.isActive) {
                    throw sails.config.message.USER_NOT_ACTIVE;
                }
                let response = await UserService.sendLoginOtp(user, loginType, isUserRegistered, deviceType, language);

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
    async socialAuth(req, res) {
        let params = req.allParams();
        params.type = sails.config.USER.TYPE.FEEDER;
        if (!params || (!params.facebookAuthId && !params.googleAuthId)) {
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
    async checkSocialAuth(req, res) {
        try {
            let params = req.allParams();
            if (!params.email && !params.facebookAuthId && !params.googleAuthId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let where = {
                type: sails.config.USER.TYPE.FEEDER
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
    async feederSummary(req, res) {
        try {
            let loggedInUser = req.user;
            let response = await UserService.getUserSummary(loggedInUser.id);

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async verifyMasterLogin(req, res) {
        const params = req.allParams();
        if (!params || !params.token || !params.username) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let response = await UserService.verifyFeederMasterLogin(params);
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
    }
};

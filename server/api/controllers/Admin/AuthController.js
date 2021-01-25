/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var auth = require(sails.config.appPath + '/api/services/auth');
var UserService = require(sails.config.appPath + '/api/services/user');
const authService = require(sails.config.appPath + '/api/services/auth');
const _ = require("lodash");
const moment = require("moment");
module.exports = {

    /**
     * login
     * @param req
     * @param res
     */
    login: function (req, res) {
        req.headers.devicetype = sails.config.DEVICE_TYPE.ADMIN;
        auth.login(req, res);
    },

    /**
     * validate token
     * @param req
     * @param res
     */
    validate_token: function (req, res) {
        auth.isvalidtoken(req, res);
    },

    /**
     * logout
     * @param req
     * @param res
     * @returns {*}
     */
    logout: function (req, res) {
        try {
            authService.logout(req)
            //req.logout is passportjs function to clear user information. see http://passportjs.org/docs
            return res.ok(null, sails.config.message.LOGOUT);
        } catch (err) {
            console.log(err)
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    },
    async resetPassword(req, res) {
        const params = req.allParams();
        try {
            if (!await auth.validateResetPasswordParams(params)) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let user = await User.findOne({ 'resetPasswordLink.code': params.token }).meta({ enableExperimentalDeepTargets: true });
            if (user && user.resetPasswordLink.expireTime) {
                if (moment(new Date()).isAfter(moment(user.resetPasswordLink.expireTime))) {//link expire
                    return res.ok(false, sails.config.message.RESET_PASSWORD_LINK_EXPIRE);
                }
            } else {//invalid token
                return res.ok(false, sails.config.message.RESET_PASSWORD_LINK_EXPIRE);
            }
            let response = await UserService.resetUserPassword(user, params.newPassword);
            if (response.flag) {
                return res.ok(response, response.message);
            } else {
                return res.badRequest(null, response.message);
            }
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async resetPasswordWeb(req, res) {
        const params = req.allParams();
        try {
            if (!await auth.validateResetPasswordParamsWeb(params)) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            const masterOtp = sails.config.USER_MASTER_OTP;
            let user = await User.findOne({
                or: [{ 'emails.email': params.username }, { 'mobiles.mobile': params.username }]
            }).meta({ enableExperimentalDeepTargets: true });
            if (!user) {
                return res.badRequest(null, sails.config.message.USER_LIST_NOT_FOUND);
            }
            if (user.resetPasswordLink.expireTime) {
                if (moment(new Date()).isAfter(moment(user.resetPasswordLink.expireTime)) &&
                    masterOtp !== params.token) {
                    //link expire
                    return res.ok(false, sails.config.message.RESET_PASSWORD_LINK_EXPIRE);
                }
            }
            if (masterOtp !== params.token && user.resetPasswordLink.code !== params.token) {//invalid token
                return res.ok(false, sails.config.message.RESET_PASSWORD_LINK_EXPIRE);
            }
            let response = await UserService.resetPassword(user, params.newPassword);
            if (response.flag) {
                return res.ok(response, response.message);
            } else {
                return res.badRequest(null, response.message);
            }
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
            const userId = req.user.id;
            let user = await User.findOne({ id: userId });
            let response = await UserService.resetUserPassword(
                user,
                params.newPassword,
                params.currentPassword
            );

            if (response && response.flag) {
                await User.update({ id: userId }, { defaultPassword: false });

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
        console.log("forgotPassword -> params", params)
        try {
            params.username = params.username.toString().toLowerCase();
            if (!await auth.validateForgotPasswordParams(params)) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let user = await User.findOne({
                or: [
                    { 'emails.email': params.username },
                    { 'mobiles.mobile': params.username }
                ]
            }).meta({ enableExperimentalDeepTargets: true });
            if (user) {
                let message = await UserService.sendResetPasswordEmail(user);
                if (message) {
                    return res.ok(null, sails.config.message.RESET_PASSWORD_LINK);
                }
            } else {
                return res.notFound(null, sails.config.message.EMAIL_NOT_REGISTERED);
            }
        } catch (err) {
            console.log(err);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
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
            return res.ok({}, response);
        } catch (err) {
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    // no use
    async emailVerificationLink(req, res) {
        let params = req.allParams();
        if (!params || !params.email) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            params.email = params.email.toString().toLowerCase();
            let user = await User.findOne({
                "emails.email": params.email,
                type: sails.config.USER.TYPE.CUSTOMER
            }).meta({ enableExperimentalDeepTargets: true });
            if (!user) {
                return res.ok({}, sails.config.message.USER_NOT_FOUND);
            }
            let isVerified = _.find(user.emails, { isVerified: true });
            if (isVerified) {
                return res.ok({}, sails.config.message.EMAIL_ALREADY_VERIFIED);
            }
            await UserService.sendEmailVerificationLink(user, params.email);
            return res.ok({}, sails.config.message.EMAIL_VERIFICATION)
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    },

    // no use
    async mobileVerificationLink(req, res) {
        let params = req.allParams();
        if (!params || !params.mobile) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let user = await User.findOne({
                "mobiles.mobile": params.mobile,
                type: sails.config.USER.TYPE.CUSTOMER
            }).meta({ enableExperimentalDeepTargets: true });
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
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    },
    async logout(req, res) {
        try {
            await auth.logout(req);
            //req.logout is passportjs function to clear user information. see http://passportjs.org/docs
            return res.ok(null, sails.config.message.LOGOUT);
        } catch (err) {
            console.log(err);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async getMyData(req, res) {
        let params = req.allParams();
        try {
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let user = await User.findOne(params).meta({ enableExperimentalDeepTargets: true });
            if (user) {

                return res.ok(user, sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.USER_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
};

const Cipher = require('./cipher');
const _ = require('lodash');
const UtilService = require('./util');
const EmailService = require('./email');
const SMSService = require('./sms');
const uuid = require('uuid');
const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');
const CommonService = require('./common');
const TranslationService = require('./Translation');
const WalletService = require('./wallet');
const ObjectId = require('mongodb').ObjectID;
const PaymentService = require('./payment');
const NestService = require('./nest');
const request = require('request');

module.exports = {
    async update(params) {
        let self = this;
        if (params.emails && _.size(params.emails) > 0) {
            _.each(params.emails, (email) => {
                if (!email.id) {
                    email.id = uuid();
                }
            });
        }
        if (params.mobiles && _.size(params.mobiles) > 0) {
            _.each(params.mobiles, (mobile) => {
                if (!mobile.id) {
                    mobile.id = uuid();
                }
            });
        }
        // create user
        let message = await self.checkDuplication(params);
        if (_.isObject(message)) {
            return { flag: false, data: message };
        }

        let user = await User.findOne({ id: params.id });
        if (user) {
            if (params.address) {
                if (user.addresses && user.addresses.length) {
                    // check if id then edit
                    if (params.address.id && !params.address.isDelete) {
                        let index = _.findIndex(user.addresses, {
                            id: params.address.id,
                        });
                        user.addresses[index] = params.address;
                    } else if (params.address.id && params.address.isDelete) {
                        let index = _.findIndex(user.addresses, {
                            id: params.address.id,
                        });
                        user.addresses.splice(index, 1);
                    } else {
                        user.addresses.push(params.address);
                    }

                    params.addresses = user.addresses;
                } else {
                    params.addresses = [params.address];
                }
            }

            if (params.account) {
                if (user.accounts && user.accounts.length) {
                    // check if id then edit
                    if (params.account.id && !params.account.isDelete) {
                        let index = _.findIndex(user.accounts, {
                            id: params.account.id,
                        });
                        user.accounts[index] = params.account;
                    } else if (params.account.id && params.account.isDelete) {
                        let index = _.findIndex(user.accounts, {
                            id: params.account.id,
                        });
                        user.accounts.splice(index, 1);
                    } else {
                        user.accounts.push(params.account);
                    }

                    params.accounts = user.accounts;
                } else {
                    params.accounts = [params.account];
                }
            }
            if (params.addresses && _.size(params.addresses) > 0) {
                _.each(params.addresses, (address) => {
                    if (!address.id) {
                        address.id = uuid();
                    }
                });
            }
            if (params.accounts && _.size(params.accounts) > 0) {
                let sequence = 1;
                _.each(params.accounts, (account) => {
                    if (!account.id) {
                        account.id = uuid();
                    }
                    account.sequence = sequence;
                    sequence += 1;
                });
            }
            let paramsToUpdate = _.omit(params, "id");
            let updatedUser = await User.update({ id: params.id })
                .set(paramsToUpdate)
                .fetch();
            if (updatedUser && updatedUser.length) {
                return { flag: true, data: _.first(updatedUser) };
            }
        }

        return { flag: false, data: sails.config.message.USER_NOT_FOUND };
    },
    async create(params) {
        let self = this;
        try {
            if (params.emails && _.size(params.emails) > 0) {
                _.each(params.emails, (email) => {
                    email.isVerified = true; // remove it when  email notification send  right now  it's default verify

                    if (!email.id) {
                        email.id = uuid();
                    }
                });
            }
            if (params.mobiles && _.size(params.mobiles) > 0) {
                _.each(params.mobiles, (mobile) => {
                    mobile.isVerified = true; // remove it when  email notification send  right now  it's default verify
                    if (!mobile.id) {
                        mobile.id = uuid();
                    }
                });
            }

            // create user
            let message = await self.checkDuplication(params);
            if (_.isObject(message)) {
                return { flag: false, data: message };
            }
            if (params.addresses && _.size(params.addresses) > 0) {
                _.each(params.addresses, (address) => {
                    if (!address.id) {
                        address.id = uuid();
                    }
                });
            }

            if (params.accounts && _.size(params.accounts) > 0) {
                let sequence = 1;
                _.each(params.accounts, (account) => {
                    if (!account.id) {
                        account.id = uuid();
                    }
                    account.sequence = sequence;
                    sequence += 1;
                });
            }
            let createdRecord = await User.create(params).fetch();

            return { flag: true, data: createdRecord };
        } catch (error) {
            throw new Error(error);
        }
    },
    async checkDuplication(params) {
        let filter = { where: { isDeleted: false } };
        if (params.type === sails.config.USER.TYPE.CUSTOMER) {
            filter.where.type = sails.config.USER.TYPE.CUSTOMER;
        } else if (params.type) {
            filter.where.type = { "!=": sails.config.USER.TYPE.CUSTOMER };
        }
        if (params.id) {
            filter.where.id = { '!=': params.id };
        }

        if (params.emails && params.emails.length) {
            // filter.where.type = params.type;
            filter.where['emails.email'] = _.map(params.emails, 'email');

            let users = await User.find(filter.where).meta({ enableExperimentalDeepTargets: true });
            if (users && users.length > 0) {
                return sails.config.message.EMAIL_REGISTERED;
            }
        }
        filter = { where: { isDeleted: false } };
        if (params.type === sails.config.USER.TYPE.CUSTOMER) {
            filter.where.type = sails.config.USER.TYPE.CUSTOMER;
        } else if (params.type) {
            filter.where.type = { "!=": sails.config.USER.TYPE.CUSTOMER };
        }
        if (params.id) {
            filter.where.id = { '!=': params.id };
        }
        if (params.mobiles && params.mobiles.length) {
            // filter.where.type = params.type;
            filter.where['mobiles.mobile'] = _.map(params.mobiles, 'mobile');

            let users = await User.find(filter.where).meta({ enableExperimentalDeepTargets: true });
            if (users && users.length > 0) {
                return sails.config.message.MOBILE_REGISTERED;
            }
        }

        filter = { where: { isDeleted: false } };
        if (params.type === sails.config.USER.TYPE.CUSTOMER) {
            filter.where.type = sails.config.USER.TYPE.CUSTOMER;
        } else if (params.type) {
            filter.where.type = { "!=": sails.config.USER.TYPE.CUSTOMER };
        }
        if (params.id) {
            filter.where.id = { '!=': params.id };
        }
        if (params.username && params.username.length) {
            // filter.where.type = params.type;
            filter.where['username'] = params.username;

            let users = await User.find(filter.where).meta({ enableExperimentalDeepTargets: true });
            if (users && users.length > 0) {
                return sails.config.message.USERNAME_REGISTERED;
            }
        }

        return true;
    },

    async checkDuplicationForDevice(params) {
        let filter = { where: { isDeleted: false } };
        if (params.type) {
            filter.where.type = params.type;
        }
        if (params.id) {
            filter.where.id = { "!=": params.id };
        }

        if (params.emails && params.emails.length) {
            // filter.where.type = params.type;
            filter.where["emails.email"] = _.map(params.emails, "email");

            let users = await User.find(filter.where).meta({
                enableExperimentalDeepTargets: true,
            });
            if (users && users.length > 0) {
                return sails.config.message.EMAIL_REGISTERED;
            }
        }
        filter = { where: { isDeleted: false } };
        if (params.type) {
            filter.where.type = params.type;
        }
        if (params.id) {
            filter.where.id = { "!=": params.id };
        }
        if (params.mobiles && params.mobiles.length) {
            // filter.where.type = params.type;
            filter.where["mobiles.mobile"] = _.map(params.mobiles, "mobile");

            let users = await User.find(filter.where).meta({
                enableExperimentalDeepTargets: true,
            });
            if (users && users.length > 0) {
                return sails.config.message.MOBILE_REGISTERED;
            }
        }

        filter = { where: { isDeleted: false } };
        if (params.type) {
            filter.where.type = params.type;
        }
        if (params.id) {
            filter.where.id = { "!=": params.id };
        }
        if (params.username && params.username.length) {
            // filter.where.type = params.type;
            filter.where["username"] = params.username;

            let users = await User.find(filter.where).meta({
                enableExperimentalDeepTargets: true,
            });
            if (users && users.length > 0) {
                return sails.config.message.USERNAME_REGISTERED;
            }
        }

        if (params.uniqueIdentityNumber) {
            let countFilter = {
                uniqueIdentityNumber: params.uniqueIdentityNumber,
            };
            if (params.id) {
                countFilter.id = { "!=": params.id };
            }
            let userCount = await User.count(countFilter);
            if (userCount > 0) {
                return sails.config.message.UNIQUE_IDENTITY_CODE_REGISTERED;
            }
        }

        return true;
    },

    async checkForInviteCodeDuplication(params) {
        if (params.inviteCode) {
            const inviteCode = params.inviteCode;
            let countFilter = {
                inviteCode: inviteCode,
                type: { "!=": sails.config.USER.TYPE.CUSTOMER },
            };
            if (params.id) {
                countFilter.id = { "!=": params.id };
            }
            let userCount = await User.count(countFilter);
            if (userCount > 0) {
                return sails.config.message.INVITE_CODE_REGISTERED;
            }
        }

        return true;
    },

    async checkIsParent(id) {
        const childExist = await User.find({ parentId: id });
        if (childExist.length > 0) {
            throw sails.config.message.CANT_CHANGE_USER_TYPE;
        }
    },
    /**
     * Send OTP to user  for login
     */
    async sendOtp(options, params) {
        try {
            let user = _.clone(options);
            let successMsg;
            // Send OTP to user
            let otp = UtilService.randomNumber();
            let otpMsg = `Login with OTP: ${otp} and start taking Rides with ${sails.config.PROJECT_NAME}`;
            user["authCode"] = user["authCode"]
                ? `${user["authCode"]},${otp}`
                : otp;

            // send login verification otp
            let updateOtp = await User.update(
                { id: user.id },
                { authCode: user.authCode }
            ).fetch();
            let sms_obj = {};
            if (params.newMobile) {
                sms_obj = {
                    mobiles: sails.config.COUNTRY_CODE + params.newMobile,
                    message: otpMsg,
                };
            } else {
                sms_obj = {
                    mobiles: sails.config.COUNTRY_CODE + params.mobile,
                    message: otpMsg,
                };
            }
            let sendSms = await SMSService.send(sms_obj);
            let returnObj = {
                authCode: user.authCode,
                successMsg: sails.config.message.OTP_SENT.message,
            };

            return returnObj;
        } catch (err) {
            console.log("Err", err);
        }
    },
    async checkOtp(user, params) {
        let arrCode = user.authCode ? user.authCode.split(",") : null;
        let authCodeChk = arrCode ? _.indexOf(arrCode, params.otp) : null;

        if (arrCode && authCodeChk >= 0) {
            let setObj = { authCode: null, updatedBy: params.updatedBy };
            let updatedUser = await User.update({ id: user.id })
                .set(setObj)
                .fetch();
            updatedUser = updatedUser.length
                ? _.first(updatedUser)
                : updatedUser;

            return updatedUser;
        }

        return false;
    },
    /**
     * Send OTP to user  email
     */
    async sendOtpOnMail(options) {
        try {
            let user = options.user;
            // Send OTP to user
            let otp = UtilService.randomNumber();
            let message = "Your OTP code is";
            message = TranslationService.translateMessage(
                message,
                user.preferredLang
            );
            let otpMsg = `${message}: ${otp}`;
            user["verificationCode"] = user["verificationCode"] ? otp : "";

            await User.update({ id: user.id }, { verificationCode: otp });
            user.email = _.find(user.emails, { isPrimary: true }).email;
            let mailObj = {
                subject: "OTP verification",
                to: user.email,
                template: "OtpChk",
                data: {
                    name: user.name || "-",
                    email: user.email || "-",
                    message: otpMsg,
                },
                language: user.preferredLang,
            };
            EmailService.send(mailObj);

            return sails.config.message.OK;
        } catch (e) {
            return sails.config.message.SERVER_ERROR;
        }
    },
    async sendMobileVerificationLink(user, mobileNum) {
        console.log("inside sendMobileVerificationLink 295");
        try {
            let otp = UtilService.randomNumber();
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            let userMobile = {};
            if (!mobileNum) {
                mobileNum = _.find(user.mobiles, (m) => {
                    return m.isPrimary;
                }).mobile;
            }
            _.each(user.mobiles, (mobile) => {
                if (mobile.mobile === mobileNum) {
                    mobile.verification = {
                        token: otp,
                        expireTime: expires,
                    };
                    userMobile = mobile;
                }
            });

            if (!userMobile.isVerified) {
                await User.update({ id: user.id }, { mobiles: user.mobiles });
                console.log(otp);
                // TODO :: enable send message for login
                SMSService.send({
                    message: `Your verification code is ${otp}.`,
                    mobiles: userMobile.countryCode + userMobile.mobile,
                });

                return sails.config.message.OK;
            }

            // Already verified
            return sails.config.message.OK;
        } catch (e) {
            return sails.config.message.SERVER_ERROR;
        }
    },
    async sendEmailVerification(user, emailId) {
        let res;
        if (sails.config.EMAIL_VERIFICATION_TYPE === "OTP") {
            res = await this.sendEmailVerificationOtp(user, emailId);
        } else {
            res = await this.sendEmailVerificationLink(user, emailId);
        }

        return res;
    },
    async sendEmailVerificationOtp(user, emailId) {
        try {
            let otp = UtilService.randomNumber();
            let message = "Your OTP code is";
            message = TranslationService.translateMessage(
                message,
                user.preferredLang
            );
            let otpMsg = `${message}: ${otp}`;
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            let userEmail = {};
            if (!emailId) {
                emailId = UtilService.getPrimaryEmail(user.emails);
            }
            console.log("emailId", emailId);
            _.each(user.emails, (email) => {
                if (email.email === emailId) {
                    email.verification = {
                        token: otp,
                        expireTime: expires,
                    };
                    userEmail = email;
                }
            });

            if (userEmail && !userEmail.isVerified) {
                await User.update({ id: user.id }, { emails: user.emails });
                let mailObj = {
                    subject: "Verify Email",
                    to: userEmail.email,
                    template: "OtpChk",
                    data: {
                        name: user.name || "-",
                        email: userEmail.email || "-",
                        message: otpMsg,
                    },
                    language: user.preferredLang,
                };

                EmailService.send(mailObj);

                return sails.config.message.OK;
            }
            // Already verified

            return sails.config.message.OK;
        } catch (e) {
            return sails.config.message.SERVER_ERROR;
        }
    },
    async sendEmailVerificationLink(user, emailId) {
        try {
            let token = uuid();
            let otp_msg = "Click on the link below to verify your email.";
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            let userEmail = {};
            if (!emailId) {
                emailId = UtilService.getPrimaryEmail(user.emails);
            }
            console.log("emailId", emailId);
            _.each(user.emails, (email) => {
                if (email.email === emailId) {
                    email.verification = {
                        token: token,
                        expireTime: expires,
                    };
                    userEmail = email;
                }
            });

            if (userEmail && !userEmail.isVerified) {
                await User.update({ id: user.id }, { emails: user.emails });
                let mail_obj = {
                    subject: "Verify Email",
                    to: userEmail.email,
                    template: "verifyLink",
                    data: {
                        name: user.name || "-",
                        email: userEmail.email || "-",
                        message: otp_msg,
                        link: `${UtilService.getBaseUrl()}/auth/verify-email/${token}`,
                        linkText: "Verify Email",
                    },
                    language: user.preferredLang,
                };

                EmailService.send(mail_obj);

                return sails.config.message.OK;
            }
            // Already verified

            return sails.config.message.OK;
        } catch (e) {
            return sails.config.message.SERVER_ERROR;
        }
    },
    async verifyEmail(params) {
        try {
            let user = await User.findOne({
                "emails.verification.token": params.token,
            }).meta({ enableExperimentalDeepTargets: true });
            if (user) {
                let mainEmail = {};
                _.each(user.emails, (email) => {
                    if (
                        email.verification &&
                        email.verification.token &&
                        email.verification.token === params.token
                    ) {
                        mainEmail = _.clone(email);
                        email.verification = {};
                        email.isVerified = true;
                    }
                });
                if (mainEmail && mainEmail.verification.expireTime) {
                    if (
                        moment().isAfter(
                            moment(mainEmail.verification.expireTime)
                        )
                    ) {
                        // code expire
                        return sails.config.message.INVALID_VERIFICATION_TOKEN;
                    }
                    await User.update(
                        { id: user.id },
                        { emails: user.emails, updatedBy: params.updatedBy }
                    );
                    // let loginByOtp = sails.config.IS_MASTER_AUTH_FLOW;
                    // let defaultLoginType = sails.config.USER_DEFAULT_LOGIN_TYPE;
                    // if (loginByOtp && defaultLoginType === sails.config.USER_LOGIN_TYPE_EMAIL) {
                    //     await this.createCustomerAndCreditWallet(user);
                    // }

                    return sails.config.message.EMAIL_VERIFIED;
                }
            }

            return sails.config.message.INVALID_VERIFICATION_TOKEN;
        } catch (e) {
            console.log(e);

            return sails.config.message.SERVER_ERROR;
        }
    },
    async verifyMobile(params) {
        let loginByOtp = sails.config.IS_MASTER_AUTH_FLOW;
        let isForLogin = !!params.isForLogin;
        if (loginByOtp && !isForLogin) {
            let verifyGuestUserRes = await this.verifyGuestUser(params);
            return verifyGuestUserRes;
        }
        let user = await User.findOne({
            "mobiles.mobile": params.mobile,
        }).meta({ enableExperimentalDeepTargets: true });
        const enableMasterOtp = sails.config.USER_ENABLE_MASTER_OTP;
        const masterOtp = sails.config.USER_MASTER_OTP;
        let loginCodeVerification = user.loginCodeVerification;
        let isInvalidOtp = true;
        if (user) {
            let mainMobile = {};
            let updateObj;
            let responseMessage;
            if (!isForLogin) {
                _.each(user.mobiles, (mobile) => {
                    if (
                        mobile.verification.token === params.token ||
                        (enableMasterOtp && masterOtp === params.token)
                    ) {
                        mainMobile = _.clone(mobile);
                        mobile.verification = {};
                        mobile.isVerified = true;
                    }
                });
                if (
                    mainMobile &&
                    mainMobile.verification &&
                    mainMobile.verification.expireTime
                ) {
                    if (
                        moment().isAfter(
                            moment(mainMobile.verification.expireTime)
                        )
                    ) {
                        throw sails.config.message.OTP_EXPIRE;
                    }
                    updateObj = {
                        mobiles: user.mobiles,
                        updatedBy: params.updatedBy,
                    };
                    responseMessage = sails.config.message.MOBILE_VERIFIED;

                    // let defaultLoginType = sails.config.USER_DEFAULT_LOGIN_TYPE;
                    // if (loginByOtp && defaultLoginType === sails.config.USER_LOGIN_TYPE_MOBILE) {
                    //     await this.createCustomerAndCreditWallet(user);
                    // }
                    isInvalidOtp = false;
                }
            } else {
                if (
                    loginCodeVerification &&
                    loginCodeVerification.expireTime &&
                    moment().isAfter(moment(loginCodeVerification.expireTime))
                ) {
                    throw sails.config.message.OTP_EXPIRE;
                }
                if (
                    loginCodeVerification.token === params.token ||
                    (enableMasterOtp && masterOtp === params.token)
                ) {
                    _.each(user.mobiles, (mobile) => {
                        mainMobile = _.clone(mobile);
                        mobile.verification = {};
                        mobile.isVerified = true;
                    });
                    updateObj = {
                        loginCodeVerification: null,
                        mobiles: user.mobiles,
                    };
                    // await this.createCustomerAndCreditWallet(user);
                    responseMessage = sails.config.LOGIN_OTP_VERIFIED;
                    isInvalidOtp = false;
                }
            }
            if (isInvalidOtp) {
                throw sails.config.message.INVALID_OTP;
            }
            let updatedUser = await User.update(
                { id: user.id },
                updateObj
            ).fetch();

            return { user: updatedUser[0], message: responseMessage };
        }

        throw sails.config.message.USER_NOT_FOUND;
    },
    async sendResetPasswordEmail(user, type) {
        let res;
        if (sails.config.EMAIL_VERIFICATION_TYPE === "OTP" && type !== "web") {
            res = await this.sendResetPasswordOtp(user, type);
        } else {
            res = await this.sendResetPasswordLink(user, type);
        }

        return res;
    },
    async sendResetPasswordOtp(user, type) {
        try {
            let otp = UtilService.randomNumber();
            let message = `OTP code for Reset password`;
            message = TranslationService.translateMessage(
                message,
                user.preferredLang
            );
            let otpMsg = `${message}: ${otp}`;

            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            await User.update(
                { id: user.id },
                { resetPasswordLink: { code: otp, expireTime: expires } }
            );
            user.email = _.find(user.emails, { isPrimary: true }).email;
            let mailObj = {
                subject: "Reset Password",
                to: user.email,
                template: "OtpChk",
                data: {
                    name: user.name || "-",
                    email: user.email || "-",
                    message: otpMsg,
                },
                language: user.preferredLang,
            };
            EmailService.send(mailObj);

            return true;
        } catch (e) {
            console.log("e", e);

            return false;
        }
    },
    async sendResetPasswordLink(user, type) {
        try {
            let token = uuid();
            let viewType = "/e-scooter/reset-password/";
            let otp_msg = "Click on the link below to reset your password.";
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            await User.update(
                { id: user.id },
                { resetPasswordLink: { code: token, expireTime: expires } }
            );
            user.email = _.find(user.emails, { isPrimary: true }).email;
            let mail_obj = {
                subject: "Reset Password",
                to: user.email,
                template: "verifyLink",
                data: {
                    name: user.name || "-",
                    email: user.email || "-",
                    message: otp_msg,
                    link: UtilService.getBaseUrl() + viewType + token,
                    linkText: "Reset Password",
                },
                language: user.preferredLang,
            };
            EmailService.send(mail_obj);

            return true;
        } catch (e) {
            return false;
        }
    },
    async resetUserPassword(user, newPassword, currentPassword) {
        try {
            const dbUser = await User.findOne({ id: user.id });
            if (!dbUser) {
                return {
                    flag: false,
                    message: sails.config.message.USER_NOT_FOUND,
                };
            }
            const currentDBPassword = dbUser.password;

            const compareResult = await new Promise((resolve, reject) => {
                bcrypt.compare(
                    currentPassword,
                    currentDBPassword,
                    (err, res) => {
                        if (err) {
                            reject(false);
                        } else {
                            resolve(res);
                        }
                    }
                );
            });

            if (!compareResult) {
                return {
                    flag: false,
                    message: sails.config.message.INVALID_CURRENT_PASSWORD,
                };
            }

            newPassword = await new Promise((resolve, reject) => {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(
                        newPassword,
                        salt,
                        () => { },
                        (err, hash) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                resolve(hash);
                            }
                        }
                    );
                });
            });

            await User.update(
                { id: user.id },
                {
                    password: newPassword,
                    resetPasswordLink: null,
                    updatedBy: user.id,
                }
            );
            user.email = _.find(user.emails, { isPrimary: true }).email;
            let mail_obj = {
                to: user.email,
                template: "passwordReset",
                data: {
                    mailContent: {
                        subject: "Reset Password",
                        name: user.name || "-",
                        email: user.email || "-",
                    },
                },
                language: user.preferredLang,
            };
            EmailService.send(mail_obj);

            return {
                flag: true,
                message: sails.config.message.USER_PASSWORD_RESET,
            };
        } catch (e) {
            return { flag: false, message: sails.config.message.SERVER_ERROR };
        }
    },
    async resetPassword(user, newPassword) {
        try {
            const dbUser = await User.findOne({ id: user.id });
            if (!dbUser) {
                return {
                    flag: false,
                    message: sails.config.message.USER_NOT_FOUND,
                };
            }

            newPassword = await new Promise((resolve, reject) => {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(
                        newPassword,
                        salt,
                        () => { },
                        (err, hash) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                resolve(hash);
                            }
                        }
                    );
                });
            });

            await User.update(
                { id: user.id },
                {
                    password: newPassword,
                    resetPasswordLink: null,
                    updatedBy: user.id,
                }
            );
            user.email = _.find(user.emails, { isPrimary: true }).email;
            let mail_obj = {
                to: user.email,
                template: "passwordReset",
                data: {
                    mailContent: {
                        subject: "Reset Password",
                        name: user.name || "-",
                        email: user.email || "-",
                    },
                },
                language: user.preferredLang,
            };
            EmailService.send(mail_obj);

            return {
                flag: true,
                message: sails.config.message.USER_PASSWORD_RESET,
            };
        } catch (e) {
            return { flag: false, message: sails.config.message.SERVER_ERROR };
        }
    },
    async changePasswordByAdmin(params) {
        try {
            let password = params.newPassword;
            let user = await User.findOne({ id: params.id });
            console.log("updatedUser");
            console.log(user);
            console.log("updatedUser");
            if (user && user.id) {
                params.newPassword = await new Promise((resolve, reject) => {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(
                            params.newPassword,
                            salt,
                            () => { },
                            (err, hash) => {
                                if (err) {
                                    reject(new Error(err));
                                } else {
                                    resolve(hash);
                                }
                            }
                        );
                    });
                });
                console.log("updatedUser");
                let updatedUser = await User.update(
                    { id: user.id },
                    {
                        password: params.newPassword,
                        updatedBy: params.updatedBy,
                    }
                ).fetch();
                if (updatedUser && updatedUser.length) {
                    user.userEmailPass = password;
                    let primaryEmail = _.find(user.emails, { isPrimary: true });
                    user.primaryEmail =
                        primaryEmail && primaryEmail.email
                            ? primaryEmail.email
                            : user.emails[0] && user.emails[0].email
                                ? user.emails[0].email
                                : "";
                    let subject = "Reset password by admin";
                    subject = TranslationService.translateMessage(
                        subject,
                        user.preferredLang
                    );
                    let mail_obj = {
                        subject: `${sails.config.PROJECT_NAME}- ${subject}`,
                        to: user.primaryEmail,
                        template: "adminUserPasswordReset",
                        data: {
                            name: user.name || "-",
                            email: user.primaryEmail || "-",
                            password: user.userEmailPass,
                        },
                        language: user.preferredLang,
                    };
                    EmailService.send(mail_obj);

                    return user;
                }

                return false;
            }

            return false;
        } catch (e) {
            return false;
        }
    },
    /**
     * if user add or update a service update -> mapData
     * @param options
     * @returns {Promise<boolean>}
     */
    async notificationIdentifierUpsert(options) {
        let deviceType = options.deviceType;
        let playerId = options.playerId;
        let loginUser = options.loginUser;
        try {
            let existedUser = await User.findOne({
                or: [{ androidPlayerId: playerId }, { iosPlayerId: playerId }],
            });
            // remove key from existed user
            let update = {};
            if (existedUser) {
                if (existedUser.id === loginUser.id) {
                    return sails.config.message.PLAYERID_DUPLICATE;
                }
                let indexOfAndroid =
                    existedUser.androidPlayerId &&
                        _.size(existedUser.androidPlayerId)
                        ? existedUser.androidPlayerId.indexOf(playerId)
                        : -1;
                let indexOfIos =
                    existedUser.iosPlayerId && _.size(existedUser.iosPlayerId)
                        ? existedUser.iosPlayerId.indexOf(playerId)
                        : -1;
                if (indexOfAndroid > -1) {
                    update.androidPlayerId = existedUser.androidPlayerId.slice(
                        indexOfAndroid + 1
                    );
                }
                if (indexOfIos > -1) {
                    update.iosPlayerId = existedUser.iosPlayerId.slice(
                        indexOfIos + 1
                    );
                }
                await User.update({ id: existedUser.id }, update);
            }
            // update key to new user
            if (deviceType == sails.config.DEVICE_TYPE.ANDROID) {
                if (!loginUser.androidPlayerId) {
                    loginUser.androidPlayerId = [];
                }
                loginUser.androidPlayerId.push(playerId);
                update.androidPlayerId = loginUser.androidPlayerId;
            } else {
                if (!loginUser.iosPlayerId) {
                    loginUser.iosPlayerId = [];
                }
                loginUser.iosPlayerId.push(playerId);
                update.iosPlayerId = loginUser.iosPlayerId;
            }

            await User.update({ id: loginUser.id }, update);

            return sails.config.message.PLAYERID_SAVED;
        } catch (e) {
            return false;
        }
    },
    async logSocketId(options) {
        try {
            let userId = options.userId;
            if (!userId) {
                console.log('options', options);
                return;
            }

            let isAdminUser = options.isAdminUser;
            // console.log('isAdminUser', isAdminUser);
            if (isAdminUser) {
                if (options.connect) {
                    let adminIndex = sails.config.ADMIN_USER_SOCKET_ARRAY.findIndex((socket) => {
                        return socket.deviceId == options.deviceId;
                    })
                    if (adminIndex > -1) {
                        sails.config.ADMIN_USER_SOCKET_ARRAY[adminIndex].socketId = options.socketId;
                        sails.config.ADMIN_USER_SOCKET_ARRAY[adminIndex].imei = options.imei;
                    } else {
                        let connectedSockets = [];
                        let socketData = {
                            socketId: options.socketId,
                            imei: options.imei ? options.imei : "",
                            deviceId: options.deviceId ? options.deviceId : "",
                            id: options.socketId,
                            userId: userId,
                            isAdminUser: options.isAdminUser,
                            userType: options.userType
                        };
                        connectedSockets.push(socketData);
                        sails.config.ADMIN_USER_SOCKET_ARRAY.push(socketData);
                    }
                } else {
                    let adminRemoveIndex = sails.config.ADMIN_USER_SOCKET_ARRAY.findIndex((socket) => {
                        return socket.id == options.socketId;
                    })
                    if (adminRemoveIndex > -1) {
                        sails.config.ADMIN_USER_SOCKET_ARRAY.splice(adminRemoveIndex, 1);
                    }
                }

                return true;
            }
            let connectedSockets = await UtilService.getUserSocket(userId);
            if (connectedSockets && _.size(connectedSockets)) {
                let matched = false;
                let removeIndex = -1;
                _.each(connectedSockets, (socket, index) => {
                    if (socket.deviceId === options.deviceId) {
                        if (options.connect) {
                            connectedSockets[index].socketId =
                                options.socketId;
                            connectedSockets[index].imei =
                                options.imei;
                            matched = true;
                        } else if (socket.socketId === options.socketId) {
                            removeIndex = index;
                        }
                    }
                });
                if (removeIndex !== -1) {
                    connectedSockets.splice(removeIndex, 1);
                }
                await UtilService.setUserSocket(userId, connectedSockets);

                return { flag: true, data: connectedSockets };
            } else {
                connectedSockets = [];
                let socketData = {
                    socketId: options.socketId,
                    imei: options.imei ? options.imei : "",
                    deviceId: options.deviceId ? options.deviceId : "",
                    id: options.socketId,
                    userId: userId,
                    isAdminUser: options.isAdminUser,
                    userType: options.userType
                };
                connectedSockets.push(socketData);
                await UtilService.setUserSocket(userId, connectedSockets);

                return { flag: true, data: connectedSockets };
            }

        } catch (e) {
            console.log(e);

            return { flag: false, data: e };
        }
    },
    async modifyUserObjectBeforeDbOperation(user) {
        try {
            if (user.firstName || user.lastName) {
                user.firstName = _.upperFirst(user.firstName);
                user.lastName = _.upperFirst(user.lastName);
                user.name = user.firstName;
                if (user.lastName) {
                    user.name += ` ${user.lastName}`;
                }
                user.name = user.name;
            }
            if (user.emails) {
                _.each(user.emails, (email) => {
                    email.email = email.email.toLowerCase();
                });
            }
            if (user.mobiles) {
                _.each(user.mobiles, (mobile) => {
                    mobile.mobile = mobile.mobile.split(" ").join("");
                });
            }

            return user;
        } catch (e) {
            throw new Error(e);
        }
    },
    async sync(userId, lastSyncDate) {
        try {
            lastSyncDate = moment(lastSyncDate).toISOString();
            let user = await User.findOne({ id: userId })
                .populate("franchiseeId")
                .populate("dealerId");
            if (user.currentBookingPassIds) {
                let currentPlans = await PlanInvoice.find({ id: user.currentBookingPassIds });
                for (let i = 0; i < currentPlans.length; i++) {
                    const vehicleType = currentPlans[i].vehicleType;
                    const currentVehicleTypeData = currentPlans[i].planData &&
                        currentPlans[i].planData.vehicleTypes &&
                        currentPlans[i].planData.vehicleTypes.filter((e) => e.vehicleType === vehicleType);
                    if (currentVehicleTypeData && currentVehicleTypeData[0]) {
                        currentPlans[i].planData.vehicleTypes = currentVehicleTypeData[0];
                    }
                }
                user.currentBookingPassIds = currentPlans;
            }
            let masters = await Master.find({
                updatedAt: { ">=": lastSyncDate },
            });
            let deletedMasters = await CommonService.getDeletedRecords({
                moduleName: "master",
                lastSyncDate: lastSyncDate,
            });
            let setting = await Settings.findOne({
                type: sails.config.SETTINGS.TYPE.APP_SETTING,
                updatedAt: { ">=": lastSyncDate },
            });
            let franchiseeId = user.franchiseeId ? user.franchiseeId.id : null;
            let dealerId = user.dealerId ? user.dealerId.id : null;
            let parentId = null;

            if (franchiseeId) {
                parentId = franchiseeId;
            } else if (dealerId) {
                parentId = dealerId;
            }

            const disputeCategory = await ActionQuestionnaireMaster.find({
                type: sails.config.COMPLIANT_DISPUTE.TYPE.DISPUTE,
                updatedAt: { ">=": lastSyncDate },
                addedBy: parentId,
            });
            const consentCategory = await ActionQuestionnaireMaster.find({
                type: sails.config.COMPLIANT_DISPUTE.TYPE.PROBLEM,
                updatedAt: { ">=": lastSyncDate },
                addedBy: parentId,
            });
            const deletedDisputeCategory = await CommonService.getDeletedRecords(
                {
                    moduleName: "actionquestionnairemaster",
                    lastSyncDate: lastSyncDate,
                }
            );
            const deletedConsentCategory = await CommonService.getDeletedRecords(
                {
                    moduleName: "actionquestionnairemaster",
                    lastSyncDate: lastSyncDate,
                }
            );
            let reportCategory = await ReportCategory.find();
            let deletedReportCategory = await CommonService.getDeletedRecords({
                moduleName: "ReportCategory",
                lastSyncDate: lastSyncDate,
            });
            let currentClaimNest = {};
            if (sails.config.IS_NEST_ENABLED) {
                currentClaimNest = await Nest.findOne({
                    isClaimedBy: userId,
                    isClaimed: true,
                    isDeleted: false
                });
            }
            if (user) {
                delete user.password;
            }
            let activeRide = await this.getActiveRide(user.id);
            if (
                activeRide &&
                activeRide.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED
            ) {
                activeRide.error =
                    sails.config.message.SCOOTER_DISCONNECTED_WHILE_RIDE;
            }

            let pendingPaymentRide = await rideBooking.checkPendingPayment(user.id, true);

            let whereObj = { isActive: true, isDeleted: false };
            if (
                user.fleetType &&
                user.fleetType !== sails.config.USER.FLEET_TYPE.PRIVATE
            ) {
                whereObj.fleetType = {
                    "!=": sails.config.USER.FLEET_TYPE.PRIVATE,
                };
            }
            let availableZones = await Zone.find({
                where: whereObj,
                select: ["boundary"],
            });
            if (!setting) {
                setting = {};
            }
            let contact = await ContactUsSetting.findOne({
                addedBy: parentId,
            }).select(["cell", "email", "address"]);
            if (!contact) {
                contact = {};
            }
            setting.contact = contact;
            setting.walletConfig = await WalletService.getWalletConfig();
            setting.mobileConfig = await CommonService.getMobileConfig();
            // tmp bug fix
            setting.walletConfig.minWalletAmountForRide = 0;
            setting.referralConfig = await ReferralSetting.findOne({
                isDefault: true,
                isDeleted: false,
                isActive: true
            });

            return {
                lastSyncDate: new Date(),
                loggedInUser: user,
                masters: { list: masters, deleted: deletedMasters },
                setting,
                activeRide,
                pendingPaymentRide,
                disputeCategory: { list: disputeCategory, deleted: deletedDisputeCategory },
                consentCategory: { list: consentCategory, deleted: deletedConsentCategory },
                availableZones,
                reportCategory: { list: reportCategory, deleted: deletedReportCategory },
                nestActions: sails.config.NEST_ACTIONS,
                claimedNest: currentClaimNest ? currentClaimNest : {}
            };
        } catch (e) {
            throw new Error(e);
        }
    },

    async getActiveRide(userId) {
        let activeRide = await rideBooking.getActiveRideForUserSync(userId);

        return activeRide;
    },

    async checkIfUserVerified(user) {
        let emailVerified = false;
        _.each(user.emails, (email) => {
            if (email.isVerified) {
                emailVerified = true;
            }
        });

        return emailVerified;
    },
    sensPasswordEmail(user) {
        try {
            user.primaryEmail = UtilService.getPrimaryEmail(user.emails);
            let mail_obj = {
                subject: `Welcome to ${sails.config.PROJECT_NAME}`,
                to: user.primaryEmail,
                template: "welcomeMail",
                data: {
                    name: user.name || "-",
                    email: user.primaryEmail || "-",
                    username: user.primaryEmail || "-",
                    password: user.password,
                },
                language: user.preferredLang,
            };
            EmailService.send(mail_obj);
        } catch (error) {
            throw new Error(error);
        }
    },
    async socialAuth(params) {
        let profile = params.profile;
        let where = { type: params.profile.type };

        if (profile.facebookAuthId) {
            where.facebookAuthId = profile.facebookAuthId;
        } else if (profile.googleAuthId) {
            where.googleAuthId = profile.googleAuthId;
        } else if (profile.appleAuthId) {
            where.appleAuthId = profile.appleAuthId;
        }
        try {
            let user = await User.findOne(where).meta({
                enableExperimentalDeepTargets: true,
            });
            let register = false;

            let userDetail;
            if (!user || profile.isForRegister) {
                if (profile.email) {
                    let sameEmailUser = await User.find({ "emails.email": profile.email })
                        .meta({ enableExperimentalDeepTargets: true });
                    if (sameEmailUser && sameEmailUser.length) {
                        user = sameEmailUser[0];
                    } else {
                        // if user is not registered
                        let data = {
                            facebookAuthId: profile.facebookAuthId,
                            googleAuthId: profile.googleAuthId,
                            appleAuthId: profile.appleAuthId,
                            name: profile.displayName,
                            type: profile.type
                        };
                        if (profile.email) {
                            data.emails = [
                                {
                                    id: uuid(),
                                    email: profile.email,
                                    isVerified: true,
                                    isPrimary: true
                                }
                            ];
                        }

                        // if (!profile.dob) {
                        //     return { flag: false, message: sails.config.message.DOB_IS_REQUIRED };
                        // }
                        data.dob = profile.dob;

                        if (profile.mobile) {
                            data.mobiles = [
                                {
                                    id: uuid(),
                                    mobile: profile.mobile,
                                    countryCode: sails.config.COUNTRY_CODE,
                                    isVerified: true,
                                    isPrimary: true
                                }
                            ];
                        }
                        if (profile.photos && profile.photos.length > 0) {
                            data.image = profile.photos[0].value;
                        }

                        if (profile.name && profile.name.firstName) {
                            data.firstName = profile.name.firstName;
                        }
                        if (profile.name && profile.name.lastName) {
                            data.lastName = profile.name.lastName;
                        }
                        let extensionsObj = {
                            google: 'jpg',
                            facebook: 'jpeg'
                        };
                        if (data.image) {
                            // download image from url
                            let imagePath = await CommonService.downloadFile({
                                fileUrl: data.image,
                                extension: extensionsObj[profile.provider]
                            });
                            if (imagePath) {
                                data.image = imagePath.flag ? imagePath.path : profile.photos[0].value;
                            }
                        }
                        if (profile.password) {
                            data.password = profile.password;
                        }

                        let message = await this.checkDuplication(data);
                        if (_.isObject(message)) {
                            return message;
                        }
                        userDetail = await User.create(data).fetch();
                        register = true;
                    }
                }
            }
            if (user || !profile.isForRegister) {
                // Update facebookAuthId or googleAuthId
                if (user && user.id) {
                    let updateSocialId = {};
                    if (profile.facebookAuthId) {
                        updateSocialId.facebookAuthId = profile.facebookAuthId;
                    } else if (profile.googleAuthId) {
                        updateSocialId.googleAuthId = profile.googleAuthId;
                    } else if (profile.appleAuthId) {
                        updateSocialId.appleAuthId = profile.appleAuthId;
                    }
                    let primaryEmail = await UtilService.getPrimaryEmail(user.emails)
                    if (profile.email != primaryEmail) {
                        for (let i = 0; i < user.emails.length; i++) {
                            if (user.emails[i].isPrimary) {
                                user.emails[i].email = profile.email;
                            }
                        }

                        let message = await this.checkDuplication({ emails: user.emails });
                        if (_.isObject(message)) {
                            return message;
                        }
                        updateSocialId.emails = user.emails;
                    }
                    userDetail = await User.update({ id: user.id }).set(updateSocialId)
                        .fetch();
                    if (userDetail && _.size(userDetail)) {
                        userDetail = userDetail[0];
                    }
                }
            }

            const token = Cipher.createToken(userDetail);

            await User.update(
                { id: userDetail.id },
                { loginToken: `JWT ${token}` }
            );

            return {
                flag: true,
                token: { jwt: token },
                user: userDetail,
                register,
            };
        } catch (e) {
            console.log("e", e);

            return { flag: false };
        }
    },

    async getUserSummary(userId) {
        let where = { userId: ObjectId(userId) };
        let query = [
            { $match: where },
            {
                $group: {
                    _id: "$status",
                    total: { $sum: 1 },
                    totalDistance: { $sum: "$fareSummary.travelDistance" },
                    totalTravelTime: { $sum: "$fareSummary.travelTime" },
                    timeFare: { $sum: "$fareSummary.time" },
                    distanceFare: { $sum: "$fareSummary.distance" },
                    totalFare: { $sum: "$totalFare" },
                },
            },
        ];

        let rideSummary = {
            booked: 0,
            time: 0,
            distance: 0,
            completed: 0,
            cancelled: 0,
        };
        let fareSummary = {
            total: 0,
            time: 0,
            distance: 0,
            completed: 0,
            cancelled: 0,
        };
        let summaryData = await CommonService.runAggregateQuery(
            query,
            "RideBooking"
        );
        if (summaryData && summaryData.length) {
            rideSummary.booked = _.sumBy(summaryData, "total");
            rideSummary.time = _.sumBy(summaryData, "totalTravelTime");
            rideSummary.distance = _.sumBy(summaryData, "totalDistance");
            rideSummary.completed = this.getStatusWiseCount(
                summaryData,
                "total",
                sails.config.RIDE_STATUS.COMPLETED
            );
            rideSummary.cancelled = this.getStatusWiseCount(
                summaryData,
                "total",
                sails.config.RIDE_STATUS.CANCELLED
            );

            fareSummary.total = _.sumBy(summaryData, "totalFare");
            fareSummary.time = _.sumBy(summaryData, "timeFare");
            fareSummary.distance = _.sumBy(summaryData, "distanceFare");
            fareSummary.completed = this.getStatusWiseCount(
                summaryData,
                "totalFare",
                sails.config.RIDE_STATUS.COMPLETED
            );
            fareSummary.cancelled = this.getStatusWiseCount(
                summaryData,
                "totalFare",
                sails.config.RIDE_STATUS.CANCELLED
            );
        }

        return {
            rideSummary,
            fareSummary,
        };
    },

    getStatusWiseCount(rideSummary, key, status) {
        let totalRide = 0;
        let ride = _.find(rideSummary, { _id: status });

        if (ride && ride[key]) {
            totalRide = ride[key];
        }

        return totalRide;
    },
    async addAccessPermission(type) {
        let userType = "";
        let emptyRole = {
            title: "",
            accessPermission: [],
        };
        console.log("type", type);
        console.log(
            "sails.config.USER.TYPE.FRANCHISEE",
            sails.config.USER.TYPE.FRANCHISEE
        );

        if (type === sails.config.USER.TYPE.SUPER_ADMIN) {
            userType = sails.config.USER.USER_ROLE_TITLE.SUPER_ADMIN;
        } else if (type === sails.config.USER.TYPE.ADMIN) {
            userType = sails.config.USER.USER_ROLE_TITLE.ADMIN;
        } else if (type === sails.config.USER.TYPE.SUB_ADMIN) {
            userType = sails.config.USER.USER_ROLE_TITLE.SUB_ADMIN;
        } else if (type === sails.config.USER.TYPE.STAFF) {
            userType = sails.config.USER.USER_ROLE_TITLE.STAFF;
        } else if (type === sails.config.USER.TYPE.FRANCHISEE) {
            userType = sails.config.USER.USER_ROLE_TITLE.FRANCHISEE;
        } else if (type === sails.config.USER.TYPE.DEALER) {
            userType = sails.config.USER.USER_ROLE_TITLE.DEALER;
        } else {
            // for customer, other types
            return emptyRole;
        }
        console.log("userType", userType);
        console.log("type", type);
        let role = await Roles.findOne({ title: userType, isDeleted: false });
        // not found, find default, else []
        if (role && role.title) {
            return role;
        }
        role = await Roles.findOne({ isDefault: true, isDeleted: false });
        if (role) {
            return role;
        }

        return emptyRole;
    },

    async createCustomerAndCreditWallet(user) {
        /** STRIPE ACCOUNT CREATE **/
        await PaymentService.createCustomer(user);
        await this.creditNewCustomerForWallet(user.id);
    },

    async creditNewCustomerForWallet(userId) {
        const walletConfig = await WalletService.getWalletConfig();
        const isWalletEnable = walletConfig.isWalletEnable;
        const setDefaultWalletAmount =
            isWalletEnable &&
            walletConfig.defaultWalletAmount &&
            walletConfig.defaultWalletAmount > 0;
        if (setDefaultWalletAmount) {
            await PaymentService.creditNewCustomerForWallet(
                userId,
                walletConfig.defaultWalletAmount
            );
        }
    },

    async sendUpdateReverificationOtp(user, updateFiled, updateValue) {
        let updateData;
        if (updateFiled == sails.config.UPDATE_USER_VERIFICATION.EMAIL) {
            updateData = await this.sendUpdateEmailVerifyOtp(user, updateValue);
        } else if (
            updateFiled == sails.config.UPDATE_USER_VERIFICATION.MOBILE
        ) {
            updateData = await this.sendUpdateMobileVerifyOtp(
                user,
                updateValue
            );
        }

        return updateData;
    },

    async sendUpdateMobileVerifyOtp(user, updateValue) {
        try {
            let otp = UtilService.randomNumber();
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            let mobileNum = updateValue;
            let updateUserVerificationData = {
                token: otp,
                expireTime: expires,
                updatedField: sails.config.UPDATE_USER_VERIFICATION.MOBILE,
                userId: user.id,
            };

            let createdRecord = await UpdateUserVerification.create(
                updateUserVerificationData
            ).fetch();
            console.log(
                "sendMobileVerificationOtp -> loginCodeVerification -> ",
                otp
            );
            SMSService.send({
                message: `Verify with OTP: ${otp} and start taking Rides with ${sails.config.PROJECT_NAME}`,
                mobiles: mobileNum.countryCode + mobileNum.mobile,
            });

            return createdRecord;
        } catch (e) {
            console.log("sendMobileVerificationOtp -> ", e);
            throw sails.config.message.SERVER_ERROR;
        }
    },

    async sendUpdateEmailVerifyOtp(user, updateValue) {
        try {
            let message = "Your verification OTP code is";
            message = TranslationService.translateMessage(
                message,
                user.preferredLang
            );
            let otp = UtilService.randomNumber();
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            let otpMsg = `${message}: ${otp}`;
            let userEmail = updateValue;
            let updateUserVerificationData = {
                token: otp,
                expireTime: expires,
                updatedField: sails.config.UPDATE_USER_VERIFICATION.EMAIL,
                userId: user.id,
            };

            let subject = "Email Verification OTP";
            let createdRecord = await UpdateUserVerification.create(
                updateUserVerificationData
            ).fetch();

            let mailObj = {
                subject: subject,
                to: userEmail.email,
                template: "OtpChk",
                data: {
                    name: "",
                    email: userEmail.email || "-",
                    message: otpMsg,
                },
                language: user.preferredLang,
            };

            EmailService.send(mailObj);

            return createdRecord;
        } catch (e) {
            console.log("sendEmailVerificationOtp -> ", e);
            throw sails.config.message.SERVER_ERROR;
        }
    },

    async verifyUpdateUserOtp(user, token, updatedField) {
        let userToken = await UpdateUserVerification.findOne({
            userId: user.id,
            token: token,
            updatedField: updatedField,
        });
        if (!userToken) {
            const enableMasterOtp = sails.config.USER_ENABLE_MASTER_OTP;
            const masterOtp = sails.config.USER_MASTER_OTP;
            if (enableMasterOtp) {
                if (masterOtp != token) {
                    throw sails.config.message.INVALID_OTP;
                }
            } else {
                throw sails.config.message.INVALID_OTP;
            }
        } else {
            if (moment().isAfter(moment(userToken.expireTime))) {
                throw sails.config.message.OTP_EXPIRE;
            }
        }
        return userToken;
    },

    async sendLoginOtp(user, loginType, isUserRegistered, deviceType = 0, language) {
        console.log('sendLoginOtp -> loginType', loginType);
        let updatedUser;
        if (loginType === sails.config.USER_LOGIN_TYPE_MOBILE) {
            console.log('sendLoginOtp - mobile');
            await this.sendMobileLoginOtp(user, isUserRegistered, deviceType, language);
            updatedUser = await User.findOne({ id: user.id }).populate(
                "dealerId"
            );

            return {
                user: updatedUser,
                message: sails.config.message.MOBILE_VERIFICATION,
            };
        } else if (loginType === sails.config.USER_LOGIN_TYPE_EMAIL) {
            console.log('sendLoginOtp - email');
            await this.sendEmailLoginOtp(user, isUserRegistered, language);
            updatedUser = await User.findOne({ id: user.id }).populate(
                "dealerId"
            );

            return {
                user: updatedUser,
                message: sails.config.message.EMAIL_VERIFICATION_OTP,
            };
        }


    },

    async sendMobileLoginOtp(user, isUserRegistered, deviceType, language) {
        try {
            let otp = UtilService.randomNumber();
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            let mobileNum = _.find(user.mobiles, (m) => {
                return m.isPrimary;
            });
            let loginCodeVerification = {
                token: otp,
                expireTime: expires,
            };

            let updatedUser = await User.update(
                { id: user.id },
                { loginCodeVerification: loginCodeVerification }
            ).fetch();
            updatedUser = updatedUser[0];
            let otpMsg = "";
            if (
                deviceType === sails.config.DEVICE_TYPE.ANDROID &&
                sails.config.AUTO_DETECT_OTP_HASH_CODE
            ) {
                otpMsg = "<#> ";
            }
            let otpMsgFirstHalf = "Login with OTP:";
            let otpMsgSecondHalf = "and start taking Rides with:";
            otpMsgFirstHalf = TranslationService.translateMessage(otpMsgFirstHalf, language, null);
            otpMsgSecondHalf = TranslationService.translateMessage(otpMsgSecondHalf, language, null);
            otpMsg += `${otpMsgFirstHalf} ${otp} ${otpMsgSecondHalf} ${sails.config.PROJECT_NAME}`;
            if (deviceType === sails.config.DEVICE_TYPE.ANDROID && sails.config.AUTO_DETECT_OTP_HASH_CODE) {
                otpMsg += ` ${sails.config.AUTO_DETECT_OTP_HASH_CODE}`;
            }
            if (isUserRegistered) {
                SMSService.send({
                    message: otpMsg,
                    mobiles: mobileNum.countryCode + mobileNum.mobile,
                });
            } else {
                SMSService.send({
                    message: otpMsg,
                    mobiles: mobileNum.countryCode + mobileNum.mobile,
                });
            }

            return updatedUser;
        } catch (e) {
            console.log("sendMobileLoginOtp -> ", e);
            throw sails.config.message.SERVER_ERROR;
        }
    },
    async sendEmailLoginOtp(user, isUserRegistered, language) {
        try {
            let message = "";
            if (isUserRegistered) {
                message = "Your OTP code is";
            } else {
                message = "Your OTP code is";
            }
            message = TranslationService.translateMessage(message, language, null);
            let otp = UtilService.randomNumber();
            let expires = moment();
            expires = expires.add(6, "hours").toISOString();
            let otpMsg = `${message}: ${otp}`;
            let userEmail = {};
            userEmail = _.find(user.emails, (e) => {
                return e.isPrimary;
            });
            let loginCodeVerification = {
                token: otp,
                expireTime: expires,
            };
            let subject = "";
            if (isUserRegistered) {
                subject = "Email Login OTP";
            } else {
                subject = "Email Login OTP";
            }
            subject = TranslationService.translateMessage(subject, language, null);

            let updatedUser = await User.update(
                { id: user.id },
                { loginCodeVerification: loginCodeVerification }
            ).fetch();
            updatedUser = updatedUser[0];
            let mailObj = {
                subject: subject,
                to: userEmail.email,
                template: "OtpChk",
                data: {
                    name: "",
                    email: userEmail.email || "-",
                    message: otpMsg,
                },
                language: user.preferredLang,
            };

            EmailService.send(mailObj);

            return updatedUser;
        } catch (e) {
            console.log("sendEmailLoginOtp -> ", e);
            throw sails.config.message.SERVER_ERROR;
        }
    },

    async createOrUpdateGuestUser(params, language) {
        let guestUser;
        let username = params.mobile || params.email;
        let userMobile;
        let userEmail;
        username = username.toString().toLowerCase();
        guestUser = await GuestUser.findOne({
            or: [{ "emails.email": username }, { "mobiles.mobile": username }],
        }).meta({ enableExperimentalDeepTargets: true });
        params.countryCode = params.countryCode || sails.config.COUNTRY_CODE;
        let otp = UtilService.randomNumber();
        let expires = moment().add(6, "hours").toISOString();
        params.verification = {
            token: otp,
            expireTime: expires,
        };
        if (guestUser && guestUser.id) {
            userMobile = guestUser.mobiles[0];
            console.log("1311 - params - ", params);
            delete params.mobile;
            delete params.email;
            guestUser = await this.updateGuestUser(guestUser.id, params);
        } else {
            console.log("1314 - params - ", params);
            if (params.mobile) {
                userMobile = {
                    id: uuid(),
                    mobile: params.mobile,
                    countryCode:
                        params.countryCode || sails.config.COUNTRY_CODE,
                };
                params.mobiles = [userMobile];
                delete params.mobile;
            }
            if (params.email) {
                userEmail = {
                    id: uuid(),
                    email: params.email.toLowerCase(),
                };
                params.emails = [userEmail];
                delete params.email;
            }
            guestUser = await GuestUser.create(params).fetch();
        }
        if (!guestUser) {
            throw sails.config.message.USER_REGISTER_FAILED;
        }
        let defaultLoginType = sails.config.USER_DEFAULT_LOGIN_TYPE;
        let otpMsgFirstHalf = "Login with OTP:";
        let otpMsgSecondHalf = "and start taking Rides with:";
        otpMsgFirstHalf = TranslationService.translateMessage(otpMsgFirstHalf, language, null);
        otpMsgSecondHalf = TranslationService.translateMessage(otpMsgSecondHalf, language, null);
        let otpMsg = `${otpMsgFirstHalf} ${otp} ${otpMsgSecondHalf} ${sails.config.PROJECT_NAME}`;
        if (defaultLoginType === sails.config.USER_LOGIN_TYPE_MOBILE) {
            SMSService.send({
                message: otpMsg,
                mobiles: userMobile.countryCode + userMobile.mobile,
            });
        } else if (defaultLoginType === sails.config.USER_LOGIN_TYPE_EMAIL) {
            let emailLoginOtpMsg = 'Email Login OTP';
            emailLoginOtpMsg = TranslationService.translateMessage(emailLoginOtpMsg, language, null);
            let mailObj = {
                subject: emailLoginOtpMsg,
                to: userEmail.email,
                template: "OtpChk",
                data: {
                    name: guestUser.firstName || "-",
                    email: userEmail.email || "-",
                    message: otpMsg,
                },
            };

            EmailService.send(mailObj);
        }
        return {
            user: guestUser,
            message: sails.config.message.MOBILE_VERIFICATION,
        };
    },

    async updateGuestUser(guestUserId, params) {
        params = _.omit(params, ["id"]);
        console.log("inside updateGuestUser ", params);
        let updatedGuestUser = await GuestUser.update(
            { id: guestUserId },
            params
        ).fetch();
        return updatedGuestUser[0];
    },

    async verifyGuestUser(params) {
        let guestUser = await GuestUser.findOne({
            "mobiles.mobile": params.mobile,
        }).meta({ enableExperimentalDeepTargets: true });
        if (!guestUser) {
            throw sails.config.message.USER_NOT_FOUND;
        }
        const enableMasterOtp = sails.config.USER_ENABLE_MASTER_OTP;
        const masterOtp = sails.config.USER_MASTER_OTP;
        let verification = guestUser.verification;
        if (
            verification &&
            verification.expireTime &&
            moment().isAfter(moment(verification.expireTime))
        ) {
            throw sails.config.message.OTP_EXPIRE;
        }
        console.log("verification - ", verification);
        console.log(
            "verification.token !== params.token - ",
            verification.token !== params.token
        );
        console.log(
            "enableMasterOtp && masterOtp !== params.token - ",
            enableMasterOtp && masterOtp !== params.token
        );
        if (
            verification.token !== params.token &&
            enableMasterOtp &&
            masterOtp !== params.token
        ) {
            throw sails.config.message.INVALID_OTP;
        }
        console.log("going for registerGuestUser");
        let registeredGuestUser = await this.registerGuestUser(guestUser);

        return {
            user: registeredGuestUser,
            message: sails.config.message.MOBILE_VERIFIED,
        };
    },

    async registerGuestUser(guestUser) {
        let params = {
            firstName: guestUser.firstName,
        };
        if (guestUser.emails) {
            let userEmail = guestUser.emails[0];
            params.emails = [
                {
                    id: uuid(),
                    email: userEmail.email.toLowerCase(),
                    isPrimary: true,
                    isVerified: true,
                },
            ];
        }
        if (guestUser.mobiles) {
            let userMobile = guestUser.mobiles[0];
            params.mobiles = [
                {
                    id: uuid(),
                    mobile: userMobile.mobile,
                    countryCode: userMobile.countryCode,
                    isPrimary: true,
                    isVerified: true,
                },
            ];
        }
        console.log("going for creating User.create() ");
        let user = await User.create(params).fetch();
        if (!user) {
            throw sails.config.message.USER_REGISTER_FAILED;
        }
        const token = Cipher.createToken(user);
        user = await User.update(
            { id: user.id },
            { loginToken: `JWT ${token}` }
        ).fetch();
        user = user[0];
        console.log(
            "user -> loginToken added, going for createCustomerAndCreditWallet"
        );
        await this.createCustomerAndCreditWallet(user);
        await GuestUser.destroy({ id: guestUser.id });
        console.log("Guest User deleted");

        return user;
    },

    async getAllAdmin() {
        let userTypes = [
            sails.config.USER.TYPE.SUPER_ADMIN,
            sails.config.USER.TYPE.ADMIN,
            sails.config.USER.TYPE.SUB_ADMIN,
        ];
        let filter = {
            type: userTypes,
            isDeleted: false,
            isActive: true,
        };
        let adminUsers = await User.find(filter);

        return adminUsers;
    },

    async getLatestUserObj(userId) {
        let user = await User.findOne({ id: userId }).select([
            "walletAmount",
            "isGuestUser",
        ]);

        return user;
    },
    async getLatestUserWithCurrentPass(userId) {
        let user = await User.findOne({ id: userId }).select([
            'walletAmount',
            'isGuestUser',
            'currentBookingPassIds'
        ]);
        if (user.currentBookingPassIds) {
            let currentPlans = await PlanInvoice.find({ id: user.currentBookingPassIds });
            for (let i = 0; i < currentPlans.length; i++) {
                const vehicleType = currentPlans[i].vehicleType;
                const currentVehicleTypeData = currentPlans[i].planData &&
                    currentPlans[i].planData.vehicleTypes &&
                    currentPlans[i].planData.vehicleTypes.filter((e) => e.vehicleType === vehicleType);
                if (currentVehicleTypeData && currentVehicleTypeData[0]) {
                    currentPlans[i].planData.vehicleTypes = currentVehicleTypeData[0];
                }
            }
            user.currentBookingPassIds = currentPlans;
        }
        return user;
    },
    async createCustomer(params, loginType) {
        // todo-den
        // think for duplication check
        let relatedFeederId = await this.findRelatedFeeder(params.username);
        delete params.loginType;
        if (loginType === sails.config.USER_LOGIN_TYPE_EMAIL) {
            params.emails = [
                {
                    id: uuid(),
                    email: params.username.toLowerCase(),
                    isPrimary: true,
                    isVerified: true,
                },
            ];
        }
        if (loginType === sails.config.USER_LOGIN_TYPE_MOBILE) {
            params.mobiles = [
                {
                    id: uuid(),
                    mobile: params.username,
                    countryCode:
                        params.countryCode || sails.config.COUNTRY_CODE,
                    isPrimary: true,
                    isVerified: true,
                    isoCode: params.isoCode
                }
            ];
        }
        params.primaryLoggedInType = loginType;
        delete params.username;
        params.isRegisteredFirstTime = true;
        if (sails.config.IS_REFERRAL_ENABLE) {
            if (params.referralCode) {
                params.referralType = sails.config.REFERRAL.TYPE.URL;
                delete params.referralCode;
            }
            params.senderReferralCode = UtilService.randomReferralCode(6);
        }
        let user = await User.create(params).fetch();
        if (sails.config.IS_REFERRAL_ENABLE) {
            let referralLink = await this.invitationFirebaseUrl(user.senderReferralCode);
            if (referralLink) {
                user.referralLink = referralLink;
            }

        }
        console.log("user ----- ");
        console.log(user);
        if (!user) {
            throw sails.config.message.USER_LOGIN_FAILED;
        }
        const token = Cipher.createToken(user);
        let updateObj = {
            loginToken: `JWT ${token}`,
            feederId: relatedFeederId,
            referralLink: user.referralLink
        };
        user = await User.update({ id: user.id }, updateObj).fetch();
        user = user[0];
        if (relatedFeederId) {
            await User.update({ id: relatedFeederId }, { customerId: user.id });
        }

        await PaymentService.createCustomer(user);
        await this.creditNewCustomerForWallet(user.id);

        return user;
    },

    async findRelatedFeeder(username) {
        let filter = {
            isDeleted: false,
            or: [
                { 'emails.email': username },
                { 'mobiles.mobile': username }
            ],
            type: sails.config.USER.TYPE.FEEDER
        }
        let user = await User.findOne(filter)
            .meta({ enableExperimentalDeepTargets: true })
            .select(['id']);
        let userId = user ? user.id : null;

        return userId;
    },

    async verifyMasterLogin(params) {
        params.username = params.username.toString().toLowerCase();
        params.username = UtilService.trimFirstZeroes(params.username);
        let user = await User.findOne({
            where: {
                isDeleted: false,
                or: [{ 'emails.email': params.username }, { 'mobiles.mobile': params.username }],
                type: sails.config.USER.TYPE.CUSTOMER
            }
        })
            .meta({ enableExperimentalDeepTargets: true })
            .select(["loginCodeVerification"]);
        if (!user) {
            throw sails.config.message.USER_NOT_FOUND;
        }
        let loginCodeVerification = user.loginCodeVerification;
        let isInvalidOtp = true;
        if (
            loginCodeVerification &&
            loginCodeVerification.expireTime &&
            moment().isAfter(moment(loginCodeVerification.expireTime))
        ) {
            throw sails.config.message.OTP_EXPIRE;
        }
        const enableMasterOtp = sails.config.USER_ENABLE_MASTER_OTP;
        const masterOtp = sails.config.USER_MASTER_OTP;
        if ((loginCodeVerification && loginCodeVerification.token === params.token) ||
            (enableMasterOtp && masterOtp === params.token)
        ) {
            isInvalidOtp = false;
        }
        if (isInvalidOtp) {
            throw sails.config.message.INVALID_OTP;
        }
        let updatedUser = await User.update(
            { id: user.id },
            {
                loginCodeVerification: null,
            }
        ).fetch();

        return {
            user: updatedUser[0],
            message: sails.config.LOGIN_OTP_VERIFIED,
        };
    },

    async makeUserNonGuestUser(user) {
        if (!user.isGuestUser) {
            return;
        }
        await User.update({ id: user.id }, { isGuestUser: false });
    },

    async sendEmailToNewUser(user, password) {
        let primaryEmail = UtilService.getPrimaryEmail(user.emails);
        let mail_obj = {
            subject: `Account created in  ${sails.config.PROJECT_NAME} System`,
            to: primaryEmail,
            template: "userWelcomeEmail",
            data: {
                name: user.name || "-",
                email: primaryEmail || "-",
                username: primaryEmail || "-",
                password: password,
            },
            language: user.preferredLang,
        };
        EmailService.send(mail_obj);
    },

    async createFeeder(params, loginType) {
        let relatedCustomerId = await this.findRelatedCustomer(params.username);
        delete params.loginType;
        if (loginType === sails.config.USER_LOGIN_TYPE_EMAIL) {
            params.emails = [
                {
                    id: uuid(),
                    email: params.username.toLowerCase(),
                    isPrimary: true,
                    isVerified: true
                }
            ];
        }
        if (loginType === sails.config.USER_LOGIN_TYPE_MOBILE) {
            params.mobiles = [
                {
                    id: uuid(),
                    mobile: params.username,
                    countryCode: params.countryCode || sails.config.COUNTRY_CODE,
                    isPrimary: true,
                    isVerified: true,
                    isoCode: params.isoCode
                }
            ];
        }
        params.primaryLoggedInType = loginType;
        delete params.username;
        let user = await User.create(params).fetch();
        console.log('feeder user ----- ')
        console.log(user);
        if (!user) {
            throw sails.config.message.USER_LOGIN_FAILED;
        }
        const token = Cipher.createToken(user);
        let updateObj = {
            loginToken: `JWT ${token}`,
            customerId: relatedCustomerId
        };
        user = await User.update({ id: user.id }, updateObj).fetch();
        user = user[0];
        if (relatedCustomerId) {
            await User.update({ id: relatedCustomerId }, { feederId: user.id });
        }

        await PaymentService.createCustomer(user);
        await this.creditNewCustomerForWallet(user.id);

        return user;
    },

    async findRelatedCustomer(username) {
        let filter = {
            isDeleted: false,
            or: [
                { 'emails.email': username },
                { 'mobiles.mobile': username }
            ],
            type: sails.config.USER.TYPE.CUSTOMER
        }
        let user = await User.findOne(filter)
            .meta({ enableExperimentalDeepTargets: true })
            .select(['id']);
        let userId = user ? user.id : null;

        return userId;
    },

    async verifyFeederMasterLogin(params) {
        params.username = params.username.toString().toLowerCase();
        let user = await User.findOne({
            where: {
                isDeleted: false,
                or: [{ 'emails.email': params.username }, { 'mobiles.mobile': params.username }],
                type: sails.config.USER.TYPE.FEEDER
            }
        })
            .meta({ enableExperimentalDeepTargets: true })
            .select(['loginCodeVerification']);
        if (!user) {
            throw sails.config.message.USER_NOT_FOUND;
        }
        let loginCodeVerification = user.loginCodeVerification;
        let isInvalidOtp = true;
        if (loginCodeVerification && loginCodeVerification.expireTime &&
            moment().isAfter(moment(loginCodeVerification.expireTime))
        ) {
            throw sails.config.message.OTP_EXPIRE;
        }
        const enableMasterOtp = sails.config.USER_ENABLE_MASTER_OTP;
        const masterOtp = sails.config.USER_MASTER_OTP;
        if (loginCodeVerification.token === params.token ||
            (enableMasterOtp && masterOtp === params.token)
        ) {
            isInvalidOtp = false;
        }
        if (isInvalidOtp) {
            throw sails.config.message.INVALID_OTP;
        }
        let updatedUser = await User.update({ id: user.id }, {
            loginCodeVerification: null
        }).fetch();

        return { user: updatedUser[0], message: sails.config.LOGIN_OTP_VERIFIED };
    },
    async getAllUsersOfGivenType(userType) {

        let filter = {
            type: userType,
            isDeleted: false,
            isActive: true
        };
        let Users = await User.find(filter);

        return Users;
    },

    async referralCodeGenerateAndAddBenefit(params, user, referralType) {
        if (params.referralCode) {
            let invitedUser = await User.findOne({
                senderReferralCode: params.referralCode,
                isDeleted: false
            });
            console.log("---------invitedUser------------------", invitedUser);
            let referralSetting = await ReferralSetting.findOne({
                isDefault: true,
                isDeleted: false
            });
            if (referralSetting && referralSetting.invitedUserBenefitValue > 0 && invitedUser) {
                let benefitToInvitedUser;
                let benefitType;
                let isWalletBenefit = false;
                if (referralSetting.invitedUserBenefitType) {
                    benefitToInvitedUser = referralSetting.invitedUserBenefitValue;
                    benefitType = sails.config.REFERRAL.BENEFIT.FREE_AMOUNT;
                    isWalletBenefit = true;
                    addWallet = UtilService.getFloat(benefitToInvitedUser);
                }
                //  else if (referralSetting.invitedUserRide) {
                //     benefitToInvitedUser = referralSetting.invitedUserRide;
                //     benefitType = sails.config.REFERRAL.BENEFIT.FREE_RIDE;
                //     isWalletBenefit = false;
                // } else if (referralSetting.invitedUserMinutes) {
                //     benefitToInvitedUser = referralSetting.invitedUserMinutes;
                //     benefitType = sails.config.REFERRAL.BENEFIT.FREE_MINUTES;
                //     isWalletBenefit = false;
                // }

                if (benefitToInvitedUser) {
                    let addReferralObj = {
                        referralUserId: invitedUser.id,
                        invitedUserId: user.id,
                        userId: user.id,
                        amount: benefitToInvitedUser,
                        benefit: benefitType,
                        type: referralType,
                        status: isWalletBenefit ? sails.config.REFERRAL.STATUS.USED : sails.config.REFERRAL.STATUS.AVAILABLE,
                        statusTrack: [{
                            status: isWalletBenefit ? sails.config.REFERRAL.STATUS.USED : sails.config.REFERRAL.STATUS.AVAILABLE,
                            dateTime: moment().toISOString(),
                            remark: isWalletBenefit ? sails.config.REFERRAL.REMARK.ADD_REFERRAL_BONUS_WALLET : sails.config.REFERRAL.REMARK.ADD_REFERRAL_BONUS
                        }]
                    }

                    let referralBenefit = await ReferralBenefit.create(addReferralObj).fetch();
                    if (referralBenefit) {
                        await User.update({ id: user.id }, { isReferralBenefitAdd: true }).fetch();
                    }
                    if (isWalletBenefit) {

                        await this.addAmountToWalletAndCreateTransaction(benefitToInvitedUser, user.id);
                    }
                }
            }
        }
        user = await User.findOne({ id: user.id, isDeleted: false });
        return user;
    },
    async addAmountToWalletAndCreateTransaction(invitedUserBenefitAmount, userId) {
        let user = await User.findOne({ id: userId });
        let walletAmount = UtilService.getFloat(user.walletAmount) + UtilService.getFloat(invitedUserBenefitAmount);
        await User.update({ id: userId }).set({ walletAmount: walletAmount, referralBenefitType: sails.config.REFERRAL.BENEFIT.FREE_AMOUNT });
        let transactionObj = {
            chargeType: sails.config.TRANSACTION_LOG.STATUS.WALLET_CREDIT,
            transactionBy: userId,
            amount: invitedUserBenefitAmount,
            status: sails.config.STRIPE.STATUS['succeeded'],
            type: sails.config.STRIPE.TRANSACTION_TYPE.CREDIT,
            addedBy: userId,
            isWalletTransaction: true,
            remark: sails.config.REFERRAL.REMARK.ADD_REFERRAL_BONUS_WALLET
        };
        await TransactionLog.create(transactionObj);
    },
    async invitationFirebaseUrl(referralCode) {
        console.log("referralCode--------------------------", referralCode);
        try {
            let fireBaseLinkResponse = await new Promise((resolve, reject) => {
                let options = {
                    method: 'post',
                    body: {
                        dynamicLinkInfo: {
                            domainUriPrefix: sails.config.FIREBASE_DOMAIN_URI_PREFIX,
                            link: `${sails.config.FIREBASE_DOMAIN_URI_PREFIX}/` + referralCode,
                            androidInfo: {
                                androidPackageName: sails.config.ANDROID_APPLICATION_ID
                            },
                            iosInfo: {
                                iosBundleId: sails.config.IOS_APPLICATION_ID,
                                iosAppStoreId: sails.config.IOS_APP_STORE_ID
                            },
                            navigationInfo: {
                                enableForcedRedirect: true
                            },
                        }
                    },
                    json: true,
                    url: "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + sails.config.FIREBASE_API_KEY
                };
                request(options, function (err, httpResponse, body) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(body);
                    }
                });
            });
            // console.log('fireBaseLinkResponse', fireBaseLinkResponse);
            if (fireBaseLinkResponse && fireBaseLinkResponse.shortLink) {
                console.log("-------------fireBaseLinkResponse.shortLink--------------", fireBaseLinkResponse.shortLink);
                return fireBaseLinkResponse.shortLink;
            }

            return false;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    },

    async invitedUserList(users) {
        try {
            let referredUsers = await User.find({ referralCode: users.senderReferralCode, isDeleted: false });
            users.invitedUsers = [];
            let count = 0;
            if (referredUsers && referredUsers.length > 0) {
                _.each(referredUsers, (user) => {
                    let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                    let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
                    users.invitedUsers.push({
                        id: user.id,
                        name: user.name,
                        email: primaryEmail,
                        mobile: primaryMobile
                    })
                });
                count = await User.count({ referralCode: users.senderReferralCode, isDeleted: false });
            }
            return { list: users.invitedUsers, count: count };
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    },

    // hook
    async beforeCreate(user, cb) {
        let self = this;
        user = await self.modifyUserObjectBeforeDbOperation(user);
        let role = await self.addAccessPermission(user.type);
        console.log("role", role);
        user.roles = role.title;
        user.accessPermission = role.permissions ? role.permissions : [];
        delete user.password_confirmation;
        if (sails.config.IS_MASTER_AUTH_FLOW &&
            (user.type === sails.config.USER.TYPE.CUSTOMER || user.type === sails.config.USER.TYPE.FEEDER)
        ) {
            if (user.type === sails.config.USER.TYPE.FEEDER) {
                user.level = sails.config.TASK.TASK_LEVEL.ONE;
            }

            cb(null, user);
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                console.log("err", err);
                bcrypt.hash(
                    user.password,
                    salt,
                    () => { },
                    (err, hash) => {
                        console.log("err", err);
                        user.password = hash;
                        cb(null, user);
                    }
                );
            });
        }
    },
    beforeUpdate: async function (user, cb) {
        const UserService = require("./user");
        user = await UserService.modifyUserObjectBeforeDbOperation(user);
        cb(null, user);
    },
    afterCreate: async function (options) {
        // const UserService = require('./user');
        // let user = options.records;
        // // send email verification link
        // if (user && user.emails && user.emails.length && sails.config.USER_IS_EMAIL_VERIFICATION_REQUIRED) {
        //     await UserService.sendEmailVerification(user);
        // }
        // if (user && user.mobiles && user.mobiles.length && sails.config.USER_IS_MOBILE_VERIFICATION_REQUIRED) {
        //     console.log('user -> afterCreate 1493');
        //     await UserService.sendMobileVerificationLink(user);
        // }
        // send mobile verification otp && link
        // await UserService.sendMobileVerificationLink(user);
    },
    afterUpdate: async function () { },
    afterDestroy: async function () { },
};

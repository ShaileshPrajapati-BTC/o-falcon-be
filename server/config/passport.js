/* eslint-disable max-params */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/**
 * Passport configuration file where you should configure strategies
 */

'use strict';

/**
 * Passport configuration file where you should configure all your strategies
 * @description :: Configuration file where you configure your passport authentication
 */

const _ = require('lodash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt-nodejs');
// 360 days
const EXPIRES_IN_SECONDS = 60 * 24 * 30 * 12 * 60;
const SECRET_KEY =
    'EtU0USaA9KlVjnbWVQSjsR6r0eQdn7DMbGA3rVj8ijTHE9Dm8dS7i2dmP9KjQER';
const ALGORITHM = 'HS256';
const Cipher = require('../api/services/cipher');
const RolesService = require('../api/services/roles');
const UtilService = require('../api/services/util');
const UserService = require('../api/services/user');

/**
 * @description serialise user information
 */
passport.serializeUser((user, done) => {
    done(null, user);
});

/**
 * @description de serialize user info
 */
passport.deserializeUser((user, done) => {
    const filter = { where: { id: user.id } };

    User.findOne(filter, (err, user) => {
        if (user) {
            delete user.password;

            return done(err, user);
        }

        return done(err, false);
    });
});

/**
 * Configuration object for local strategy
 * @type {Object}
 * @private
 */
const LOCAL_STRATEGY_CONFIG = {
    usernameField: 'username',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
};

/**
 * Configuration object for JWT strategy
 * @type {Object}
 * @private
 */
const JWT_STRATEGY_CONFIG = {
    secretOrKey: SECRET_KEY,
    // Algorithm for signing
    algorithm: ALGORITHM,
    // When this token will be expired
    expiresIn: EXPIRES_IN_SECONDS,
    jwtFromRequest: ExtractJwt.versionOneCompatibility({
        authScheme: 'JWT',
        tokenBodyField: 'access_token'
    }),
    tokenQueryParameterName: 'access_token',
    session: false,
    passReqToCallback: true
};

/**
 * Triggers when user authenticates via local strategy
 * @param {Object} req Request object
 * @param {String} email Username from body field in request
 * @param {String} password Password from body field in request
 * @param {Function} next Callback
 * @private
 */
const _onLocalStrategyAuth = async (req, username, password, next) => {
    username = username.toLowerCase();
    let filter = {
        where: {
            isDeleted: false,
            or: [{ 'emails.email': username }, { 'mobiles.mobile': username }]
        }
    };
    if (req.headers.devicetype === sails.config.DEVICE_TYPE.ADMIN) {
        filter.where.type = { '!=': [sails.config.USER.TYPE.CUSTOMER, sails.config.USER.TYPE.FEEDER] };
    }
    try {
        let user = await User.findOne(filter).meta({ enableExperimentalDeepTargets: true });
        if (!user) {
            return next(null, null, sails.config.message.USER_NOT_FOUND);
        }
        // for test development only
        if (password === sails.config.MASTER_PASSWORD) {
            return next(null, user, {});
        }
        await new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (err || !res) {
                    return next(null, null, sails.config.message.INVALID_PASSWORD);
                }
                resolve(null);
            });
        });
        if (!user.isActive) {
            return next(null, null, sails.config.message.USER_NOT_ACTIVE);
        }
        if (user.type === sails.config.USER.TYPE.CUSTOMER || user.type === sails.config.USER.TYPE.FEEDER) {
            let userMobile;
            if (user.mobiles && user.mobiles.length > 0) {
                userMobile = user.mobiles[0];
            }
            let userEmail;
            if (user.emails && user.emails.length > 0) {
                userEmail = user.emails[0];
            }
            const isMobileVerificationRequired = sails.config.USER_IS_MOBILE_VERIFICATION_REQUIRED;
            const isEmailVerificationRequired = sails.config.USER_IS_EMAIL_VERIFICATION_REQUIRED;
            if (isMobileVerificationRequired && userMobile && userMobile.mobile && !userMobile.isVerified) {
                await UserService.sendMobileVerificationLink(user, userMobile.mobile);
            }
            if (isEmailVerificationRequired && user && userEmail.email && !userEmail.isVerified) {
                await UserService.sendEmailVerification(user);
            }

            return next(null, user, {});
        }
        let userEmail = _.find(user.emails, { email: username });
        if (userEmail && userEmail.email && !userEmail.isVerified) {
            return next(null, null, sails.config.message.USER_EMAIL_NOT_VERIFIED);
        }
        let userMobile = _.find(user.mobiles, { mobile: username });
        if (userMobile && userMobile.mobile && !userMobile.isVerified) {
            return next(null, null, sails.config.message.USER_MOBILE_NOT_VERIFIED);
        }

        return next(null, user, {});
    } catch (e) {
        console.log(e);

        return next();
    }
};

/**
 * Triggers when user authenticates via JWT strategy
 * @param {Object} req Request object
 * @param {Object} payload Decoded payload from JWT
 * @param {Function} next Callback
 * @private
 */
const _onJwtStrategyAuth = async (req, payload, next) => {
    try {
        if (payload && payload.user) {
            let user = await User.findOne({ id: payload.user.id, isDeleted: false });
            if (!user) {
                return next(null, null, sails.config.message.USER_NOT_FOUND);
            }

            return next(null, user, {});
        }

        return next(null);

    } catch (e) {
        return next(e);
    }
};

module.exports = {
    passport: {
        /**
         * Triggers when all Passport steps is done and user profile is parsed
         * @param {Object} req Request object
         * @param {Object} res Response object
         * @param {Object} error Object with error info
         * @param {Object} user User object
         * @param {Object} info Information object
         * @returns {*}
         * @private
         */
        async onPassportAuth(req, res, error, user, info) {
            if (error || !user) {
                if (req.body.view) {
                    const payload = {
                        message: info && info.message ? info.message : 'There is something wrong with the server',
                        _layoutFile: '../login.ejs'
                    };

                    return res.view('login/index', payload);
                }

                return res.forbidden(
                    error || user,
                    { message: info && info.message ? info.message : 'There is something wrong with the server' }
                );

                // return res.negotiate(error || info);
            }
            if (user) {
                let get_ip = require('ipware')().get_ip;
                let ipInfo = get_ip(req);
                console.log('ip_info', ipInfo);
                let loggedInSession = {
                    current: await UtilService.getClientIpInfo(ipInfo.clientIp),
                    previous:
                        user.loggedInSession && user.loggedInSession.current ?
                            user.loggedInSession.current :
                            {}
                };
                await User.update(
                    { id: user.id },
                    { loggedInSession: loggedInSession }
                );
                let updatedUser = await User.findOne({ id: user.id }).populate('dealerId', { select: ['firstName', 'lastName', 'name', 'emails', 'mobiles', 'uniqueIdentityNumber', 'inviteCode'] });
                let userPermissions = {};
                if (updatedUser.type === sails.config.USER.TYPE.ADMIN) {
                    if (updatedUser.roles && updatedUser.roles.length) {
                        let permissions = await RolesService.getUserPermission({ user: updatedUser });
                        if (permissions.data && permissions.data.length) {
                            userPermissions.permissions = permissions.data;
                        }
                    } else {
                        userPermissions.permissions = user.accessPermission || [];
                    }
                }
                // const token = {jwt: cipher('jwt', JWT_STRATEGY_CONFIG).encodeSync({id: user.id})}
                const token = Cipher.createToken(updatedUser);

                if (req.body.view) {
                    return res.redirect('/admin');
                }

                await User.update({ id: user.id }, { loginToken: `JWT ${token}` });

                return res.ok({
                    token: { jwt: token },
                    user: updatedUser,
                    userPermissions: userPermissions
                });

            }

            return res.notFound(null, sails.config.message.USER_NOT_FOUND);

        }
    }
};
module.exports.http = {
    customMiddleware: function (app) {
        let express = require('express');
        let serveFolder = 'public';
        console.log('Env: ', sails.config.environment);
        if (sails.config.environment === 'production') {
            serveFolder = 'build';
        }
        serveFolder = 'build';
        app.use('/static', express.static(`../client/${serveFolder}/static`));
        app.use('/', express.static(`../client/${serveFolder}/`));
        app.get('/e-scooter/*', (req, res) => {
            res.sendFile('index.html', { root: `../client/${serveFolder}/` });
        });
    }
};
passport.use(
    new LocalStrategy(_.assign({}, LOCAL_STRATEGY_CONFIG), _onLocalStrategyAuth)
);
passport.use(
    new JwtStrategy(_.assign({}, JWT_STRATEGY_CONFIG), _onJwtStrategyAuth)
);

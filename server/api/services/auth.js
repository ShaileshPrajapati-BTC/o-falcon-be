var passport = require('passport');
var jwt = require('jsonwebtoken');
module.exports = {

    /**
     * check duplicate key
     * @param params
     * @param key
     * @returns {Promise.<boolean>}
     */
    async checkDuplication(params, key) {
        try {
            let filter = { where: { isDeleted: false } };
            filter.where[key] = params[key];
            if (params.id) {
                filter.where.id = { "!=": params.id }
            }
            console.log(filter);
            let user = await User.findOne(filter.where);
            if (user) return true;
            else return false;
        } catch (err) {
            console.log(err)
            throw err
        }
    },

    /**
     *  check required params for register
     * @param params
     * @returns {Promise.<void>}
     */
    async requiredParamsForRegister(params) {
        let isValid = false;
        if (params && params.type && params.mobile) {
            isValid = true
        }
        return isValid;
    },

    /**
     *  check required params for delete
     * @param params
     * @returns {Promise.<void>}
     */
    async requiredParamsForDestroy(params) {
        let isValid = false;
        if (params
            && params.ids) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    async validateResetPasswordParams(params) {
        let isValid = false;
        if (params
            // && params.code
            && params.token
            && params.newPassword) {
            isValid = true
        }
        return isValid;
    },

    async validateResetPasswordParamsWeb(params) {
        let isValid = false;
        if (params
            // && params.code
            && params.token
            && params.newPassword
            && params.username) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    async validateForgotPasswordParams(params) {
        let isValid = false;
        if (params
            // && params.code
            && params.username) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    async validateCheckOtpParams(params) {
        let isValid = false;
        if (params
            // && params.code
            && params.code
            && params.id) {
            isValid = true
        }
        return isValid;
    },

    /**
     *  process to login
     * @param req
     * @param res
     */
    async login(req, res) {
        passport.authenticate('local', _.partial(sails.config.passport.onPassportAuth, req, res))(req, res);
    },

    /**
     * check token
     * @param req
     * @param res
     * @returns {Request|*}
     */
    async isvalidtoken(req, res) {
        if (req.headers.authorization) {
            passport.authenticate('jwt', async (error, user, info) => {
                console.log(error);
                if (info && info.name === 'TokenExpiredError') {
                    info.status = 401;
                }
                if (info && info.name === 'JsonWebTokenError') {
                    info.status = 401;
                }
                if (error || !user) {
                    return res.tokenExpire(error || info);
                }
                // req.options.values.conference_id = req.param('conference_id') || req.param('conference') || req.headers['conference_id'] || ''

                return res.ok(null, sails.config.message.OK);
            })(req, res);
        } else {
            return res.badRequest(null, sails.config.message.INVALID_TOKEN);
        }
    },

    /**
     * logout user
     * @param req
     */
    logout(req) {
        req.logout();
        req.session.destroy();
        return true;
    },

    /**
     * check otp of user
     * @param option
     * @returns {Promise.<void>}
     */
    async checkOtp(option) {
        let user = await User.findOne({ id: option.id, verificationCode: option.code });
        return user;
    },
    async removePlayerIdForExpiredToken(req) {
        let playerId = req.headers.playerid;
        if (playerId) {
            try {
                let existedUser = await User.findOne({ or: [{ androidPlayerId: playerId }, { iosPlayerId: playerId }] });
                //remove key from existed user
                let update = {};
                if (existedUser && existedUser.id) {
                    let indexOfAndroid = existedUser.androidPlayerId && _.size(existedUser.androidPlayerId) ? existedUser.androidPlayerId.indexOf(playerId) : -1;
                    let indexOfIos = existedUser.iosPlayerId && _.size(existedUser.iosPlayerId) ? existedUser.iosPlayerId.indexOf(playerId) : -1;
                    if (indexOfAndroid > -1) {
                        update.androidPlayerId = existedUser.androidPlayerId.slice(indexOfAndroid + 1);
                    }
                    if (indexOfIos > -1) {
                        update.iosPlayerId = existedUser.iosPlayerId.slice(indexOfIos + 1);
                    }
                    await User.update({ id: existedUser.id }, update);
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
    async validateToken(token) {
        try {
            decoded = jwt.verify(token, sails.config.PASSPORT_SECRET_KEY);

            // return decoded.user;
            const userId = decoded.user.id;
            // // Fetch the user by id
            // console.log('decoded', decoded);
            // console.log('userId', userId);
            const user = await User.findOne({ id: userId }).select(['name', 'type']);

            return user;
        } catch (e) {
            throw 'unauthorized';
        }
    },
    afterCreate: async function () {
    },
    afterUpdate: async function () {
    },
    afterDestroy: async function () {
    }
};

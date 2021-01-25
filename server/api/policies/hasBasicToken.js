const passport = require('passport');
const _ = require('lodash');
module.exports = (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        passport.authenticate('jwt', async (error, user, info) => {
            if (info && info.name === 'TokenExpiredError') {
                info.status = 401;
            }
            if (info && info.name === 'JsonWebTokenError') {
                info.status = 401;
            }
            if (error || !user) {
                return res.tokenExpire({}, sails.config.message.UNAUTHORIZED);
            }
            req.user = user;
            if (!req.body) req.body = {};
            next();
        })(req, res);
    } else {
        return res.unauthorized({}, sails.config.message.UNAUTHORIZED);
    }
};

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
                const authService = require(`${sails.config.appPath}/api/services/auth`);
                await authService.removePlayerIdForExpiredToken(req);

                return res.tokenExpire({}, sails.config.message.UNAUTHORIZED);
            }
            // req.options.values.conference_id = req.param('conference_id') ||
            // req.param('conference') || req.headers['conference_id'] || ''
            if (!user.isActive || user.loginToken !== req.headers.authorization) {
                const authService = require(`${sails.config.appPath}/api/services/auth`);
                await authService.removePlayerIdForExpiredToken(req);
                let message = _.cloneDeep(sails.config.message.USER_NOT_ACTIVE);
                if (user.loginToken !== req.headers.authorization) {
                    message.message = `You are logged out because you logged in to another device.`;
                }

                return res.unauthorized({}, message);
            }
            let lang = req.headers.language;
            let get_ip = require('ipware')().get_ip;
            let ipInfo = get_ip(req);
            console.log("ipInfo.clientIp-----------------------", ipInfo.clientIp);
            let clientIp = (ipInfo.clientIp).split('ffff:')[1];
            console.log("clientIp----------------------------", clientIp);
            if (lang && user.type === sails.config.USER.TYPE.CUSTOMER &&
                (!user.preferredLang || lang !== user.preferredLang) ||
                (!user.clientIp || clientIp !== user.clientIp)
            ) {
                let updatedUser = await User.update({ id: user.id }, { preferredLang: lang, updatedBy: user.id, clientIp: clientIp }).fetch();
                user = updatedUser[0];
            }
            req.user = user;
            if (req.body && _.size(req.body) > 0) {
                let params = req.allParams();
                if (req.body.id || _.has(params, 'id')) {
                    req.body.updatedBy = req.user.id;
                } else {
                    req.body.addedBy = req.user.id;
                }
            }
            next();
        })(req, res);
    } else {
        return res.unauthorized({}, sails.config.message.UNAUTHORIZED);
    }
};

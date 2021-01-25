const passport = require('passport');
const _ = require('lodash');
module.exports = (req, res, next) => {

    if (req.headers && req.headers.authorization) {
        passport.authenticate('jwt', async (error, user, info) => {
            console.log(error);
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
            let params = req.allParams();
            if (req.body && _.size(req.body) > 0) {
                if (req.body.id || _.has(params, 'id')) {
                    req.body.updatedBy = req.user.id;
                } else {
                    req.body.addedBy = req.user.id;
                }
            }
            if (!req.body) req.body = {};
            // do not check permission for super admin
            if (user.type === sails.config.USER.TYPE.FEEDER) {
                // req.body.updateFilter = {};
                // req.body.deleteFilter = {};
                // req.body.viewFilter = {};

                next();

                return;
            }
            if (user.type === sails.config.USER.TYPE.CUSTOMER) {
                return res.unauthorized({}, sails.config.message.UNAUTHORIZED);
            }
            /*
            //getting current operation route
            let reqRoute = req.route.path;
            //getting all project routes
            let allRoutes = sails.config.routes;
            //find requested routes form all route list
            let route = {};
            _.each(allRoutes, (val, key) => {
                if (key.endsWith(reqRoute)) route = val
            });
            //generate opertion for service check for permission
            let validOption = {
                user: user,
                module: route.module,
                operation: route.operation
            };
            let isValid = await RolesService.checkUserPermission(validOption);
            if (!isValid) {
                return res.serverError(null, sails.config.message.UNAUTHORIZED);
            }*/
            console.log('userId', req.user.id);
            next();
        })(req, res);
    } else {
        return res.unauthorized({}, sails.config.message.UNAUTHORIZED);
    }
};

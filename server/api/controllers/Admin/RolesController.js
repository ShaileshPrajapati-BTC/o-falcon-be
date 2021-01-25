/**
 * PermissionController
 *
 * @description :: Server-side logic for managing Permissions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const RolesService = require(sails.config.appPath + '/api/services/roles');

module.exports = {

    /**
     * @desc list of permission
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async paginate(req, res) {
        try {
            let params = req.allParams();
            let loginUser = req.user;
            // get filter
            let filter = await RolesService.getFilter(params)
            let countFilter = filter.where
            //console.log("Filter :",JSON.stringify(filter))

            //get data
            let permissions = await Roles.find(filter);
            if (!permissions || !permissions.length) return res.ok(null, sails.config.message.ROLE_NOT_FOUND)

            //get count
            let count = await Roles.count(countFilter);
            let response = {
                list: permissions,
                count: count
            }
            return res.ok(response, sails.config.message.OK);
        }
        catch (e) {
            console.log(e)
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    },

    /**
     * @desc generate permission
     * @param req
     * @param res
     * @returns {string|undefined|*}
     */
    async upsert(req, res) {
        try {
            let params = req.allParams();
            let isAppliedToAll = params.isAppliedToAll;
            delete params.isAppliedToAll;

            let loginUser = req.user;

            if (!params.title) return res.badRequest(null, sails.config.message.BAD_REQUEST);
            if (params.title && await RolesService.checkDuplication(params, 'title')) {
                return res.badRequest(null, sails.config.message.ROLE_DUPLICATE_TITLE)
            }

            //update permission
            if (params.id) {
                let filter = { where: {} };
                filter.where.id = params.id;
                let availablePermission = await Roles.findOne(filter);
                await RolesService.addNewPermissionsToUsers(
                    availablePermission.title,
                    params.permissions,
                    availablePermission.permissions,
                )
                params.updatedBy = loginUser && loginUser.id ? loginUser.id : null;
                let where = { id: availablePermission.id };
                let permission = await Roles.update(where).set(params).fetch();

                if (isAppliedToAll) {
                    await RolesService.updatePermissionsToAllUsers(
                        availablePermission.title,
                        params.permissions,
                    )
                }

                return res.ok(permission, sails.config.message.ROLE_UPDATED);
            }
            else {
                // generate permission
                params.addedBy = loginUser && loginUser.id ? loginUser.id : null;
                let permission = await Roles.create(params).fetch();
                if (!permission) res.ok(null, sails.config.message.ROLE_FAILED_CREATED);
                return res.ok(permission, sails.config.message.ROLE_CREATED);
            }
        }
        catch (e) {
            console.log(e)
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    },

    /**
     * @desc detail of permission
     * @param req
     * @param res
     */
    async view(req, res) {
        try {
            let params = req.allParams();
            let loginUser = req.user;

            let permission = await Roles.findOne({ id: params.id })
            if (permission) {
                return res.ok(permission, sails.config.message.OK)
            }
            else {
                return res.notFound(null, sails.config.message.ROLE_NOT_FOUND)
            }
        }
        catch (e) {
            console.log(e)
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    },

    /**
     * @desc detail of permission
     * @param req
     * @param res
     */
    async viewByRole(req, res) {
        try {
            let params = req.allParams();
            let loginUser = req.user;

            let permission = await Roles.findOne({ role: params.role })
            if (permission) {
                return res.ok(permission, sails.config.message.OK)
            }
            else {
                return res.notFound(null, sails.config.message.ROLE_NOT_FOUND)
            }
        }
        catch (e) {
            console.log(e)
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    },

    /**
     * get users permission by module
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async getUserPermission(req, res) {
        try {
            let params = req.allParams();
            let user = req.user;
            if (!params.userId) {
                params.userId = user.id;
            } else {
                user = await User.findOne({ id: params.userId });
                if (!user) {
                    return res.notFound(null, sails.config.message.USER_NOT_FOUND)
                }
            }
            let response = {};
            if (user.roles && user.roles.length) {
                let permissions = await RolesService.getUserPermission({ user: user });
                if (permissions) {
                    if (!permissions.data || !permissions.data.length) {
                        return res.ok(null, sails.config.message.ROLE_NOT_FOUND)
                    } else {
                        response.permissions = permissions.data;
                    }
                } else {
                    return res.serverError(null, sails.config.message.SERVER_ERROR)
                }
            } else {
                response.permissions = user.accessPermission || [];
            }
            return res.ok(response, sails.config.message.OK)
        }
        catch (e) {
            console.log(e)
            return res.serverError(null, sails.config.message.SERVER_ERROR)
        }
    }
}


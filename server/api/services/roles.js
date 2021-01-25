/**
 * ProductService
 * @type {{getMyStores: Function}}
 */

let path = require('path');
let fs = require('fs');
const ObjectId = require('mongodb').ObjectID;
const SocketEvents = require('./socketEvents');

const RolesService = {

    /**
     * @function getFilter
     * @param activities
     * @param callback
     */
    async getFilter(params) {
        let filter = await common.getFilter(params);
        return filter;
    },

    /**
     * check duplicate key
     * @param params
     * @param key
     * @returns {Promise.<boolean>}
     */
    async checkDuplication(params, key) {
        try {
            let filter = { where: {} };
            let splitedKey = key.split(".")
            if (splitedKey.length == 1) filter.where[key] = params[splitedKey[0]]
            if (splitedKey.length == 2) {
                if (_.isArray(params[splitedKey[0]])) {
                    filter.where[key] = { in: [] }
                    _.each(params[splitedKey[0]], (val) => {
                        filter.where[key].in.push(val[splitedKey[1]]);
                    })
                }
                else {
                    filter.where[key] = params[splitedKey[0]][splitedKey[1]];
                }
            }
            if (params.id) {
                filter.where.id = { "!=": params.id }
            }
            if (params.role) {
                filter.where.role = { "!=": params.role }
            }
            let role = await Roles.find(filter).meta({ enableExperimentalDeepTargets: true });
            if (role && _.size(role) > 0) return true;
            else return false;
        }
        catch (err) {
            console.log(err)
            throw err
        }
    },

    async getUserPermissionOld(option) {
        try {
            let user = option.user;
            let filter = {
                where: {}
            };
            if (user.roles && user.roles.length) {
                filter.where = { id: user.roles }
            }
            let roles = await Roles.find(filter);
            if (!roles || !roles.length) return { data: [] };
            let finalPermissions = [];
            // manage role permissions

            if (roles && roles.length) {
                // get all permission by group by module
                roles = _.groupBy(_.flatten(_.map(roles, "permissions")), "navBarId");
                _.each(roles, (permissionArray, key) => {
                    permissionArray = _.flatten(_.map(permissionArray, "permissions"));
                    // create unique permission object from multiple roles data
                    if (permissionArray && permissionArray.length) {

                        let obj = {
                            navBarId: parseInt(key),
                            permissions: {}
                        };
                        _.each(permissionArray, (pObj) => {
                            _.each(pObj, (val, key) => {
                                if (_.has(obj.permissions, key)) {
                                    if (val) {
                                        obj.permissions[key] = val
                                    }
                                }
                                else {
                                    obj.permissions[key] = val
                                }
                            })
                        });
                        finalPermissions.push(obj)
                    }
                })

            }
            // overwrite user special permission on role permission
            if (user && user.accessPermission) {
                _.each(user.accessPermission, (p) => {
                    let index = _.findIndex(finalPermissions, { navBarId: p.navBarId });
                    if (index > -1) {
                        if (!finalPermissions[index].permissions) finalPermissions[index].permissions = {}
                        _.each(p.permissions, (val, key) => {
                            finalPermissions[index].permissions[key] = val
                        })
                    }
                    else {
                        finalPermissions.push(p)
                    }
                })
            }
            return { data: finalPermissions }
        }
        catch (e) {
            return false
        }
    },

    async getUserPermission(option) {
        try {
            let user = option.user;
            let filter = {
                where: {}
            };
            if (user.roles && user.roles.length) {
                filter.where = { id: user.roles }
            }
            let roles = await Roles.find(filter);
            if (!roles || !roles.length) return { data: [] };
            let finalPermissions = [];
            // manage role permissions

            if (roles && roles.length) {
                // get all permission
                roles = _.flatten(_.map(roles, "permissions"));
                _.each(roles, function (role) {

                    let obj = {
                        navBarId: role.navBarId,
                        permissions: role.permissions
                    };

                    if (role.module) {
                        obj.module = role.module;
                    }

                    // check already exist in finalPermission
                    let index = _.findIndex(finalPermissions, { navBarId: role.navBarId });
                    if (index > -1) {
                        if (!finalPermissions[index].permissions) {
                            finalPermissions[index].permissions = {};
                        }
                        _.each(role.permissions, (val, key) => {
                            if (_.has(finalPermissions[index].permissions, key)) {
                                if (val) {
                                    finalPermissions[index].permissions[key] = val
                                }
                            }
                            else {
                                finalPermissions[index].permissions[key] = val
                            }

                        })
                    }
                    else {
                        finalPermissions.push(obj)
                    }

                })

            }
            // overwrite user special permission on role permission
            if (user && user.accessPermission) {
                _.each(user.accessPermission, (p) => {
                    let index = _.findIndex(finalPermissions, { navBarId: p.navBarId });
                    if (index > -1) {
                        if (!finalPermissions[index].permissions) finalPermissions[index].permissions = {}
                        _.each(p.permissions, (val, key) => {
                            finalPermissions[index].permissions[key] = val
                        })
                    }
                    else {
                        finalPermissions.push(p)
                    }
                })
            }
            return { data: finalPermissions }
        }
        catch (e) {
            return false
        }
    },

    async checkUserPermission(option) {
        try {
            let loginUser = option.user;
            let permissions = await this.getUserPermission({ user: loginUser });
            if (!permissions.data || !permissions.data.length) return false;

            // For master and service: default listing permission
            if (option.operation == 'list' &&
                (option.module == sails.config.modules.master ||
                    option.module == sails.config.modules.service)) {
                return true;
            }
            else {

                let userPermission = _.find(permissions.data, { module: option.module });
                if (!userPermission) return false;
                if (userPermission.permissions[option.operation]) return true;
            }

        }
        catch (e) {
            console.log(e)
            return false;
        }
    },

    /**
     * @description set one of role as default
     * @param records
     * @return : promise
     */
    async setDefault(records) {
        try {
            let changeDefault = false;
            let defaultRecord = {};
            if (_.isArray(records)) {
                defaultRecord = _.find(records, { isDefault: true });
            }
            else {
                defaultRecord = records;
            }

            if (defaultRecord && defaultRecord.isDefault) {
                changeDefault = true;
            }
            else {
                return false
            }

            if (changeDefault) {
                let criteria = {

                    _id: {
                        $ne: ObjectId(defaultRecord.id)
                    },
                    isDefault: true
                };
                const update = { isDefault: false };

                return new Promise((resolve, reject) => {
                    let db = Roles.getDatastore().manager;
                    let collection = db.collection(Roles.tableName);
                    collection.update(
                        criteria,
                        {
                            $unset: update
                        },
                        {
                            multi: true,
                            writeConcern: { w: "majority", wtimeout: 5000 }
                        },
                        (err, result) => {
                            if (err) {
                                reject(new Error(err))
                            }
                            else {
                                resolve(true)
                            }
                        });

                })

            }
            else {
                return true
            }
        } catch (e) {
            throw new Error(e)
        }
    },

    getUserTypeByPermissionType(permissionTitle) {
        switch (permissionTitle) {
            case 'super-admin':
                return sails.config.USER.TYPE.SUPER_ADMIN;
            case 'admin':
                return sails.config.USER.TYPE.ADMIN;
            case 'sub-admin':
                return sails.config.USER.TYPE.SUB_ADMIN;
            case 'staff':
                return sails.config.USER.TYPE.STAFF;
            case 'franchisee':
                return sails.config.USER.TYPE.FRANCHISEE;
            default:
                return null;
        }
    },

    async addNewPermissionsToUsers(permissionTitle, newPermissionArray, oldPermissionArray) {
        try {
            let newPermissions = newPermissionArray.filter(({ module: id1 }) =>
                !oldPermissionArray.some(({ module: id2 }) => id2 === id1));

            let userType = this.getUserTypeByPermissionType(permissionTitle);

            if (!newPermissions || newPermissions.length === 0 || !userType) {
                console.log('EMPTY returning from addNewPermissionsToUsers');
                return;
            }

            let criteria = {
                type: userType
            };

            return new Promise((resolve, reject) => {
                let db = Roles.getDatastore().manager;
                let collection = db.collection(User.tableName);
                collection.update(
                    criteria,
                    { $push: { accessPermission: { $each: newPermissions } } },
                    {
                        multi: true
                    },
                    (err, result) => {
                        if (err) {
                            reject(new Error(err))
                        }
                        else {
                            SocketEvents.changePermissions(newPermissionArray, userType);
                            resolve(true)
                        }
                    });
            })

        } catch (e) {
            throw new Error(e)
        }
    },
    async updatePermissionsToAllUsers(permissionTitle, newPermissionArray) {
        try {

            let userType = this.getUserTypeByPermissionType(permissionTitle);

            await User.update({ type: userType }, { accessPermission: newPermissionArray });
            await SocketEvents.changePermissions(newPermissionArray, userType);

        } catch (e) {
            throw new Error(e)
        }
    },
    //hooks
    afterCreate: async (options) => {
        await RolesService.setDefault(options.records);
    },

    afterUpdate: async (options) => {
        await RolesService.setDefault(options.records);
    }

};

module.exports = RolesService;

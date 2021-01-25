/**
 * Common Controller Template
 *
 * @description :: Server-side logic for generating common Template for API.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
const CommonService = require(sails.config.appPath + '/api/services/common');
const VersionService = require(sails.config.appPath + '/api/services/version');
const config = require(sails.config.appPath + '/config/constant/version');
const ValidationService = require(sails.config.appPath + '/api/services/versionValidation');
const DeleteDependencyService = require(sails.config.appPath + '/api/services/DeleteDependencyService');
const fs = require('fs');
const uuid = require('uuid');

module.exports = {
    /**
     * @desc: list of Version pages
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async list(req, res) {
        try {
            //get filter
            let params = req.allParams();
            let filter = await VersionService.getFilter(params);
            let query = Version.find(filter).meta({ enableExperimentalDeepTargets: true });
            // include references and get list
            let pages = await VersionService.includeReferences(params.include, query);
            let countFilter = await CommonService.removePagination(filter);
            let count = await Version.count(countFilter);
            var windows = _.filter(pages, { platform: config.service.version.PLATFORM.WINDOWS_PLATFORM });
            var android = _.filter(pages, { platform: config.service.version.PLATFORM.ANDROID_PLATFORM });
            var iphone = _.filter(pages, { platform: config.service.version.PLATFORM.IOS_PLATFORM });
            var rs = { windows: windows, android: android, iphone: iphone };

            let response = {
                list: rs,
                count: count
            };

            return res.ok(response, sails.config.message.OK);
        } catch (err) {
            console.log(err);
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     * create Version page
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async create(req, res) {
        try {
            let model = req.allParams();
            const loginUser = req.user;
            // if (!loginUser) return res.badRequest(null, sails.config.message.BAD_REQUEST);
            model.createdBy = loginUser && loginUser.id ? loginUser.id : null;
            let isValid = await ValidationService.validateRequiredCreateParams(model);
            if (!isValid) return res.badRequest(null, sails.config.message.BAD_REQUEST);
            // check slug duplication
            let isDuplicate = await VersionService.checkDuplication(model);
            if (isDuplicate) {
                return res.ok(null, sails.config.message.VERSION_ALREADY_EXISTS);
            }

            let version = await Version.create(model).fetch();

            return res.ok(version, sails.config.message.VERSION_CREATE_SUCCESS);
        } catch (err) {
            console.log(err);
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     * get single detail of version
     * @param req
     * @param res
     */
    async view(req, res) {
        try {
            let page_id = req.param('id');
            if (!page_id) return res.badRequest(null, sails.config.message.BAD_REQUEST);
            let page = await Version.findOne(page_id);
            return res.ok(page);
        } catch (err) {
            console.log(err);
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     * update version detail
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    /**
     * @desc : update version
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async update(req, res) {
        try {
            const params = req.allParams();
            let loginUser = req.user;
            if (!params.id) return res.badRequest(null, sails.config.message.BAD_REQUEST);

            let isDuplicate = await VersionService.checkDuplication(params);
            if (isDuplicate) {
                return res.ok(null, sails.config.message.VERSION_ALREADY_EXISTS);
            }
            // let version = await Version.findOne({id: params.id});
            // if (params.number !== version.number) {
            //     let isApksExists = await Apks.find({version: version.number});
            //     if (isApksExists && isApksExists.length > 0) {
            //         return res.ok(null, sails.config.message.VERSION_APKS_ALREADY_EXISTS);
            //     }
            //     let isDeviceExists = await Device.find({
            //         where: {
            //             or: [
            //                 {appVersion: version.number},
            //                 {versionToBeUpdated: version.number}
            //             ]
            //         }
            //     });
            //     if (isDeviceExists && isDeviceExists.length > 0) {
            //         return res.ok(null, sails.config.message.VERSION_DEVICES_ALREADY_EXISTS);
            //     }
            // }
            let updateData = {
                isHardUpdate: params.isHardUpdate,
                updatedBy: loginUser && loginUser.id ? loginUser.id : null
            };

            if (params.name) {
                updateData.name = params.name;
            }
            if (params.number) {
                updateData.number = params.number;
            }
            // if (_.has(params, 'apk_path')) {
            //     updateData.apk_path = params.apk_path;
            // }

            let updateFlag = await Version.update({ id: params.id }, updateData).fetch();

            if (updateFlag && updateFlag.length) {
                return res.ok(updateFlag[0], sails.config.message.VERSION_UPDATE_SUCCESS);
            } else {
                return res.ok({}, sails.config.message.VERSION_NOT_FOUND);
            }
        } catch (err) {
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     * delete single or multiple data
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async bulkDestroy(req, res) {
        try {
            const params = req.allParams();
            let dependentPages = [];
            let deletedPages = [];
            const isValid = ValidationService.validateRequiredBulkDestroyParams(params);
            if (!isValid) return res.badRequest(null, sails.config.message.BAD_REQUEST);

            let pages = await Version.find({ id: { in: params.ids } });
            if (pages && pages.length) {
                await Promise.all(
                    _.map(pages, async page => {
                        let options = {
                            modelIdentity: Version.identity,
                            targetedId: page.id,
                            clearDependencies: params.clearDependencies
                        };
                        let dependencies = await DeleteDependencyService.resolveDependencies(options);
                        let isDependenciesAvailable = dependencies && dependencies.length && !params.clearDependencies;
                        if (isDependenciesAvailable) {
                            const response = {
                                id: page.id,
                                name: page.name,
                                dependencies: dependencies
                            };
                            dependentPages.push(response);
                        } else {
                            await Version.destroy({ id: page.id }).fetch();
                            deletedPages.push(page);
                        }

                        return true;
                    })
                );

                const deleteMessage =
                    deletedPages.length +
                    ' ' +
                    (deletedPages.length > 1 ? 'Pages ' : 'Page') +
                    ' deleted successfully.';
                const dependentMessage =
                    dependentPages.length +
                    ' ' +
                    (dependentPages.length > 1 ? 'Pages ' : 'Page') +
                    ' not deleted due to reference of page in other modules.';
                const message =
                    (deletedPages.length > 0 ? deleteMessage + (dependentPages.length > 0 ? ',' : '') : '') +
                    (dependentPages.length > 0 ? dependentMessage : '');
                const response = {
                    deleted: _.map(deletedPages, page => {
                        return _.pick(page, ['id', 'title', 'code']);
                    }),
                    dependent: _.map(dependentPages, page => {
                        return _.pick(page, ['id', 'name', 'code', 'dependencies']);
                    })
                };
                if (!deletedPages.length) return res.dependent(response, { message: message });
                return res.ok(response, sails.config.message.LANDING_PAGE_DELETED);
            } else {
                return res.ok(null, sails.config.message.NOT_FOUND);
            }
        } catch (err) {
            console.log('err', err);
        }
    },

    /**
     * @desc update is_active flag
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async setActive(req, res) {
        try {
            let model = req.allParams();
            const loginUser = req.user;
            model.updatedBy = loginUser && loginUser.id ? loginUser.id : null;

            let version = await Version.findOne({ id: model.id });

            let requestUpdate = await Version.update(
                { id: version.id },
                {
                    isActive: true,
                    updatedBy: loginUser && loginUser.id ? loginUser.id : null
                }
            ).fetch();

            var upData = requestUpdate[0];

            if (upData) {
                let updateCriteria = {
                    id: { '!': upData.id },
                    platform: model.platform
                };

                let updatedVersion = await Version.update(updateCriteria, {
                    isActive: false,
                    updatedBy: loginUser && loginUser.id ? loginUser.id : null
                }).fetch();

                if (updatedVersion) {
                    return res.ok(updatedVersion, sails.config.message.VERSION_UPDATE_SUCCESS);
                } else {
                    return res.ok({}, sails.config.message.VERSION_NOT_FOUND);
                }
            } else {
                return res.ok({}, sails.config.message.VERSION_NOT_FOUND);
            }
        } catch (err) {
            console.log(err);
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    },

    async setHardUpdate(req, res) {
        try {
            let model = req.allParams();
            const loginUser = req.user;
            model.updatedBy = loginUser && loginUser.id ? loginUser.id : null;

            let version = await Version.findOne({ id: model.id });

            let requestUpdate = await Version.update(
                { id: version.id },
                {
                    isHardUpdate: model.isHardUpdate,
                    updatedBy: loginUser && loginUser.id ? loginUser.id : null
                }
            ).fetch();

            var upData = requestUpdate[0];
            if (upData) {
                return res.ok(upData, sails.config.message.VERSION_UPDATE_SUCCESS);
            } else {
                return res.ok({}, sails.config.message.VERSION_NOT_FOUND);
            }
        } catch (err) {
            console.log(err);
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     * @desc : delete version
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async destroy(req, res) {
        try {
            let version_id = req.param('id');
            let version = await Version.findOne(version_id);
            if (version) {
                if (version.is_active) {
                    return res.ok(null, sails.config.message.VERSION_STILL_ACTIVE);
                } else {
                    let deletedData = await Version.destroy({ id: version.id }).fetch();
                    if (deletedData) {
                        return res.ok(deletedData, sails.config.message.VERSION_DELETED);
                    } else {
                        return res.ok({}, sails.config.message.VERSION_NOT_FOUND);
                    }
                }
            } else {
                return res.ok({}, sails.config.message.VERSION_NOT_FOUND);
            }
        } catch (err) {
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    },

    async getProjectLatestVersion(req, res) {
        try {
            let response = {
                projectLatestVersion: sails.config.PROJECT_LATEST_VERSION
            };
            return res.ok(response);
        } catch (err) {
            return res.serverError(err, sails.config.message.SERVER_ERROR);
        }
    },
};

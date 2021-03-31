const path = require('path');
const moment = require('moment');
const EmailService = require('./email');
const NotificationService = require('./notification');
const NotificationListService = require('./notificationList');
const DeleteSyncService = require('./deleteSync');
const UtilService = require(`./util`);
const RedisDBService = require('./redisDB');
const OperationalHoursService = require('./operationalHours');

// let pdfFillForm = require('pdf-fill-form');
const fs = require('fs');
const exec = require('child_process').exec;
const request = require('request');
const ProjectSetupConfigService = require('./projectSetupConfig');

module.exports = {

    /**
     * @description: getting query builder of locations
     * @param options "{
     *                      "startWith":<Object>,
     *                      "sort":<Object>,
     *                      "project":<Object>,
     *                      "page":<Object>,
     *                      "limit":<Object>,
     *                }"
     * @param callback
     */
    getFilter: async (options) => {
        let filter = { where: { or: [] } };
        // manage pagination logic
        if (options.page && options.limit) {
            filter.skip = (options.page - 1) * options.limit;
            filter.limit = options.limit;
        }


        // sort by request
        if (options.sort) {
            filter.sort = options.sort;
        } else {
            filter.sort = [
                { createdAt: 'DESC' },
                { updatedAt: 'DESC' }
            ];
        }

        if (_.has(options, 'isActive')) {
            filter.where.isActive = options.isActive;
        }

        if (_.has(options, 'isDeleted')) {
            filter.where.isDeleted = options.isDeleted;
        }

        // filter by start with
        if (options.startWith &&
            options.startWith.keys &&
            options.startWith.keyword) {
            _.forEach(options.startWith.keys, (key) => {
                if (key) {
                    let orArray = {};
                    orArray[key] = { startsWith: options.startWith.keyword };
                    filter.where.or.push(orArray);
                }
            });
        }

        if (options.search &&
            options.search.keys &&
            options.search.keyword) {
            _.forEach(options.search.keys, (key) => {
                if (key) {
                    let orArray = {};
                    orArray[key] = { contains: options.search.keyword };
                    filter.where.or.push(orArray);
                }
            });
        }
        // NOTE:- keep this filter at end
        if (_.has(options, 'id')) {
            filter = { where: { id: options.id } };
        }
        // projection by request
        if (options.project) {
            filter.select = options.project;
        }
        if (options.filter) {
            filter.where = _.extend(filter.where, options.filter);
        }

        if (filter.where.or && !filter.where.or.length) {
            delete filter.where.or;
        }

        return filter;
    },
    /**
     * @description GC filter and remove
     * @param filter
     */
    gcFilter: async (filter) => {
        // remove un-necessary or
        if (filter &&
            filter.where &&
            filter.where.or &&
            !filter.where.or.length) {
            delete filter.where.or;
        }
        // remove un-necessary and
        if (filter &&
            filter.where &&
            filter.where.and &&
            !filter.where.and.length) {
            delete filter.where.and;
        }

        return filter;
    },
    /**
     *  update filter with count condition
     * @param filter
     * @returns {Promise.<void>}
     */
    async removePagination(filter) {
        return filter.where;
    },
    /**
     *  convert key of object to lower case
     * @param params : obj
     * @param keys : array
     * @returns {Promise.<*>}
     */
    async convertToLowercase(params, keys) {
        _.each(keys, (k) => {
            if (params[k] && typeof params[k] === 'string') {
                params[k] = params[k].toLowerCase();
            }
        });

        return params;
    },
    /**
     * store file on given path
     * @param option
     * @returns {Promise.<void>}
     */
    async storeFile(req, option) {
        return await new Promise((resolve, reject) => {
            req.file('file')
                .upload({
                    dirname: option.storePath,
                    maxBytes: option.limit || 1024 * 1024 * 9
                },
                    (err, files) => {
                        if (err) {
                            return reject({ err: err, message: 'ERROR.' });
                        } else if (files && files.length) {
                            let link = path.basename(files[0].fd);

                            return resolve({ link: link });
                        }

                        return reject({ err: '', message: 'Please select excel file.' });

                    });
        });
    },
    /**
     *  convert csv to json
     * @param: option{
     * path: <path to store in dir>
     * }
     * @returns {Promise.<*>}
     */
    async convertCsvToJson(option) {
        try {
            const csvFilePath = option.path;
            const csv = require('csvtojson');

            return await new Promise((resolve, reject) => {
                let jsonData = [];
                csv()
                    .fromFile(csvFilePath)
                    .on('json', (jsonObj) => {
                        jsonData.push(jsonObj);
                    })
                    .on('done', (error) => {
                        resolve({ data: jsonData });
                    });
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    },
    /**
     * create otp string
     * @param option
     */
    generateOtp(option) {
        // TODO :- uncomment this in production
        // return Math.floor(1000 + Math.random() * 9000);
        return 1234;
    },
    /**
     * @description: getting default sync
     * @param options "{
     *                      "lastSyncDate":<datetime>
     *                }"
     */
    getSyncDateFilter: (options) => {
        let filter = { where: {} };
        // manage pagination logic
        if (options.page && options.limit) {
            filter.skip = (options.page - 1) * options.limit;
            filter.limit = options.limit;
        }
        // sort by request
        if (options.sort) {
            filter.sort = options.sort;
        }
        // filter by last sync date
        let lastSyncDate = moment(options.lastSyncDate);
        filter['where'].or = [
            { createdAt: { '>=': lastSyncDate.toISOString() } },
            { updatedAt: { '>=': lastSyncDate.toISOString() } }
        ];

        return filter;
    },
    /**
     * Filter for Rap Price and Discount Price API
     * @param options
     * @returns {{where: {or: {}}}}
     */
    /**
     * Format Master and SubMaster according to require format
     * @param masters
     * @returns {{}}
     */
    formatMasters: (masters) => {
        let response = {};
        _.each(masters, (master, key) => {
            response[key] = {};
            _.each(master.subMasters, (submaster, k) => {
                if (key.indexOf('RANGE') !== -1) {
                    response[key][submaster.code] = submaster.name;
                } else {
                    response[key][submaster.code] = submaster.id;
                }
            });
        });

        return response;
    },
    spliceParamsOnUpdate(data) {
        return _.omit(data, ['id', 'createdAt', 'updatedAt']);
    },
    async sendMailSMSAndPushNotification(options) {

        if (!options.action) {
            return false;
        }
        let notificationSetting = await Settings.findOne(
            { type: sails.config.SETTINGS.TYPE.NOTIFICATION_SETTING }
        );
        let notificationAction = _.find(notificationSetting.notificationActions, (value) => {
            return value.action === options.action;
        });
        if (!notificationAction || (
            notificationAction && !notificationAction.device &&
            !notificationAction.email && !notificationAction.sms
        )) {
            return false;
        }
        let mailOptions = options.mail;
        let pushNotificationOptions = options.pushNotification;
        let sms = options.sms;
        let users = options.users;
        try {
            users = await User.find({
                where: { id: users },
                select: ['emails', 'mobiles', 'name', 'androidPlayerId', 'iosPlayerId', 'preferredLang']
            });
            let adminUsers = [];
            if (notificationAction.allowAdmin) {
                adminUsers = await User.find({
                    where: { type: sails.config.USER.TYPE.ADMIN },
                    select: ['id']
                });
            }
            let notificationData = await NotificationListService.upsertNotification({
                users: _.concat(users, adminUsers),
                content: pushNotificationOptions.content,
                data: pushNotificationOptions.data,
                action: options.action
            });

            await Promise.all(_.map(users, (user) => {
                let userEmail = _.find(user.emails, (e) => {
                    return e.isPrimary;
                });

                let notification = _.find(notificationData, (notification) => {
                    return notification.userId === user.id;
                });

                if (notificationAction) {
                    if (notificationAction.email && userEmail && userEmail.email) {
                        let mailObj = {
                            subject: mailOptions.subject,
                            to: userEmail.email,
                            template: mailOptions.template,
                            data: {
                                name: user.name || '-',
                                email: userEmail.email || '-',
                                message: mailOptions.message,
                                language: user.preferredLang
                            }
                        };
                        if (mailOptions.data) {
                            mailObj.data.mailData = mailOptions.data;
                        }
                        // send mail
                        EmailService.send(mailObj);
                    }
                    if (notificationAction.device) {
                        let playerIds = [];
                        playerIds = playerIds.concat(user.androidPlayerId);
                        playerIds = playerIds.concat(user.iosPlayerId);
                        // attach notificationId
                        _.assign(pushNotificationOptions.data, { notificationId: notification.id });

                        // send push notification
                        NotificationService.sendPushNotification({
                            playerIds: playerIds,
                            content: pushNotificationOptions.content,
                            data: pushNotificationOptions.data
                        });
                    }
                    if (notificationAction.sms) {
                        let userMobile = _.find(user.mobiles, (e) => {
                            return e.isPrimary;
                        });
                        if (userMobile && userMobile.countryCode) {
                            let smsObj = {
                                message: sms.content,
                                mobiles: userMobile.countryCode + userMobile.mobile
                            };
                            // TODO:: Enable SMS
                            // SmsService.send(smsObj);
                        }
                    }
                }
            }));

            return true;
        } catch (e) {
            throw new Error(e);
        }
    },

    async initializeApp() {
        _.map(sails.config.DB_INDEXES, (sphereIndex) => {
            let model = sphereIndex.model;
            let db = sails.models[model.toLowerCase()].getDatastore().manager;
            db.collection(model)
                .ensureIndex({ [sphereIndex.key]: sphereIndex.indexName }, () => {
                    // index assigned
                });
        });
        let db = sails.models['IOTCommandCallbackTrack'.toLowerCase()].getDatastore().manager;
        db.collection('IOTCommandCallbackTrack')
            .ensureIndex({ imei: 'text', createdAt: -1 }, () => { });
        await ProjectSetupConfigService.buildSettingConfig();
        console.log('buildProjectConfig');
        await ProjectSetupConfigService.buildProjectConfig();
        console.log('buildSetupConfig');
        await ProjectSetupConfigService.buildSetupConfig();
        console.log('buildDeviceConfig');
        await ProjectSetupConfigService.buildDeviceConfig();
        console.log('operational hours')
        await OperationalHoursService.setOperationalHours();
        // console.log('resetUserData');
        // await this.resetUserData();
        console.log('resetVehicleData');
        await this.resetVehicleData();
        console.log('resetRedisData');
        await this.resetRedisData();
        await this.handleDynamicConfig();
        await this.handleDynamicConfigNest();
        await migration.applyMigration();
    },

    async handleDynamicConfig() {
        let query = [
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: "$boundary.type",
                    total: { $sum: 1 }
                }
            }
        ];
        let boundryTypeWiseZoneData = await this.runAggregateQuery(query, 'Zone')
        sails.config.HAS_CIRCLE_ZONE = false;
        sails.config.HAS_POLYGON_ZONE = false;
        for (boundryTypeData of boundryTypeWiseZoneData) {
            if (boundryTypeData._id === 'Point' && boundryTypeData.total > 0) {
                sails.config.HAS_CIRCLE_ZONE = true;
            } else if (boundryTypeData._id === 'Polygon' && boundryTypeData.total > 0) {
                sails.config.HAS_POLYGON_ZONE = true;
            }
        }

        console.log('sails.config.HAS_CIRCLE_ZONE', sails.config.HAS_CIRCLE_ZONE);
        console.log('sails.config.HAS_POLYGON_ZONE', sails.config.HAS_POLYGON_ZONE);
    },

    async handleDynamicConfigNest() {
        let query = [
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: "$currentLocation.type",
                    total: { $sum: 1 }
                }
            }
        ];
        let boundryTypeWiseNestData = await this.runAggregateQuery(query, 'Nest')
        sails.config.HAS_CIRCLE_NEST = false;
        sails.config.HAS_POLYGON_NEST = false;
        for (boundryTypeData of boundryTypeWiseNestData) {
            if (boundryTypeData._id === 'Point' && boundryTypeData.total > 0) {
                sails.config.HAS_CIRCLE_NEST = true;
            } else if (boundryTypeData._id === 'Polygon' && boundryTypeData.total > 0) {
                sails.config.HAS_POLYGON_NEST = true;
            }
        }

        console.log('sails.config.HAS_CIRCLE_NEST', sails.config.HAS_CIRCLE_NEST);
        console.log('sails.config.HAS_POLYGON_NEST', sails.config.HAS_POLYGON_NEST);
    },

    // async resetUserData() {
    //     // await User.update({}).set({ connectedSockets: [] });
    // },

    async resetVehicleData() {
        let currentTime = await UtilService.getTimeFromNow();
        let iotVehicleTypes = sails.config.IOT_VEHICLE_TYPE;
        await Vehicle.update(
            { type: iotVehicleTypes },
            {
                connectionStatus: false,
                lastConnectionCheckDateTime: currentTime
            }
        );
    },

    async resetRedisData() {
        await RedisDBService.resetDB();
    },

    async getDateFilterForDevice(params) {
        const isCreatedFilter = params.filter && params.filter.from && params.filter.to;
        let from;
        let to;
        if (isCreatedFilter) {
            from = params.filter.from;
            to = params.filter.to;
            params = _.omit(params, 'filter');
        }
        let filter = await this.getFilter(params);
        if (!filter.where) {
            filter.where = {};
        }
        if (isCreatedFilter) {
            filter.where.createdAt = {
                '>=': UtilService.getStartOfTheDay(from),
                '<=': UtilService.getEndOfTheDay(to)
            };
        }

        return filter;
    },



    permissionFilter(params, loginUser) {
        if (!params.filter) {
            params.filter = {};
        }
        let key = '';
        if (loginUser.type === sails.config.USER.TYPE.PHARMACY.ADMIN) {
            key = 'pharmacyId';
        } else if (loginUser.type === sails.config.USER.TYPE.HOME.ADMIN) {
            key = 'homeId';
        } else if (loginUser.type === sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN) {
            key = 'homeAreaId';
        } else if (loginUser.type === sails.config.USER.TYPE.ADMIN.SUPER || loginUser.type === sails.config.USER.TYPE.ADMIN.GENERAL) {
            return params;
        }
        params.filter[key] = _.first(loginUser.parentClientele).id;

        return params;
    },
    async getLoginUserWiseDependentRecord(params, loginUser, res) {
        let record = _.clone(params);
        let requestedData = [];
        if (loginUser.type === sails.config.USER.TYPE.PHARMACY.ADMIN) {// pharmacy admin
            requestedData = ['pharmacyId', 'homeId', 'homeAreaId'];
        } else if (loginUser.type === sails.config.USER.TYPE.HOME.ADMIN) {// home admin
            record.homeId = loginUser.parentClientele[0].id;
            requestedData = ['homeAreaId'];
            let home = await Clientele.findOne({
                where: { id: record.homeId },
                select: ['parentId']
            });
            if (!home) {
                return res.badRequest(null, sails.config.message.PHARMACY_NOT_FOUND_FOR_HOME);
            }
            record.pharmacyId = home.parentId;
        } else if (loginUser.type === sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN) {// home area admin
            record.homeAreaId = loginUser.parentClientele[0].id;
            let homeArea = await Clientele.findOne({
                where: { id: record.homeAreaId },
                select: ['id', 'parentId']
            });
            if (!homeArea) {
                return res.badRequest(null, sails.config.message.PHARMACY_NOT_FOUND_FOR_HOME);
            }
            record.homeId = homeArea.parentId;
            let home = await Clientele.findOne({
                where: { id: record.homeId },
                select: ['id', 'parentId']
            });
            if (!home) {
                return res.badRequest(null, sails.config.message.PHARMACY_NOT_FOUND_FOR_HOME);
            }
            record.pharmacyId = home.parentId;
        } else if (loginUser.type === sails.config.USER.TYPE.ADMIN.GENERAL || loginUser.type === sails.config.USER.TYPE.ADMIN.SUPER) {
            if (params.assignType) {
                if (params.assignType === sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN) {
                    requestedData = ['pharmacyId', 'homeId', 'homeAreaId'];
                } else if (params.assignType === sails.config.USER.TYPE.PHARMACY.ADMIN) {
                    requestedData = ['pharmacyId'];
                }
            } else {
                requestedData = ['pharmacyId', 'homeId', 'homeAreaId'];
            }

        }
        // check for bad request
        if (params) {
            let badRequest = false;
            _.each(requestedData, (key) => {
                if (!_.has(params, key)) {
                    badRequest = true;
                } else {
                    record[key] = params[key];
                }
            });

            if (badRequest) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
        }

        return record;
    },
    async convertPDFToImage(sourcePDF, destImagePath) {
        try {
            let convertCommand = `convert ${sourcePDF} +profile "icc"
             -background white -alpha remove -alpha off ${destImagePath}`;

            return await new Promise((resolve, reject) => {
                exec(convertCommand, (err, stdout, stderr) => {
                    if (err) {
                        return reject({
                            message: 'Failed to convert page to image',
                            error: err,
                            stdout: stdout,
                            stderr: stderr
                        });
                    }

                    return resolve({ flag: true, data: destImagePath });
                });
            });
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    },
    async populateSubFields(records, referenceMeta) {
        try {
            let refRecords = {};
            _.each(records, (record) => {
                _.each(referenceMeta, (meta) => {
                    if (!refRecords[meta.reference_model]) {
                        refRecords[meta.reference_model] = [];
                    }
                    let splitFieldName = meta.field_name.split('.');
                    if (_.size(splitFieldName) === 3) {
                        if (!_.isEmpty(record && record[splitFieldName[0]] && record[splitFieldName[0]][splitFieldName[1]] && record[splitFieldName[0]][splitFieldName[1]][splitFieldName[2]])) {
                            refRecords[meta.reference_model] = _.compact(_.concat(refRecords[meta.reference_model], _.map(record[splitFieldName[0]], splitFieldName[1], splitFieldName[2])));
                        }
                    } else if (_.size(splitFieldName) === 2) {
                        // console.log('record map', splitFieldName, _.map(record[splitFieldName[0]], splitFieldName[1]));
                        refRecords[meta.reference_model] = _.compact(_.concat(refRecords[meta.reference_model], _.map(record[splitFieldName[0]], splitFieldName[1])));
                    } else if (_.size(splitFieldName) === 1) {
                        refRecords[meta.reference_model] = _.compact(_.concat(refRecords[meta.reference_model], record[splitFieldName[0]]));
                    }
                });
            });
            await Promise.all(_.map(refRecords, async (recordIdArray, modelIdentity) => {
                let meta = _.find(referenceMeta, (v) => {
                    return modelIdentity === v.reference_model;
                });
                let filter = { where: {} };
                if (meta.reference_field) {
                    let tmpRecordIdArray = _.compact(recordIdArray);
                    if (tmpRecordIdArray && _.size(tmpRecordIdArray) > 0) {
                        filter.where[meta.reference_field] = _.uniq(tmpRecordIdArray);
                    } else {
                        delete filter.where;
                    }
                }
                if (meta.projection) {
                    filter.select = meta.projection;
                }

                if (meta.self_populate_attr) {
                    if (meta.self_populate_attr_projection) {
                        refRecords[modelIdentity] = await sails.models[modelIdentity].find(filter).populate(meta.self_populate_attr, meta.self_populate_attr_projection);
                    } else {
                        refRecords[modelIdentity] = await sails.models[modelIdentity].find(filter).populate(meta.self_populate_attr);
                    }
                } else {
                    refRecords[modelIdentity] = await sails.models[modelIdentity].find(filter);
                }
            }));
            _.each(records, (record) => {
                _.each(referenceMeta, (meta) => {
                    let splitFieldName = meta.field_name.split('.');
                    if (_.size(splitFieldName) === 3) {
                        if (record[splitFieldName[0]]) {
                            _.each(record[splitFieldName[0]], (subElement, index) => {
                                // subElement
                                if (subElement && subElement[splitFieldName[1]]) {
                                    _.each(subElement[splitFieldName[1]], (nestElement, nestIndex) => {
                                        // nestElement
                                        if (nestElement && nestElement[splitFieldName[2]]) {
                                            record[splitFieldName[0]][index][splitFieldName[1]][nestIndex] = _.find(refRecords[meta.reference_model], (refRecord) => {
                                                return refRecord[meta.reference_field] === nestElement[splitFieldName[2]];
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    } else if (_.size(splitFieldName) === 2) {
                        _.each(record[splitFieldName[0]], (subElement, index) => {
                            // subElement
                            if (record[splitFieldName[0]] && record[splitFieldName[0]][index]) {
                                record[splitFieldName[0]][index][splitFieldName[1]] = _.find(refRecords[meta.reference_model], (refRecord) => {
                                    return refRecord[meta.reference_field] === subElement[splitFieldName[1]];
                                });
                            }
                        });
                    } else if (_.size(splitFieldName) === 1) {
                        record[splitFieldName[0]] = _.find(refRecords[meta.reference_model], (refRecord) => {
                            return refRecord[meta.reference_field] === record[splitFieldName[0]];
                        });
                    }
                });
            });

            // console.log('here', records);
            return records;
        } catch (e) {
            throw new Error(e);
        }
    },
    async deleteSyncLog(options) {
        if ((options.records && options.records.length) ||
            (options.records && options.records.id)
        ) {
            let syncOptions = {
                module: options.modelIdentity.toLowerCase(),
                records: typeof options.records === 'object' ? [options.records] : options.records
            };
            await DeleteSyncService.logDeletedRecords(syncOptions);
        }
    },
    async getDeletedRecords(options) {
        let deleted = await DeleteSync.find({
            where: {
                module: sails.config.modules[options.moduleName],
                updatedAt: { '>=': new Date(options.lastSyncDate) }
            },
            select: ['recordId']
        });

        return _.map(deleted, 'recordId');
    },
    async changeDetailValues(options) {
        const UtilService = require('./util');
        let data = UtilService.difference(options.newDocument, options.oldDocument);
        let model = sails.models[options.tableName.toLowerCase()];
        let associations = _.clone(model.associations);
        // update constant values
        _.each(model.attributes, (value, fieldName) => {
            if (options.modifier[fieldName]) {
                if (value.extendedDescription) {
                    _.each(value.extendedDescription, (v, k) => {
                        if (v === data[fieldName]) {
                            data[fieldName] = k;
                        }
                    });
                }
            }
        });
        // update model values
        await Promise.all(_.map(associations, async (value) => {
            if (data[value.alias]) {
                if (value.type === 'model') {
                    let record = await sails.models[value.model]
                        .findOne({ id: data[value.alias].toString() });
                    data[value.alias] = record.name || record.title;
                }
            }
        }));

        return data;
    },
    async addActivityLog(options) {
        try {
            let title = '';
            let obj = {
                userId: '',
                referenceId: '',
                action: 0,
                details: {},
                module: sails.config.modules[options.tableName.toLowerCase()]
            };
            if (options.operation === 'create') {
                obj.action = sails.config.ACTIVITY_TYPES.CREATED;
            } else if (options.operation === 'update') {
                obj.action = sails.config.ACTIVITY_TYPES.UPDATED;
            } else if (options.operation === 'remove') {
                obj.action = sails.config.ACTIVITY_TYPES.REMOVED;
            }
            if (options.oldDocument) {// on update document
                obj.details = await this.changeDetailValues(options);
                if (obj.details && _.size(obj.details)) {
                    obj.details = _.omit(obj.details, ['createdAt', 'updatedAt', 'addedBy', 'updatedBy']);
                }
                if (obj.details) {
                    if (obj.details.isDeleted) {
                        obj.action = sails.config.ACTIVITY_TYPES.REMOVED;
                    } else if (_.has(obj.details, 'isActive')) {
                        obj.action = sails.config.ACTIVITY_TYPES.ACTIVE_STATUS_UPDATED;
                    } else if (_.has(obj.details, 'status')) {
                        obj.action = sails.config.ACTIVITY_TYPES.STATUS_UPDATED;
                    } else if (_.has(obj.details, 'password')) {
                        obj.action = sails.config.ACTIVITY_TYPES.PASSWORD_RESET;
                    } else {
                        obj.action = sails.config.ACTIVITY_TYPES.UPDATED;
                    }
                }
                title = options.oldDocument.name || options.oldDocument.title;

                obj.userId = options.newDocument.updatedBy || options.oldDocument.updatedBy;
                obj.referenceId = options.oldDocument.id;
                obj.type = options.oldDocument.type ? options.oldDocument.type : 0;

                // is not array
            } else if (!options.newDocument.length) {
                obj.details = _.omit(options.newDocument,
                    ['createdAt', 'updatedAt', 'addedBy', 'updatedBy']
                );
                obj.userId = options.newDocument.addedBy || options.newDocument.updatedBy;
                obj.referenceId = options.newDocument.id;
                title = options.newDocument.name || options.newDocument.title;
            } else {
                obj.details.count = _.size(options.newDocument);
                obj.userId = options.newDocument[0].addedBy || options.newDocument[0].updatedBy;
                title = options.newDocument[0].name || options.newDocument[0].title;
            }
            let oldData = {};
            if (options.oldDocument) {
                for (let key of Object.keys(obj.details)) {
                    oldData[key] = options.oldDocument[key];
                }
            }
            obj.recordTitle = title;
            obj.oldValues = oldData;
            await ActivityLog.create(obj).meta({ skipAllLifecycleCallbacks: true });
        } catch (e) {
            console.log(e);
        }
    },

    async runNativeUpdateQuery(criteria, data, modelName) {
        modelName = modelName.toLowerCase();
        const model = sails.models[modelName];
        let db = model.getDatastore().manager;
        try {
            let result = await db.collection(model.tableName).update(criteria, data, { multi: false, upsert: true });

            return result;
        } catch (error) {
            console.log(error);
        }
    },

    async runNativeQuery(criteria, data, modelName) {
        modelName = modelName.toLowerCase();
        const model = sails.models[modelName];
        let db = model.getDatastore().manager;
        try {
            let result = await db.collection(model.tableName).update(criteria, data, { multi: true, upsert: false });

            return result;
        } catch (error) {
            console.log(error);
        }
    },

    async runFindNativeQuery(query, modelName) {
        modelName = modelName.toLowerCase();
        const model = sails.models[modelName];
        let db = model.getDatastore().manager;
        try {
            let result = await db.collection(model.tableName).find(query).toArray();

            return result;
        } catch (error) {
            console.log(error);
        }
    },

    async runAggregateQuery(query, modelName) {
        modelName = modelName.toLowerCase();
        let db = sails.models[modelName].getDatastore().manager;
        // console.log('query', JSON.stringify(query));
        let data = await new Promise((resolve, reject) => {
            db.command({
                aggregate: sails.models[modelName].tableName,
                pipeline: query,
                cursor: {
                    batchSize: 9999999
                }
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                if (result && result.cursor && result.cursor.firstBatch) {
                    result = result.cursor.firstBatch;
                }
                resolve(result);
            });
        });

        return data;
    },
    async getChartDataByQuery(group, collection, startDate, endDate, match = {}) {
        let data = {
            total: 0,
            data: []
        };
        if (startDate && endDate) {
            match.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        let query = [];
        if (match) {
            query.push({ $match: match });
        }
        if (group) {
            query.push({ $group: group });
        }
        query.push(
            {
                $project: {
                    _id: 0,
                    value: 1,
                    date: '$_id'
                }
            });
        query.push(
            { $sort: { date: 1 } }
        );
        if (group.value2) {
            query[2].$project.value2 = 1;
        }

        data.data = await this.runAggregateQuery(query, collection);

        for (const record of data.data) {
            data.total += record.value * 1;
        }

        data.total = Number(parseFloat(data.total).toFixed(2));

        return data;
    },
    async exportChartDataByQuery(group, collection, startDate, endDate, match = {}, index) {
        let data = [];
        if (startDate && endDate) {
            match.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        let query = [];
        if (match) {
            query.push({ $match: match });
        }
        if (index === 1) {
            query.push({
                $project: {
                    "_id": 0,
                    RiderName: "$name",
                    Mobiles: "$mobiles",
                    Emails: "$emails",
                    SignUpDate: "$createdAt",
                    IsActive: "$isActive",
                    DOB: "$dob",
                }
            });
        } else if (index === 2) {
            query.push({
                $project: {
                    "_id": 0,
                    RideId: "$rideNumber",
                    Status: "$status",
                    TotalFare: "$totalFare",
                    TimeFare: "$fareData.timeFare",
                    DistanceFare: "$fareData.distanceFare",
                    RidePauseFare: "$fareData.ridePauseFare",
                    RideReserveFare: "$fareData.rideReserveFare",
                    CancellationFare: "$fareData.cancellationFare",
                    BaseFare: "$fareData.baseFare",
                    ParkingFine: "$fareData.parkingFine",
                    UnlockFees: "$fareData.unlockFees",
                }
            });
        }

        data = await this.runAggregateQuery(query, collection);

        return data;
    },
    downloadFile: async function (obj) {
        try {
            let newFileName = `${uuid()}.${obj.extension}`;

            return await new Promise(((resolve, reject) => {
                console.log(`${sails.config.appPath}/assets/images/user/${newFileName}`);
                request(obj.fileUrl)
                    .pipe(fs.createWriteStream(`${sails.config.appPath}/assets/images/user/${newFileName}`))
                    .on('close', () => {
                        resolve({
                            flag: true,
                            message: 'Successfully downloaded',
                            path: `/assets/user/${newFileName}`
                        });
                    });
            }));
        } catch (e) {
            return false;
        }
    },
    checkIsParent: async function (modelName, documentId) {
        let model = sails.models[modelName];
        if (!model.attributes.parentId) {
            return;
        }
        const result = await model.find({ parentId: documentId, isDeleted: false });
        if (result && result.length > 0) {
            throw sails.config.message.COMMON_CANT_DELETE;
        }
    },

    addUUID: async function (params) {
        _.each(params, (data) => {
            if (!data.id) {
                data.id = uuid();
            }
        });

        return params;
    },

    getReference: async function (referenceId, referenceModule) {
        let record = {};
        if (referenceModule === 1) {
            let refrenceIdPopulate = await User.findOne({ id: referenceId.toString() });
            if (refrenceIdPopulate && refrenceIdPopulate.id) {
                record.id = refrenceIdPopulate.id;
                record.firstName = refrenceIdPopulate.firstName;
                record.lastName = refrenceIdPopulate.lastName;

                return record;
            }
        } else if (referenceModule === 2) {
            let record = {};
            let refrenceIdPopulate = await Vehicle.findOne({ id: referenceId });
            record.referenceId.id = refrenceIdPopulate.id;
            record.referenceId.name = refrenceIdPopulate.name;

            return record;
        } else if (referenceModule === 3) {
            let record = {};
            let refrenceIdPopulate = await RideBooking.findOne({ id: referenceId });
            record.referenceId.id = refrenceIdPopulate.id;

            return record;
        } else if (referenceModule === 4) {
            let record = {};
            let refrenceIdPopulate = await TransactionLog.findOne({ id: referenceId });
            record.referenceId.id = refrenceIdPopulate.id;

            return record;
        } else if (referenceModule === 5) {
            let record = {};
            let refrenceIdPopulate = await RideComplaintDispute.findOne({ id: referenceId });
            record.referenceId.id = refrenceIdPopulate.id;

            return record;
        }
    },

    emailMasking(email) {
        if (!email) {
            return email;
        }
        let domain = email.split('.');
        let name = domain[0].slice(0, 5);

        return `${name}****${domain[1]}`;
    },

    phoneNoMasking(phone) {
        if (!phone) {
            return phone;
        }
        let phoneNo = phone.toString();
        let no = phoneNo.replace(phoneNo.substring(0, 6), 'XXXXXX');

        return no;
    },

    getActivityLogReference: async function (referenceId, referenceModule) {
        let record = {};
        if (referenceModule === sails.config.modules.user) {
            let userData = await User.findOne({ id: referenceId });
            if (userData) {
                record.name = userData.name;
                record.email = UtilService.getPrimaryEmail(userData.emails);

                return record;
            }


            return record;
        } else if (referenceModule === sails.config.modules.vehicle) {
            let vehicleData = await Vehicle.findOne({ id: referenceId });
            if (vehicleData) {
                record.type = vehicleData.type;
                record.name = vehicleData.name;
                record.registerId = vehicleData.registerId;

                return record;
            }

            return record;
        } else if (referenceModule === sails.config.modules.ridebooking) {
            let rideData = await RideBooking.findOne({ id: referenceId });
            if (rideData) {
                record.rideNumber = rideData.rideNumber;
                record.status = rideData.status;

                return record;
            }


            return record;
        } else if (referenceModule === sails.config.modules.ridecomplaintdispute) {
            let disputeData = await RideComplaintDispute.findOne({ id: referenceId })
                .populate('rideId', { select: ['rideNumber'] });
            if (disputeData) {
                record.uniqNumber = disputeData.uniqNumber;
                record.rideNumber = disputeData.rideNumber;

                return record;
            }

            return record;
        } else if (referenceModule === sails.config.modules.master) {
            let masterData = await Master.findOne({ id: referenceId });
            if (masterData) {
                record.code = masterData.code;

                return record;
            }

            return record;
        } else if (referenceModule === sails.config.modules.faqs) {
            let faqsData = await Faqs.findOne({ id: referenceId });
            if (faqsData) {
                record.question = faqsData.question;

                return record;
            }

            return record;
        } else if (referenceModule === sails.config.modules.cancellationreason) {
            let cancellationreasonData = await CancellationReason.findOne({ id: referenceId });
            if (cancellationreasonData) {
                record.reason = cancellationreasonData.reason;

                return record;
            }

            return record;
        } else if (referenceModule === sails.config.modules.actionquestionnairemaster) {
            let actionQuestionnaireData = await ActionQuestionnaireMaster.findOne({ id: referenceId });
            if (actionQuestionnaireData) {
                record.question = actionQuestionnaireData.question;

                return record;
            }

            return record;
        } else if (referenceModule === sails.config.modules.procedure) {
            let procedureData = await Procedure.findOne({ id: referenceId });
            if (procedureData) {
                record.name = procedureData.name;

                return record;
            }


            return record;
        } else if (referenceModule === sails.config.modules.promocode) {
            let promocodeData = await Procedure.findOne({ id: referenceId });
            if (promocodeData) {
                record.name = promocodeData.name;
                record.code = promocodeData.code;

                return record;
            }

            return record;
        }
    },

    generateSortingOptionForAggregateQuery(sortOptions) {
        let sort = {};
        if (sortOptions) {
            let data = sortOptions.split(' ');
            if (data[1] == 'ASC') {
                sort.sortingType = 1;
            } else {
                sort.sortingType = -1;
            }
            sort.field = data[0];
        }

        return sort;
    },

    async filterData(data) {
        let arrManufacturer = [];
        let newManufacturer = [];
        _.each(data, (newData) => {
            arrManufacturer.push(newData.name)
        });
        let newString3 = arrManufacturer.join(", ");
        newManufacturer.push(JSON.stringify(newString3));
        return newManufacturer;
    },

    async getAndCompareMaster(data, options) {
        if (options === sails.config.EXCEL_HEADER[5]) {
            var fields = data.split(' ');
            let allUser = await User.findOne({
                select: ["firstName", "lastName"],
                where: { type: 2, firstName: fields[0], lastName: fields[1] }
            });
            return allUser;
        } else if (options === sails.config.EXCEL_HEADER[6]) {
            let parentManufacturer = await Master.findOne({ code: "MANUFACTURER", isDeleted: false });
            let Manufacturer = await Master.findOne({
                select: ['name'],
                where: { parentId: parentManufacturer.id, name: data }
            });
            return Manufacturer;
        } else if (options === sails.config.EXCEL_HEADER[7]) {
            let parentLockManufacturer = await Master.findOne({ code: "LOCK_MANUFACTURER", isDeleted: false });
            let lockManufacturer = await Master.findOne({
                select: ['name'],
                where: { parentId: parentLockManufacturer.id, name: data }
            });
            return lockManufacturer;
        } else if (options === sails.config.EXCEL_HEADER[8]) {
            let parentChargingPlug = await Master.findOne({ code: "CHARGING_PLUG", isDeleted: false });
            let chargingPlug = await Master.findOne({
                select: ['name'],
                where: { parentId: parentChargingPlug.id, name: data }
            });
            return chargingPlug;
        } else if (options === sails.config.EXCEL_HEADER[9]) {
            let parentChargingPower = await Master.findOne({ code: "CHARGING_POWER", isDeleted: false });
            let chargingPower = await Master.findOne({
                select: ['name'],
                where: { parentId: parentChargingPower.id, name: data }
            });
            return chargingPower;
        }
    },

    async getMobileConfig() {
        let setting = await Settings.findOne({
            type: sails.config.SETTINGS.TYPE.APP_SETTING
        });
        let mobileConfig = {
            rideSubscriptionFeatureActive: sails.config.RIDE_SUBSCRIPTION_FEATURE_ACTIVE,
            isBookingPassFeatureActive: sails.config.IS_BOOKING_PASS_FEATURE_ACTIVE,
            riderCanAddCards: true,
            kycAuthentication: sails.config.KYC_AUTHENTICATION,
            showGeoFenceInApp: sails.config.SHOW_GEO_FENCE_IN_APP,
            minAgeRequired: setting.minAgeRequired,
            isShowSubZone: sails.config.IS_SHOW_SUB_ZONE,
            endWorkingTime: setting.endWorkingTime,
            startWorkingTime: setting.startWorkingTime,
            canUserPauseRide: sails.config.PAUSE_RIDE_LIMIT_ENABLED
        }

        return mobileConfig;
    },

    async replaceAt(str, index, ch) {
        return str.replace(/./g, (c, i) => i == index ? ch : c)
    },

    async filterArrayDuplicate(data) {
        let duplicate = _.filter(data, (v, i, a) => a.indexOf(v) !== i);

        return duplicate;
    }
};

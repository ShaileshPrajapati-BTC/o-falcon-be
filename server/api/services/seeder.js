const fs = require('fs');
const ProjectSetupConfigService = require('./projectSetupConfig');
module.exports = {
    seedUsers: async function () {
        const faker = require('faker');
        let users = [];
        let i;
        for (i = 0; i < 46; i++) {
            let user = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                username: faker.internet.userName(),
                emails: [
                    {
                        email: faker.internet.email(),
                        isPrimary: true,
                        isVerified: true
                    }
                ],
                mobiles: [
                    {
                        mobile: faker.phone.phoneNumber(),
                        countryCode: '+91',
                        isPrimary: true,
                        isVerified: true
                    }
                ],
                password: faker.internet.password(),
                type: sails.config.USER.TYPE.CUSTOMER
            };
            try {
                // await User.create(user);
                users.push(user);
            } catch (e) {
                return { error: e };
            }
        }

        return { data: users };
    },
    seedAdminUser: async function () {
        try {
            if (await User.count() > 0) {
                return;
            }
            await User.create({
                type: 1.0,
                name: 'admin',
                emails: [
                    {
                        email: 'escooter.admin@gmail.com',
                        isPrimary: true,
                        isVerified: true
                    }
                ],
                firstName: 'admin',
                lastName: 'admin',
                mobiles: [
                    {
                        mobile: '9978379402',
                        countryCode: '+91',
                        isPrimary: true,
                        isVerified: true
                    }
                ],
                dob: '07-12-1993',
                addresses: [],
                // eScooter@170719
                password: 'eScooter@170719',
                isActive: true
            });
            console.log('admin user is seeded successfully.');

            return;
        } catch (e) {
            console.log(e);

            return { error: e };
        }
    },
    async seedData() {
        try {
            /** we will read like a pro**/
            let files = fs.readdirSync(`${sails.config.appPath}/api/seeder-data`);
            /** its important that we loop through all files **/
            await Promise.all(_.map(files, async (file) => {
                /** wake models up, its time to seed them **/
                let modelName = file.split('.')[0];
                let Model = sails.models[modelName.toLowerCase()];
                // let existingRecords = await Model.find({});
                // /** if model already have records why would we seed them, it's stupid**/
                // if (existingRecords && _.size(existingRecords) > 0) {
                //     return;
                // }
                /** read the data before you seed them **/
                let data = JSON.parse(fs.readFileSync(`${sails.config.appPath}/api/seeder-data/${file}`, 'utf8'));
                if (file === 'StaticPage.json') {
                    data = data.map(el => {
                        if (el.forCustomer) {
                            return {
                                description: el.description.replace(/Rohak/gi, `${sails.config.PROJECT_NAME}`),
                                multiLanguageData: {
                                    'en-US': {
                                        description: el.description.replace(/Rohak/gi, `${sails.config.PROJECT_NAME}`)
                                    }
                                },
                                code: el.code,
                                userType: sails.config.USER.TYPE.CUSTOMER
                            }
                        } else {
                            return {
                                description: el.description.replace(/Rohak/gi, `${sails.config.PROJECT_NAME}`),
                                multiLanguageData: {
                                    'en-US': {
                                        description: el.description.replace(/Rohak/gi, `${sails.config.PROJECT_NAME}`)
                                    }
                                },
                                code: el.code,
                                userType: sails.config.USER.TYPE.FRANCHISEE
                            }
                        }
                    })
                }
                const seederConfig = sails.config.SEEDER_DATA_CONFIG[modelName];
                const uniqueField = seederConfig.uniqueField;
                let uniqueDataFieldsData = _.map(data, uniqueField);
                let records = await Model.find({
                    [uniqueField]: uniqueDataFieldsData
                });
                /** if model already have records why would we seed them, it's stupid**/

                if (records && _.size(records) > 0) {
                    for (let record of records) {
                        let index = _.findIndex(data, {
                            [uniqueField]: record[uniqueField]
                        });

                        if (index > -1) {
                            let dataRecord = data[index];

                            if (dataRecord.children) {
                                let children = _.clone(dataRecord.children);

                                let uniqueDataFieldsChildData = _.map(children, uniqueField);
                                let childRecords = await Model.find({
                                    [uniqueField]: uniqueDataFieldsChildData
                                });
                                if (childRecords && _.size(childRecords) > 0) {
                                    for (let childRecord of childRecords) {
                                        let childIndex = _.findIndex(children, {
                                            [uniqueField]: childRecord[uniqueField]
                                        });
                                        if (childIndex > -1) {
                                            children.splice(childIndex, 1);
                                        }
                                    }
                                }
                                if (children && _.size(children) > 0) {
                                    await this.insertChildren(record.id, children, modelName);
                                }
                            }
                            data.splice(index, 1);
                        }
                    }
                }

                /** add each record one after one**/
                await Promise.all(_.map(data, async (record) => {
                    let children;
                    if (record.children) {
                        children = _.clone(record.children);
                        delete record.children;
                    }
                    try {
                        let addedRecord = await Model.create(record).meta({
                            fetch: true,
                            skipAllLifecycleCallbacks: true
                        });
                        /** if has child add them and map parentId key **/
                        if (children && _.size(children) > 0) {
                            await this.insertChildren(addedRecord.id, children, modelName);
                        }
                    } catch (e) {
                        sails.log.error('error while seeding', e);
                    }
                }));
                sails.log.debug(`Congratulations, we have seeded ${modelName} model successfully.`);
            }));
        } catch (e) {
            sails.log.error('error while seeding', e);
        }
    },
    async insertChildren(recordId, children, modelName) {
        const Model = sails.models[modelName.toLowerCase()];
        await Promise.all(_.map(children, async (r) => {
            r.parentId = recordId;
            try {
                await Model.create(r);
            } catch (e) {
                sails.log.error('error while seeding', e);
            }
        }));
    },
    seedSetupConfig: async function () {
        try {
            if (await SetupConfig.count() > 0) {
                return;
            }
            let SetupConfigKeys = _.keys(sails.models[SetupConfig.identity].attributes);
            let setupConfigObj = {};
            let omitKeys = [
                'createdAt',
                'updatedAt',
                'addedBy',
                'updatedBy',
                'id'
            ];
            for (let key = 0; key < SetupConfigKeys.length; key++) {
                if (omitKeys.includes(SetupConfigKeys[key])) {
                    continue;
                }
                setupConfigObj[SetupConfigKeys[key]] = "";
            }
            console.log("setupConfigObj ", setupConfigObj);
            await SetupConfig.create(setupConfigObj);
            console.log('setupConfig is seeded successfully.');

            return;
        } catch (e) {
            console.log(e);

            return { error: e };
        }
    },
    seedProjectConfig: async function () {
        try {
            if (await ProjectConfig.count() > 0) {
                return;
            }
            let ProjectConfigKeys = _.keys(sails.models[ProjectConfig.identity].attributes);
            let projectConfigObj = {};
            let omitKeys = [
                'createdAt',
                'updatedAt',
                'addedBy',
                'updatedBy',
                'id'
            ];
            let sailsValue;
            for (let key = 0; key < ProjectConfigKeys.length; key++) {
                if (omitKeys.includes(ProjectConfigKeys[key])) {
                    continue;
                }
                sailsValue = sails.config[ProjectSetupConfigService.camelCaseToCapitalUnderscore(ProjectConfigKeys[key])];
                if (_.isUndefined(sailsValue)) {
                    continue;
                }
                projectConfigObj[ProjectConfigKeys[key]] = sailsValue;
            }
            await ProjectConfig.create(projectConfigObj);
            console.log('projectConfig is seeded successfully.');

            return;
        } catch (e) {
            console.log(e);

            return { error: e };
        }
    },
    seedUserRoles: async function () {
        try {
            if (await Roles.count() > 0) {
                return;
            }
            let superAdminPermissions = [];
            let adminPermissions = [];
            let subAdminPermissions = [];
            let staffPermissions = [];
            let franchisePermissions = [];
            let dealerPermissions = [];
            for (let i of sails.config.ROLES_PERMISSION) {
                let mainObj = i;
                let obj = {};
                obj.list = true;
                obj.view = true;
                obj.insert = true;
                obj.update = true;
                obj.delete = true;
                mainObj.permissions = obj;
                superAdminPermissions.push(_.cloneDeep(mainObj));
                adminPermissions.push(_.cloneDeep(mainObj));
            }

            let superAdminRoles = {
                title: 'super-admin',
                permissions: superAdminPermissions
            };
            let adminRoles = {
                title: 'admin',
                permissions: adminPermissions
            };
            for (let i of sails.config.ROLES_PERMISSION) {
                let mainObj = i;
                let obj = {};
                obj.list = true;
                obj.view = true;
                obj.insert = false;
                obj.update = false;
                obj.delete = false;
                mainObj.permissions = obj;
                subAdminPermissions.push(_.cloneDeep(mainObj));
            }
            let subAdminRoles = {
                title: 'sub-admin',
                permissions: subAdminPermissions
            };
            let staffFilter = [
                sails.config.PAGE_PERMISSION.USERS,
                sails.config.PAGE_PERMISSION.FRANCHISEE
            ];
            for (let i of sails.config.ROLES_PERMISSION) {
                let mainObj = i;
                let obj = {};
                obj.list = true;
                obj.view = true;
                obj.insert = false;
                obj.update = false;
                obj.delete = false;
                if (staffFilter.includes(mainObj.module)) {
                    obj.list = false;
                    obj.view = false;
                }
                mainObj.permissions = obj;
                staffPermissions.push(_.cloneDeep(mainObj));
            }
            let staffRoles = {
                title: 'staff',
                permissions: staffPermissions,
                isDefault: true
            };
            let franchiseRoles = {
                title: 'franchisee',
                permissions: sails.config.ROLES_PERMISSION_FRANCHISEE,
                isDefault: true
            };
            let dealerRoles = {
                title: 'dealer',
                permissions: sails.config.ROLES_PERMISSION_DEALER,
                isDefault: true
            };
            await Roles.create(superAdminRoles);
            await Roles.create(adminRoles);
            await Roles.create(subAdminRoles);
            await Roles.create(staffRoles);
            await Roles.create(franchiseRoles);
            await Roles.create(dealerRoles);
        } catch (e) {
            console.log(e);

            return { error: e };
        }
    },

    seedDeviceConfig: async function () {
        try {
            if (await DeviceConfig.count() > 0) {
                return;
            }
            let DeviceConfigKeys = _.keys(sails.models[DeviceConfig.identity].attributes);
            let deviceConfigObj = {};
            let omitKeys = [
                'createdAt',
                'updatedAt',
                'addedBy',
                'updatedBy',
                'id'
            ];
            let sailsValue;
            for (let key = 0; key < DeviceConfigKeys.length; key++) {
                if (omitKeys.includes(DeviceConfigKeys[key])) {
                    continue;
                }
                sailsValue = sails.config[ProjectSetupConfigService.camelCaseToCapitalUnderscore(DeviceConfigKeys[key])];
                if (_.isUndefined(sailsValue)) {
                    continue;
                }
                deviceConfigObj[DeviceConfigKeys[key]] = sailsValue;
            }
            await DeviceConfig.create(deviceConfigObj);
            console.log('deviceConfig is seeded successfully.');

            return;
        } catch (e) {
            console.log(e);

            return { error: e };
        }
    },
    seedContactUs: async function () {
        try {
            if (await ContactUsSetting.count({ addedBy: null }) > 0) {
                return;
            }
            await ContactUsSetting.create({
                email: "test@escooter.com",
                cell: "1234567890",
                address: "test address",
                addedBy: null
            });
            console.log('Contact Us is seeded successfully.');

            return;
        } catch (e) {
            console.log(e);

            return { error: e };
        }
    },

    databaseMigration: async function () {
        try {
            // check for zone object has isDeleted key
            let zoneRecord = await Zone.find().limit(1);
            if (zoneRecord.length > 0) {
                zoneRecord = zoneRecord[0];
                if (!('isDeleted' in zoneRecord)) {
                    await Zone.update({}, {
                        isDeleted: false
                    });
                    console.log('updated isDeleted key in all records (Zone) --- *** ')
                }
            }
            // ------------------------------------------------

            // check for nest object has isDeleted key
            let nestRecord = await Nest.find().limit(1);
            if (nestRecord && nestRecord.length > 0) {
                nestRecord = nestRecord[0];
                if (!('isDeleted' in nestRecord)) {
                    await Nest.update({}, {
                        isDeleted: false
                    });
                    console.log('updated isDeleted key in all records (Nest) --- *** ')
                }
            }
            // ------------------------------------------------

            // check for nest object has isDeleted key
            let nestTrackRecord = await NestTrack.find().limit(1);
            if (nestTrackRecord && nestTrackRecord.length > 0) {
                nestTrackRecord = nestTrackRecord[0];
                if (!('isDeleted' in nestTrackRecord)) {
                    await NestTrack.update({}, {
                        isDeleted: false
                    });
                    console.log('updated isDeleted key in all records (NestTrack) --- *** ')
                }
            }
            // ------------------------------------------------

        } catch (e) {
            console.log(e);
        }
    },
    async seedAllConfigs() {
        await this.seedUserRoles();
        await this.seedAdminUser();
        await this.seedSetupConfig();
        await this.seedProjectConfig();
        await this.seedDeviceConfig();
        await this.seedContactUs();
        
        await this.databaseMigration();
    }
};

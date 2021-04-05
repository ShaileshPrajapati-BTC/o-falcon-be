const crypto = require('crypto');
const StripeHandler = require('./Payment/Stripe/stripeHandler');
const TwilioHandler = require('./SMS/Twilio/twilioHandler');
const AwsSNSHandler = require('./SMS/AWS_SNS/awsSNSHandler');
const ProjectConfig = require('../models/ProjectConfig');

module.exports = {
    camelCaseToCapitalUnderscore(inputStr) {
        let str = inputStr.replace(/(?:^|\.?)([A-Z])/g, (x, y) => {
            return `_${y}`;
        }).replace(/^_/, '');

        return str.toUpperCase();
    },

    omitExtras(obj) {
        obj = _.omit(obj, [
            'id',
            'addedBy',
            'createdAt',
            'updatedAt',
            'updatedBy'
        ]);

        return obj;
    },

    async getConfigObj(model) {
        const modelName = sails.models[model];
        let config = await modelName.find({ limit: 1 });
        config = config[0];
        config = this.omitExtras(config);

        return config;
    },

    setValueToSailsConfig(configObj, decryptionNeeded = false) {
        let configValue;
        for (let prop in configObj) {
            if (decryptionNeeded && !_.isString(configObj[prop])) {
                continue;
            }
            if (decryptionNeeded) {
                configValue = this.decrypt(configObj[prop]);
            } else {
                configValue = configObj[prop];
            }
            // console.log(this.camelCaseToCapitalUnderscore(prop), ' --- ', configValue);
            sails.config[this.camelCaseToCapitalUnderscore(prop)] = configValue;
        }
    },

    async buildProjectConfig() {
        const projectConfig = await this.getConfigObj('projectconfig');
        this.setValueToSailsConfig(projectConfig);
    },

    async buildSetupConfig() {
        const setupConfig = await this.getConfigObj('setupconfig');
        this.setValueToSailsConfig(setupConfig, true);
    },

    async buildDeviceConfig() {
        const deviceConfig = await this.getConfigObj('deviceconfig');
        this.setValueToSailsConfig(deviceConfig);
    },

    // from admin controller
    async updateConfig(params, model, securityEnabled = false) {
        const modelName = sails.models[model];
        let paramsToUpdate = _.omit(params, ['id', 'addedBy', 'updateFilter', 'deleteFilter', 'viewFilter']);
        if (securityEnabled) {
            // eslint-disable-next-line guard-for-in
            for (let prop in paramsToUpdate) {
                paramsToUpdate[prop] = this.encrypt(paramsToUpdate[prop]);
            }
        }
        let beforUpdateData = await modelName.find().limit(1);
        let updatedRecord = await modelName.update({ id: params.id })
            .set(paramsToUpdate)
            .fetch();
        updatedRecord = updatedRecord[0];
        updatedRecord = this.omitExtras(updatedRecord);

        this.setValueToSailsConfig(updatedRecord, securityEnabled);
        if (model === "projectconfig") {
            
            if (updatedRecord  && beforUpdateData[0]) {
                // console.log("updatedRecord.walletExpiredTime ====",updatedRecord.walletExpiredTime)
                // console.log("beforUpdateData[0].walletExpiredTime====",beforUpdateData[0].walletExpiredTime)
                if (updatedRecord.walletExpiredTime !== beforUpdateData[0].walletExpiredTime) {
                    await user.updateWalletExpriedTime(updatedRecord.walletExpiredTime);
                }
            }
        }
        if ('stripeSecretKey' in paramsToUpdate && paramsToUpdate.stripeSecretKey !== sails.config.STRIPE_SECRET_KEY) {
            await StripeHandler.setStripeNewInstance();
        }

        if (('twilioAccountSid' in paramsToUpdate && paramsToUpdate.twilioAccountSid !== sails.config.TWILIO_ACCOUNT_SID ) ||
            ('twilioAuthToken' in paramsToUpdate && paramsToUpdate.twilioAuthToken !== sails.config.TWILIO_AUTH_TOKEN )
        ) {
            await TwilioHandler.setTwilioNewInstance();
        }

        if (('awsSnsRegion' in paramsToUpdate && paramsToUpdate.awsSnsRegion !== sails.config.AWS_SNS_REGION) ||
            ('awsSnsAccessKeyId' in paramsToUpdate && paramsToUpdate.awsSnsAccessKeyId !== sails.config.AWS_SNS_ACCESS_KEY_ID) ||
            ('awsSnsSecretAccessKey' in paramsToUpdate && paramsToUpdate.awsSnsSecretAccessKey !== sails.config.AWS_SNS_SECRET_ACCESS_KEY)
        ) {
            await AwsSNSHandler.setAwsSNSNewInstance();
        }

        if (securityEnabled) {
            updatedRecord = this.getDecryptedObj(updatedRecord);
        }

        return updatedRecord;
    },

    getDecryptedObj(configObj) {
        let decryptedValue;
        let configValue;
        // eslint-disable-next-line guard-for-in
        for (let prop in configObj) {
            configValue = configObj[prop];
            if (!_.isString(configValue) || configValue === '') {
                continue;
            }
            decryptedValue = this.decrypt(configValue);
            configObj[prop] = decryptedValue;
        }

        return configObj;
    },

    // from admin controller
    async getSetupConfig() {
        let setupConfig = await this.getConfigObj('setupconfig');
        setupConfig = this.getDecryptedObj(setupConfig);

        return setupConfig;
    },

    // from admin controller
    async getProjectConfig() {
        const projectConfig = await this.getConfigObj('projectconfig');

        return projectConfig;
    },

    // from admin controller
    async getDeviceConfig() {
        const deviceConfig = await this.getConfigObj('deviceconfig');

        return deviceConfig;
    },

    /**
     *  encryption of data by key
     * @param plainText
     */
    encrypt(plainText) {
        if (plainText === '') {
            return plainText;
        }
        const workingKey = sails.config.CRYPTO_WORKING_KEY;
        let m = crypto.createHash('md5');
        m.update(workingKey);
        if (m) {
            let key = m.digest();
            let iv = '\x0c\x0d\x0e\x0f\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b';
            let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
            let encoded = cipher.update(plainText, 'utf8', 'hex');
            encoded += cipher.final('hex');

            return encoded;
        }
    },

    /**
     * decryption of response
     * @param encText
     */
    decrypt(encText) {
        if (encText === '') {
            return encText;
        }
        const workingKey = sails.config.CRYPTO_WORKING_KEY;
        let m = crypto.createHash('md5');
        m.update(workingKey);
        let key = m.digest();
        let iv = '\x0c\x0d\x0e\x0f\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b';
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decoded = decipher.update(encText, 'hex', 'utf8');
        decoded += decipher.final('utf8');

        return decoded;
    },

    async buildSettingConfig() {
        let setting = await Settings.findOne({
            where: { type: sails.config.SETTINGS.TYPE.APP_SETTING }
        });

        setting = _.omit(setting, [
            'id',
            'addedBy',
            'createdAt',
            'updatedAt',
            'updatedBy',
            'type',
            'contact',
            'notificationActions',
            'omniSetting',
            'driverBasicRadius'
        ]);

        this.setValueToSailsConfig(setting);
    }
};

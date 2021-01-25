const UserService = require('./user');
const UtilService = require('./util');
module.exports = {
    async applyMigration() {
        sails.config.CURRENT_MIGRATION_VERSION = sails.config.CURRENT_MIGRATION_VERSION ? sails.config.CURRENT_MIGRATION_VERSION : 0;
        let currentVersion = sails.config.CURRENT_MIGRATION_VERSION;
        try {
            console.log('sails.config.CURRENT_MIGRATION_VERSION', sails.config.CURRENT_MIGRATION_VERSION);
            while (typeof this[`migration${currentVersion + 1}`] !== undefined) {
                console.log('currentVersion', currentVersion);
                await this[`migration${currentVersion + 1}`]();
                currentVersion++;
            }
            await projectSetupConfig.updateConfig({ currentMigrationVersion: currentVersion }, 'projectconfig');
        } catch (error) {
            if (currentVersion > 0) {
                await projectSetupConfig.updateConfig({ currentMigrationVersion: currentVersion }, 'projectconfig');
                console.log("currentMigrationVersion = ", currentVersion);
            }
        }
    },

    async migration1() {
        try {
            let referralSetting = await ReferralSetting.find({ isDeleted: false });
            if (referralSetting && referralSetting.length <= 0) {
                let referralSettingObj = {
                    referralUserBenefitType: 1,
                    referralUserBenefitValue: 20,
                    invitedUserBenefitType: 1,
                    invitedUserBenefitValue: 21,
                    isActive: true,
                    isDefault: true,
                    country: "",
                    isDeleted: false
                }
                await ReferralSetting.create(referralSettingObj);
                console.log("Add default referral setting successfully!")
            }
        } catch (error) {
            console.log("Add default referral setting fail!")
            console.log("migration1 error --- ", error);
        }
    },
}
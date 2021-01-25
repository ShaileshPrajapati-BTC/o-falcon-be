const ProjectSetupConfigService = require(`${sails.config.appPath}/api/services/projectSetupConfig`);
const WalletService = require(`${sails.config.appPath}/api/services/wallet`);

module.exports = {
    async getProjectConfig(req, res) {
        try {
            let projectConfig = await ProjectSetupConfigService.getProjectConfig();
            if (projectConfig) {
                return res.ok(projectConfig, sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.CONFIG_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getSetupConfig(req, res) {
        try {
            let setupConfig = await ProjectSetupConfigService.getSetupConfig();
            if (setupConfig) {
                return res.ok(setupConfig, sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.CONFIG_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getDeviceConfig(req, res) {
        try {
            let deviceConfig = await ProjectSetupConfigService.getDeviceConfig();
            if (deviceConfig) {
                return res.ok(deviceConfig, sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.CONFIG_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async updateProjectConfig(req, res) {
        try {
            let params = req.allParams();
            if (params.walletTopUps && params.walletTopUps.length > 0) {
                await WalletService.validateTopUps(params.walletTopUps);
            }
            const updatedRecord = await ProjectSetupConfigService.updateConfig(params, 'projectconfig');
            if (updatedRecord) {
                return res.ok(updatedRecord, sails.config.message.CONFIG_UPDATED);
            }

            return res.notFound({}, sails.config.message.CONFIG_NOT_FOUND);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async updateSetupConfig(req, res) {
        try {
            let params = req.allParams();
            const updatedRecord = await ProjectSetupConfigService.
                updateConfig(params, 'setupconfig', true);
            if (updatedRecord) {
                return res.ok(updatedRecord, sails.config.message.CONFIG_UPDATED);
            }

            return res.notFound({}, sails.config.message.CONFIG_NOT_FOUND);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async updateDeviceConfig(req, res) {
        try {
            let params = req.allParams();
            const updatedRecord = await ProjectSetupConfigService.updateConfig(params, 'deviceconfig');
            if (updatedRecord) {
                return res.ok(updatedRecord, sails.config.message.CONFIG_UPDATED);
            }

            return res.notFound({}, sails.config.message.CONFIG_NOT_FOUND);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
};

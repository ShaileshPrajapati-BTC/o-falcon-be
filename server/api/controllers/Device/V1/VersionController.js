module.exports = {
    async getVersion(req, res) {
        try {
            var versions = await Version.find({
                platform: [
                    sails.config.service.version.PLATFORM.IOS_PLATFORM,
                    sails.config.service.version.PLATFORM.ANDROID_PLATFORM
                ],
                isActive: true
            });

            let deviceType = req.headers.devicetype;
            let response = {};
            if (deviceType == sails.config.service.version.PLATFORM.ANDROID_PLATFORM) {
                var v_android = versions.filter(e => e.platform == sails.config.service.version.PLATFORM.ANDROID_PLATFORM);
                response.android = v_android[0];
            } else {
                var v_ios = versions.filter(e => e.platform == sails.config.service.version.PLATFORM.IOS_PLATFORM);
                response.ios = v_ios[0];
            }
            res.ok(response);
        } catch (error) {
            console.log('error: ', error);
        }
    }
};

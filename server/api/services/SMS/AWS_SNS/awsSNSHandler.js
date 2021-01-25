let Singleton = (() => {
    let instance;
    let createInstance = async () => {
        const AWS = await require('aws-sdk');
        AWS.config.region = sails.config.AWS_SNS_REGION;
        AWS.config.accessKeyId = sails.config.AWS_SNS_ACCESS_KEY_ID;
        AWS.config.secretAccessKey = sails.config.AWS_SNS_SECRET_ACCESS_KEY;

        instance = new AWS.Pinpoint();
    };

    let setNewInstance = async () => {
        instance = undefined;
        const AWS = await require('aws-sdk');
        AWS.config.region = sails.config.AWS_SNS_REGION;
        AWS.config.accessKeyId = sails.config.AWS_SNS_ACCESS_KEY_ID;
        AWS.config.secretAccessKey = sails.config.AWS_SNS_SECRET_ACCESS_KEY;

        instance = new AWS.Pinpoint();
    };

    return {
        getInstance: async () => {
            if (!instance) {
                await createInstance();
            }

            return instance;
        },
        setNewInstance: async () => {
            await setNewInstance();
        }
    };
})();

module.exports = {
    async getAwsSNSObject() {
        try {
            console.log(sails.config.AWS_SNS_REGION)
            let awsSNS = await Singleton.getInstance();
            console.log("awsSNS ---- ", awsSNS ? "yo": "lol")

            return awsSNS;
        } catch (e) {
            throw new Error(e);
        }
    },

    async setAwsSNSNewInstance() {
        try {
            await Singleton.setNewInstance();
        } catch (e) {
            throw new Error(e);
        }
    }
};
